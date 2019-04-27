require ('custom-env').env(true)

const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser')
require('./helpers');
const mongoose = require('mongoose');
const Curso = require ('../models/curso')
const Matricula = require ('../models/matricula')
const Usuario = require ('../models/usuario')
const bcrypt = require('bcrypt');
const session = require('express-session')
const sgMail = require('@sendgrid/mail')
const multer = require('multer')
const directoriopublico = path.join(__dirname, '../public')
const directoiopartial= path.join(__dirname, '../partials')
const dirNode_modules = path.join(__dirname,'../node_modules')
var MemoryStore = require('memorystore')(session)

const server = require('http').createServer(app);
const io = require('socket.io')(server);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
process.env.URLDB = process.env.URLDB ||  'mongodb://localhost:27017/EducacionContinua'

app.use(express.static(directoriopublico));
app.use('/css',express.static(dirNode_modules+'/bootstrap/dist/css'));
app.use('/js',express.static(dirNode_modules+'/jquery/dist'));
app.use('/js',express.static(dirNode_modules+'/popper.js/dist'));
app.use('/js',express.static(dirNode_modules+'/bootstrap/dist/js'));
hbs.registerPartials(directoiopartial);
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
    	}),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use((req,res,next)=>{

  if(req.session.usuario){
  	res.locals.sesion = true
  	res.locals.nombre = req.session.nombre.toUpperCase();
  	res.locals.identificador = req.session.identificador
  	res.locals.tipo = req.session.tipo
  	res.locals.avatar = req.session.avatar
  }
  if(req.session.tipo=="Coordinador"){
  	res.locals.coordinador = true
  }
  if(req.session.tipo=="Aspirante"){
  	res.locals.aspirante = true
  }
next()

})

app.set('view engine','hbs');

app.get('/',(req,res)=>{
	res.render('index',{
		
	});
});

app.get('/interesado',(req,res)=>{

	Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		res.render('interesado',{
			listado:respuesta
		});
	})

});

app.get('/iniciochat',(req,res)=>{
	res.render('iniciochat',{

	});
});

app.get('/chat',(req,res)=>{
	res.render('chat',{

	});
});

app.get('/contacto',(req,res)=>{
	res.render('contacto',{

	});
});

app.post('/envioemail',(req,res)=>{

const msg = {
 to: 'pipeospinav@gmail.com',
 from: req.body.from,
 subject: req.body.subject,
 text: req.body.text
};
sgMail.send(msg);

			res.render('envioemail',{
				mensaje:'Enviado Satisfactoriamente'
			});


});

app.post('/iniciodesesion',(req,res)=>{
	res.render('iniciodesesion',{

	});
});

app.get('/iniciodesesion',(req,res)=>{
	res.render('iniciodesesion',{

	});
});

