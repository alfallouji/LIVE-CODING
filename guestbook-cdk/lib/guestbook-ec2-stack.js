const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const iam = require('@aws-cdk/aws-iam');

class GuestbookEc2Stack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    
    var vpc = props.vpc.current;
  
    // Security group
    let clientSecurityGroup = new ec2.SecurityGroup(this, 'guestbook-app-sg',{
      vpc: vpc,
      description: "Security Group Guestbook App",
    });
    
    // Tag the security group so it can be looked up easily
    cdk.Tag.add(clientSecurityGroup, 'cdk-name-lookup', 'guestbook-app-sg');

    const trustedRemoteNetwork = ec2.Peer.anyIpv4();
    const httpPort = ec2.Port.tcp(80);
    clientSecurityGroup.addIngressRule(
      trustedRemoteNetwork,
      httpPort,
      'Allow inbound HTTP port 80 from anywhere'
    );

    // Use existing role (if it exists)
    var role = iam.Role.fromRoleArn(this, props.iam.ssmRoleName, props.iam.ssmExistingRoleArn);

    // Otherwise, create it
    if (!role) {
        role = new iam.Role(this, 'guestbook-ssm-role', {
          'assumedBy': new iam.ServicePrincipal('ec2.amazonaws.com'),
          'roleName': props.iam.ssmRoleName,
          'description': 'ssm role used by ec2',
          'managedPolicies': [props.iam.ssmManagedPolicyArn]
        });
    }

    // Select AMI 
    const machineImage = ec2.MachineImage.lookup({
      name: props.instance.machineImage,
    });

    var subnets = vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC});

    var ec2Instance = new ec2.Instance(this, 'Instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      vpc: vpc,
      instanceName: props.instance.name + '-' + props.environmentType,
      vpcSubnets: subnets,
      machineImage: machineImage,
      role: role,
      securityGroup: clientSecurityGroup,
    });

    // Create an EIP for each instance
    const ec2EIP = new ec2.CfnEIP(ec2Instance, 'guestbook-eip', {
      domain: 'vpc',
      instanceId: ec2Instance.instanceId,
    });
  }
}

module.exports = { GuestbookEc2Stack }
