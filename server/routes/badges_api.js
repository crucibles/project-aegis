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
/**
 * @description portal for requests regarding Badges. api/badges
 * @author Cedric Yao Alvaro
 * @author Donevir Hynson - modified 6 June 2018
 */
router.post('/badges', (req, res) => {
    if (req.body.method == "addBadgeAttainer") {
        addBadgeAttainer(req, res);
    } else if (req.body.badgeData) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('badges')
            .count({ badge_name: req.body.badgeData.badge_name })
            .then((count) => {
                if (count > 0) {
                    response.data = req.body.badgeData.badge_name;
                    res.json(false);
                } else {
                    insertNewBadge(req.body.badgeData, req.body);
                    res.json(true);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    } else {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('badges')
            .find()
            .toArray()
            .then((badges) => {

                if (badges) {
                    Promise.all(badges).then((badge) => {
                        let earnedbadge = badge.filter((b) => {
                            if (b.badge_conditions.log_in_streak <= req.body.conditions.log_in_streak) {
                                return b;
                            }
                        });

                        if (earnedbadge.length > 0) {
                            Promise.all(earnedbadge).then((eb) => {

                                const myDB = mongodb.db('up-goe-db');
                                myDB.collection('badges')
                                    .updateOne(
                                        { _id: ObjectID(eb[0]._id) },
                                        {
                                            $addToSet: {
                                                "badge_attainers": req.body.user_id
                                            }
                                        }
                                    )
                                    .then(badge => {
                                        res.json(badge);
                                    })
                                    .catch((err) => {
                                        sendError(err, res);
                                    });
                            });
                        } else {
                            res.json(false);
                        }
                    });
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }

    function insertNewBadge(badgeData, body) {
        myDB.collection('badges')
            .insertOne((badgeData), function (err, res) {
                if (err) {
                    throw err;
                } else {
                    myDB.collection('badges')
                        .findOne({ badge_name: badgeData.badge_name })
                        .then(badge => {
                            if (badge) {
                                myDB.collection('sections')
                                    .updateOne({ _id: ObjectID(body.sectionId) }, {
                                        $push: {
                                            badges: JSON.stringify(badge._id).toString().substring(1, 25)
                                        }
                                    })
                            }
                        })
                        .catch(err => {
                            sendError(err, res);
                        });
                }
            });
    }

    function addBadgeAttainer(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('badges')
            .updateOne(
                {
                    _id: ObjectID(req.body.badge_id)
                },
                {
                    $addToSet: {
                        "badge_attainers": req.body.user_id,
                    }
                }
            ).then((result) => {
                res.json(result);
            }).catch((err) => {
                sendError(err, res);
            });
    };

    router.get('/badges', (req, res) => {
        if (req.query.method == "ALL") {


            const myDB = mongodb.db('up-goe-db');
            myDB.collection('badges')
                .find()
                .toArray()
                .then((badges) => {
                    if (badges) {
                        res.json(badges);
                    } else {
                        res.json(false);
                    }
                })

        } else if (req.query.badge_id) {


            const myDB = mongodb.db('up-goe-db');
            myDB.collection('badges')
                .find({ _id: ObjectID(req.query.badge_id) })
                .toArray()
                .then((badges) => {
                    if (badges && badges[0]) {
                        res.json(badges[0]);
                    } else {
                        res.json(false);
                    }
                })

        } else if (req.query.method && req.query.method == "getSectionBadges") {
            getSectionBadges(req, res);
        } else if (req.query.user_id) {
            console.log(req.query.method);
            getTeacherBadges(req, res);
        } else {

            const myDB = mongodb.db('up-goe-db');
            myDB.collection('badges')
                .find()
                .toArray()
                .then((badges) => {

                    if (badges) {

                        Promise.all(badges).then(badges => {
                            // earned system badges
                            let esb = badges.filter(b => {
                                if (b.is_system_badge == true) {
                                    let a = b.badge_attainers.filter(user => {
                                        if (user == req.query.id) {
                                            return user;
                                        }
                                    });
                                    if (a.length > 0) {
                                        return b;
                                    };
                                }
                            });
                            response.data = esb;
                            res.json(esb);
                        });

                    } else {
                        res.json(false);
                    }
                })
                .catch((err) => {
                    sendError(err, res);
                });
        }



        // not yet tested
        function getTeacherBadges(req, res) {

            const myDB = mongodb.db('up-goe-db');
            myDB.collection('sections')
                .find({ "instructor": req.query.user_id })
                .toArray()
                .then(section => {
                    let teacherBadges = [];

                    section.forEach(sect => {
                        sect.badges.forEach(badge => {
                            if (badge.is_default == false) {
                                teacherBadges.push(ObjectID(badge));
                            }
                        });
                    });

                    myDB.collection('badges')
                        .find({
                            _id: {
                                $in: teacherBadges
                            }
                        })
                        .toArray()
                        .then((badges) => {

                            res.json(badges);
                        })
                        .catch((err) => {
                            sendError(err, res);
                        });
                })
                .catch((err) => {
                    sendError(err, res);
                });
        }

        function getSectionBadges(req, res) {

            const myDB = mongodb.db('up-goe-db');
            myDB.collection('sections')
                .findOne(ObjectID(req.query.section_id))
                .then(section => {
                    let sectionBadges = [];
                    section.badges.forEach(badge => {
                        sectionBadges.push(ObjectID(badge));
                    })

                    myDB.collection('badges')
                        .find({
                            _id: {
                                $in: sectionBadges
                            }
                        })
                        .toArray()
                        .then((badges) => {

                            res.json(badges);
                        })
                        .catch((err) => {
                            sendError(err, res);
                        });
                })
                .catch((err) => {
                    sendError(err, res);
                });

        };







    });
});


module.exports = router;