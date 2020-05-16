# Welcome to your CDK JavaScript project!

This is a blank project for JavaScript development with CDK.

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
`cdk deploy -c env=prod`

`cdk synth -c env=prod`

### Development environment

`cdk deploy -c env=dev`

`cdk synth -c env=dev`