app.post('/ingresar2',(req,res)=>{
let sw=false;
let sww=false;
	Usuario.findOne({identificador:parseInt(req.body.identificador)},(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		if(!resultados){
			return	res.render('ingresar2',{
						mensaje: "El usuario no es válido"
					})
		}
		if(!bcrypt.compareSync(req.body.password,resultados.password)){
			return	res.render('ingresar2',{
				mensaje: "La contraseña no es válida"
			})
		}

		req.session.usuario = resultados._id
		req.session.identificador = resultados.identificador
		req.session.nombre = resultados.nombre
		req.session.tipo = resultados.tipo

		if(resultados.avatar){
			avatar = resultados.avatar.toString('base64')
		}else{
			avatar='/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAgMDAwMDBAcFBAQEBAkGBwUHCgkLCwoJCgoMDREODAwQDAoKDhQPEBESExMTCw4UFhQSFhESExL/2wBDAQMDAwQEBAgFBQgSDAoMEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhL/wAARCAMABMMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7Looor3TzwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKVVaRgsYZmY4UAZyfagBKKu/2LqH/Pje/wDgO3+FW7TwfrF5sMNhOFkPDONoH1z0qXOK6j5WY9FdN/wrnXf+faP/AL/L/jUc/wAP9bt4yzWgfH8KSKx/LNT7an/MPkl2Odop81vLbSGO4jkikHVZF2kfgaZWhIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVq2nhXVr1Ve3sLgo5wGZdo+vPalKSjuNJvYyqK7rS/hXdTYbVLmOBTzsi+ZvxPQdvWt+x+GOk22Dc+ddEZ+++0H8qwliqcfM0VKTPJqvWGh3+qOFsLOebpyFwBnpkngV7Zb6LZWiFLWztYkJzhYgBn8qtxxiNQFAUDgAdhWEsb2Raodzym1+GGrTEfaHtoAVzksWIPpgV0en/C7Trdc38s925HY7FH4Dn9a7akrCWJqS6mipRRiaf4O0jT8eTYwsRn5pRvPP1rYht4reNY7eOOONfuqigAfgKkorFyb3LSSEopaSkMKr315FY27z3cixQxjLM3QVV1zXLbQ7Frm8bgcIg6u3oK8e17xFeeILppLuRhFn93CG+VB7D1963o0JVPQznUUSXxdrcev61JdW6lYdqom5QCQO5x75rGoor1YxUVZHI3fUKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiinRxPPIqQI8jt91UXJP0FADaFUswCgkngD1rs9F+Gd9dTK2rFbW3AyQG3O3sMdPxruNH8H6Xor+Za22+XtJL87D6elc08XCO2prGlJ7nlmk+E9T1h1+z2siRHrLKNqj8T1/Cuv0n4VxJKW1m585R92OH5QfqT/AEr0DA9KK5J4qpLbQ2jSijLsfC+l6ayvZ2UKOoGHK7iMd8nv71p7adSVztt7mqVgpaKKQBRRRQAUUUUAFFFFABSHoaWkb7poA8G1jWrvXLrz9QlLsMhV6Kgz0A7VRqzqGm3Ok3LW+oRNDKvO1u49Qe4qtXtwtyqxwS+LUKKKKoQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABT4YZLiRY4EeSR+FVVJJ/Ctjw54TvPEU2YR5VspG+ZwcEZ5C+p616joHhWw0BQbOLdcbdrzMcs/9B+Fc9XExp6bs0hScjidA+Gd1ebZtaY2kfB8pcF2HcH+7Xoem6JZ6TGiWFtFFsXbvC/MR7t1PNXulLXnTrTm7s6YwjESloorMsKKKKACiiigAooooAKKKKACiiigAooooAKQ5xx1paKAKGp6LaavbtFfQpIGUgNj5k91PUGvMfE3gG60WQSaaJr21OeVTLR/UD27/wAq9dppXNa060qexE4KR880V6n4q+HsOpZn0VYra6J+ZSdqMOcnAHBrzG7tZbG4kguo2jlibaysOQa9OlWjU2OScHEiooorUkKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoop8EMlzMkVujPLI21VUck0XAYqlmCqCWJwAOpr0Lwr8OQ0aXWvBg27KW4YEEf7X+ANbHhLwLBoqx3V8Fmvxz1yseewHr711o6V51fFN+7E6YUurEWNY1CxqFVRgADAApcClorjNwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooATaKyPEXhmz8RW4S7UrKmfLmX7yZ/mPatiimpNO6E1fc8L13w5eeH7gpext5bHEcwHyv8AT368day6981LS7bVrdoL+FJo2/vDkH1B7GvJPFXg+48OSmVN01k7YWXH3SegP+PevSoYlS0luctSny6o56iiiuoyCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAlt7eS6mSG2RpJZGCqqjJJNeteDPB8egQie6Akv5VwzdRGP7o/xqh4A8If2fGNQ1OIi7fPkq3/LNSOpHYnn8PxruMV5uJr83urY6aVO2rBV20tFFchuFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFQ3FrFdQyRXCLJFIuGVhkEVNRQB5H4u8CyaHm608vPZZ+bI+aL0z6j3rk6+grm3juLeSGdFeKVSrq3Qg9RXkXjLwfL4fmM9qGksZW+VupjP91v6GvRw+Iv7sjmqU7ao5qiiiu0wCiiikAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFdb8PfDI1jUDd3kYeztezdHfsMeg6/lXMWdpJf3cNtb48yeQIm7gZJwK9y0HSk0XS4LOElhCvLHuTyT+ZrlxVXljZbs1pQu7svLkCnUUV5h1hRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFV72xg1C3aC8iWWF/vK3Q1YooQHh3ijw7J4b1EwOwkjcb43H90kgA+/FZFe5eJNBTxDpctq7BHOGikx9xh0/wAPxrxK8tXsbua2nwJYJCj4ORkHBxXq4et7SNnuclSHK/IioooroMgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA7X4Y6Kl7qEt9MFZbQAIrLn5m7g+wH616kOK5/wAD6WNK8O267cSXI86TnOSwGP0xXQ149afNNs7acbRCiiisiwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArzj4n6Dt8rU7aNiWOy4K9Bx8pPp6Z+lej1U1SzXUNNuLV9uJ42QblyASODj64NaUqnJJMmceaNjwKipLq2ks7iSC4UpLExVlPYio69lO+xwhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRVzRVDaxYhgCDcxgg9/mFKWw1ue62dutnbQwRklYY1RSepAGKnpKK8M7xaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACmntTqTtQB458Qrf7P4ouCEKCVEccfeyOT+YNc3XZfFT/kYLf8A681/9DeuNr2KDvTRwz+JhRRRWpIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABV3RP8AkNWH/X1H/wChCqVXdE/5DVh/19R/+hClL4WNbnvdFFFeGd4UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJ2paTHFAHlXxU/5GC3/AOvNf/Q3rja7n4r25TVLKfcP3luU2+m1ic/+PfpXDV6+H/ho4qnxMKKKK2ICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKu6J/yGrD/AK+o/wD0IVSrW8JwpP4k05JVyvng/iOR/IVM3aLY47nuVFFFeId4UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHm/wAW/wDj403/AHJP5rXn9egfFv8A4+NN/wByT+a15/XrYb+Ejjq/GwooorczCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK2/Bf/I0ad/12/oaxK2/Bf/I0ad/12H8jUVfgY4/Ej22iiivFO8KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDzf4t/8AHxpv+5J/Na8/r0D4t/8AHxpv+5J/Na8/r1sN/CRx1fjYUUUVuZhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFbfgv8A5GjTv+uw/kaxK6DwHbm58VWQ3bfKYv8AXCnioqv92yofEj2iiiivFO4KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDzf4t/8fGm/7kn81rz+vQPi3/x8ab/uSfzWvP69bDfwkcdX42FFFFbmYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXTfDj/ka7f8A65v/AOgmuZrpvhx/yNlv/wBc3/8AQTWdZfu5Fw+JHsVFFFeMdoUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHm/xb/4+NN/3JP5rXn9egfFv/j403/ck/mtef162G/hI46vxsKKKK3MwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACum+HH/I2W/wD1zf8A9BNczXTfDj/kbLf/AK5v/wCgms638OXoXD4kexUUUV4x2hRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAeb/Fv/j403/ck/mtef16B8W/+PjTf9yT+a15/XrYb+Ejjq/GwooorczCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK6b4cf8jZb/wDXN/8A0E1zNdN8OP8AkbLf/rm//oJrOt/Dl6Fw+JHsVFFFeMdoUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHm/wAW/wDj403/AHJP5rXn9egfFv8A4+NN/wByT+a15/XrYb+Ejjq/GwooorczCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK6b4c/wDI12//AFzf/wBBNT6H8Ob3VrRbm4njtI5FzGCpZmHrjsK6Twz4Bl0DWYbxryOdEVgV8sqSSMDHPufyrlrV4cso31NYQlzJnb0UUV5h1hRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAeb/Fv/j40z/ck/mtef16J8VLea6u9MS1ikmfy5TtjUscZXsK4K40+6tEDXVtcQqTgNJGVBPpkivVwzXs0jjqr3mQUUUV0GYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFAoooYH0MkaxoqoqqqjCgDAApahsbgXlnBOBtE0avjOcZGanrwmeggooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBMVU1Swj1OxntbgN5UyFW28H8Kt1HcTJbwySTMESNSzMegAHJprcD58ooor3DzwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKYHt3gv/AJFfTv8Arj/U1tVheB5Vl8LWBjbdtj2n2IJyK3a8OfxM747BRRRUjCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASsfxdK1v4c1CSM4bySPz4P6GtisXxp/yK+o/9cv6iqh8SFLZniVFFFe2cAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFMD174azJJ4XjVDloppFf2Oc/yIrqa4b4U3SnSbyDB3x3G8nthlAH/AKCa7nrivGrq1RnbTfuoWiiisiwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAErl/iMzL4XuMEjLoODj+IV1NcT8VpNuiWybsF7ofLnqArf4itKKvURM37rPLaKKK9k4QooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAO7+E7H+0L5cnaYVOM8Zz1r0xa8d+Huoix8SRJIxVLpTEfmwMnlc+vIx+NexDtXl4tWqHXRfui0UUVzGoUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXmnxYuGa8sICF2pGzg98kgH+Qr0onFeTfE69Fz4gWFCv8Ao0IVsdcnnB/AiujCq9QyrP3TkaKKK9U5AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAJLWY21zFKpYGJw3ynB4Of6V73Y3seoWsNxbndHMgZT7EV4BXpPwx12N7VtMnfEsbFoQTncp5IH0IJ/GuPGU7xUl0NqMtbHf0UUV5x1BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUlADZXEalmICqMkk9K8F1a8fUNTuriQhmmlY8HIxnjHtXqfxE1Y6doLxwyKk12fLAz823+Ij8OPxryGvQwcNHI5q76BRRRXaYBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFF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6EV7Z4b1yPXtLjuI2UyAATKONr4BI+nNebiqXLLmWzOqlO6sa9FJS1yGwUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUANJNeTfEjW31DWTaI3+j2YAAU5DMRkn9cfnXf8Ai7Xk0HR5ZCxE8oKW4A6vjj8B1rxNmLMSxJJ5JrtwdO752YVpdAooor0DmCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACtrwp4kk8N6h5oBeCUBZk9R6j3GTWLRSlFSVmNNrVH0BZ3kN9bpPayLLFKMqy96n61494Q8ZSaBMILxpJNPOf3agEox7jP8q9fikEkauv3WAI+hryKtJ05WZ2QnzK4+iiisiwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAEqK4u4bOFpbqRIo0HzO7YA+pqVulcD8Vr6SG1s7WOQCO4LGVOOdu3b+uaunDnkokzlyq5x3irX5PEGqvMxHkxZSALnGwHrz3PX8qx6Slr2YxUY2RxN3dwooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBURpGVUGWYgD619A2imO1hVhhljUEehxXhWh24u9asYWJUS3CLkdssK96X7tcGNeqR0UFuxaKKK4ToCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooARuleY/Fb/kKWX/Xuf/Qq9O7ivMfiv/yFLL/r3P8A6FXRhf4qM6vwnDUUUV6pxhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAbvgWJJvFenrKAwDswB9QhIP5gV7Sv3a8l+GShvEw3DOLdyPbpXrVeZjH+8sddH4R1FFFcpqFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAleY/Ff/kKWX/Xuf/Qq9Pry34qyq2sWqKQWjt/mHpljiujC/wARGVX4TiaKKK9U5AooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOy+F1uZNdmlBAWG3IPvkj/CvVe1ec/Ce1DSajPuIKqiY9jk/0r0avKxT/es7KS90Wiiiuc0CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8j+J3/Izf9u6f1r1yvI/ib/yM3/bun9a6sJ/EMq3wnJ0UUV6ZyBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUU7CPUfhTCi6PeSqPne52MfZVBH/oRrt65b4bRqvheIqAC8shYjud2P5AV1NeLWd6jO+HwoKKKKzKCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8j+J3/ACM3/bun9a9cryP4m8+Jv+2Cf1rpwn8UyrfCcnRSdelLXqnIFFFFIAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpa3/BGiprevRxzhGhgUyyI38YBAx+ZH61MpcsbsaV3Y2PDPw5bUrUXGsyTWyyf6uKPAbHqSQcfTFdXB8O9EgkRxbs+zqHkJDcY5H68eldGoFPryZV5yd7nYqcUV7Gwg023EFjEsMK5KovQZ61YoorIsKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKy77wzp2pXLXF/axzysoXc+eg6CtSimnbYGjgvEXw1tWtpp9F8yOeNSywZ3LIeuBnkHt+VeayK0bssgIZThgRjBr6Fb7teS/EbR/wCz9Z+1R4Ed/l+mAGGA317H8a7sLXbfLI56sNLo5Oiiiu45wooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvSPhTYBba9u2RgzuI1YjjA5OPxP6CvN69e+GsLReGI2ccSzO6/TOP5g1zYuVqfqa0fiOpFLRRXlnWFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVxvxSheTw/E0a5EV0rOfQFWH8yK7Kuc+IFu1x4XuwhUGPa5z3AYZrWi7VIkzXus8aooor2DhCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAdFE1xKkcYy0jBVHuTXunh3TP7G0a2sy29oV+ZvVicnHtkmvNvhvoQ1LVWu5uYrDDKM9XP3fywTXrKjGa87F1Ly5ex00Y9R1FFFcZuFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVWv7OLULWW3ul3xSrtZc4yKs0houB8/39nJp95NbXAIkhcqflxnHfH6/jUFd98UtHKzwalEBtdRFLj+8OVP5cfgK4GvZoz54JnDOPK7BRRRWhIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVreFdJXW9ctrWUjymYtJn+JV5I4qZyUVdjSu7HqXgrRl0fQ4F+UyzqJZH24JJ5AP0BxXQUgXFLXiylzNtnclZWCiiikMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAzPEOk/wBs6PdWm4r5q/KV65B3D9QK8Nmhe3meGdSkkbFXU9QR1FfQteM+PNLbTfEVw2D5d2fOjP1+9+ua7cHPVxMK0epztFJS16BzBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRSUwFoqa1s571ttnDLO3cRoWx9cV12k/DC+vI1k1KZLNTj93je+O+ew/Ws51YQ3ZUYuWxxdbel+DNW1Ty2htHjhcj97J8oAPfB5I+len6T4L0zR1TybZJZV5M0wDNn2z06npW4q4GMYArjnjP5UbRo9zidL+GFjbqjanJLcyj7yq21Pwxz+tdlbWcNnEI7WKOFBztRQBUtLXJOpKW7NoxUdgoooqCgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKhuLWK6geK4jSSORcMrDIIqaigDitS+GOn3bSyWck9pI/3VXDIp+h5/WuN1LwHrGneY32f7RDGC3mxMDkfTr+lezUtbwxNSPmZypRZ88MrIxVwVYdQRg0le5ah4X0zVWZ76yheR+TIBtfjp8w5ri9U+FcscbvpN0JSANsMq4J/4F0/SuyGLhLfQxlRktjgaKuahot9pbst/bTRBWxuZTtP0PSqddKaexk1YKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKVVMjKsYLOxAVQM5oASiun0X4e6nqkmbtDYwDBLyrywP90f413GifD/AEzSpPMmRryVTlWm5C/Relc9TE04+bNI0pM8z0fw3qGvSEafASgGWkc7VHpz3/Cu30P4Y28SFtckM7soxFExVUP16mu7SJI1CxqFUdAOgp20elcdTFTlotDeNKKKtjpttpkPk2MCQxbi21R3PerQGKWiuY1SCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkIzS0UARSQrKjJKqujjDKy5BHuK5bV/hvpl+rNZ7rOZmzuT5l+m0muupKqM5R2YnFM8Z1TwHq+lxPK0Kzwpks0LZIAPUjrXPspVirDawOCDwR9a+hto9Ky9X8O6frUYW+tkcgkhl+VgSOuR/npXXDGP7SMHQXQ8MorutX+F09vHv0i4+0FR80cg2sfoelcdqGmXWlzCLUIJIHIyA46iuynVhPZmMoSjuVqKKK0JCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiir+kaFe65MU0yEy4GS3RR+J4zSbUVdjSuUKltrSe8kEdpDLM5/hjUk/pXoeifC+FYQ+uys8rc+XC2Ao9M45712ljplvpsCw2MKQxoMAKP5nqa5amMjHSOprGi3ueeaR8Lbq48p9WnFuh5eKPDOOemeldzpPhnT9FX/AEG2RZMY8xvmY/ifrWqBilrinWnPdm8YRjsJRS0VkWFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAlQXtlBqFu0F5Ek0T/eVhkGrFFAHEa38MbS8zJpMhs5D/wAsz8yH+orida8HanojEzwNNDnCzRDcPx7j8a9tpmOa6IYmpHTdGUqUWfPTAqSGBBHUUV7RrHgnS9ZbzJoPJmySZIcKWJ9eOa4XV/htqVlI7afsu4Mnbg4fHuD369PSuynioS0ehjKlJHI0U6WN4ZCkytHIv3lZcEfUU2unzMgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACik4rodB8D6lryiWNVtrc4/eS5G4cfdGOeD9OOtTKcY6tjSb2Ofra0fwfqetMpt7Z4oT1mlBVce2evTtXo2k/D/AErTY4zNB9rnTkySkkE47L0x9a6dVCqABwK46mM6RRvGj3OO0H4b2GnSLNqDm9lXkKy4QH/d7/j+VdbDbxW8YjgRY0XoqDAH4CpKWuKU5S1ZsopbCYpaKKkoKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKbtFOooAoaloljq0TpqFvFLuXbuK/MB7N1FcJq3wteNXk0e58wAEiGXg/QN0/lXpNGK0hVnDZkyhGW54HfaTe6YwGoWs8GSQC6EBiPQ9DVSvoG8soL+FobyGOaJ/vK65BrjNc+GNtdfPobi0cDHluzMje+eSD+ddtPGRfxaGEqL6HmNFamt+Gr/QJSt9F+7zhZkyUb6GsuuuMlJXWpi01uFFFFMQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUAFmwoJJ9K6XQ/AOpawd06GxgIPzzJyT6BetTKcY6yY0m9jmhzgDvXS6J4B1PVvLlmQWls4DCSTqR7L1/PFeh6F4M03RVykS3E4OfOmUMwPt6Vv7RXFUxj2gdEKPcwdD8GadoLCS1R5JxnE0zbmGfTsK3sUtFcUpOWrNkktgooopDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAjePcpDYIPauW1j4c6bqkjTW5kspGHSLGwnOclcfyIrraSqjOUXdMTSe54pq3gvVtJ3tNbPNCmf30XzDA7kdR+NYdfQ2wHqM1zeveBdO1iNzDElpckkiWJcZJz1HQ/zrsp4z+cwlR7HjtFdHrXgPU9Jy8KfbIOMSQqSfxXr/ADrnCCpIIwRXbCcZfDqYOLW4UUUVQgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiitDR9Avtcm2afCzqGAeQ8KmfU0nJLVjSb2M+t3QPBuoeIFMluqwwBgPMlzg/Qd67zw98O7PSXSe8Iu7lcEbh8iN7Dv+NdZHGI1CqAoHAA4AFcVTGdIG8KPc5/Q/A+naGySxxtPcKP9bLyQfUDoP510VLRXFKUpO7N0kthKWiipGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAJWBrngvTdaLvJD5NwwP76Lg5Pcjoa6CinGTi7oTSe5414g8C6hoaPNgXNsrY8yPqB6le1c5X0My7gQeQa5zXvAuna3iTZ9mn7yQqBu+o79K7aeM6TMJUex45RW5rng/UdDkkMkLz2yc+ei8EepHOOlYdd0ZRlqmYOLW4UUUUxBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFKql2CqCxPQAZNWdM0241e8S1sE8yZ8kL0HA5JPavVvCvgm20HZPOPOvmQBmblYzjkL/jWNWvGn6lwpuRy/hf4cy3RjuddDQw5z9n+65xjG70HXjrXpFnY29hbrDZxJDEvRUXAqfFLXmVKsqm51xgo7BRRRWZQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAxow2Qw3KeoPeuL8R/Di0vlMuihbScfwf8s3/DqD05rt6Q/SrhOUHdEyipbnz5c20tnM0VxG0ciEgq3scf0qOvZfFvhWLxFalsFbuFD5DbsDPofavIb+xm028ltbxPLmhOHXOcf/AFq9OhXVReZyzpuJBRRRW5mFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFWtN0u51i6W3sImlkPJ9FGep9ByKhtbeS8uIoLcbpJnCIPUk4FeyeEfCsPhyywwVryQYnlXODg8AZ7DP41hWrezj5mlOHMTeG/DNv4bs/Ktz5sjsTJMygFvb2HHStqkpa8ptvVnWlbRBRRRSGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAIwzXO+LvCcfiCx/dbI7yL5o5NvXj7pPpXR0hGaqMnF3QmrqzPnueCS1maK4jeKRDhkZcEH3FMr0z4i+FRdQvqtngTQJ++QDG9R/F9R/Ie1eZ169KqqkbnHOHK7BRRRWhAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFafhvR/7d1iCz3hFkOXP+yOTj3wKUpKKuxpXO8+G/hs2Ns2o3se2a4GIQeojPf8AH+QFdwBimQwrDGscaqiIoCqo4AHTFSV41SbnK7O2EeVWCiiioKCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooATaOeOteN+OPD76LrEkkaYtLti8RyOvG5fwJ/lXstc94z0JNb0eUMv763UyQsq5bIHIH1xj8q2w9Tkn5EVI80Txiikpa9c4gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK9A+FNjulvrxuqqsKnPqcnj8Frz+vWPhio/4RsnAybh8/kK5sU7UzSiveOvoHFLRXlnYFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFNbn8adSUAeJeMtNj0rxFdQ24KxMRIo24A3DOB7ZzWLXonxYsRtsbxV5G6JiF7dRk/n+ZrzuvXw8uammcVRcsgooorYgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z'
		}
		req.session.avatar = avatar
		if(resultados.tipo=='Coordinador')
			sw=true;

		if(resultados.tipo=='Aspirante')
			sww=true;
		
		res.render('ingresar2',{
			mensaje: "Bienvenido "+ resultados.nombre.toUpperCase(), 
			sesion: true,
			coordinador: sw,
			aspirante: sww,
			nombre: req.session.nombre.toUpperCase(),
			mensajee:req.session.usuario,
			mensajeee:req.session.tipo,
			avatar: avatar
		})
	})
});

