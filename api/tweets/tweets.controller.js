const fs = require("fs");
var uniqid = require('uniqid'); 

/**
 * GET      /api/tweets                      -> getAll
 * POST     /api/tweets                      -> createTweet
 * GET      /api/tweets/:id                  -> getTweetById
 * DELETE   /api/tweets/:id                  -> deleteTweet
 */

module.exports = { getAll, createTweet, getTweetById, deleteTweet, sortTweetsAsc, sortTweetsDes };

let users = loadUsers();
let tweets = loadTweets();

function getAll(req, res) {
  loadData();
  let tweetsSorted = [...tweets];
  if(req.body.hasOwnProperty('sort') && req.body.sort == 'asc'){
    tweetsSorted = tweets.sort(function(a,b){
      return a.createdAt - b.createdAt;
    })
  }else if(req.body.hasOwnProperty('sort') && req.body.sort == 'des'){
    tweetsSorted = tweets.sort(function(a,b){
      return b.createdAt - a.createdAt;
    })
  }
  res.json(tweetsSorted);
}

function createTweet(req, res) {
  loadData()
  const user = getUserByUsername(req.body.owner);
  let tweet = {
    id: generateId(),
    text: req.body.text,
    owner: req.body.owner,
    createdAt: Date.now(),
  };
  tweets.push(tweet);
  user.tweets.push(tweet.id);
  saveData()
  res.json(tweet);
}

function getTweetById(req, res) {
  loadData()
  const tweetID = req.params.id;
  const tweet = getTweet(tweetID);
  res.json(tweet);
}

function deleteTweet(req, res) {
  loadData();
  const user = getUserByUsername(getTweet(req.params.id).owner);
  tweets = tweets.filter(tweet => tweet.id != req.params.id)
  user.tweets = user.tweets.filter((tweet) => tweet != req.params.id);
  saveData();
  res.json(user);
}

function sortTweetsAsc(req, res){
  loadData()
  console.log('df')
  const tweetsSorted = tweets.sort(function(a,b){
    return a.createdAt - b.createdAt;
  })
  
  res.json(tweetsSorted)
}

function sortTweetsDes(req, res){
  loadData()
  const tweetsSorted = tweets.sort(function(a,b){
    return b.createdAt - a.createdAt;
  })
  res.json(tweetsSorted)
}

//--------------------------------------FUNCIONES--------------------------------------------------------------------------------
function loadUsers() {
  const fileData = fs.readFileSync(__dirname + "/../../data/users.json");
  return JSON.parse(fileData);
}

function loadTweets(){
  const fileData = fs.readFileSync(__dirname + "/../../data/tweets.json");
  return JSON.parse(fileData);
}

function saveUsers(users){
  fs.writeFileSync(__dirname+'/../../data/users.json', JSON.stringify(users));
}

function saveTweets(tweets){
  fs.writeFileSync(__dirname+'/../../data/tweets.json', JSON.stringify(tweets));
}

function loadData(){
  users = loadUsers();
  tweets = loadTweets();
}

function saveData(){
  saveUsers(users);
  saveTweets(tweets);
}

function getUserByUsername(username) {
  return users.find((user) => user.username == username);
}

function generateId() {
  return uniqid.time("tweet-");
}

function getTweet(id) {
  let tweet = {};
  tweet = tweets.find((tweet) => tweet.id == id);
  return tweet;
}

function validateID(id){

}