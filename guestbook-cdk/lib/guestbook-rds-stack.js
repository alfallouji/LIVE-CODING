const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const secretsManager = require('@aws-cdk/aws-secretsmanager');
const rds = require('@aws-cdk/aws-rds');

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
    
    // Database config
    const dbConfig = {
      dbClusterIdentifier: `guestbook-${props.environmentType}`,
      engineMode: props.rds.engineMode,
      engine: props.rds.engine,
      engineVersion: props.rds.engineVersion,
      enableHttpEndpoint: true,
      databaseName: 'main',
      masterUsername: props.rds.databaseUsername, 
      masterUserPassword: 'chips123456!', 
      backupRetentionPeriod: isDev ? 1 : 30,
      finalSnapshotIdentifier: `main`,
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: isDev ? 4 : 384,
        minCapacity: 2,
        secondsUntilAutoPause: isDev ? 3600 : 10800,
      },
      dbSubnetGroupName: new rds.CfnDBSubnetGroup(
          this, 
          `subnetgroup-${props.rds.databaseName}-${props.environmentType}`,
          {
              dbSubnetGroupDescription: `Subnet group for ${props.rds.serviceName}-${props.environmentType}`,
              subnetIds: vpc.selectSubnets({subnetType: ec2.SubnetType.ISOLATED}).subnetIds
          }
      ).dbSubnetGroupName,
      deletionProtection: isDev ? false : true
    };

    console.log(vpc.selectSubnets({subnetType: ec2.SubnetType.ISOLATED}).subnetIds);
  
    const rdsCluster = new rds.CfnDBCluster(this, 'DBCluster', dbConfig);

    // Create DB credentials for RDS master account
    const databaseCredentialsSecret = new secretsManager.Secret(this, 'DBCredentialsSecret', {
      secretName: `${props.rds.serviceName}-${props.environmentType}-master-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.rds.databaseUsername,
          engine: props.secretManager.engine,
          password: 'chips123456!',
          host: rdsCluster.attrEndpointAddress
        }),
        generateStringKey: '@todo'
      }
    });
    
    // The target service or database
    const target = new ec2.Connections({
      defaultPort: ec2.Port.tcp(3306),
      securityGroups: rdsCluster.vpcSecurityGroupIds
    });

    new secretsManager.SecretRotation(this, 'SecretRotation', {
      application: secretsManager.SecretRotationApplication.MYSQL_ROTATION_SINGLE_USER,
      secret: databaseCredentialsSecret,
      target,
      vpc: vpc,
      subnetType: ec2.SubnetType.PRIVATE
    });

    this.rdsCluster = rdsCluster;
  }

  getRdsCluster() {
      return this.rdsCluster;
  }    
}

module.exports = { GuestbookRdsStack }