const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);

const matriculaSchema = new Schema({
	idmatricula:{
		type:Number,
		require: true,
		unique: true
	},
	idcurso:{
		type: Number,
		require: true
	},
	idaspirante:{
		type: Number,
		require: true
	}				
});

const Matricula = mongoose.model('Matricula', matriculaSchema);

module.exports = Matricula