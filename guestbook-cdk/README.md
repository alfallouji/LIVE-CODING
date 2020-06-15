# Welcome to your CDK JavaScript project!

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## Configuration

Copy file conf/config.json.sample to `conf/config.prod.json` (for production env) and `conf/config.dev.json` (for dev env) and customize them if needed.

## Targeting dev or prod environment

The same code is used to build dev and production environment. You can pass the `env` parameter as a context to select the desired environment.

### Production environment
`cdk deploy {stackName} -c env=prod`

`cdk synth {stackName} -c env=prod`

### Development environment

`cdk deploy {stackName} -c env=dev`

`cdk synth {stackName} -c env=dev`

### To list stacks

`cdk list -c env=dev|prod`


### How to deploy all the stacks into a new account

Follow this order : 

#### 1. Bootstrap using your account id, region and select adequate environment (dev or prod):
`cdk bootstrap aws://1234567890/eu-west-1 -c env=dev|prod`

#### 2. Deploy the vpc
`cdk deploy guestbook-dev|prod-vpc -c env=dev`

#### 3. Deploy common resources (e.g. IAM role)
`cdk deploy guestbook-dev|prod-common -c env=dev`

#### 4. Deploy database
`cdk deploy guestbook-dev|prod-rds -c env=dev`

#### 5. Deploy application
`cdk deploy guestbook-dev|prod-ec2 -c env=dev`

