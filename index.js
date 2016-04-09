var express = require('express');
var bodyParser = require('body-parser');
var requestHandler = require('./server/request_handler.js');
var dummyData = require('./server/dummyData/data_we_return_to_client');


var app = express();
app.set('port', (process.env.PORT || 8000));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  //res.send(dummyData);
});

app.post('/places', function(req, res) {
    console.log('request made to /places');
    // requestHandler(req, res);
      // dummyData = JSON.stringify(dummyData);
      res.send(dummyData);
});

var server = app.listen(app.get('port'), function () {
  var port = server.address().port;
    console.log('bae-synchronous is running on port ', port);
});

// // test validCategoryListings.js
//   var startingData = require('./server/dummyData/categoryListings_from_Steve');
//   var inputData    = startingData.categoryListings_from_Steve;

//   var sh =  require('./server/validCategoryListings.js');
//   // var results = sh.getValidCategoryListings(inputData);

//   // test callback version
//     // sh.getValidCategoryListings(inputData, functionThatNeedsMyData);

//     // function functionThatNeedsMyData(results){
//     //   console.log('--returned data---', results);
//   // }

//   // test promise version -- THIS IS NOT CORRECT -NOT SURE HOW TO TEST !!
//     // var results = sh.getValidCategoryListings(inputData);
//     // console.log('--returned data---', results);




module.exports = server;
