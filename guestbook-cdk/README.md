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

##### Example:

To bootstrap the dev environment on eu-central-1 :

`cdk bootstrap aws://01234567890/eu-central-1 -c env=dev`

#### 2. Deploy the vpc
`cdk deploy guestbook-dev|prod-vpc -c env=dev`

##### Example:
This will deploy the vpc stack for a prod environment:

`cdk deploy guestbook-prod-vpc -c env=prod`

This will deploy the vpc stack for a dev environment in the us-east-1 region (it overrides the region configured in the config file):

`cdk deploy guestbook-dev-vpc -c env=dev -c region=us-east-1`

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

#### Architecture overview

Here is a view of what will be deployed.

<p align="center"><img src="https://raw.githubusercontent.com/alfallouji/LIVE-CODING/master/episodes/assets/step_5.png" /></p>

[Draw.io diagram](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1#R7Zttc9o4EIB%2FDTN3H8L4%2FeUjL0mud02bKTPt3H1hhC2MJsLy2DIh%2FfW3smXAlii5K6TQ0maCtRaSvPusdqXIPXu0XN%2FnKFs8sBjTnmXE65497lmW6VgefAjJSy0JfKcWJDmJZaWtYEK%2BYik0pLQkMS5aFTljlJOsLYxYmuKIt2Qoz9lzu9qc0XavGUqwIphEiKrSLyTmC%2FkUrrGV%2F4FJsmh6Ng15Z4maylJQLFDMnndE9m3PHuWM8fpquR5hKpTX6KX%2B3t2eu5uB5Tjlr%2FnCJzYMcz7IUWl%2FnNkffGeNnm7cupUVoqV84E84ISyVQ%2BYvjR4yRlJe6dIdwg90NTJ6LtwZiVLfcjuCbtlvC0y1JNpoC7plvy0wu82bnf7N7gB3BEqp1bzR6d%2FYGSD82ENWckpSPNpQZ4AwyVFMwBojRlkOspSloL3hgi8plEy4fF4QjicZioRWn8FjQDZnKZfcm1ZTlooXrQI3mbherhPhYn30XDj9JGdlVnX5DsjX3p3mtSWhBZ6zJ9yMqmfZpuPfDgeiL0JpZ7QrnHMC%2FA8oSUTDnIl%2BkCxRPOeiRXgEkibvq9LYNuSwdV3EqFjgWD6LyqzEWPSK1zsiyfA9ZkvM8xeo0txt%2FElOKGZYF5%2B33ul5sspi1zONQEqRnBKSTdtbr4EL6Tj%2FwYk8xYkGK0QomhFKuBj6P0K1XY%2FS6H6%2FoTZaNPeaqMvNPoMcwwZO2wauagMz0Ngg9E9lAv9XM4Htn5sJgl%2FNBG5wbiYIFRP0LI%2BKCXsGF4m4uC9xwWeMPUG9z4%2Bj5j50t6mi2OgSgt0qi3ToBH5oht5JI92mi6NHOrfNl22rgLmhBjDvZIA1WfkOYY%2FljJIIZJNylmJ%2BkfAU9dB%2FNn46IcIONROUrUuVTsePeeXnYvixQ%2Ffs%2BLGu%2FFwMP55xfvOPrfKTkxXieAcgDy2FItNZkV1qNvRzAtUNaG7gvhYo51RAOVegLheoboQ7B6DUHdkrUBcDVDfknQNQ6u6kCpTx27uCUZDFv19pOhuauvHOD6zX0WQZ%2FqloUjdarzRdBk3dYHcONKl7xleaLoOmbqQ7B5p029%2BvAaalm0bx79EM00dWEF79EXU8Y5yz5UHLRKBSnLdx06Bj94moB2BME0D7Gb10MADb3UH2YHv7gT6CFR2rPSdYmiW6F6pG9K0T2dBSN5jP2IarLJqm6Mea0Oru8vqmYkJX44fuqRJOS93jvR0Jwbu04CiN1L8BNroly%2Bowzq7a9YY6aF8qbgxR9CSm4DTesci8%2BgdVqs4GRbZFCDWFOVkLlIZyPOMF5%2BK00UDoxbqL4tTqE5ju5ySNcd6PoEfrLkYcwYeQF%2FCJlugrS2%2BAkpuC4zQiVEirw0F3E85yaHg6BYLhHp%2BOMSXwSC%2FTwZfJtLl7XzN1Y1pBP0uTY6STodUixbNthRQ%2F0Dh7cCpS1N1c0AAIRpSVcfg6x%2B8EPPh%2FJ4awz%2BOUILwBouO6m4ZeNbMsSRxTXdzeIPmtyeVQPtI8Z5OPmNvYL%2BL%2Bvuwky1lcRrxOTYaZNkeJalUfJydwnBZgpqmZiiwVsPAI273%2B6INR4Af8MQv4X7d%2F3z98DP68UWeiQeWXPXEq0a7UOihz8Lcram%2BAGqpV3aCmcKWh7xuJSzvqBZ6auOjOXpjmqVhTN4KVsxdjPEelWNFcD16cem3zXXB1D16EmmlMd%2B7CNI8QKbVwqZvCY8g3ZqgQC%2BUNZ3kDEklhsgB9fkXVnKHc3%2Bwg17%2FVChMc5dXa%2BxPjso2zTcIpWs5iNJ2XaVT3oE3CnUNJ%2BHcR43UORHqW5qiOLgk%2FwjpKC4zmSGqVWdWGhVzUeEAppJn5NfK9QeQraq1Pl1Lnx2HObjO3edHgh4VAdW9471JvTvF6IF7PAF3gNJaX44iioiB1QEFivdAV79izbhvHyvsbBxV4yCmlLMcU5r5Vu3md0mQPj%2BIViZ2Fecc%2BTmD33XYjBSvzCMvvbZWvNOW5B5sCdSWYK01Vdtw8%2Bv83rWallmUUfLAODsZ7hmL4AAcUK%2FzrrPIm%2BfTWAlMK%2Bp%2FOGu0fJ8XuHG92NMdP33Z%2BUQ%2Fv1EFtUHImYhvYjjQ7JVf2TryW46yQ%2Bj4KbbZnvRltUNy%2BdlfPkNuXF%2B3bfwE%3D)
