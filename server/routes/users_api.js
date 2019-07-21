/**
 * This is where all the request is being handled. 
 * All requests enter an api/"some string" depending on where or what api needs to be accessed.
 */
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const nodemailer = require('nodemailer');
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

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res? res.status(501).json(response): console.log("no connection");
};

// Initialization of the nodemailer transport (the 'sender' of the email).
/**
 * @default donevirdensinghynson@gmail.com - as the default email should add a system email to be used exclusive.
 * @description this function is used for retrieving lost password of a user.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'donevirdensinghynson@gmail.com',
        clientId: '252696106568-ra91i6p5akda1sv1lvbd0u9s0576nq05.apps.googleusercontent.com',
        clientSecret: 'fhz3ClKjFYWqqh3T4oEyTgZw',
        refreshToken: '1/Jqk1UIt4IVHkWIwB7hqMbNP-Zd_H2IaJjAqySmy0wOM'
    }
});

/**
 * ---------------------------------
 * USER SERVER REQUESTS ARE BELOW
*/


// LOGIN USER

/**
 * @description portal for requests regarding users. api/login
 * @author Cedric Yao Alvaro - modified Dec 9 2018
 * @author Donevir Hynson - modified Jan 11 2018
 */
router.post('/login', (req, res) => {
    //
    const myDB = mongodb.db('up-goe-db');
    myDB.collection('users')
        .findOne({
            user_email: req.body.user_email,
            user_password: req.body.user_password
        })
        .then((user) => {
            if (user) {
                if (user.user_verified) {
                    // Login in user if account is verified.
                    response.data = user;
                    res.json(user);
                } else {
                    // Deny user login, account is unverified.
                    res.json(false);
                }
            } else {
                // User does not exist.
                res.json(false);
            }
        })
        .catch((err) => {
            sendError(err, res);
        });
    // });
});

// GET PASSWORD

/**
         * @description portal for requests regarding user requesting for their forgotten password. api/userReqPass
         * @author Donevir D. Hynson
         * @deprecated email should be a dedicated one for the aegis. Passwords should be hashed asap.
         */
        router.post('/userReqPass', (req, res) => {

            const myDB = mongodb.db('up-goe-db');
            myDB.collection('users')
                .findOne({
                    user_email: req.body.user_email
                })
                .then((user) => {
                    if (user) {
                        // Mail content that is to be sent.
                        var mailOptions = {
                            from: 'UPGOE Admin <donevirdensinghynson@gmail.com>',
                            to: user.user_email,
                            subject: 'Password Retrieval',
                            text: 'Hi ' + user.user_fname + '. Your password is \'' + user.user_password + '\'.' +
                                '\n\nThis is a system-generated email.\nDo not reply in this email.\nThank you.'
                        };

                        // Sends the email.
                        transporter.sendMail(mailOptions, function (err, res) {
                            if (err) {
                                console.log(err);
                                sendError(err, res);
                            }
                        });
                        response.data = user.user_email;
                        res.json(user.user_email);
                    } else {
                        response.data = user;
                        res.json(false);
                    }
                })
                .catch((err) => {
                    sendError(err, res);
                });
        });



// ACTIVATE USER

/**
 * @description portal for requests regarding email verification. api/userVerificatoin
 * @author Donevir Hynson
 */
