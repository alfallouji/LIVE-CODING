const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const secretsManager = require('@aws-cdk/aws-secretsmanager');
const rds = require('@aws-cdk/aws-rds');

class GuestbookDBSecretStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    
    var vpc = props.vpc.current;
    
    // Create a rotating secret we can use to access the database.
    /**
    const databaseCredentialsSecret = new rds.DatabaseSecret(this, `guestbook-${props.environmentType}-dbuser-credentials`, {
    	  username: 'guestbookuser',
        host: props.rds.current.attrEndpointAddress,
        engine: props.secretManager.engine,
        foo: 'bar'
    });
    */
    
    //databaseCredentialsSecret.attach(props.rds.current);
    
    // Create DB credentials for RDS
    const databaseCredentialsSecret = new secretsManager.Secret(this, 'dbuser-credentials', {
      secretName: `${props.rds.serviceName}-${props.environmentType}-dbuser-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'guestbookuser',
          engine: props.secretManager.engine,
          host: props.rds.current.attrEndpointAddress
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password'
      }
    });

    // The target service or database
    const target = new ec2.Connections({
      defaultPort: ec2.Port.tcp(3306),
      securityGroups: props.rds.current.vpcSecurityGroupIds
    });

    new secretsManager.SecretRotation(this, 'SecretRotation', {
      application: secretsManager.SecretRotationApplication.MYSQL_ROTATION_SINGLE_USER,
      secret: databaseCredentialsSecret,
      target,
      vpc: vpc,
      subnetType: ec2.SubnetType.PRIVATE
    });    
  }
}

module.exports = { GuestbookDBSecretStack }
