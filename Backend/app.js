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

const destinationFolder = '/imagenes/'
const destinationFolderPath = path.join(__dirname, destinationFolder);


if(!fs.existsSync(destinationFolderPath)) {
  fs.mkdirSync(destinationFolderPath);
  console.log(`Created destination folder: ${destinationFolderPath}`)
}

const uploader = multer({dest: '/uploads'});


app.post('/uploads', uploader.single('image'), async(req, res) => {
  console.log('linea 29 correcta')
  console.log('Upload route hit!');
  try {
    const {file} = req;
    if(!file) {
      return res.status(400).json({success: false, error: 'No file uploaded'});
    }

    
    const newFolder = '/images';
    const newFolderPath = path.join(__dirname, newFolder);
    
    
    if(!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, {recursive: true});
      console.log(`Created new folder: ${newFolderPath}`);
    }

    const uniqueFilename = generateuniqueFileName(file.originalname);
    const newFilePath = path.join(destinationFolderPath, uniqueFilename);

    console.log('Before copyFile');
    await fs.promises.copyFile(file.path, newFilePath);
    console.log('After copyFile');

    const thumbnailCreatorResponse = await thumbnailCreatorRequester.send({
      type: 'createThumbnail',
      filePath: newFilePath,
    });

    
    console.log('Thumbnail creator response:', thumbnailCreatorResponse);



    console.log('Before Unlink');
    await fs.promises.unlink(file.path);
    console.log('After unlink');
    console.log(`Image moved to ${newFilePath}`);



    return res.json({success: true, message: 'Image moved succesfully'});;
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