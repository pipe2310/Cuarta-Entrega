const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const usuarioSchema = new Schema({
	identificador:{
		type: Number,
		require: true,
		unique: true
	},
	nombre:{
		type: String,
		require: true
	},
	correo:{
		type: String,
		require: true
	},
	telefono:{
		type: Number,
		require: true
	},
	password:{
		type: String,
		require: true
	},
	tipo:{
		type: String
	},
	avatar:{
		type: Buffer
	}
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario