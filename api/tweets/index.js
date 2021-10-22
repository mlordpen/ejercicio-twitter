const router = require("express").Router();
const controller = require('./tweets.controller.js')

router.get('/', controller.getAll)
router.post('/', controller.createTweet)
router.get('/:id', controller.getTweet)
router.delete('/:id', controller.deleteTweet)

module.exports = router;