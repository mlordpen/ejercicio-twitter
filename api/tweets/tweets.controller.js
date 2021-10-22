const fs = require("fs");
const TWEETModel = require("./tweets.model");
const USERModel = require("../../api/users/users.model");

/**
 * GET      /api/tweets                      -> getAll
 * POST     /api/tweets                      -> createTweet
 * GET      /api/tweets/:id                  -> getTweet
 * DELETE   /api/tweets/:id                  -> deleteTweet
 */

module.exports = { getAll, createTweet, getTweet, deleteTweet };

function getAll(req, res) {
  //Para hacer el orden con query params
  const {_sort} = req.query
  if(_sort != undefined && _sort == 'asc'){// si detecta el query param, y es asc, ordena asc
    TWEETModel.find().sort([['createdAt', 1]]).then(r => res.json(r))
  }else { //por defecto, ordena desc
    TWEETModel.find().sort([['createdAt', -1]]).then(r => res.json(r))
  }
  
}

async function createTweet(req, res) {
  let newTweet = new TWEETModel({
    text: req.body.text,
    owner: req.body.owner,
    createdAt: Date.now(),
  });
  let userExists = await USERModel.exists({ username: request.username });
  if (!userExists) {
    return res.status(400).send(`El usuario ${req.body.owner} no existe`);
  } else {
    newTweet
      .save()//guarda el tweet
      .then((response) => {
        //return res.send("El tweet se ha creado correctamente")
        return { _id: response._id, owner: response.owner };//captura un objeto con ambos atributos
      })
      .then(async (response) => {// usa los atributos para actualizar la lista de tweets en el user
        USERModel.updateOne({username: response.owner}, {$push: {tweets: response._id}}, function (err){
          if(err) return res.status(400).send(err + "<== error")
          else return res.send('Se ha cread el tweet correctamente \n' + response)
        })
      })
      .catch((e) => {// si falla el guardado, devuelve error
        return res.status(400).send(e);
      });
    res.json(newTweet);
  }
}

function getTweet(req, res) {
  let _id = req.params.id; // recoge el id del parametro de la url
  TWEETModel.findById({ _id })
    .then((re) => {
      return res.json(re);
    })
    .catch((er) => {
      return res.status(400).send("Id no encontrado");
    });
}

function deleteTweet(req, res) {
  let _id = req.params.id;
  TWEETModel.deleteOne({ _id }, function (err, resp) {
    if (err) return res.status(400).send("No se ha borrado el tweet");
    else return res.send("Se ha borrado el tweet correctamente");
  });
}


