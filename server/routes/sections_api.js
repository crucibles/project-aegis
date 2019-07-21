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
 * --------------------------------------------------------------
 * Section Server Requests below
 */



// PUTTING QUESTS IN A SECTION

/**
 * @description portal for requests regarding quests. api/sectionQuests
 * @author Cedric Yao Alvaro
 * @author Donevir Hynson - modified 2 June 2018
 */
router.get('/sections/quests', (req, res) => {

    const myDB = mongodb.db('up-goe-db');
    myDB.collection('sections')
        .find({
            students: {
                $elemMatch: {
                    status: "E",
                    user_id: req.query.id
                }
            }
        })
        .toArray()
        .then((sections) => {
            if (req.query.method) {
                let questsOnly = sections.map(section => section.quests);
                let userQuests = [];

                questsOnly.forEach(quests => {
                    quests.forEach(quest => {
                        quest.quest_participants.forEach(participant => {
                            if (participant == req.query.id) {
                                userQuests.push(quest.quest_id);
                            }
                        });
                    })
                });

                // Removing duplicate entries in userQuests.
                userQuests = userQuests.filter(function (elem, pos) {
                    return userQuests.indexOf(elem) == pos;
                });

                myDB.collection('quests')
                    .find()
                    .toArray()
                    .then((quests) => {
                        let AllUserQuests = [];
                        sections.forEach(section => {
                            section.quests.forEach(quest => {
                                userQuests.forEach(userQuest => {
                                    if (quest.quest_id == userQuest) {
                                        AllUserQuests.push({
                                            course: section.course_id,
                                            section: section.section_name,
                                            section_id: section._id,
                                            questData: quest.quest_id
                                        });
                                    }
                                })
                            })
                        });

                        // Replaces the questId in AllUserQuests.questData to quest object.
                        quests.forEach(quest => {
                            AllUserQuests.forEach(userQuest => {
                                if (quest._id == userQuest.questData) {
                                    userQuest.questData = quest;
                                }
                            });
                        });

                        myDB.collection('courses')
                            .find()
                            .toArray()
                            .then((courses) => {
                                if (courses) {
                                    // Replaces the course_id in AllUserQuests.course to course_name.
                                    AllUserQuests.forEach(quest => {
                                        courses.forEach(course => {
                                            if (course._id == quest.course) {
                                                quest.course = course.course_name;
                                            }
                                        });
                                    });

                                    let user_section_ids = [];
                                    user_section_ids = AllUserQuests.map(quest => {
                                        return quest.section_id + ""
                                    });

                                    myDB.collection('experiences').find({
                                        user_id:
                                            req.query.id,
                                        section_id: { $in: user_section_ids }
                                    }).toArray()
                                        .then(expArr => {
                                            expArr.forEach(exp => {
                                                exp.quests_taken = exp.quests_taken.filter(q => {
                                                    if (q.date_submitted != '') {
                                                        return q.quest_id;
                                                    }
                                                }
                                                );

                                                AllUserQuests = AllUserQuests.filter(
                                                    uq => {
                                                        let isIncluded = true;
                                                        exp.quests_taken.forEach(id => {
                                                            if (id.quest_id == (uq.questData._id + '')) {
                                                                isIncluded = false;
                                                            }
                                                        })

                                                        if (isIncluded) {
                                                            return uq;
                                                        }
                                                    }
                                                )
                                            })
                                            let auq = AllUserQuests;
                                            response.data = auq;
                                            res.json(auq);

                                        }
                                        )
                                        .catch((err) => {
                                            sendError(err, res);
                                        });
                                } else {
                                    response.data = courses;
                                    res.json(false);
                                }
                            })
                            .catch((err) => {
                                sendError(err, res);
                            });
                    })
                    .catch((err) => {
                        sendError(err, res);
                    });
            } else {
                response.data = sections;
                res.json(sections);
            }
        })
        .catch((err) => {
            sendError(err, res);
        });
});


// READ SECTION

/**
 * @description portal for get requests that regards to sections "api/sections"
 * @author Cedric Yao Alvaro
 */