app.post('/salir',(req,res)=>{

	req.session.destroy((err)=>{
		if(err) return console.log(err)
	})
	res.redirect('/')
})

app.post('/usuario',(req,res)=>{
	res.render('usuario',{

	});
});

app.get('/usuario',(req,res)=>{
	res.render('usuario',{
		
	});
});

/*var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null,'avatar'+req.body.id +path.extname(file.originalname))
  }
})*/
 
var upload = multer({  })

app.post('/registrousuario',upload.single('archivo'),(req,res)=>{

	let usuario= new Usuario({
		identificador: parseInt(req.body.id),
		nombre: req.body.nombre,
		correo: req.body.correo,
		telefono: parseInt(req.body.telefono),
		password:bcrypt.hashSync(req.body.password, 10),
		tipo: "Aspirante",
		avatar:req.file.buffer
	})
	usuario.save((err,resultado)=>{
		if(err){
			return res.render('registrousuario',{
			mostrarusuario: 'El documento de identidad ingresado se ha registrado previamente'
			})
		}
		if(!resultado){
			res.render('registrousuario',{
			mostrarusuario: 'El documento de identidad ingresado se ha registrado previamente'
			})
					}
					else{
		res.render('registrousuario',{
			mostrarusuario:'El documento de identidad '+ resultado.identificador +' se ha registrado correctamente'//or resultado.nombre etc
		})
}
	})

});

