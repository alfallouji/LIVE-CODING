exports.main = function(event, context, callback) {
    // Use this code snippet in your app.
    // If you need more information about configurations or implementing the sample code, visit the AWS docs:
    // https://aws.amazon.com/developers/getting-started/nodejs/
    
    // Load the AWS SDK
    var AWS = require('aws-sdk');
    const region = process.env.AWS_REGION;
    var mysql = require('mysql');
    var cfnresponse = require('cfn-response');
    var secret = null;
    var decodedBinarySecret = null;

    console.log('Starting Lambda using region: ' + region);
    
    // Create a Secrets Manager client
    var client = new AWS.SecretsManager({
        region: region
    });
    
    // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
    // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    // We rethrow the exception by default.
    
    client.getSecretValue({SecretId: process.env.secretName}, function(err, data) {
        if (err) {
            if (err.code === 'DecryptionFailureException')
                // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InternalServiceErrorException')
                // An error occurred on the server side.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidParameterException')
                // You provided an invalid value for a parameter.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidRequestException')
                // You provided a parameter value that is not valid for the current state of the resource.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'ResourceNotFoundException')
                // We can't find the resource that you asked for.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
        }
        else {
            // Decrypts secret using the associated KMS CMK.
            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if ('SecretString' in data) {
                secret = data.SecretString;
            } else {
                let buff = new Buffer(data.SecretBinary, 'base64');
                decodedBinarySecret = buff.toString('ascii');
            }
        }
        
        var secretJson = JSON.parse(secret);
        var mysql = require('mysql');
        var con = mysql.createConnection({
          host: secretJson.host,
          user: secretJson.username,
          password: secretJson.password,
          database: 'mysql',
          multipleStatements: true
        });
        
        con.connect(function(err) {
          if (err) {
              console.log('Error occured while connecting', err);
              cfnresponse.send(event, context, cfnresponse.FAILED, {"Data": "notOk"});
              callback(err);
          }
          
          // @todo : Move sql outside
          con.query("CREATE DATABASE IF NOT EXISTS " + secretJson.database +"; CREATE TABLE IF NOT EXISTS " + secretJson.database + ".guestbook ( \
  `id` INT NOT NULL AUTO_INCREMENT, \
  `name` VARCHAR(32) NOT NULL, \
  `message` TEXT NULL, \
  `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, \
  PRIMARY KEY (`id`)); SHOW DATABASES;", function (err, result, fields) {
            if (err) {
                console.log('Error - couldnt create schema', err);
                cfnresponse.send(event, context, cfnresponse.FAILED, {"Data": "notOk"});
                callback(err);
            }
            console.log('success', result);
            con.end();
            cfnresponse.send(event, context, cfnresponse.SUCCESS, {"Data": "ok"});
            callback(null);
          });
        });  
    });
}