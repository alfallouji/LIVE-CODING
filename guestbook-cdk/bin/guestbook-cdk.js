#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');

const { GuestbookVpcStack } = require('../lib/guestbook-vpc-stack');
const { GuestbookRdsStack } = require('../lib/guestbook-rds-stack');
const { GuestbookEc2Stack } = require('../lib/guestbook-ec2-stack');
const { GuestbookCommonStack } = require('../lib/guestbook-common-stack');

const app = new cdk.App();

var props = {};
const env_name = app.node.tryGetContext('env');
switch(env_name) { 
    case 'prod':
        props = require('../conf/config.prod.json');
    break;
    
    case 'dev':
        props = require('../conf/config.dev.json');
    break;
    
    default:
        throw('An environment context must be provided (-c env=prod|dev)');
    break;
}

// Inject AWS SDK into properties
props.AWS = require('aws-sdk');
props.AWS.config.update({region: props.env.region});

var prefix = env_name.charAt(0).toLowerCase() + env_name.slice(1);

props.stackName = 'guestbook-' + prefix + '-vpc';
var vpcStack = new GuestbookVpcStack(app, props.stackName, props);

if (vpcStack) {
    props.vpc.current = vpcStack.getVPC();
} else { 
    props.vpc.lookupName = props.stackName + '/' + props.vpc.name;
    props.vpc.current = ec2.Vpc.fromLookup(this, props.vpc.name, {
        isDefault: false,
        vpcName: props.vpc.lookupName,
    });    
}

props.stackName = 'guestbook-' + prefix + '-common';
var commonStack = new GuestbookCommonStack(app, props.stackName, props);

props.stackName = 'guestbook-' + prefix + '-rds';
var rdsStack = new GuestbookRdsStack(app, props.stackName, props);
if (rdsStack) {
    props.rds.current = rdsStack.getRdsCluster();
    props.rds.stack = rdsStack;
} else { 
    props.rds.current = null;
}

props.stackName = 'guestbook-' + prefix + '-ec2';
var ec2Stack = new GuestbookEc2Stack(app, props.stackName, props);