app.get('/cursos',(req,res)=>{
	if(req.session.tipo=="Coordinador"){
		res.render('cursos',{
		});
	}else{
		res.render('error',{		
		});
	}
});

app.post('/registrocursos',(req,res)=>{
let lista;
	let curso= new Curso({
		identificador: parseInt(req.body.id),
		nombre: req.body.nombre,
		descripcion: req.body.descripcion,
		valor: parseInt(req.body.valor),
		modalidad: req.body.modalidad,
		intensidad: req.body.intensidad,
		estado: 'Disponible'
	})
		Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
			if(err){
				return console.log(err)
			}
			if(respuesta){
				lista=respuesta;	
			}
		})
	curso.save((err,resultado)=>{
		if(err){
			res.render('registrocursos',{
			mostrarcurso: "El identificador del curso ingresado se ha registrado previamente",
			listado:lista
			})
		}
		Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
			if(err){
				return console.log(err)
			}
			if(resultado){
				res.render('registrocursos',{
					mostrarcurso: "Se ha guardado correctamente el curso  "+ resultado.nombre ,//or resultado.nombre etc
					listado: respuesta
				})		
			}
		})
	})

});

app.get('/coordinador',(req,res)=>{

	Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		Matricula.find({}).exec((err,respuestaa)=>{//entre las llaves condicion ejemplo ingles: 5
			if(err){
				return console.log(err)
			}
			Usuario.find({}).exec((err,respuestaaa)=>{//entre las llaves condicion ejemplo ingles: 5
				if(err){
					return console.log(err)
				}
				if(req.session.tipo=="Coordinador"){
					res.render('coordinador',{
						listado:respuesta,
						listadoo: respuestaa,
						listadooo:respuestaaa
					});
				}else{
					res.render('error',{
					});	
				}
			})
		})
	})

});

