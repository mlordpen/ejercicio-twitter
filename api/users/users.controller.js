const fs = require("fs");
var uniqid = require('uniqid'); 

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

let users = loadUsers();

// Devuelve todos los usuarios
function getAll(req, res) {
  users = loadUsers()
	return res.json(users);
}

// Crea un nuevo usuario
function create(req, res) {
	
    let checkNewUser = validateNewUser(req.body);

    if (checkNewUser.validated) {
        const newUser = {
			username: req.body.username,
			name: req.body.name,
			email: req.body.email,
            id: generateId(),
            tweets: []
		}
		users.push(newUser);
        saveUsers(users); 
        return res.json(newUser);
	} else {
		return res.status(400).send(`CreateError: ${checkNewUser.message}`);
	}
}

// Borra un usuario
function destroy(req, res) {

	const userName = req.params.username;

	if (!!getUserByUsername(userName)) {
		users = users.filter((user) => user.username != userName);
        saveUsers(users); 
        return res.json(users);
	} else {
		return res.status(400).send(`DeleteError: El usuario [${userName}] no existe en la BD`);
	}
}

// Modifica el correo || nombre de un usuario
function modify(req, res) {
	const userName = req.params.username;
	let user = getUserByUsername(userName);

    if(!user) return res.status(400).send(`ModifyError: El usuario no existe`);

    if (!req.body || 
        (!req.body.hasOwnProperty("name") && !req.body.hasOwnProperty("email"))){
            return res.status(400).send(`ModifyError: request.body is empty`);
        } 

	if (req.body.hasOwnProperty("email") && req.body.email != "") {
        if (!validateEmail(req.body.email)) return res.status(400).send(`ModifyError: El nuevo email no tiene un formato válido`);
        user.email = req.body.email;
    }

    if (req.body.hasOwnProperty("name") && req.body.name != "") user.name = req.body.name;

    saveUsers(users); 
	res.json(user);
}

/**
 * =====================================================================
 * ============================= Auxiliars =============================
 * =====================================================================
 */ 

/**
 * Busca un usuario en la bd por el campo username
 * @param username - username del usuario (su id)
 * @returns Los datos del usuario si existe o undefined si no lo encontró
 */
 function getUserByUsername(username) {
	return users.find((user) => user.username == username);
}

/**
 * Busca un usuario registrado por el campo email
 * @param email - email del usuario 
 * @returns Los datos del usuario si existe o undefined si no lo encontró
 */
 function getUserByEmail(email) {
	return users.find((user) => user.email == email);
}

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
function validateNewUser(request) {
	// console.log(request);

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
		return { validated: false, message: "Los campos [username] y [email] son obligatorios." };
	}

	// el email no es válido
	if (!validateEmail(request.email)) return { validated: false, message: `El email introducido [${request.email}] no es válido.` };

	// el usuario ya existe (username o correo coinciden)
	let user = users.find((user) => request.username == user.username || request.email == user.email);

	if (!!user) {
		// !!user <==> user != undefined
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

/**
 * Lee los usuarios guardados en el fichero /data/users.json
 * @returns los ficheros parseados en JSON
 */
function loadUsers() {
	const fileData = fs.readFileSync(__dirname+'/../../data/users.json');
	return JSON.parse(fileData);
}

/**
 * Guarda los usuarios en el fichero /data/users.json
 * @returns 
 */
function saveUsers(users){
    fs.writeFileSync(__dirname+'/../../data/users.json', JSON.stringify(users));
}

/**
 * Generate a unique id based on the current time, process and machine name
 * @returns 
 */
function generateId() {
	return uniqid.time('user-')
}

function invalidBody(body) {
	return !body || !Object.keys(body).length;
}

function removeUserFromArr ( user ) {
    // var i = users.indexOf( user );
 
    // if ( i !== -1 ) {
    //     arr.splice( i, 1 );
    // }
}
