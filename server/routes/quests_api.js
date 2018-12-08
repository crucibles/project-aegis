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


/**
 * -----------------------------------------------------------------
 *
 */


 // Read
 
/**
 * @description portal for requests regarding quests. api/quests
 * @author Cedric Yao Alvaro
 */
router.get('/quests', (req, res) => {
    if (req.query.quest_id) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('quests')
            .find(ObjectID(req.query.quest_id))
            .toArray()
            .then((quests) => {
                if (quests) {
                    response.data = quests;
                    res.json(quests);
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    } else {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('quests')
            .find()
            .toArray()
            .then((quests) => {
                if (quests) {

                    response.data = quests;
                    res.json(quests);
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }
});


 //Create

router.post('/createQuest', (req, res) => {

    var newQuestObj = {
        quest_title: req.body.quest_title,
        quest_description: req.body.quest_description,
        quest_retakable: req.body.quest_retakable,
        quest_badge: req.body.quest_badge,
        quest_xp: req.body.quest_xp,
        quest_hp: req.body.quest_hp,
        quest_item: req.body.quest_item,
        quest_start_date: req.body.quest_start_date,
        quest_end_date: req.body.quest_end_date,
        quest_party: req.body.quest_party
    };

    insertQuest();
    // async.waterfall([
    //     insertQuest,
    // ], function (err, resultId) {
    //     if (err) {
    //         response.message = err;
    //         throw err;
    //     }
    // });

    function insertQuest() {
        const myDB = mongodb.db('up-goe-db');
        myDB.collection('quests')
            .insertOne(newQuestObj, function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                response.data = newQuestObj;
                let questObj = {
                    _id: result.insertedId,
                    quest_title: req.body.quest_title,
                    quest_description: req.body.quest_description,
                    quest_retakable: req.body.quest_retakable,
                    quest_badge: req.body.quest_badge,
                    quest_xp: req.body.quest_xp,
                    quest_hp: req.body.quest_hp,
                    quest_item: req.body.quest_item,
                    quest_start_date: req.body.quest_start_date,
                    quest_end_date: req.body.quest_end_date,
                    quest_party: req.body.quest_party
                }
                res.json(questObj);
                //callback(null, result.insertedId);
            });
    }

    // function addQuestToSection(resultId, callback) {
    //     const myDB = mongodb.db('up-goe-db');
    //     myDB.collection('sections')
    //     .update(
    //         { _id: req.body.section_id },
    //         {
    //             $push: {
    //                 quests: {
    //                     quest_id: resultId,
    //                     quest_prerequisite: "prereq2",
    //                     quest_participants: [],
    //                 }
    //             }
    //             },
    //             function (err, section) {
    //                 response.data = section;
    //                 callback(null, resultId);
    //             }
    //         );
    // };
});

module.exports = router;