app.post('/actualizacionestado',(req,res)=>{

	Curso.findOneAndUpdate({identificador:req.body.id},{$set: {estado:req.body.estado}},{new: true},(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		/*if(!usuario){
			return res.redirect('/')
		}*/
		res.render('actualizacionestado',{
			mostraractualizar:	"Estado del curso "+resultados.nombre+" actualizado correctamente"
		});
	})

});

app.get('/inscripciones',(req,res)=>{
	Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		Matricula.find({}).exec((err,respuestaa)=>{//entre las llaves condicion ejemplo ingles: 5
			if(err){
				return console.log(err)
			}
			Usuario.find({}).exec((err,respuestaaa)=>{//entre las llaves condicion ejemplo ingles: 5
				if(err){
					return console.log(err)
				}
				if(req.session.tipo=="Coordinador"){
					res.render('inscripciones',{
						listado:respuesta,
						listadoo: respuestaa,
						listadooo:respuestaaa
					});
				}else{
					res.render('error',{
					});	
				}
			})
		})
	})
});

app.post('/eliminacionmatricula',(req,res)=>{

	Matricula.findOneAndDelete({idmatricula:req.body.matricula},req.body,(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		Matricula.find({idcurso: req.body.identificadorcurso},(err,respuesta)=>{
			Usuario.find({}).exec((err,respuestaa)=>{
		  		Curso.find({}).exec((err,respuestaaa)=>{
					res.render('eliminacionmatricula',{
						matricula: "Matricula eliminada correctamente",
						matriculaa: respuesta,
						listado: respuestaaa,
						listadoo:respuestaa,
						identificador:req.body.identificadorcurso,
						documento:req.body.identificador
					})
		 	 	})
			})
	  	})
	})

});

