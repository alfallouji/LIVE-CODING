const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const iam = require('@aws-cdk/aws-iam');
const autoscaling = require('@aws-cdk/aws-autoscaling');
const elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
const utils = require('../utils/lookup.js');

class GuestbookEc2Stack extends cdk.Stack {
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
    var vpc = props.vpc.current;
    
    // Load/Fetch the existing app security group 
    var lookup = new utils.Lookup(props);
    var clientSecurityGroup = await lookup.getAppSecurityGroup(this);
  
    const trustedRemoteNetwork = ec2.Peer.anyIpv4();
    const httpPort = ec2.Port.tcp(80);
    clientSecurityGroup.addIngressRule(
      trustedRemoteNetwork,
      httpPort,
      'Allow inbound HTTP port 80 from anywhere'
    );

    // Create role for the EC2 instance
    const role = new iam.Role(this, props.instance.rolename, {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });
    
    // allow instance to communicate with secrets manager & ssm (for debug purposes if needed)
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(props.instance.roleManagedPolicyName));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(props.iam.ssmManagedPolicyName));
    
    /**
    // If you want to select a specific AMI, you can do the following :
    const machineImage = ec2.MachineImage.lookup({
      name: props.instance.machineImage,
    });
    */
    
    // Use latest amazon linux2 AMI
    var machineImage = new ec2.AmazonLinuxImage({generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2});
    
    var subnets = vpc.selectSubnets({subnetType: ec2.SubnetType.PUBLIC});
    var userdata = ec2.UserData.forLinux();
    
    const secretName = `${props.rds.serviceName}-${props.environmentType}-master-credentials`;

    userdata.addCommands(
      'sudo curl https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/guestbook-app/setup/userdata.sh > /tmp/userdata.sh', 
      'sudo sh /tmp/userdata.sh',
      `sudo echo "GUESTBOOK_SECRET_NAME="${secretName}" >> /opt/guestbook.env`,
      `sudo echo "GUESTBOOK_REGION="${props.env.region}" >> /opt/guestbook.env`
    );
    
    const lb = new elbv2.ApplicationLoadBalancer(this, 'loadbalancer', {
      vpc,
      internetFacing: true,
      healthCheck: {
        port: 8080
      }
    });  
    
    const listener = lb.addListener('listener', { 
      port: 80,
      open:true
    });
    
    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');
    
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      vpcSubnets: subnets,
      userData: userdata,
      instanceName: props.instance.name + '-' + props.environmentType,
      machineImage: machineImage,
      role: role
    });

    asg.addSecurityGroup(clientSecurityGroup);
  
    listener.addTargets('ApplicationFleet', {
      port: 8080,
      targets: [asg]
    });
    
    /**
    // If you want to deploy a single instance (without ALB or Autoscaling group) : 
    var ec2Instance = new ec2.Instance(this, 'Instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      vpc: vpc,
      instanceName: props.instance.name + '-' + props.environmentType,
      vpcSubnets: subnets,
      machineImage: machineImage,
      role: role,
      securityGroup: clientSecurityGroup,
      userData: userdata
    });

    // Create an EIP for the instance
    const ec2EIP = new ec2.CfnEIP(ec2Instance, 'guestbook-eip', {
      domain: 'vpc',
      instanceId: ec2Instance.instanceId,
    });
    */
  }
}

module.exports = { GuestbookEc2Stack }
