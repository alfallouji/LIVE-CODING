#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { GuestbookVpcStack } = require('../lib/guestbook-vpc-stack');

const app = new cdk.App();

const env_name = app.node.tryGetContext('env');
switch(env_name) { 
    case 'prod':
        var props = require('../conf/config.prod.json');
    break;
    
    case 'dev':
        var props = require('../conf/config.dev.json');
    break;
    
    default:
        throw('An environment context must be provided (-c env=prod|dev)');
    break;
}

var prefix = env_name.charAt(0).toUpperCase() + env_name.slice(1);
new GuestbookVpcStack(app, 'Guestbook' + prefix + 'VpcStack', props);