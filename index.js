'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('contacts',['contactslist']);


app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));
app.set('port', process.env.PORT || '3300');
app.use(bodyParser.json());
app.engine('html', require('ejs').renderFile);
//fill up db for test
var contactsArr = [
    {"name":"Ольга","secondname":"Николаевна","familyname":"Иванова","phone":"90177712345"},
    {"name":"Андрей","secondname":"Петрович","familyname":"Смирнов","phone":"9171234567"},
    {"name":"Сергей","secondname":"Александрович","familyname":"Петренко","phone":"9041234567"},
    {"name":"Анна","secondname":"Анатольевна","familyname":"Пыжевская","phone":"9051234567"},
    {"name":"Ольга","secondname":"Юрьевна","familyname":"Киндурис","phone":"9151234567"},
    {"name":"Светлана","secondname":"Александровна","familyname":"Мороз","phone":"9081234567"},
    {"name":"Семен","secondname":"Сергеевич","familyname":"Симоненко","phone":"9031234567"},
    {"name":"Станисолав","secondname":"Эдуардович","familyname":"Юдин","phone":"9037654321"},
    {"name":"Мария","secondname":"Яковлевна","familyname":"Милова","phone":"9085671234"},
    {"name":"Ольга","secondname":"Васильевна","familyname":"Зазнобина","phone":"4567123456"}
];
var setDb = function(){
    db.contactslist.insert(contactsArr, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Contacts array is successfully added to the db contacts');
        }
    });
};
setDb();

var getDb = function(req, res) {
    db.contactslist.find(function(err, doc) {
        if (err) {
            res.status(403).send('Data base error');
        }
        else {
            res.json(doc);
        }
    });
};


app.get('/',function(req, res){
    res.render('index.html');
});

app.get('/contacts', function (req, res) {
    getDb(req, res);
});

app.get('/search', function (req, res) {
    var  finddata = req.query;

    db.contactslist.find(finddata, function(err, result) {
        if(err){
            res.status(403).send(err);
        }
        else {
           res.json(result);

        }
    })
});

app.post('/add', function(req, res) {

    var newUser = {
        "name":req.body.name,
        "secondname":req.body.secondname,
        "familyname":req.body.familyname,
        "phone":req.body.phone
    };
    if( !req.body.name && !req.body.secondname &&  !req.body.familyname && !req.body.phone) {
        res.status(403).send('Wrong params of object contacts');
        return;
    }
    db.contactslist.insert(newUser, function(err, result) {
        if(err) {
            res.status(403).send(err);
        }
        else {
            getDb(req, res);
        }
    });

});

app.delete('/deleteall', function(req, res) {

        db.contactslist.remove({}, function(err, result) {
            if(err) {
                res.status(403).send(err);
            }
            else {
                res.status(200).json(result);
            }
        });

});

app.delete('/delete/:id', function(req, res) {
    var id = req.params.id;
    console.log('id= ',id);
    db.contactslist.remove({_id: id}, function(err, result) {
        if(err) {
            res.status(403).send(err);
        }
        else {
            console.log(result);
            getDb(req, res);
        }
    });
});

app.put('/edit/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
    var failure = true;
    if( !req.body.name && !req.body.secondname &&  !req.body.familyname && !req.body.phone) {
        res.send('403 wrong params of object user');
        return;
    }
    db.contactslist.update({_id: id}, req.body, function(err, result) {
        if(err) {
            res.status(403).send("Error data update");
        }
        else {
            getDb(req, res);
        }
    });
});

app.use(function (req, res, next) {
    console.log('Looking for URL:' + req.url);
    next();
});

app.listen(app.get('port'), function () {
    console.log('Express started on port http://localhost:' + app.get('port'));
});
/**
 * Created by HP on 10/29/2016.
 */
