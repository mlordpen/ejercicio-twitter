const fs = require("fs");
const USERModel = require("./users.model");
const { exists } = require("./users.model");

// Action mapping
/**
 * GET      /api/users                      -> getAll
 * POST     /api/users                      -> create
 * PATCH    /api/users/:username            -> modify
 * PUT      /api/users/:username            -> update // sin implementar
 * DELETE   /api/users/:username            -> destroy
 */

// ============ El tirón con un objeto:
/*module.exports = {getAll: getAll, create: create, modify: modify, destroy: destroy} */

// ============ Truco: Cuando el nombre con el que exportamos y el del método coinciden:
module.exports = { getAll, create, modify, destroy };

// ============ Línea a línea:
/* module.exports.getAll = getAll
module.exports.create = create
module.exports.modify = modify
module.exports.destroy = destroy */

// Devuelve todos los usuarios
// GET http://localhost:5000/api/users
function getAll(req, res) {
  USERModel.find().then((response) => {
    console.log(response);
    return res.json(response);
  });
}

// Crea un nuevo usuario
// POST http://localhost:5000/api/users
async function create(req, res) {
  let checkNewUser = await validateNewUser(req.body);

  if (checkNewUser.validated) {
    var newUser = new USERModel({
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      tweets: [],
    });
    await newUser.save();
    return res.json(newUser);
  } else {
    return res.status(400).send(`CreateUserError: ${checkNewUser.message}`);
  }
}

// Borra un usuario
// DELETE http://localhost:5000/api/users/:username
async function destroy(req, res) {
  const userName = req.params.username;

  // Check if username (id) exists in a collection with mongoose
  // const doesUserExist = await USERModel.exists({username: userName})

  // Ayuda: https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do/31550321#31550321
  USERModel.findOneAndRemove({ username: userName }, (err, user) => {
    if (user) {
      return res
        .status(200)
        .send(`El usuario [${userName}] se ha borrado correctamente`);
    }
    return res
      .status(404)
      .send(`DeleteError: El usuario [${userName}] no existe en la BD`);
  });
}

// Modifica el correo || Nombre de un usuario
// PATCH http://localhost:5000/api/users/:username
async function modify(req, res) {
  const userName = req.params.username;

  const doesUserExist = await USERModel.exists({ username: userName });
  if (!doesUserExist)
    return res.status(400).send(`ModifyUserError: El usuario no existe`);

  let updateUserInfo = {};

  if (
    !req.body ||
    (!req.body.hasOwnProperty("name") && !req.body.hasOwnProperty("email"))
  ) {
    return res.status(400).send(`ModifyUserError: request.body is empty`);
  }

  if (req.body.hasOwnProperty("email") && req.body.email != "") {
    if (!validateEmail(req.body.email))
      return res
        .status(400)
        .send(`ModifyError: El nuevo email no tiene un formato válido`);
    updateUserInfo.email = req.body.email;
  }

  if (req.body.hasOwnProperty("name") && req.body.name != "")
    updateUserInfo.name = req.body.name;

  USERModel.updateOne(
    { username: userName },
    { $set: updateUserInfo },
    (err, response) => {
      console.log(response);
      if (response.modifiedCount === 1) {
        return res
          .status(200)
          .send(`El usuario [${userName}] se ha modificado correctamente`);
      } else {
        return res
          .status(200)
          .send(`ModifyUser: no se han modificado los campos del usuario`);
      }
    }
  );
}

/**
 * =====================================================================
 * ============================= Auxiliars =============================
 * =====================================================================
 */

/**
 * Valida el email del usuario utilizando regex
 * @param email - email del usuario a validar
 * @returns True o False dependiendo de si el email pasa la validación
 */
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Valida que los datos del body sean correctos de cara a
 * crear un nuevo usuario
 * @param request - body de la petición http que contiene los datos
 * de un usuario que tienen que ser validados
 * @returns un objeto con dos propiedades: validated (true o false)
 * y message (mensaje explicando el error)
 */
async function validateNewUser(request) {
  // body vacío
  if (!request) return { validated: false, message: "request.body is empty" };
  // los campos username y email son obligatorios
  if (
    !(
      request.hasOwnProperty("username") &&
      request.username != "" &&
      request.hasOwnProperty("email") &&
      request.email != ""
    )
  ) {
    return {
      validated: false,
      message: "Los campos [username] y [email] son obligatorios.",
    };
  }
  // el email no es válido
  if (!validateEmail(request.email))
    return {
      validated: false,
      message: `El email introducido [${request.email}] no es válido.`,
    };
  // el usuario ya existe (username o correo coinciden)
  const doesUserExist = await USERModel.exists({ username: request.username });
  if (doesUserExist) {
    return {
      validated: false,
      message: `El correo electrónico o el username utilizado ya pertenece a un usuario registrado.`,
    };
  }
  // ha pasado todas las validaciones
  return {
    validated: true,
    message: "Validación correcta",
  };
}


