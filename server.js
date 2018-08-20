const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const db = router.db;
const middlewares = jsonServer.defaults()
const _ = require('lodash');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(name, password, done) {
    let user;
    try {
      user = db.get('users').find({ name }).value();
    } catch (err) {
      return done(err);
    }

    if(user && user.password === password) {
      done(null, user);
    } else {
      return done(null, false);
    }
  }
));

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use('/recipes', 
passport.authenticate('basic', { session: false }),
(req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.user = req.user.id;

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

server.use('/recipes/:id',
passport.authenticate('basic', { session: false }),
(req, res, next) => {

  const targetRecipe = db.get('recipes').find({ id: req.params.id }).value();
  if(req.user.id !== targetRecipe.user){
    res.sendStatus(403);
    return next(new Error());
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if(req.body.description) {
      const tags = req.body.description.match(/(#[a-z\d-]+)/ig);
      const oldDescription = targetRecipe.description;
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

    const oldDescription = (targetRecipe || {}).description;
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

server.use('/users', 
passport.authenticate('basic', { session: false }),
(req, res, next) => {
  if (req.method !== 'GET') {
    res.sendStatus(403);
    return next(new Error());    
  }
  next();
});

server.use('/users/:id', 
passport.authenticate('basic', { session: false }),
(req, res, next) => {
  if (req.method === 'GET') {
    return next();    
  }
  if (req.params.id !== req.user.id 
    || req.method === 'POST'
    || req.method === 'DELETE') {
      res.sendStatus(403);
      return next(new Error()); 
  }
  next();
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running in http://localhost:3000');
});