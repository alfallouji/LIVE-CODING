const ec2 = require('@aws-cdk/aws-ec2');
const cdk = require('@aws-cdk/core');

class Lookup {
    /**
     * Class constructor
     */
    constructor(props) {
        this.props = props;
    }
    
    /**
     * Async function helper to get a security group by filters 
     */
    async getSecurityGroupByFilters(filters) {
      var sdkEc2 = new this.props.AWS.EC2({apiVersion: '2016-11-15'});
      var params = {
        DryRun: false,
        Filters: filters
      };
      
      let promise = new Promise((resolve, reject) => {
        sdkEc2.describeSecurityGroups(params, function(err, data) {
          if (err) {
            // an error occurred
            console.log(err, err.stack); 
            reject();
          } else {
            // successful response
            if (Array.isArray(data['SecurityGroups']) && data['SecurityGroups'].length) {
                resolve(data['SecurityGroups'][0].GroupId);
            } else { 
                resolve();
            }
          }
        });
      });              
    
      return await promise;
    }

    /**
     * Returns the app security group 
     */
    async getAppSecurityGroup(scope) {
        var filters = [{
          Name: 'tag:cdk-name-lookup',
          Values: [
            'guestbook-app-sg'
        ]}];

        var appSecurityGroupId = await this.getSecurityGroupByFilters(filters);
        var appSecurityGroup = null;
        
        // Load the existing app security group (we are making an assumption that this sg exists already -> the ec2 stack was executed already)
        // @todo : Handle the case that this assumption isnt true
        if (appSecurityGroupId) { 
          appSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            scope, 
            'guestbook-app-sg', 
            appSecurityGroupId 
          );
        } else { 
            // Security group for the guestbook app
            appSecurityGroup = new ec2.SecurityGroup(scope, this.props.instance.securityGroupName, {
              vpc: this.props.vpc.current,
              description: "Security Group Guestbook App",
            });
            
            // Tag the security group so it can be looked up easily
            cdk.Tag.add(appSecurityGroup, 'cdk-name-lookup', this.props.instance.securityGroupName);
        }
        
        return appSecurityGroup;
    }
}

module.exports = { Lookup }