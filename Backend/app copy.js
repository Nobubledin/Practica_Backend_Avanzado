'use strict'

require('./lib/connectMongoose');
require('./models/Anuncio');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('./lib/i18nConfigure');
const jwtAuth = require('./lib/jwtAuth');
const markdownIt = require('markdown-it')();
const fs = require('fs');
const multer = require('multer');
const cote  = require('cote');
const thumbnailCreatorRequester = new cote.Requester({name: 'thumbnail creator requester'});
console.log('Thumbnaill Creator Requester is listening');

require('./models');


const app = express();


app.set('view engine', 'ejs');

app.locals.title = 'Backend';



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);


const uploader = multer({dest: 'uploads/'});

app.post('/upload', uploader.single('image'), async(req, res) => {
  try {
    const {file} = req;
    if(!file) {
      return res.status(400).json({success: false, error: 'No file uploaded'});
    }
    console.log('Before reading image file');
    const iamgeBuffer = await fs.promises.readFile(file.path);
    console.log('After reading image file');

    console.log('Before sending create Thumbnail request');
    try {
      const response = await thumbnailCreatorRequester.send({
        type: 'createThumbnail',
        image: file.path,
      });
    console.log('After sending createThumbnail request:', response);
    }catch(error) {
      console.error('Error sending createThumbnail request:', error)
    }

    return res.json(response);
  } catch(error) {
    console.error('Error processing image upload:', error);
    return res.status(500).json({success: false, error:'Internal Server Error'});
  }
});

app.use('/README', (req, res, next) => {
  const language = req.query.lang || 'es';

  req.readmePath = path.join(__dirname, `README_${language}.md`);
  next();
});

app.get('/README', (req, res, next) => {
  fs.readFile(req.readmePath, 'utf8', (err, readmeContent) => {
    if(err) {
      next(createError(404, 'README not found'));
    } else {
      const renderMarkdown = markdownIt.render(readmeContent);

      res.send(renderMarkdown);
    }
  })
});



const indexRouter = require('./routes/index');
app.use('/anuncios', require('./routes/anuncios'))
app.use('/api/authenticate', require('./routes/api/authenticate'));
app.use('/api/anuncios',jwtAuth(), require('./routes/api/anuncios'));

app.use('/', indexRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  res.status(err.status || 500);

  if(isAPI(req)) {
    res.json({success: true, error: err.message})
    return
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

function isAPI(req) {
  return req.originalUrl.indexOf('/api') === 0
}

module.exports = app;