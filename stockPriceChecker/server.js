'use strict';
require('dotenv').config();
const helmet = require('helmet')
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const myDB = require('./connection');
const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.contentSecurityPolicy({directives:{scriptSrc:["'self'"],styleSrc:["'self'"]}}))

myDB(async client=>{
  const myDatabase=await client.db('database').collection('ipAddresses');

  app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });
  console.log('About to route app')
  apiRoutes(app, myDatabase);
  //auth(app, myDatabase);

  app.use((req,res,next)=>{
    res.status(404).type('text').send('Not Found');
  })
 
}).catch(e=>{
  app.route('/').get((req,res)=>{
    res.render('index',{title: e,message:'Unable to connect to database'});
  });
});


//Index page (static HTML)


//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
//apiRoutes(app);  
    

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  /*** 
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
  **/
});

module.exports = app; //for testing
