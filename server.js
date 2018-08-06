const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const db = router.db;
const middlewares = jsonServer.defaults()
const _ = require('lodash');

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use('/recipes', (req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();

    if(req.body.description) {
      const tags = req.body.description.match(/(#[a-z\d-]+)/ig);
      _(tags)
        .map(tag => tag.substr(1))
        .countBy()
        .each( (count, name) => {
          const tagList = db.get('tags');
          const foundTag = tagList.find({ name });
          if(foundTag.value()) {
            foundTag
              .update('count', n => n + count)
              .update('lastUpdated', () => Date.now())
              .write()
          } else {
            tagList.push({
              name,
              count: count,
              lastUpdated: Date.now()
            }).write();
          }
        });
    }
  }
  next();
});

server.use('/recipes/:id', (req, res, next) => {

  if (req.method === 'PUT' || req.method === 'PATCH') {

    if(req.body.description) {
      const tags = req.body.description.match(/(#[a-z\d-]+)/ig);
      const oldDescription = db.get('recipes').find({ id: req.params.id }).value().description;
      const oldTags = _((oldDescription || '').match(/(#[a-z\d-]+)/ig))
        .map(tag => tag.substr(1))
        .countBy()
        .value();

      _(tags)
        .map(tag => tag.substr(1))
        .countBy()
        .mergeWith(oldTags, (objValue, oldTagCount, tagName, newTags, source, stack) => {
          return newTags[tagName] ? newTags[tagName] : 0;
        }).each( (count, name) => {
          const tagList = db.get('tags');
          const foundTag = tagList.find({ name });
          const foundTagCount = foundTag.value() ? foundTag.value().count : 0;
          if(foundTagCount) {
            const newCount = foundTagCount - (oldTags[name] || 0) + count;
            if(newCount > 0) {
              foundTag
                .update('count', () => newCount)
                .update('lastUpdated', () => Date.now())
                .write()
            } else {
              tagList
                .remove({ name })
                .write()
            }
          } else {
            tagList.push({
              name,
              count: count,
              lastUpdated: Date.now()
            }).write();
          }
        });
    }

  } else if(req.method === 'DELETE') {

    const oldDescription = (db.get('recipes').find({ id: req.params.id }).value() || {}).description;
    const oldTags = (oldDescription || '').match(/(#[a-z\d-]+)/ig);

    if(oldTags && oldTags.length) {
      _(oldTags)
        .map(tag => tag.substr(1))
        .countBy()
        .each( (count, name) => {
          const tagList = db.get('tags');
          const foundTag = tagList.find({ name });
          const foundTagCount = foundTag.value() ? foundTag.value().count : 0;
          if(foundTagCount) {
            const newCount = foundTagCount - count;
            if(newCount > 0) {
              foundTag
                .update('count', () => newCount)
                .update('lastUpdated', () => Date.now())
                .write()
            } else {
              tagList
                .remove({ name })
                .write()
            }
          }
        });
    }
  }
  next();
});




server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});