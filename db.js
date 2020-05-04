var cfg = require('nconf');
var mysql = require('mysql');
var db_config = {
    host: (process.env.db_info && process.env.db_info.host) || cfg.get('db:host'),
    user: (process.env.db_info && process.env.db_info.username) || cfg.get('db:user'),
    password: (process.env.db_info && process.env.db_info.password) || cfg.get('db:password'),
    database: (process.env.db_info && process.env.db_info.database) || cfg.get('db:database')
};

var connection;

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
