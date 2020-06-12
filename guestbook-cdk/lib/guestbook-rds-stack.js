const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const secretsManager = require('@aws-cdk/aws-secretsmanager');
const rds = require('@aws-cdk/aws-rds');
const uuid = require('uuid');

class GuestbookRdsStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    
    this.rdsCluster = null;
    var vpc = props.vpc.current;

    // Deploy an rds cluster    
    const isDev = props.environmentType !== "production";
    
    // Generate an initial password for the master account
    const initialMasterPassword = uuid.v4();

    // Load the existing app security group
    const appSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this, 
      'guestbook-app-sg', 
      'sg-052f0ba6579c1c342'
    );

    // Security group assigned to the database (opens DB port to the App security group)
    let dbSecurityGroup = new ec2.SecurityGroup(this, 'guestbook-db-sg',{
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
      VpcSecurityGroupIds: [dbSecurityGroup.securityGroupId]
    };

    const rdsCluster = new rds.CfnDBCluster(this, 'DBCluster', dbConfig);
    
    // Create DB credentials for RDS master account
    const databaseCredentialsSecret = new secretsManager.Secret(this, 'DBCredentialsSecret', {
      secretName: `${props.rds.serviceName}-${props.environmentType}-master-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.rds.databaseUsername,
          engine: props.secretManager.engine,
          password: initialMasterPassword,
          host: rdsCluster.attrEndpointAddress
        }),
        generateStringKey: '_unused'
      }
    });
    
    // The target service or database
    const target = new ec2.Connections({
      defaultPort: ec2.Port.tcp(3306),
      securityGroups: rdsCluster.vpcSecurityGroupIds
    });

    new secretsManager.SecretRotation(this, 'SecretMasterRotation', {
      application: secretsManager.SecretRotationApplication.MYSQL_ROTATION_SINGLE_USER,
      secret: databaseCredentialsSecret,
      target,
      vpc: vpc,
      subnetType: ec2.SubnetType.PRIVATE,
      securityGroup: appSecurityGroup
    });

    this.rdsCluster = rdsCluster;
  }

  getRdsCluster() {
      return this.rdsCluster;
  }    
}

module.exports = { GuestbookRdsStack }