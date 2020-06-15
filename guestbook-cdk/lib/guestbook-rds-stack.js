const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const secretsManager = require('@aws-cdk/aws-secretsmanager');
const rds = require('@aws-cdk/aws-rds');
const utils = require('../utils/lookup.js');
const cfn = require('@aws-cdk/aws-cloudformation');
const lambda = require('@aws-cdk/aws-lambda');
const iam = require('@aws-cdk/aws-iam');

class GuestbookRdsStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    this.executeStack(scope, id, props);
  }

  /**
   * Async function containing all the logic
   * 
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  async executeStack(scope, id, props) {
    this.rdsCluster = null;
    var vpc = props.vpc.current;

    // Deploy an rds cluster    
    const isDev = props.environmentType !== "production";
    
    // Generate an initial password for the master account
    const initialMasterPassword = Math.random().toString(36).substring(2);

    // Load the existing app security group 
    var lookup = new utils.Lookup(props);
    var appSecurityGroup = await lookup.getAppSecurityGroup(this);
    
    // Security group assigned to the database (opens DB port to the App security group)
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'guestbook-db-sg',{
      vpc: vpc,
      description: "Security Group Guestbook database",
    });
    const dbPort = ec2.Port.tcp(3306);
    dbSecurityGroup.addIngressRule(
      appSecurityGroup,
      dbPort,
      'Allow inbound to database port to the app security group'
    );
    
    // Database config
    const dbConfig = {
      dbClusterIdentifier: `guestbook-${props.environmentType}`,
      engineMode: props.rds.engineMode,
      engine: props.rds.engine,
      engineVersion: props.rds.engineVersion,
      enableHttpEndpoint: true,
      databaseName: 'main',
      masterUsername: props.rds.databaseUsername, 
      masterUserPassword: initialMasterPassword, 
      backupRetentionPeriod: isDev ? 1 : 30,
      finalSnapshotIdentifier: `main`,
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: isDev ? 4 : 384,
        minCapacity: 2,
        secondsUntilAutoPause: isDev ? 3600 : 10800,
      },
      vpc: vpc,
      vpcPlacement: {subnetType: ec2.SubnetType.ISOLATED},
      dbSubnetGroupName: new rds.CfnDBSubnetGroup(this, `subnetgroup-${props.rds.databaseName}-${props.environmentType}`, {
          dbSubnetGroupDescription: `Subnet group for ${props.rds.serviceName}-${props.environmentType}`,
          subnetIds: vpc.selectSubnets(vpc.subnets).subnetIds
      }).ref,      
      deletionProtection: isDev ? false : true,
      vpcSecurityGroupIds: [dbSecurityGroup.securityGroupId]
    };

    const rdsCluster = new rds.CfnDBCluster(this, 'DBCluster', dbConfig);
    const secretName = `${props.rds.serviceName}-${props.environmentType}-master-credentials`;
    
    // Create DB credentials for RDS master account
    const databaseCredentialsSecret = new secretsManager.Secret(this, 'DBCredentialsSecret', {
      secretName: secretName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.rds.databaseUsername,
          engine: props.secretManager.engine,
          password: initialMasterPassword,
          host: rdsCluster.attrEndpointAddress,
          database: props.rds.databaseName
        }),
        generateStringKey: '_unused'
      }
    });
    
    // The target service or database
    const target = new ec2.Connections({
      defaultPort: ec2.Port.tcp(3306),
      securityGroups: [dbSecurityGroup]
    });

    // Add secret rotation for password
    new secretsManager.SecretRotation(this, 'SecretMasterRotation', {
      application: secretsManager.SecretRotationApplication.MYSQL_ROTATION_SINGLE_USER,
      secret: databaseCredentialsSecret,
      target,
      vpc: vpc,
      subnetType: ec2.SubnetType.PRIVATE,
      securityGroup: appSecurityGroup
    });
    
    // Call custom resource to create the db schema
    const role = new iam.Role(this, props.lambda.rolename, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // allow lambda  to communicate with secrets manager
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(props.lambda.roleManagedPolicyName));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"));

    var lambdaFunction = new lambda.SingletonFunction(this, 'guestbookLambda', {
        uuid: 'lambda-database-setup-001',
        code: lambda.Code.asset('lib/custom-resource/database-setup'),
        handler: 'index.main',
        description: 'Initial database schema creation',
        timeout: cdk.Duration.seconds(300),
        runtime: lambda.Runtime.NODEJS_12_X,
        vpc: props.vpc.current,
        securityGroup: appSecurityGroup,
        role: role,
        vpcSubnets: vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE}),
        environment: {'secretName': secretName}
    });
    
    // Create the custom resource with the Lambda
    var customProvider = cfn.CustomResourceProvider.lambda(lambdaFunction);
    const resource = new cfn.CustomResource(this, 'Resource', {
      provider: customProvider,
      properties: {}
    });
    
    this.rdsCluster = rdsCluster;
  }

  getRdsCluster() {
      return this.rdsCluster;
  }    
}

module.exports = { GuestbookRdsStack }