app.post('/eliminacioninscripcion',(req,res)=>{

	Matricula.findOneAndDelete({idmatricula:req.body.matricula},req.body,(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		Matricula.find({idaspirante: req.session.identificador},(err,respuesta)=>{
		  		Curso.find({}).exec((err,respuestaaa)=>{
					res.render('eliminacioninscripcion',{
						matricula: "Inscripción eliminada correctamente",
						matriculaa: respuesta,
						listado: respuestaaa

					})
		 	 	})
		
	  	})
	})

});

app.get('/usuarios',(req,res)=>{


			Usuario.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
				if(err){
					return console.log(err)
				}
				if(req.session.tipo=="Coordinador"){
					res.render('usuarios',{
						listado:respuesta,
					});
				}else{
					res.render('error',{
					});	
				}
			})



});

app.post('/actualizacionusuario',(req,res)=>{


			Usuario.findOne({identificador: parseInt(req.body.identificador)}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
				if(err){
					return console.log(err)
				}
				if(req.session.tipo=="Coordinador"){
					res.render('actualizacionusuario',{
						documento: respuesta.identificador,
						nombre:  respuesta.nombre,
						correo: respuesta.correo,
						telefono: respuesta.telefono,
						tipo: respuesta.tipo

					});
				}else{
					res.render('error',{
					});	
				}
			})



});

