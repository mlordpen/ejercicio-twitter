const router = require("express").Router();
const controller = require('./tweets.controller.js')

router.get('/', controller.getAll)
router.post('/', controller.createTweet)
router.get('/:id', controller.getTweetById)
router.delete('/:id', controller.deleteTweet)
router.get('/asc/', controller.sortTweetsAsc)
router.get('/des/', controller.sortTweetsDes)

module.exports = router;