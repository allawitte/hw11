'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var db = [
    {id:1, name: 'Nick', score: 10},
    {id:2, name: 'Sony', score: 9},
    {id:3, name: 'Tobby', score: 11},
    {id:4, name: 'Alan', score: 12},
];
app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));
app.set('port', process.env.PORT || '8888');
app.use(bodyParser.json());

app.get('/users', function (req, res) {
    console.log('I received a GET request');
    res.json(db);
});

app.post('/add/', function(req, res) {
    if( !req.body.name || !req.body.score) {
        res.send('403 wrong params of object user');
        return;
    }
    var id = db[db.length-1].id + 1;
    var user = {
        id: id,
        name: req.body.name,
        score: req.body.score
    };
    db.push(user);
    res.json(db);
});

app.delete('/delete/:all', function(req, res) {
    var all = req.params.all;
    if (all == 'all') {
        db = [];
        console.log('Users deleted');
        res.json(db);
        return;
    }
    else {
        res.send('403 wrong delete param');
    }
});

app.delete('/delete/:id', function(req, res) {
    var id = req.params.id;
    console.log('id= ',id);
    var ind = null;
    db.forEach(function(item, index){
        if (item.id == id) {
            ind = index;        }
    });
    if(ind === null) {
        res.send('404, user not found');
        return;
    }
    db.splice(ind, 1);
    console.log('User deleted');
    res.json(db);
});

app.put('/edit/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
    var failure = true;
    if( !req.body.name || !req.body.score) {
        res.send('403 wrong params of object user');
        return;
    }
    db.forEach(function(item){
        if (item.id == id) {
            item.name = req.body.name;
            item.score = req.body.score;
            failure = false;
        }
    });
    if (failure) {
        res.send('404 user not found');
        return;
    }
    console.log('Save updates');
    res.json(db);
});

app.use(function (req, res, next) {
    console.log('Looking for URL:' + req.url);
    next();
});


app.use(function (req, res) {
    res.type('text/html');
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on port http://localhost:' + app.get('port'));
});
/**
 * Created by HP on 10/29/2016.
 */
