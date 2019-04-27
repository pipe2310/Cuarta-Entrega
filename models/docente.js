const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const docenteSchema = new Schema({
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
	nivelacademico:{
		type: String
	},
	titulouniversitario:{
		type: String
	}
});

const Docente = mongoose.model('Docente', docenteSchema);

module.exports = Docente