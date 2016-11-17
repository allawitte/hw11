'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/planner');
var db = mongoose.connection;

var mongojs = require('mongojs');
var db = mongojs('planner',['tasks', 'personal']);


app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));
app.set('port', process.env.PORT || '3300');
app.use(bodyParser.json());

var Schema = mongoose.Schema;
var personalSchema = new Schema({
    name: {type: String, required: true},
    familyname: {type: String, required: true},
    phone: String
}, {collection: 'personal'});

var tasksSchema = new Schema({
    name: {type: String, requires: true},
    status: {type: Boolean, required: true},
    personal: [{type: mongoose.Schema.ObjectId}]
}, {collection: 'tasks'});

var Personal = mongoose.model('Personal', personalSchema);
var Task = mongoose.model('Task', tasksSchema);

//fill up db for test
var personalArr = [
    {"name": "Ольга", "familyname": "Иванова", "phone": "90177712345"},
    {"name": "Андрей", "familyname": "Смирнов", "phone": "9171234567"},
    {"name": "Сергей", "familyname": "Петренко", "phone": "9041234567"},
    {"name": "Анна", "familyname": "Пыжевская", "phone": "9051234567"},
    {"name": "Ольга", "familyname": "Киндурис", "phone": "9151234567"},
    {"name": "Светлана", "familyname": "Мороз", "phone": "9081234567"},
    {"name": "Семен", "familyname": "Симоненко", "phone": "9031234567"},
    {"name": "Станисолав", "familyname": "Юдин", "phone": "9037654321"},
    {"name": "Мария", "familyname": "Милова", "phone": "9085671234"},
    {"name": "Ольга", "familyname": "Зазнобина", "phone": "4567123456"}
];

var setDb = function () {
    personalArr.forEach(item => {
        var data = new Personal(item);
        data.save(err => {
            console.log(err);
        });
    });
};


//setDb();

var getDb = function(req, res) {
    Personal.find(function(err, pers) {
        if (err) {
            res.status(403).send(err);
        }
        else {
            res.status(200).json(pers);
        }
    });
};

var tasksAgg = function(req, res) {
    db.tasks.aggregate(
        {$unwind: '$personal'}
        ,{$lookup: {
            from: "personal",
            localField: "personal",
            foreignField: "_id",
            as: "stats"
        }}
        ,{ $group : { _id : "$_id", name: {$first: "$name"}, status: {$first: "$status"}, exec: { $push: "$stats" } } }
        ,function(err, result){
            if(err){
                console.log(err);
            }
            else {
                res.status(200).json(result);
            }
        });
};

var getTasks = function(req, res) {

    Task.find(function(err, pers) {
        if (err) {
            res.status(403).send(err);
        }
        else {
            tasksAgg(req, res);
        }
    });
};


app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/personal', function (req, res) {
    getDb(req, res)
});

app.get('/gettasks', function(req, res) {
    getTasks(req, res);
});

app.post('/addpers', function (req, res) {

    var newUser = {
        "name": req.body.name,
        "familyname": req.body.familyname,
        "phone": req.body.phone
    };
    var data = new Personal(newUser);
    if (!req.body.name && !req.body.familyname && !req.body.phone) {
        res.status(403).send('Wrong params of object personal');
        return;
    }
    data.save(data, function (err, result) {
        if (err) {
            res.status(403).send(err);
        }
        else {
            getDb(req, res);
        }
    });

});


app.post('/addtask', function(req, res) {
    var ObjectID = require('mongodb').ObjectID;
    req.body.pers.forEach((item, index) => {
        req.body.pers[index] = new ObjectID(item);
    });

    var newTask = {
        'name':req.body.name,
        'status':req.body.status,
        'personal':req.body.pers
    };

    var data = new Task(newTask);
    if (!req.body.name && !req.body.pers.length) {
        res.status(403).send('Wrong params of object task');
        return;
    };
    data.save(data, function (err, result) {
        if (err) {
            res.status(403).send(err);
        }
        else {
            tasksAgg(req, res);
        }
    });
});

app.put('/updatetask/:id', function(req, res) {
    var id = req.params.id;
    var ObjectID = require('mongodb').ObjectID;
    req.body.pers.forEach((item, index) => {
        req.body.pers[index] = new ObjectID(item);
    });

    var data = {
        'name':req.body.name,
        'status':req.body.status,
        'personal':req.body.pers
    };

    //var data = new Task(newTask);
    if (!req.body.name && !req.body.pers.length) {
        res.status(403).send('Wrong params of object task');
        return;
    };
    Task.update({_id: id}, data, function (err, result) {
        if (err) {
            res.status(403).send("Error data update");
        }
        else {
            tasksAgg(req, res);
        }
    });
});

app.delete('/deleteall', function (req, res) {

    db.contactslist.remove({}, function (err, result) {
        if (err) {
            res.status(403).send(err);
        }
        else {
            res.status(200).json(result);
        }
    });

});

app.delete('/deletepers/:id', function (req, res) {
    var id = req.params.id;
    Personal.remove({_id: id}, function (err, result) {
        if (err) {
            res.status(403).send("Error data delete");
        }
        else {
            getDb(req, res);
        }
    });
});

app.delete('/deltask/:id', function(req, res) {
    var id = req.params.id;
    Task.remove({_id: id}, function (err, result) {
        if (err) {
            res.status(403).send("Error task delete");
        }
        else {
            tasksAgg(req, res);
        }
    });
});

app.put('/editpers/:id', function (req, res) {
    var id = req.params.id;
    if (!req.body.name && !req.body.familyname && !req.body.phone) {
        res.send('403 wrong params of object user');
        return;
    }
    var data = {
        name: req.body.name,
        familyname: req.body.familyname,
        phone: req.body.phone
    };
    Personal.update({_id: id}, data, function (err, result) {
        if (err) {
            res.status(403).send("Error data update");
        }
        else {
            getDb(req, res);
        }
    });
});

app.get('/searchtask', function(req, res) {
    var finddata = req.query.name;
    db.tasks.aggregate(
        {$match:{name: {$regex: finddata, $options: "si"}}}
        ,{$unwind: '$personal'}
        ,{$lookup: {
            from: "personal",
            localField: "personal",
            foreignField: "_id",
            as: "stats"
        }}
        ,{ $group : { _id : "$_id", name: {$first: "$name"}, status: {$first: "$status"}, exec: { $push: "$stats" } } }
        ,function(err, result){
            if(err){
                console.log(err);
            }
            else {
                res.status(200).json(result);
            }
        });

});

app.get('/getstats', function(req, res) {
    db.tasks.aggregate(
        {$match:{status: false}}
        ,{$unwind: '$personal'}

        ,{$project: {name:1, personal:1, count: {$add: [1]}, _id:1}}

        ,{$group: {
            _id: "$personal",
            count: { $sum: 1 }
        }}
        ,{$sort: {count: -1}}
        ,{$lookup: {
            from: "personal",
            localField: "_id",
            foreignField: "_id",
            as: "stats"
        }}
        //,{$out: "mycoll"}
        //,{$project: {name:1, stats: 1, count: {$add: [1]}}, _id:1}

        ,function(err, result){
            console.log('stats out');
            if(err){
                console.log(err);
            }
            else {
               res.status(200).json(result);
            }
        });
});

app.listen(app.get('port'), function () {
    console.log('Express started on port http://localhost:' + app.get('port'));
});
/**
 * Created by HP on 10/29/2016.
 */
