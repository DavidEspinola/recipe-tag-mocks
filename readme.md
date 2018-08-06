# recipe-tag-mocks
API ligera de prototipado para recetas (o cualquier otra cosa) con hastags

# Cómo empezar
Descargar el repositorio, ejecutar `npm install` y `npm start`.
Esto abrirá un servidor en localhost:3000 al que se podrá hacer peticiones, por ejemplo `http://localhost/recipes`.

# Métodos de la Api

| PATH                                           | METHOD | Descripción                                                                                           | Ejemplo Body                                              |
|------------------------------------------------|--------|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| /recipes                                       | GET    | Obtiene un listado de recetas                                                                         |                                                           |
| /recipes                                       | POST   | Crea una nueva receta                                                                                 | {"name":"Receta", "description": "Receta de #dieta", ...} |
| /recipes/:id                                   | PUT    | Reemplaza todo el contenido                                                                           | {"name":"Receta", "description": "Descripcion", ...}      |
| /recipes/:id                                   | PATCH  | Modifica sólo ciertos valores                                                                         | {"name":"Nuevo nombre"}                                   |
| /recipes/:id                                   | DELETE | Elimina una receta                                                                                    |                                                           |
| /recipes?q=Texto%20de%20receta                 | GET    | Búsqueda de recetas por texto (%20 es un espacio, pero el navegador puede encargarse de reemplazarlo) |                                                           |
| /recipes?q=%23dieta                            | GET    | Búsqueda de recetas por hashtag (%23 es el símbolo #)                                                 |                                                           |
| /recipes?_sort=createdAt&_order=desc&_limit=10 | GET    | Obtiene las últimas 10 recetas que se crearon                                                         |                                                           |
| /tags                                          | GET    | Obtiene todos los tags                                                                                |                                                           |
| /tags?_sort=lastUpdated&_order=desc&_limit=10  | GET    | Obtiene los últimos 10 tags que han cambiado                                                          |                                                           |