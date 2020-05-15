const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');

class GuestbookVpcStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, props.vpc.name, {
      maxAzs: 3,
     	subnetConfiguration: [
           {
             cidrMask: 24,
             name: 'public',
             subnetType: ec2.SubnetType.PUBLIC,
           },
           {
             cidrMask: 24,
             name: 'private',
             subnetType: ec2.SubnetType.PRIVATE,
           },
           {
             cidrMask: 24,
             name: 'isolated',
             subnetType: ec2.SubnetType.ISOLATED,
           }
        ]
      }
    );
  }
}

module.exports = { GuestbookVpcStack }
