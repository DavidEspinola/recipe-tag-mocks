# recipe-tag-mocks
API ligera de prototipado para recetas (o cualquier otra cosa) con hastags

# Cómo empezar
Descargar el repositorio, ejecutar `npm install` y `npm start`.
Esto abrirá un servidor en localhost:3000 al que se podrá hacer peticiones, por ejemplo `http://localhost/recipes`.

# Logado
Los servicios están protegidos para ser sólo accesibles por usuarios logados. El backend utiliza autenticación básica, por lo que es necesario incluir las credenciales del usuario convertidas a base64 en cada petición. Un ejemplo de implementación sería:
```javascript
const user = 'admin';
const password = 'admin';
const credentials = btoa(`${ user }:${ password }`); // Convertimos credenciales a base 64

fetch('http://localhost:3000/recipes', {
  method: 'POST',
  body: JSON.stringify({name: 'Receta ejemplo', description: 'Esto es un #ejemplo'}),
  headers:{
      'Authentication': `Basic ${ credentials }`, // Incluimos las credenciales en la cabecera
      'Content-Type': 'application/json'
  }
}).then(...);
```

# Métodos de la Api

| PATH                                           | METHOD | Descripción                                                                                           | Ejemplo Body                                              |
|------------------------------------------------|--------|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| /recipes                                       | GET    | Obtiene un listado de recetas                                                                         |                                                           |
| /recipes                                       | POST   | Crea una nueva receta                                                                                 | {"name":"Receta", "description": "Receta de #dieta", ...} |
| /recipes/:id                                   | GET    | Obtiene el detalle de una receta                                                                      |                                                           |
| /recipes/:id                                   | PUT    | Reemplaza todo el contenido                                                                           | {"name":"Receta", "description": "Descripcion", ...}      |
| /recipes/:id                                   | PATCH  | Modifica sólo ciertos valores                                                                         | {"name":"Nuevo nombre"}                                   |
| /recipes/:id                                   | DELETE | Elimina una receta                                                                                    |                                                           |
| /recipes?q=Texto%20de%20receta                 | GET    | Búsqueda de recetas por texto (%20 es un espacio, pero el navegador puede encargarse de reemplazarlo) |                                                           |
| /recipes?q=%23dieta                            | GET    | Búsqueda de recetas por hashtag (%23 es el símbolo #)                                                 |                                                           |
| /recipes?_sort=createdAt&_order=desc&_limit=10 | GET    | Obtiene las últimas 10 recetas que se crearon                                                         |                                                           |
| /tags                                          | GET    | Obtiene todos los tags                                                                                |                                                           |
| /tags?_sort=lastUpdated&_order=desc&_limit=10  | GET    | Obtiene los últimos 10 tags que han cambiado                                                          |                                                           |
| /users/:id  | GET    | Obtiene el detalle de un usuario                                                          |                                                           |
| /users/:id  | PATCH    | Modifica algún detalle de un usuario (cada usuario sólo puede editarse a sí mismo)                                                         |     {"password":"Nueva contraseña"}                                                      |