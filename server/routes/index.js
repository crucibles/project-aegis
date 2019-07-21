/**
 * This is where all requests will be redirected to their specified apis.
 */
const express = require('express');
const router = express.Router();


var users_api = require('./users_api');
var sections_api = require('./sections_api');
var items_api = require('./items_api');
var badges_api = require('./badges_api');
var experiences_api = require('./experiences_api');
var posts_api = require('./posts_api');
var quests_api = require('./quests_api');
var questmaps_api = require('./questmaps_api');
var courses_api = require('./courses_api');
var api = require('./api');

router.use(users_api);
router.use(sections_api);
router.use(items_api);
router.use(badges_api);
router.use(experiences_api);
router.use(posts_api);
router.use(quests_api);
router.use(questmaps_api);
router.use(courses_api);
router.use(api);



module.exports = router;