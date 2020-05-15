#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { GuestbookVpcStack } = require('../lib/guestbook-vpc-stack');
const props = require('../conf/config.json');

const app = new cdk.App();
new GuestbookVpcStack(app, 'GuestbookVpcStack', props);