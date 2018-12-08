/**
 * This is where all the request is being handled. 
 * All requests enter an api/"some string" depending on where or what api needs to be accessed.
 */
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const async = require('async');
const nodemailer = require('nodemailer');
const path = require("path");
const multer = require('multer');
var requestTime;
var mongodb;

router.use(function timeLog(req, res, next) {
    requestTime = Date.now();
    next();
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, requestTime + "." + file.originalname);
    }
});

MongoClient.connect('mongodb://127.0.0.1:27017/up-goe-db', { poolSize: 10, autoReconnect: true }, (err, db) => {
    if (err) return console.log(err);
    mongodb = db;
});

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

var upload = multer({ storage: storage }).single('file');
// var upload = multer({ dest: DIR }).single('photo');


/**
 * Note: queries are string, body can be object because of bodyParsers;

/**
 * Note: queries are string, body can be object because of bodyParsers;  
 * @deprecated: Unhandled Promise rejection
 */


router.post('/upload', (req, res) => {

    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            return res.status(422).send("an Error occured")
        }
        // No error occured.
        // return res.send(path.substring(8, path.length));
        return res.json({ originalName: req.file.originalname, uploadName: req.file.filename });
    })

});

router.get('/badgeImg', (req, res) => {
    var path = '';

    filepath = path.join(__dirname, '../../uploads') + '/' + req.query.imgName;
    res.sendFile(filepath);

});

router.post('/download', (req, res) => {
    filepath = path.join(__dirname, '../../uploads') + '/' + req.body.fileName;
    res.sendFile(filepath);
});


/**
 * @description portal for requests regarding ailments/statuses. api/statuses
 * @author Cedric Yao Alvaro
 */
router.get('/statuses', (req, res) => {
    if (req.query.method == "getDefaultStatuses") {
        getDefaultStatuses();
    }

    function getDefaultStatuses() {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('statuses')
            .find()
            .toArray()
            .then(statuses => {
                if (statuses) {
                    res.json(statuses);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }
});



/**
* @description portal for requests regarding security questions. api/securityQuestions
* @author Donevir D. Hynson
* @author Cedric Yao Alvaro - modified May 14, 2018
*/
router.get('/securityQuestions', (req, res) => {

    const myDB = mongodb.db('up-goe-db');
    myDB.collection('questions')
        .find()
        .toArray()
        .then((questions) => {
            if (questions) {
                response.data = questions;
                res.json(questions);
            } else {
                res.json(false);
            }
        })
        .catch((err) => {
            sendError(err, res);
        });
});


module.exports = router;