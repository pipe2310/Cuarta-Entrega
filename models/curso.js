const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const cursoSchema = new Schema({
	identificador:{
		type: Number,
		require: true,
		unique: true
	},
	nombre:{
		type: String,
		require: true
	},
	descripcion:{
		type: String,
		require: true
	},
	valor:{
		type: Number,
		require: true
	},
	modalidad:{
		type: String
	},
	intensidad:{
		type: Number
	},
	estado:{
		type: String
	}				
});

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso