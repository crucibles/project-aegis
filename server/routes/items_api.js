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




router.post('/items', (req, res) => {
    console.log("> POST ITEMS ITEMS le here");
    if (req.body.method == "equipItem") {
        if (req.body.to_equip) {
            equipItem();
        } else {
            unequipItem();
        }
    } else if (req.body.method == "useItem") {

    } else if (req.body.method == "removeItem") {
        removeItem();
    } else if (req.body.method == "createItem") {
        createItem();
    } else if (req.body.method == "addItemToSection") {
        addItemToSection(req.body.item_id, req.body.section_id);
    }

    function createItem() {

        const myDB = mongodb.db('up-goe-db');

        let newItemBody = {
            item_type: req.body.item_type,
            item_part: req.body.item_part,
            item_name: req.body.item_name,
            item_photo: req.body.item_photo,
            item_description: req.body.item_description,
            item_hp: req.body.item_hp,
            item_xp: req.body.item_xp,
            item_ailment: req.body.item_ailment,
            item_armor: req.body.item_armor,
            is_default: req.body.is_default
        };
        myDB.collection('items')
            .insertOne(newItemBody)
            .then(result => {
                resultId = result.insertedId + '';
                addItemToSection(resultId, req.body.section_id);
            })
            .catch((err) => {
                sendError(err, res);
            });
    }

    function addItemToSection(item_id, section_id) {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('items')
            .updateOne(
                {
                    _id: ObjectID(req.body.section_id)
                },
                {
                    $addToSet: {
                        "items": item_id
                    }
                }
            )
            .then(result => {
                res.json(true);
            })
            .catch(err => {
                sendError(err, res);
            })
    }

    function equipItem() {

        const myDB = mongodb.db('up-goe-db');
        let item_part = req.body.item_part;
        myDB.collection('inventories')
            .updateOne(
                {
                    _id: ObjectID(req.body.inventory_id)
                },
                {
                    $set: {
                        [item_part]: req.body.item_id
                    }
                }
            ).then(result => {
                if (result) {
                    removeItem();
                } else {
                    res.json(false);
                }
            });
    }

    function unequipItem() {

        const myDB = mongodb.db('up-goe-db');
        let item_part = req.body.item_part;
        myDB.collection('inventories')
            .updateOne(
                {
                    _id: ObjectID(req.body.inventory_id)
                },
                {
                    $set: {
                        [item_part]: ""
                    },
                    $addToSet: {
                        items: {
                            item_id: req.body.item_id,
                            item_quantity: 1
                        }
                    }
                }
            ).then(result => {
                if (result) {
                    res.json(true);
                } else {
                    res.json(false);
                }
            })
    }

    function removeItem() {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('inventories')
            .updateOne(
                {
                    _id: ObjectID(req.body.inventory_id)
                },
                {
                    $inc: {
                        "items.$[elem].item_quantity": -1
                    }
                }, {
                    arrayFilters: [{
                        "elem.item_id": req.body.item_id
                    }]
                }).then(result => {
                    if (result) {
                        cleanInventory();
                    } else {
                        res.json(false);
                    }
                }).catch((err) => {
                    sendError(err, res);
                });
    }

    /**
     * Clears out inventory from items with qty of 0.
     * 
     * @author Sumandang, AJ Ruth H.
     */
    function cleanInventory() {

        const myDB = mongodb.db('up-goe-db');
        myDB.collection('inventories')
            .updateOne(
                {
                    _id: ObjectID(req.body.inventory_id)
                },
                {
                    $pull: {
                        items: {
                            "item_quantity": 0
                        }
                    }
                }
            ).then(result => {
                if (result) {
                    res.json(true);
                } else {
                    res.json(false);
                }
            })
    }
});

/**
 * @description portal for get requests that regards to sections "api/items"
 * @author Sumandang, AJ Ruth H.
 */
router.get('/items', (req, res) => {
    if (req.query.method == "getUserSectionInventory") {
        console.log(req.query);
        getSectionInventory();
    }

    /**
     * Retrieves the user's section inventory based on the received user and section id
     */
    function getSectionInventory() {

        const myDB = mongodb.db('up-goe-db');

        myDB.collection('inventories')
            .findOne({
                "user_id": req.query.user_id,
                "section_id": req.query.section_id
            })
            .then(inventory => {
                console.log(inventory);
                if (inventory) {
                    let items = [];
                    inventory.head.length > 0 ? items.push(ObjectID(inventory.head)) : "";
                    inventory.armor.length > 0 ? items.push(ObjectID(inventory.armor)) : "";
                    inventory.footwear.length > 0 ? items.push(ObjectID(inventory.footwear)) : "";
                    inventory.left_hand.length > 0 ? items.push(ObjectID(inventory.left_hand)) : "";
                    inventory.right_hand.length > 0 ? items.push(ObjectID(inventory.right_hand)) : "";
                    inventory.accessory.length > 0 ? items.push(ObjectID(inventory.accessory)) : "";
                    inventory.items.forEach(item => {
                        items.push(ObjectID(item.item_id))
                    })
                    getItems(items, inventory);
                } else {
                    res.json(null);
                }
            })
            .catch((err) => {
                sendError(err, res);
            });
    }

    function getItems(items, inventory) {
        let result = {
            inventory: inventory,
            items: []
        };

        if (items.length > 0) {

            const myDB = mongodb.db('up-goe-db');

            myDB.collection('items')
                .find({
                    _id: { $in: items }
                })
                .toArray()
                .then(new_items => {
                    if (res) {
                        result.items = new_items;
                    }
                    res.json(result);
                });
        } else {
            res.json(result);
        }
    }
});


/**
 * -----------------------------------------------------------------
 *
 */



module.exports = router;