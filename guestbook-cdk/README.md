# Guestbook CDK JavaScript project

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
`cdk bootstrap aws://{account_id}/{region} -c env=dev|prod`

Example:

To bootstrap the dev environment on eu-central-1 :

`cdk bootstrap aws://01234567890/eu-central-1 -c env=dev`

#### 2. Deploy the vpc
`cdk deploy guestbook-dev|prod-vpc -c env=dev`

#### 3. Deploy common resources (e.g. IAM role)
`cdk deploy guestbook-dev|prod-common -c env=dev`

#### 4. Deploy database
`cdk deploy guestbook-dev|prod-rds -c env=dev`

#### 5. Deploy application
`cdk deploy guestbook-dev|prod-ec2 -c env=dev`

### CDK Stacks
The same stack code can be used to deploy into a dev and a production environment. The `conf/config.dev.json` and `conf/config.prod.json` files allows slight customization on 

#### guestbook-{dev|prod}-vpc
This will deploy a vpc with 3 subnetsd on each AZ (public, private and isolated), an internet gateway, a NAT Gateway along with all the adequate routes. The subnets definition is the following :

- public subnet : full access to the internet, this is for public facing resources (e.g. a load balancer)
- private subnet : only outbound access to the internet via the NAT gateway (e.g. to download external packages), this is for application server for example
- isolated subnet : no access to the internet at all, this is for a database (rds) for example

#### guestbook-{dev|prod}-common
This will deploy some common resources such as role, that are used by other stacks.

#### guestbook-{dev|prod}-ec2
This will deploy an autoscaling group, with a load balancer and ec2 instances. It will bootstrap the ec2 instance (deploy and configure the guestbook app) via a userdata script. 

#### guestbook-{dev|prod}-rds
This will deploy an rds database (aurora serverless), it will enable secret rotation using AWS Secrets Manager and it will also deploy the initial schema via a custom resource.
