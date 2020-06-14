const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const iam = require('@aws-cdk/aws-iam');

class GuestbookCommonStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    
    var vpc = props.vpc.current;
  
    // Security group for the guestbook app
    let clientSecurityGroup = new ec2.SecurityGroup(this, props.instance.securityGroupName, {
      vpc: vpc,
      description: "Security Group Guestbook App",
    });
    
    // Tag the security group so it can be looked up easily
    cdk.Tag.add(clientSecurityGroup, 'cdk-name-lookup', props.instance.securityGroupName);
  }
}

module.exports = { GuestbookCommonStack }
