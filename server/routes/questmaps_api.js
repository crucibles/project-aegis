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


router.get('/getSectionQuests', (req, res) => {

    const myDB = mongodb.db('up-goe-db');

    myDB.collection('questmaps')
        .findOne({
            "section_id": req.query.section_id
        })
        .then(questmap => {
            if (questmap) {
                let questIds = [];
                questmap.quest_coordinates.forEach(coord => {
                    if (coord.quest_id) {
                        questIds.push(coord.quest_id);
                    }
                });

                myDB.collection('quests')
                    .find()
                    .toArray()
                    .then((quests) => {
                        let sectionQuests = [];
                        questIds.forEach(questId => {
                            quests.forEach(quest => {
                                if (quest._id == questId) {
                                    sectionQuests.push(quest);
                                }
                            });
                        })
                        res.json(sectionQuests);
                    })
                    .catch((err) => {
                        sendError(err, res);
                    });
            } else res.json(false);
        })
        .catch((err) => {
            sendError(err, res);
        });
});




/**
 * @description protal for requests regarding questmaps. api/questmaps
 * @author Sumandang. AJ Ruth H.
 */
router.get('/questmaps', (req, res) => {
    if (req.query.method && req.query.method == "getSectionQuestMap") {
        getSectionQuestMap(req, res);
    }

    function getSectionQuestMap(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('questmaps')
            .findOne({
                section_id: req.query.section_id
            })
            .then((questmap) => {
                res.json(questmap);
            })
            .catch((err) => {
                sendError(err, res);
            });
    }
});

/**
 * @description protal for requests regarding questmaps. api/questmaps
 * @author Sumandang. AJ Ruth H.
 */
router.post('/questmaps', (req, res) => {
    if (req.body.method && req.body.method == "addQuestMapCoordinates") {
        addQuestMapCoordinates(req, res);
    } else if (req.body.method && req.body.method == "editQuestMapCoordinateAt") {
        editQuestMapCoordinateAt(req, res);
    } else if (req.body.method && req.body.method == "setMaxEXP") {
        setMaxEXP(req, res);
    } else if (req.body.method && req.body.method == "setFlatOnePercentage") {
        setFlatOnePercentage(req, res);
    }

    function addQuestMapCoordinates(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('questmaps')
            .updateOne(
                { _id: ObjectID(req.body.quest_map_id) },
                {
                    $push: {
                        quest_coordinates: {
                            $each: req.body.quest_coordinates
                        }
                    }
                },
                function (err, result) {
                    if (err) {
                        throw err;
                    }
                    req.body.quest_coordinates.forEach(coord => {
                        if (coord.quest_id) {
                            req.body.quest_coordinates = coord;
                        }
                    });
                    response.data = result;
                    addQuestToSection(req, res);
                }
            );
    }

    function editQuestMapCoordinateAt(req, res) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('questmaps')
            .updateOne(
                {
                    _id: ObjectID(req.body.quest_map_id)
                },
                {
                    $set: {
                        "quest_coordinates.$[elem].quest_id": req.body.quest_coordinates.quest_id
                    }
                },
                {
                    upsert: true,
                    arrayFilters: [
                        {
                            $and: [
                                { "elem.x1": req.body.quest_coordinates.x1 },
                                { "elem.y1": req.body.quest_coordinates.y1 }
                            ]
                        }
                    ]
                }
            )
            .then((questmaps) => {
                response.data = questmaps;
                addQuestToSection(req, res);
            })
            .catch(err => {
                sendError(err, res);
                throw err;
            });

    };

    function addQuestToSection(req, res) {
        console.warn("ADING QUEST TO SECTION.......................................")

        //AHJ: unimplemented; dili ko kabalo sa pagpush ug array T_T okay lng sya if string or hardcore array though....
        const myDB = mongodb.db('up-goe-db');
        let prereq_array = [];
        prereq_array = req.body.quest_prerequisite;

        myDB.collection('sections')
            .updateOne(
                { _id: ObjectID(req.body.section_id) },
                {
                    $push: {
                        quests: {
                            quest_id: req.body.quest_coordinates.quest_id,
                            quest_participants: [],
                            quest_prerequisite: prereq_array
                        }
                    }
                }
            )
            .then(section => {
                console.log(section);
                console.log("hehehe");
                res.json(section);
            })
            .catch(err => {
                console.log(err);
                sendError(err, res);
            });

    };

    function setMaxEXP(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('questmaps')
            .updateOne(
                { _id: ObjectID(req.body.quest_map_id) },
                {
                    $set: {
                        max_exp: req.body.max_exp
                    }
                }
            )
            .then(section => {
                res.json(true);
            })
            .catch(err => {
                sendError(err, res);
            });
    }

    function setFlatOnePercentage(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('questmaps')
            .updateOne(
                { _id: ObjectID(req.body.quest_map_id) },
                {
                    $set: {
                        flat_one_perc: req.body.flat_one_perc
                    }
                }
            )
            .then(section => {
                res.json(true);
            })
            .catch(err => {
                sendError(err, res);
            });
    }
});


module.exports = router;