router.post('/userVerification', (req, res) => {
    if (req.body.code.length < 12) {
        res.json(false);
    } else {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('users')
            .findOne(ObjectID(req.body.code))
            .then((user) => {
                if (user) {
                    // User account is verified.
                    myDB.collection('users')
                        .updateOne(
                            { _id: ObjectID(req.body.code) },
                            {
                                $set: {
                                    user_verified: true
                                }
                            }
                        );
                    res.json(user.user_email);
                } else {
                    // User account is not verified.
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }
});


// READ USER

/**
 * @description portal for requests regarding users. api/users
 * @author Cedric Yao Alvaro
 * 
 */
router.get('/users', (req, res) => {


    const myDB = mongodb.db('up-goe-db');
    myDB.collection('users')
        .find(
            ObjectID(req.query.id)
        )
        .toArray()
        .then((users) => {
            if (users) {
                response.data = users;
                res.json(users);
            } else {
                res.json(false);
            }
        })
        .catch((err) => {
            sendError(err, res);
        });

});


// CREATE USER

/**
 * @description portal for requests regarding signup. api/signup
 * @author Donevir Hynson
 * @deprecated Please consider that the path given here is localhost, change the address when deployed. 
 * Also we should make an admin email dedicated for aegis.
 * 
 * 
 */
router.post('/signup', (req, res) => {

    const myDB = mongodb.db('up-goe-db');
    var newUserObj = {
        user_fname: req.body.firstName,
        user_mname: req.body.middleName,
        user_lname: req.body.lastName,
        user_birthdate: req.body.birthdate,
        user_school_id: req.body.schoolId,
        user_contact_no: req.body.contactNumber,
        user_email: req.body.email,
        user_home: req.body.home,
        user_password: req.body.password,
        user_security_question: req.body.securityQuestion,
        user_security_answer: req.body.securityAnswer,
        user_photo: null,
        user_type: req.body.type,
        user_verified: req.body.verified,
        user_conditions: req.body.userConditions
    };

    myDB.collection('users')
        // Counts the number of returned results from query
        .count({
            user_email: newUserObj.user_email
        })
        .then((count) => {
            // If count returns true (>=1), then user email already exists
            if (count) {
                response.data = newUserObj.user_email;
                // Returns false to signal that user already exists
                res.json(false);
            } else {
                // If count returns false (=0), inserts new user to database
                myDB.collection('users')
                    .insertOne(newUserObj, function (err, result) {
                        if (err) {
                            response.message = err;
                            throw err;
                        } else {
                            // Mail content that is to be sent.
                            var mailOptions = {
                                from: 'UPGOE Admin <donevirdensinghynson@gmail.com>',
                                to: newUserObj.user_email,
                                subject: 'Email Verification',
                                text: 'Hi ' + newUserObj.user_fname + '. Please go to this link to verify your email: ' +
                                    'http://localhost:4200/sign-up/verify-email?verify=' + result.insertedId +
                                    '\n\nThis is a system-generated email.\nDo not reply in this email.\nThank you.'
                            };

                            // Sends the email.
                            transporter.sendMail(mailOptions, function (err, res) {
                                if (err) {
                                    console.log(err);
                                    sendError(err, res);
                                }
                            });
                        }

                        response.data = newUserObj;
                        res.json(result);
                    });
            }
        })
        .catch((err) => {
            sendError(err, res);
        })
});

// UPDATE USER

/**
 * @description portal for requests regarding users. api/users
 * @author Cedric Yao Alvaro
 * 
 */
router.post('/updateUser', (req, res) => {
    var x = new Date(Date.now());
    var h = [];

    if (req.body.currentUserId && req.body.userContactNo) {
        updateStudentProfile(req, res);
    } else {
        hasLoggedInThisDay(req, res);
    }


    function loginUpdate(req, res) {


        const myDB = mongodb.db('up-goe-db');
        myDB.collection('users')
            .updateOne(
                { _id: ObjectID(req.body.user_id) },
                {
                    $inc: {
                        "user_conditions.log_in_streak": 1
                    },
                    $push: {
                        "user_conditions.log_in_total": new Date(x).toLocaleDateString()
                    }
                }

            )
            .then(z => {
                if (z) {
                    res.json(true);
                } else {
                    res.json(false);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });

    }

    function updateStudentProfile(req, res) {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('users')
            .updateOne(
                { _id: ObjectID(req.body.currentUserId) },
                {
                    $set: {
                        user_contact_no: req.body.userContactNo
                    }
                },
                function (err, res) {
                    if (err) throw err;
                    response.data = req.body.currentUserId;
                }
            );
    }


    function hasLoggedInThisDay(req, res) {


        const myDB = mongodb.db('up-goe-db');
        myDB.collection('users')
            .findOne(ObjectID(req.body.user_id))
            .then((user) => {

                if (user) {

                    if (user.user_conditions.log_in_total.length > 0) {

                        Promise.all(user.user_conditions.log_in_total).then((date) => {

                            h = date.filter((d) => {
                                if (new Date(d).toLocaleDateString() == x.toLocaleDateString()) {
                                    return new Date(d).toLocaleDateString();
                                } else {
                                    return false;
                                }
                            });
                            if (h.length > 0) {
                                res.json(true);
                            } else {
                                loginUpdate(req, res);
                            }

                        });

                    } else {

                        loginUpdate(req, res);

                    }

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