app.post('/actualizacionusuarios',(req,res)=>{

	Usuario.findOneAndUpdate({identificador:req.body.id},{$set: {nombre:req.body.nombre, correo: req.body.correo, telefono: req.body.telefono}},{new: true},(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		/*if(!usuario){
			return res.redirect('/')
		}*/
		res.render('actualizacionusuarios',{
			mostraractualizarusuarios:	"Datos del usuario "+resultados.nombre+" actualizados correctamente"
		});
	})

});

app.get('/imagen',(req,res)=>{
	res.render('imagen',{
		
	});
});

var upload = multer({  })
app.post('/actualizacionimagen',upload.single('archivo'),(req,res)=>{

	Usuario.findOneAndUpdate({identificador:req.session.identificador},{$set: {avatar:req.file.buffer}},{new: true},(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		Usuario.findOne({identificador:req.session.identificador}).exec((err,respuesta)=>{
		/*if(!usuario){
			return res.redirect('/')
		}*/
		avatar = respuesta.avatar.toString('base64')
		req.session.avatar = avatar
		res.render('actualizacionimagen',{
			mostraractualizarimagen:	"Imagen de perfil actualizada correctamente",
			avatar: avatar
		});
	})
})
});

app.get('/matricula',(req,res)=>{

	Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		if(req.session.tipo=="Aspirante"){
			res.render('matricula',{
				listado:respuesta
			});
		}else{
			res.render('error',{
			});
		}
	})

});

