'use strict';
var express = require('express');
var app = express();

var db = [
    {id:1, name: 'Nick', score: 10},
    {id:2, name: 'Sony', score: 9},
    {id:3, name: 'Tobby', score: 11},
    {id:4, name: 'Alan', score: 12},
];
app.disable('x-powered-by');
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//MORE INSTALL

app.use(require('body-parser').urlencoded({extended: true}));

app.set('port', process.env.PORT || '8888');
//console.log(__dirname);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('home', {data: db});
});

app.get('/update-list', function (req, res) {
    res.render('update-list', {data: db});
});

app.get('/thankyou', function (req, res) {
    res.render('thankyou');
});



app.put('/update?*', function(req, res) {
    console.log('FORM: ',req.query.form );
    console.log('Name: ',req.body.name );
    console.log('Score: ',req.body.score );
    console.log('Id: ',req.body.id );
    res.redirect(303, 'thankyou');
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
