const hbs = require('hbs');
const fs = require ('fs');
const Curso = require ('../models/curso')


////////////////////////////////////////////////////MOSTRAR LISTADO DE CURSOS//////////////////////////////////////////////////////////

hbs.registerHelper('mostrarr',(listado)=>{
let texto=`
<table class='table table-striped table-hover'>
    <thead class='thead-dark'>
      <th>Identificador</th>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Valor</th>
      <th>Modalidad</th>
      <th>Intensidad Horaria</th>
      <th>Estado</th>
    </thead>
  <tbody>`;

if(listado){
  listado.forEach(curso=>{
      if(curso.intensidad==null){
        intensidad="";
      }else{
        intensidad=curso.intensidad;
      }
	     texto=texto+
  	   `<tr>
    		<td>${curso.identificador}</td>
    		<td>${curso.nombre}</td>
    		<td>${curso.descripcion}</td>
    		<td>${curso.valor}</td>
    		<td>${curso.modalidad}</td>
    		<td>${intensidad}</td>
    		<td>${curso.estado}</td>
    	</tr>`;
  })
}
texto=texto+`
  </tbody>  
</table>`;

return texto;

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////MOSTRAR NOMBRE DE LOS CURSOS////////////////////////////////////////////////////////////////

hbs.registerHelper('mostrarcursosnombre',(listado)=>{

let out='<option value="">-</option> ';

  listado.forEach(curso=>{
    out= out+`<option value="${curso.identificador}" >${curso.nombre}</option>`
  })

  return new hbs.SafeString(
    out 
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////MOSTRAR NOMBRE DE LOS CURSOS DISPONIBLES////////////////////////////////////////////////////

hbs.registerHelper('mostrarcursosnombre2',(listado)=>{

let out='<option value="">-</option> ';

  listado.forEach(curso=>{
    if(curso.estado=="Disponible"){
      out= out+`<option value="${curso.identificador}" >${curso.nombre}</option>`
    }
	})

  return new hbs.SafeString(
    out 
  );

})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////MOSTRAR LOS CURSOS DISPONIBLES VER MAS2/////////////////////////////////////////////////////

hbs.registerHelper('mostrarcursosdisponiblesvermas2',(listado)=>{
let intensidad;
var out=`
<div class="accordion" id="accordionExample">
 <div class="row">`;
i=1;
listado.forEach(curso=>{
    if(curso.estado=='Disponible' ){
      if(curso.intensidad==null){
        intensidad="";
      } else{
        intensidad=curso.intensidad+' Horas';
      }
        out = out +`
    <div class=".cols-sm-12 .cols-md-4 .cols-lg-12" >
      <div class="card" >
        <div class="card-header" id="heading${i}" >
          <h2 class="mb-0">
            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
              Identificador: ${curso.identificador}<br>
              Nombre: ${curso.nombre}<br>
              Valor: ${curso.valor}<br><br>
              Ver Más
            </button>
          </h2>
        </div>

        <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionExample">
          <div class="card-body">
            Descripción: ${curso.descripcion}<br>
            Modalidad: ${curso.modalidad}<br>
            Intensidad Horaria: ${intensidad}
          </div>
        </div>
     </div>
    </div>`
    }
    i=i+1;
})

out=out+`
  </div> 
</div>`;

  return new hbs.SafeString(
    out 
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////MOSTRAR LAS MATRICULAS//////////////////////////////////////////////////////////////////////

hbs.registerHelper('mostrarmatcursos2',(listado,listadoo,listadooo)=>{

var out = `
<div class="accordion" id="accordionExample"> 
  <div class="row">`;
i=1;
let sw;

listado.forEach(cur=>{
sw=false;
out=out+`
<div class=".cols-sm-12 .cols-md-4 .cols-lg-12" >
  <div class="card" >
    <div class="card-header" id="heading${i}" >
      <h2 class="mb-0">
        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
          Identificador: ${cur.identificador}<br>
          Nombre: ${cur.nombre}<br><br>
        
          Ver Matriculas
        </button>
      </h2>
    </div>
  <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionExample">
<div class="card-body"> 
  <table>
  <form action="/eliminacionmatricula" method="post">
      `
listadoo.forEach(mat=>{
encontradoo =listadooo.find(id=>id.identificador==mat.idaspirante)
  if(sw==false && cur.identificador==mat.idcurso){
      out=out+ ` 
      <thead>
        <tr>
        	<td>Documento</td>
        	<td>Nombre</td>
        	<td>Correo Electrónico</td>
        	<td>Teléfono</td>
          <td>Eliminar</td>
        </tr>
      </thead>`
        sw=true;
  }
  if(cur.identificador==mat.idcurso){
      out=out+`
        <tr>
          <td>${encontradoo.identificador}</td>
        	<td>${encontradoo.nombre}</td>
        	<td>${encontradoo.correo}</td>
        	<td>${encontradoo.telefono}</td>
        	<input type="hidden" name="identificador" value="${encontradoo.identificador}">
        	<input type="hidden" name="identificadorcurso" value="${cur.identificador}">
        	<td><button name="matricula" value="${cur.identificador+''+encontradoo.identificador}">Eliminar</button></td>
      	</tr>`
  }
})
out=out+ `
  </table>
  </form>
          </div>
        </div>
      </div>
    </div>
   		`
i=i+1;
})

	out=out+  `
   </div>
</div>`

  return new hbs.SafeString(
    out 
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////MOSTRAR LAS MATRICULAS//////////////////////////////////////////////////////////////////////

hbs.registerHelper('mostrarmatcursos3',(matriculaa,listado,listadoo,identificador,documento)=>{
let string ;
var out = '<div class="accordion" id="accordionExample"> <div class="row">';
i=1;
let sw;
listado.forEach(cur=>{
sw=false;
	if(cur.identificador==identificador[0]){
out=out+   `
<div class=".cols-sm-12 .cols-md-4 .cols-lg-12" >
   <div class="card" >
    <div class="card-header" id="heading${i}" >
      <h2 class="mb-0">
        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
          Identificador del curso: ${cur.identificador}<br>
          Nombre: ${cur.nombre}<br>
        </button>
      </h2>
    </div>
     <div id="collapse${i}" class="collapse show" aria-labelledby="heading${i}" data-parent="#accordionExample">
      <div class="card-body"> 
      <table>
      `
matriculaa.forEach(mat=>{
encontradoo =listadoo.find(id=>id.identificador==mat.idaspirante)
if(sw==false && cur.identificador==mat.idcurso){
	
    out=out+ ` 
    <thead>
      <tr>
      	<td>Documento</td>
      	<td>Nombre</td>
      	<td>Correo</td>
      	<td>Telefono</td>
      </tr>
    </thead>`
      sw=true;
}
if(cur.identificador==mat.idcurso){
    out=out+`
    <tr>
      <td>${encontradoo.identificador}</td>
    	<td>${encontradoo.nombre}</td>
    	<td>${encontradoo.correo}</td>
    	<td>${encontradoo.telefono}</td>
    </tr>
   `
}

	})
out=out+ `
</table>
</div>
</div>
</div>
</div>`
i=i+1;
}
	})
	out=out+`
</div>
</div>`

  return new hbs.SafeString(
    out 
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////MOSTRAR LAS INSCRIPCIONES///////////////////////////////////////////////////////////

hbs.registerHelper('mostrarmatcursos8',(listadoo,listado)=>{

var out

i=1;
let sw;
let texto;
if(listadoo.length>0){
 texto=`
<table class='table table-striped table-hover'>
<form action="/eliminacioninscripcion" method="post">
    <thead class='thead-dark'>
      <th>Identificador</th>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Valor</th>
      <th>Modalidad</th>
      <th>Intensidad Horaria</th>
      <th>Estado</th>
      <th>Eliminar</th>
    </thead>
  <tbody>`;
}else{
  texto="<center><h2>No se ha matriculado a ningun curso</h2></center>"
}
  listadoo.forEach(mat=>{

    encontrado =listado.find(id=>id.identificador==mat.idcurso)

      if(encontrado.intensidad==null){
        intensidad="";
      }else{
        intensidad=encontrado.intensidad;
      }
       texto=texto+
       `<tr>
        <td>${encontrado.identificador}</td>
        <td>${encontrado.nombre}</td>
        <td>${encontrado.descripcion}</td>
        <td>${encontrado.valor}</td>
        <td>${encontrado.modalidad}</td>
        <td>${intensidad}</td>
        <td>${encontrado.estado}</td>
        <td><button name="matricula" value="${mat.idmatricula}">Eliminar</button></td>
      </tr>`;
      
  })

texto=texto+`
  </tbody>  
</table>
</form>`;

  return new hbs.SafeString(
    texto
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

hbs.registerHelper('mostrarmatcursos9',(matriculaa,listado)=>{
let string ;

i=1;
let sw;
let texto;

if(matriculaa.length>0){
 texto=`
<table class='table table-striped table-hover'>

    <thead class='thead-dark'>
      <th>Identificador</th>
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Valor</th>
      <th>Modalidad</th>
      <th>Intensidad Horaria</th>
      <th>Estado</th>
    </thead>
  <tbody>`;
}else{
  texto=""
}
  matriculaa.forEach(mat=>{


console.log(matriculaa)
console.log("Hola")

    encontrado =listado.find(id=>id.identificador==mat.idcurso)

console.log(encontrado)
      if(encontrado.intensidad==null){
        intensidad="";
      }else{
        intensidad=encontrado.intensidad;
      }
       texto=texto+
       `<tr>
        <td>${encontrado.identificador}</td>
        <td>${encontrado.nombre}</td>
        <td>${encontrado.descripcion}</td>
        <td>${encontrado.valor}</td>
        <td>${encontrado.modalidad}</td>
        <td>${intensidad}</td>
        <td>${encontrado.estado}</td>
      </tr>`;
      
  })


texto=texto+`
  </tbody>  
</table>
`;

  return new hbs.SafeString(
    texto
  );

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////MOSTRAR USUARIOS//////////////////////////////////////////////////////////////

hbs.registerHelper('mostrarrr',(listado)=>{
let texto=`
<table class='table table-striped table-hover'>
<form action="/actualizacionusuario" method="post">
    <thead class='thead-dark'>
      <th>Documento de identidad</th>
      <th>Nombre</th>
      <th>Correo</th>
      <th>Teléfono</th>
      <th>Tipo</th>
      <th>Actualizar</th>
    </thead>
  <tbody>`;

if(listado){
  listado.forEach(usuario=>{
       texto=texto+
       `<tr>
        <td>${usuario.identificador}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.telefono}</td>
        <td>${usuario.tipo}</td>
        <td><button name="identificador" value="${usuario.identificador}">Actualizar</button></td>
      </tr>`;
  })
}
texto=texto+`
  </tbody>  
</table>
</form>`;

return texto;

})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////