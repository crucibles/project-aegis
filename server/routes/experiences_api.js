/**
 * This is where all the request is being handled. 
 * All requests enter an api/"some string" depending on where or what api needs to be accessed.
 */
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
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

 // REad exp

/**
 * @description portal for requests regarding experiences. api/experiences
 * @author Sumandang, AJ Ruth H.
 */
router.get('/experiences', (req, res) => {

    const myDB = mongodb.db('up-goe-db');

    let query = {
        section_id: req.query.section_id
    };

    if (req.query.user_id) {
        query = {
            section_id: req.query.section_id,
            user_id: req.query.user_id
        }
    }

    myDB.collection('experiences')
        .find(query)
        .toArray()
        .then(experiences => {
            res.json(experiences);
        })
        .catch(err => {
            sendError(err, res);
        })
});

/**
 * @description portal for requests regarding experiences. api/experiences
 * @author AJ Ruth Sumandang
 */
router.post('/experiences', (req, res) => {
    var holder = "";
    var isEarning = false;
    if (req.body.method == "setStudentQuestGrade") {
        setStudentQuestGrade(req, res);
    } else if (req.body.user_id) {
        getUserExpRecord(req, res);
    }

    function getUserExpRecord(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('experiences')
            .findOne({
                user_id: req.body.user_id,
                section_id: req.body.section_id
            })
            .then(user => {
                if (user) res.json(user);
                else res.json(false);
            })
            .catch(err => {
                sendError(err, res);
            });
    }

    function setStudentQuestGrade(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('experiences')
            .updateOne(
                {
                    user_id: req.body.user_id,
                    section_id: req.body.section_id
                },
                {
                    $set: {
                        "quests_taken.$[elem].quest_grade": req.body.grade,
                        "quests_taken.$[elem].is_graded": true
                    },
                    $push: {
                        total_xp: req.body.grade
                    }
                },
                {
                    arrayFilters: [{
                        "elem.quest_id": req.body.quest_id
                    }]
                }
            )
            .then(grade => {


                const myDB = mongodb.db('up-goe-db');
                myDB.collection('quests')
                    .find(ObjectID(req.body.quest_id))
                    .toArray()
                    .then((quests) => {
                        if (req.body.grade >= (quests[0].quest_xp * 0.8)) {
                            isEarning = true;
                        }
                        if (quests[0] && quests[0].quest_badge != "") {
                            holder = quests[0].quest_badge;
                            holder = holder.toString().trim();
                            if (isEarning) {

                                const myDB = mongodb.db('up-goe-db');
                                myDB.collection('badges')
                                    .updateOne(
                                        {
                                            _id: ObjectID(holder)
                                        },
                                        {
                                            $addToSet: {
                                                "badge_attainers": req.body.user_id,
                                            }
                                        }
                                    );
                            }
                            res.json(true);
                        } else {
                            res.json(false);
                        }
                    })
                    .catch((err) => {
                        sendError(err, res);
                    });
            })
            .catch(err => {
                sendError(err, res);
            })
    }
});

 // Create experience

/**
* @description portal for requests to collect score data from a certain quest. api/questLeaderboard
* @author Donevir D. Hynson
*/
router.post('/questLeaderboard', (req, res) => {

    const myDB = mongodb.db('up-goe-db');
    myDB.collection('experiences')
        .find({
            section_id: req.body.currSection,
            quests_taken: {
                $elemMatch: {
                    is_graded: true
                }
            }
        })
        .toArray()
        .then((experiences) => {
            if (experiences) {
                var studentExp = [];

                // Acquires the students with scores in the database.
                experiences.forEach((exp) => {
                    exp.quests_taken.forEach((quest) => {
                        if (quest.quest_id == req.body.currQuest) {
                            studentExp.push({
                                studentId: exp.user_id,
                                score: quest.quest_grade,
                                dateCompleted: quest.date_submitted
                            });
                        }
                    });
                });

                // Sorts the result in increasing order.
                studentExp.sort(function (a, b) {
                    return (b.score - a.score);
                });

                // Replaces the _id to userId.
                myDB.collection('users')
                    .find()
                    .toArray()
                    .then((users) => {
                        if (users) {
                            users.forEach(user => {
                                studentExp.forEach(exp => {
                                    if (user._id == exp.studentId) {
                                        exp.studentId = user.user_school_id;
                                    }
                                });
                            });
                            response.data = studentExp;
                            res.json(studentExp);
                        } else {
                            response.data = users;
                            res.json(false);
                        }
                    })
                    .catch((err) => {
                        sendError(err, res);
                    });
            } else {
                response.data = experiences;
                res.json(false);
            }
        })
        .catch((err) => {
            sendError(err, res);
        });
});





router.post('/currentExperience', (req, res) => {

    const myDB = mongodb.db('up-goe-db');
    myDB.collection('experiences')
        .findOne({
            user_id: req.body.user_id,
            section_id: req.body.section_id
        })
        .then(exp => {
            if (exp) {
                exp.quests_taken.forEach(quest => {
                    if (quest.quest_id == req.body.quest_id) {
                        if (quest.is_graded) res.json("true");
                        else res.json("false");
                    }
                });
            } else {
                res.json(false);
            }
        })
        .catch(err => {
            sendError(err, res);
        });
});

module.exports = router;