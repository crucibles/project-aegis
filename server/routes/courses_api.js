/**
 * This is where all the request is being handled. 
 * All requests enter an api/"some string" depending on where or what api needs to be accessed.
 */
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const async = require('async');
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

// CREATE COURSES


/**
 * @description portal for requests on creating course plus section. api/createCourseSection
 * @author Sumandang, AJ Ruth
 */
router.post('/createCourseSection', (req, res) => {

    var newCourseObj = {
        course_name: req.body.courseName,
        course_description: req.body.courseDescription
    };
    var newSectionObj = {
        course_id: "",
        section_name: req.body.sectionName,
        instructor: req.body.instructor,
        quests: req.body.quests,
        items: req.body.items,
        badges: [],
        schedule: req.body.schedule
    };

    var badges = req.body.badges;

    var isSuccess = false;
    var course;

    async.waterfall([
        insertCourse,
        insertBadges,
        insertSection,
        insertQuestMap
    ], function (err, results) {
        if (err) {
            response.message = err;
            throw err;
        }
        response.data = newSectionObj;
        res.json(results);
    });

    function insertCourse(callback) {
        const myDB = mongodb.db('up-goe-db');
        myDB.collection('courses')
            .insertOne(newCourseObj, function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                response.data = newCourseObj;
                newSectionObj.course_id = result.insertedId + '';
                callback(null, newSectionObj);
            });
    };

    function insertBadges(sectionObj, callback) {
        const myDB = mongodb.db('up-goe-db');
        myDB.collection('badges').insert(badges, function (err, result) {
            if (err) {
                response.message = err;
                throw err;
            }

            let badgeIds = [];
            // obtains the ids of the newly inserted badges
            result.ops.forEach(badge => {
                badgeIds.push(badge._id);
            })

            sectionObj.badges = badgeIds;
            callback(null, sectionObj);
        });
    }

    function insertSection(sectionObj, callback) {
        const myDB = mongodb.db('up-goe-db');
        myDB.collection('sections')
            .insertOne((sectionObj), function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                resultId = result.insertedId + '';
                response.data = result;
                callback(null, resultId);
            });
    };

    function insertQuestMap(resultId, callback) {
        const myDB = mongodb.db('up-goe-db');
        let newQuestMapObj = {
            section_id: resultId,
            max_exp: 0,
            quest_coordinates: [
                {
                    quest_id: "",
                    type: "scatter",
                    x1: 5,
                    y1: 25
                }
            ]
        };

        myDB.collection('questmaps')
            .insertOne((newQuestMapObj), function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                response.data = result;
                callback(null, result);
            });
    };
});


// READ COURSES

/**
 * @description portal for requests regarding courses. api/courses
 * @author Cedric Yao Alvaro
 */
router.get('/courses', (req, res) => {

    if (req.query.id) {
        const myDB = mongodb.db('up-goe-db');
        myDB.collection('courses')
            .find(ObjectID(req.query.id))
            .toArray()
            .then((courses) => {
                if (courses) {
                    response.data = courses[0];
                    res.json(courses[0]);
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    } else {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('courses')
            .find()
            .toArray()
            .then((courses) => {
                if (courses) {
                    response.data = courses;
                    res.json(courses);
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }

});

module.exports = router;