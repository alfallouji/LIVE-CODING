var cfg = require('nconf');
var mysql = require('mysql');

// Load the AWS SDK
var AWS = require('aws-sdk'),
// @todo - move to config file region & secretName
region = "eu-central-1",
secretName = "guestbook-dev-master-credentials",
secret,
decodedBinarySecret;

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

var connection;

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

client.getSecretValue({SecretId: secretName}, function(err, data) {
    if (err) {
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

    var secretJSON = JSON.parse(secret);
    console.log('getting secret', secretJSON);
    var db_config = {
        host: secretJSON.host || (process.env.db_info && process.env.db_info.host) || cfg.get('db:host'),
        user: secretJSON.username || (process.env.db_info && process.env.db_info.username) || cfg.get('db:username'),
        password: secretJSON.password || (process.env.db_info && process.env.db_info.password) || cfg.get('db:password'),
        database: secretJSON.database || (process.env.db_info && process.env.db_info.database) || cfg.get('db:database')
    };

    function handleDisconnect() {
        connection = mysql.createConnection(db_config);

        connection.connect(function(err) {
            if (err) {
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000);
            }
        });

        connection.on('error', function(err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }

    handleDisconnect();
});


module.exports = {

    // Return all post made to the guestbook
    getGuestbook: function(callback) {
        connection.query('SELECT * FROM `guestbook` ORDER BY `date` DESC;', function(err, rows, fields) {
            callback(err, rows);
        });
    },

    // Insert a new comment to the guestbook
    setGuestbook: function(name, message, callback) {
        connection.query('INSERT INTO `guestbook`(`name`, `message`) VALUE(?, ?);',
            [name, message], function(err, rows, fields) {
            callback(err, rows);
        });
    }
};