router.get('/sections', (req, res) => {
    var myObjArr = [];

    if (req.query.instructor) {
        getSectionsofInstructor(req, res);
    } else if (req.query.id) {
        getSectionsOfStudent(req, res);
    } else if (req.query.class) {

        if (req.query.class.length == 24) {
            searchSection(req, res);
        } else {
            searchSectionByName(req, res);
        }

    } else if (req.query.students) {
        getEnrolledStudents(req, res);
    }

    function getEnrolledStudents(req, res) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('sections')
            .findOne(ObjectID(req.query.students))
            .then((sections) => {

                if (sections) {
                    if (sections.students) {
                        let enrolled = sections.students.map((x) => {
                            if (x.status == 'E' || req.query.all) {
                                return x.user_id;
                            } else {
                                return "";
                            }
                        })
                        response.data = enrolled;
                        res.send(enrolled);
                    } else {
                        res.json(false);
                    }

                } else {
                    res.json(false);
                }

            })
            .catch((err) => {
                sendError(err, res);
            })
    }

    function getSectionsofInstructor(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('sections')
            .find({
                instructor: req.query.instructor
            })
            .toArray()
            // editing the section body adding a course name in it.
            .then((sections) => {

                if (sections) {

                    async.forEach(sections, processEachSection, afterAllSection);

                    function processEachSection(section, callback) {

                        myDB.collection('courses')
                            .find(ObjectID(section.course_id))
                            .toArray()
                            .then((course) => {
                                Promise.all(course[0].course_name).then(() => {
                                    myObjArr.push({
                                        section: section,
                                        course_name: course[0].course_name
                                    });
                                    callback(null);
                                });
                            });

                    }


                    function afterAllSection(err) {
                        response.data = myObjArr;
                        res.send(myObjArr);
                    }

                } else {
                    res.json(false);
                }


            })
            .catch((err) => {
                sendError(err, res);
            })

    }

    function getSectionsOfStudent(req, res) {

        const myDB = mongodb.db('up-goe-db');

        let query = {
            students: {
                $elemMatch: {
                    user_id: req.query.id
                }
            }
        };

        if (req.query.section_id) {
            query = {
                _id: ObjectID(req.query.section_id),
                students: {
                    $elemMatch: {
                        user_id: req.query.id
                    }
                }
            }
        }

        myDB.collection('sections')
            .find(query)
            .toArray()
            .then((sections) => {
                async.forEach(sections, processEachSection, afterAllSection);

                function processEachSection(section, callback) {
                    myDB.collection('courses')
                        .find(ObjectID(section.course_id))
                        .toArray()
                        .then((course) => {
                            Promise.all(course[0].course_name).then(() => {
                                myObjArr.push({
                                    section: section,
                                    course_name: course[0].course_name
                                });
                                callback(null);
                            });
                        });

                }

                function afterAllSection(err) {
                    response.data = myObjArr;
                    res.send(myObjArr);
                }


            })
            .catch((err) => {
                sendError(err, res);
            })

    }

    function searchSection(req, res) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('sections')
            .find(ObjectID(req.query.class))
            .toArray()
            .then((sections) => {

                if (sections) {

                    async.forEach(sections, processEachSection, afterAllSection);

                    function processEachSection(section, callback) {

                        myDB.collection('courses')
                            .find(ObjectID(section.course_id))
                            .toArray()
                            .then((course) => {
                                Promise.all(course[0].course_name).then(() => {
                                    myObjArr.push({
                                        section: section,
                                        course_name: course[0].course_name
                                    });
                                    callback(null);
                                });
                            });

                    }

                    function afterAllSection(err) {
                        response.data = myObjArr;
                        res.send(myObjArr);
                    }

                } else {

                    res.json(false);
                }

            })
            .catch((err) => {
                sendError(err, res);
            })

    }

    function searchSectionByName(req, res) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('sections')
            .find()
            .toArray()
            .then((sections) => {
                if (sections) {

                    myDB.collection('courses')
                        .find({
                            course_name: { $regex: '(?i)' + req.query.class + '(?-i)' }
                        })
                        .toArray()
                        .then((course) => {

                            // course found.
                            if (course.length > 0) {

                                sections.filter((s) => {
                                    course.filter((c) => {
                                        if (c._id == s.course_id) {
                                            myObjArr.push({
                                                section: s,
                                                course_name: c.course_name
                                            });
                                        }
                                    })
                                });

                                Promise.all(myObjArr).then(x => {
                                    res.json(myObjArr);
                                })
                            }




                        });

                } else {
                    res.json(false);
                }



            })
            .catch((err) => {
                sendError(err, res);
            })



    }


});





// CREATE SECTION

/**
 * @description portal for post requests that regards to sections "api/sections"
 * @author Cedric Yao Alvaro
 * 
 * 1. Student requestin to enroll in a section
 */
