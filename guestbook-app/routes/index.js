var cfg = require('nconf');

/* GET home page. */
exports.home = function(req, res) {
    var db = req.app.get('db');
    db.getGuestbook(function(err, rows) {
        if (err) {
            throw err;
        } else {
            res.render('index', { 'rows': rows });
        }
    });
};

exports.post = function(req, res) {
    var name = req.body.name;
    var message = req.body.message;

    // Debug
    console.log('Post data:', req.body);

    // name and message cant be empty
    if (name == '' ||  message == '') {
        res.redirect('/');
        return;
    }

    // Write record to db.
    var db = req.app.get('db');
    db.setGuestbook(name, message, function(err, rows) {
        if (err) {
            console.log('Write db failed.');
            throw err;
        }

        res.redirect('/');
    });
};