app.post('/registromatricula',(req,res)=>{
var sw=false;
let documento=req.body.documento;

	Usuario.findOne({identificador: documento},(err,respuesta)=>{
		if(err){
			return console.log(err)
		}
		if(!respuesta){
			res.render('registromatricula',{
				mostrarmatricula: "El documento de identidad ingresado no se encuentra registrado"//or resultado.nombre etc
			})
		}	
		else{
			if(respuesta.identificador==parseInt(req.body.documento)){
				let matricula= new Matricula({
				idmatricula:parseInt(req.body.identificador)+''+parseInt(req.body.documento),
				idcurso: parseInt(req.body.identificador),
				idaspirante: parseInt(req.body.documento),
				})
				matricula.save((err,resultado)=>{
					if(err){
						res.render('registromatricula',{
						mostrarmatricula: "Ya se ha matriculado previamente a este curso"
						})
					}
					if(!resultado){
					}
					else{
				Curso.findOne({identificador: parseInt(resultado.idcurso)},(err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
					if(err){
						return console.log(err)
					}
						res.render('registromatricula',{
						mostrarmatricula: "Se ha matriculado correctamente al curso "+respuesta.nombre+' el cual tiene un valor de '+respuesta.valor+' COP' //or resultado.nombre etc
						})
						})
					}
				})
			}
			else{
				res.render('registromatricula',{
					mostrarmatricula: "no se encontro"//or resultado.nombre etc
				})
			}
		}

	})

});

app.get('/miscursos',(req,res)=>{

	Curso.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		Matricula.find({idaspirante: req.session.identificador}).exec((err,respuestaa)=>{//entre las llaves condicion ejemplo ingles: 5
			if(err){
				return console.log(err)
			}
			Usuario.find({}).exec((err,respuestaaa)=>{//entre las llaves condicion ejemplo ingles: 5
				if(err){
					return console.log(err)
				}
				if(req.session.tipo=="Aspirante"){
					res.render('miscursos',{
						listado:respuesta,
						listadoo: respuestaa,
						listadooo:respuestaaa
					});
				}else{
					res.render('error',{
					});	
				}
			})
		})
	})

});

app.get('*',(req,res)=>{
	res.render('error',{
		estudiante: 'error'
	})
})

/*mongoose.connect('mongodb://localhost:27017/EducacionContinua',{useNewUrlParser: true},(err,resultado)=>{
	if(err){
		return console.log(error)
	}
	console.log("conectado")
});*/

mongoose.connect(process.env.URLDB,{useNewUrlParser: true},(err,resultado)=>{
	if(err){
		return console.log(error)
	}
	console.log("conectado")
});

/*app.listen(3000,()=>{
console.log('escuchando en el puerto 3000')

});*/

server.listen(process.env.PORT,()=>{
console.log('servidor en el puerto ' + process.env.PORT)
});


const { Usuarios } = require('./usuarios')
const usuarios= new Usuarios();

let contador=0
io.on('connection', client => {


	console.log("un usuario se ha conectado")

	/*client.emit("mensaje","Bienvenido a mi página")//emit enviar on recibir

	client.on("mensaje",(informacion)=>{
		console.log(informacion)
	})

	client.on("contador",()=>{
		contador++
		console.log(contador)
		io.emit("contador",contador)//emit enviar on recibir
	})*/

	client.on('usuarioNuevo',(usuario)=>{
		let listado = usuarios.agregarUsuario(client.id, usuario)
		console.log(listado)
		let texto = `Se ha conectado ${usuario}`
		io.emit('nuevoUsuario', texto )

	})

	client.on('disconnect',()=>{
		let usuarioBorrado = usuarios.borrarUsuario(client.id)
		let texto = `Se ha desconectado ${usuarioBorrado.nombre}`
		io.emit('usuarioDesconectado', texto)
	})
		/*client.on("texto",(text, callback)=>{
		console.log(text)
		io.emit("texto",(text))//emit enviar on recibir
		callback()
	})*/
	client.on("texto", (text, callback) =>{
		let usuario = usuarios.getUsuario(client.id)
		let texto = `${usuario.nombre} : ${text}`
		
		io.emit("texto", (texto))
		callback()
	})

	client.on("textoPrivado", (text, callback) =>{
		let usuario = usuarios.getUsuario(client.id)
		let texto = `${usuario.nombre} : ${text.mensajePrivado}`
		let destinatario = usuarios.getDestinatario(text.destinatario)
		client.broadcast.to(destinatario.id).emit("textoPrivado", (texto))
		callback()
	})

});