router.post('/sections', (req, res) => {
    if (req.body.quest_id) {
        if (req.body.abandon) {
            abandonQuest(req, res);
        } else {
            if (req.body.method && req.body.method == "submitQuest") {
                //upload here
                submitQuest(req, res);
            } else {
                joinQuest(req, res);
            }
        }
    } else if (req.body.method == "addBadgeToStudent") {
        addBadgeToStudent(req, res);
    } else {
        enrollAndRequest(req, res);
    }


    function abandonQuest(req, res) {


        const myDB = mongodb.db('up-goe-db');

        myDB.collection('sections')
            .updateOne(
                {
                    _id: ObjectID(req.body.section_id)
                },
                {
                    $pull: {
                        "quests.$[elem].quest_participants": req.body.user_id
                    }
                },
                {
                    arrayFilters: [{ "elem.quest_id": req.body.quest_id }]
                }
            ).then(result => {
                if (result) {

                    myDB.collection('experiences')
                        .updateOne(
                            {
                                user_id: req.body.user_id,
                                section_id: req.body.section_id
                            },
                            {
                                $pull: {
                                    "quests_taken": {
                                        quest_id: req.body.quest_id
                                    }
                                }
                            }
                        )
                        .then(x => {
                            res.json(x);
                        })

                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            })


    }

    function submitQuest(req, res) {

        var submitObj = {
            quest_id: req.body.quest_id,
            quest_grade: 0,
            is_graded: false,
            file: req.body.data,
            comment: req.body.comment,
            date_submitted: new Date(req.body.time).toLocaleString()
        }



        const myDB = mongodb.db('up-goe-db');

        myDB.collection('experiences')
            .updateOne(
                {
                    user_id: req.body.user_id,
                    "quests_taken.quest_id": req.body.quest_id
                },
                {
                    $set: {
                        "quests_taken.$[elem]": submitObj,
                    }
                },
                {
                    arrayFilters: [{ "elem.quest_id": req.body.quest_id }]
                }
            )
            .then(x => {
                res.json(x);
            })
            .catch((err) => {
                sendError(err, res);
            })

    }

    function joinQuest(req, res) {

        var myObj = {
            quest_id: req.body.quest_id,
            quest_grade: 0,
            is_graded: false,
            file: null,
            comment: "",
            date_submitted: ""
        }




        const myDB = mongodb.db('up-goe-db');

        myDB.collection('sections')
            .updateOne(
                {
                    _id: ObjectID(req.body.section_id)
                },
                {
                    $addToSet: {
                        "quests.$[elem].quest_participants": req.body.user_id
                    }
                },
                {
                    arrayFilters: [{ "elem.quest_id": req.body.quest_id }]
                }
            ).then(result => {
                myDB.collection('experiences')
                    .updateOne(
                        {
                            user_id: req.body.user_id,
                            section_id: req.body.section_id
                        },
                        {
                            $addToSet: {
                                "quests_taken": myObj
                            }
                        }
                    )
                    .then(x => {
                        res.json(x);
                    })



            })
            .catch((err) => {
                sendError(err, res);
            })


    }

    function addBadgeToStudent(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('sections')
            .updateOne(
                {
                    _id: ObjectID(req.body.section_id)
                },
                {
                    $addToSet: {
                        "students.$[elem].badges": req.body.badge_id,

                    }
                },
                {
                    arrayFilters: [{ "elem.user_id": req.body.user_id }]
                }
            )
            .then(x => {
                res.json(x);
            })
            .catch((err) => {
                sendError(err, res);
            });
    }

    function enrollAndRequest(req, res) {

        if (!req.body.approve) {


            const myDB = mongodb.db('up-goe-db');

            myDB.collection('sections')
                .updateOne(
                    { _id: ObjectID(req.body.section_id) },
                    {
                        $push: {
                            students: {
                                user_id: req.body.user_id,
                                status: "R",
                                badges: []
                            }
                        }
                    }
                ).then(result => {

                    if (result) {
                        res.json(result);
                    } else {
                        res.json(false);
                    }

                })
                .catch((err) => {
                    sendError(err, res);
                })


        } else if (req.body.approve) {


            const myDB = mongodb.db('up-goe-db');

            myDB.collection('sections')
                .updateOne(
                    {
                        _id: ObjectID(req.body.section_id),
                        "students.user_id": req.body.user_id
                    },
                    {
                        $set: {
                            "students.$[elem].status": "E"
                        }
                    },
                    {
                        arrayFilters: [{ "elem.user_id": req.body.user_id }]
                    }
                ).then(result => {

                    let newUserXP = {
                        user_id: req.body.user_id,
                        section_id: req.body.section_id,
                        total_xp: [],
                        quests_taken: []
                    }

                    let newUserInventory = {
                        user_id: req.body.user_id,
                        section_id: req.body.section_id,
                        items: [],
                        head: "",
                        footwear: "",
                        armor: "",
                        left_hand: "",
                        right_hand: "",
                        accessory: ""
                    };

                    myDB.collection('experiences')
                        .insertOne(newUserXP, function (err, result) {
                            if (err) {
                                response.message = err;
                                throw err;
                            }

                            myDB.collection('inventories')
                                .insertOne(newUserInventory)
                                .then(reslt => {
                                    console.log("added inventory");
                                    response.data = newUserXP;
                                    res.json(result);
                                });
                        });


                })
                .catch((err) => {
                    sendError(err, res);
                })


        }

    }



});


module.exports = router;