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


 
/**
 * @description portal for requests regarding posts. api/posts
 * @author Sumandang, AJ Ruth H.
 */
router.post('/posts', (req, res) => {
    if (req.body.method && req.body.method == "addCommentPost") {
        addCommentPost(req, res);
    } else if (req.body.method && req.body.method == "attachComment") {
        attachComment(req, res);
    }

    function addCommentPost(req, res) {

        const myDB = mongodb.db('up-goe-db');
        let newPostObj = {
            section_id: req.body.section_id,
            user_id: req.body.user_id,
            post_content: req.body.post_content,
            post_comments: req.body.post_comments,
            post_date: req.body.post_date,
            commentable: req.body.commentable,
            is_post: req.body.is_post,
            data: req.body.data
        };

        myDB.collection('posts')
            .insertOne(newPostObj, function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                response.data = newPostObj;
                res.json(result);
            });
    }

    function attachComment(req, res) {

        const myDB = mongodb.db('up-goe-db');
        let newPostObj = {
            section_id: req.body.section_id,
            user_id: req.body.user_id,
            post_content: req.body.post_content,
            post_comments: req.body.post_comments,
            post_date: req.body.post_date,
            commentable: req.body.commentable,
            is_post: req.body.is_post
        };

        //inserting new commentpost into the DB
        myDB.collection('posts')
            .insertOne(newPostObj, function (err, result) {
                if (err) {
                    response.message = err;
                    throw err;
                }
                let mainPostId = req.body.main_post_id;
                let commentPostId = result.insertedId + '';

                response.data = result;

                myDB.collection('posts')
                    .updateOne(
                        { _id: ObjectID(mainPostId) },
                        {
                            $push: {
                                post_comments: commentPostId
                            }
                        }
                    ).then(result => {

                        if (result) {
                            res.json(true);
                        } else {
                            res.json(false);
                        }

                    })
                    .catch((err) => {
                        sendError(err, res);
                    })
            });
    }
});

 // Read

/**
 * @description portal for requests regarding posts. api/posts
 * @author Cedric Yao Alvaro
 */
router.get('/posts', (req, res) => {
    var myObjArr = [];
    var counter = 0;
    var index = 0;

    if (req.query.method && req.query.method == "getSectionPosts") {
        getSectionPosts(req, res);
    } else {

        const myDB = mongodb.db('up-goe-db');
        if (req.query.sections) {
            let sections = req.query.sections.split(",");
            myDB.collection('posts')
                .find()
                .toArray()
                .then((posts) => {

                    if (posts) {

                        async.forEach(posts, processPosts, afterAll);

                        function processPosts(post, callback) {

                            myDB.collection('posts')
                                .find({
                                    section_id: sections[counter]
                                })
                                .toArray()
                                .then((post) => {
                                    Promise.all(post[0].section_id).then(() => {
                                        myObjArr.push(post[index]);
                                        counter++;
                                        index++;
                                    })
                                    callback(null);
                                });

                        }

                        function afterAll(err) {
                            response.data = myObjArr;
                            res.json(myObjArr);
                        }

                    } else {
                        res.json(false);
                    }


                })
                .catch((err) => {
                    sendError(err, res);
                })

        } else {
            res.json(false);
        }

    }

    function getSectionPosts(req, res) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('posts')
            .find({
                section_id: req.query.section_id
            })
            .toArray()
            .then((posts) => {
                res.json(posts);
            })
            .catch(err => {
                sendError(err, res);
            });
    }
});


module.exports = router;