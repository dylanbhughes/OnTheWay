// FOR LINTING CHECK ONLY (inside sublime)
// var require = function(){};
// var _ = {};

// input:
  //  an object with structure that the client expects to receive back
  //  it has an array of categoryListings that
  //    - "commuteFromAddress1" and "commuteFromAddress2"
  //      with data I get back from Google Distance Matrix API call
  //    - then remove any categoryListings where either
  //      "commuteFromAddress1" or "commuteFromAddress2"
  //      are greater than maxTime (obtained from client, stored in the object I receive)
  //
  // returns data object ready to return to client:
  // listings of type "category" which are <= maxTime away from both address1, and from address2

var axios  = require('axios');
var config = require('./config');
var _ = require('underscore');

// test data
var startingData = require('./dummyData/categoryListings_from_Steve');
var inputData = startingData.categoryListings_from_Steve;

// GoogleMapsDistanceMatrixAPI_base uri
var base_url = "https://maps.googleapis.com/maps/api/distancematrix/json";
var API_KEY_Server = config.shServerKey1;

function getValidCategoryListings(){

  var googleCommuteData = getGoogleCommuteData(inputData);
  // console.log('googleCommuteData: ', googleCommuteData);

  // // TODO: how to handle promises ?
  // // these need to be executed at resolution of the above function call..
  // // console.log(inputData);
  // populateCommuteTimes(googleCommuteData, inputData);
  // // console.log(inputData);
  // removeListingsWithCommutesLongerThanMaxTime(inputData);

}

//--------------------------------------

// requests commute data between address1 and each of our supplied categoryListings
//   and between address2 and each of our supplied categoryListings, from google API
function getGoogleCommuteData(inputData){

  axios.get(base_url, {
    params: {
      units:        'imperial',
      origins:      getOriginsString(inputData),
      destinations: getDestinationsString(inputData),
      key:          API_KEY_Server
    }
  })

  .then(function (response) {
    var googleCommuteData = response;
    // console.log('Yea', googleCommuteData);
    return googleCommuteData.data;
  })

  // // TODO: not sure how to handle promises to finish computing our data
  .then(function (googleCommuteData){
    // console.log('before populateCommuteTimes', googleCommuteData);
    populateCommuteTimes(googleCommuteData, inputData);
    // console.log('inputData after populateCommuteTimes', inputData);
    // console.log(inputData);
    removeListingsWithCommutesLongerThanMaxTime(inputData);
    console.log('after remove long commutes',inputData);
  })

  .catch(function (response) {
    // TODO: check on what to do with this
    // console.log('inputData', inputData, 'googleCommuteData', googleCommuteData);
    console.log('error catch in getGoogleCommuteData: ',response);
  });
}

// populate our inputData with the commute times we received back from this query
function populateCommuteTimes(googleCommuteData, inputData){
  console.log('populateCommuteTimes');
  _.each(inputData.categoryListings, function(categoryListing, listIndex){

    // console.log('each', listIndex);
    // console.log('each categoryListing', categoryListing);
    // console.log('each googleCommuteData', googleCommuteData);
    // this is value in seconds.. divide by 60 to get minutes
    var commuteTime1 = googleCommuteData.rows[0].elements[listIndex].duration.value;
    var commuteTime2 = googleCommuteData.rows[1].elements[listIndex].duration.value;

    categoryListing.timeFromAddress1 = Math.round(commuteTime1/60);
    categoryListing.timeFromAddress2 = Math.round(commuteTime2/60);
  });
  // console.log('inputData after PopulateCommuteTimes:', inputData);
  // console.log('categoryListings after PopulateCommuteTimes:', inputData.categoryListings);
}

function removeListingsWithCommutesLongerThanMaxTime(inputData){
  // return _.filter(inputData.categoryListings,
  //                 areBothCommuteTimesLessThanMaxTime
  //        );
  var filtered = _.filter(inputData.categoryListings,
                  areBothCommuteTimesLessThanMaxTime
         );
  console.log(filtered);
  // return filtered;
  inputData.categoryListings = filtered;
  console.log(inputData);

  function areBothCommuteTimesLessThanMaxTime(categoryListing){
    var maxTime = inputData.maxTime;
// testing
maxTime = 2;// testing
    var time1 = categoryListing.timeFromAddress1;
    var time2 = categoryListing.timeFromAddress2;
    console.log(maxTime, time1, time2);
    console.log(( (time1 <= maxTime) && (time2 <= maxTime) ));
    return ( (time1 <= maxTime) && (time2 <= maxTime) );
  }
}


//--------------------------------------

// assemble string used for origins parameter of google Distance Matrix API call
function getOriginsString(inputData){

  return inputData.address1.coordinates.lat + ',' +
         inputData.address1.coordinates.lng + '|' +
         inputData.address2.coordinates.lat + ',' +
         inputData.address2.coordinates.lng;

        // if it becomes useful to query using a single address,
          // could pass in a flag to tell this func to create a Origins String using:
          // - both address1 and address2
          // - only address1
          // - only address2
          // create string for 2 origin addresses
}

// assemble string used for destinations parameter of google Distance Matrix API call
function getDestinationsString(inputData){
   var destinations = '';

  // use these values for a Server Query
  var space = ' ';          // for browser query, use space = '%2C';
  var pipe  = '|';          // for browser query, use pipe  = '%7C';

  _.each(inputData.categoryListings, function(categoryListing){
    destinations += categoryListing.coordinates.lat + space +
                    categoryListing.coordinates.lng + pipe;
  });
  // remove pipe from last destination
  destinations = destinations.slice(0, -1);

  return destinations;
}

module.exports = {
  getValidCategoryListings: getValidCategoryListings,

  getGoogleCommuteData: getGoogleCommuteData,
  populateCommuteTimes: populateCommuteTimes,
  removeListingsWithCommutesLongerThanMaxTime: removeListingsWithCommutesLongerThanMaxTime,

  getOriginsString: getOriginsString,
  getDestinationsString: getDestinationsString
};

// for testing Google Query in Browser
  // function getBrowserQueryString(){
  //   var space = '%2C';
  //   var pipe  = '%7C';

  //   // query string for a single  origin address
  //   // var queryString_1addr = '' + '?' + 'units=imperial' +
  //   //                         '&' + 'origins=' + inputData.address1.coordinates.lat +
  //   //                               ','        + inputData.address1.coordinates.lng +
  //   //                         '&' + 'destinations=' + destinations +
  //   //                         '&' + 'key=' + API_KEY;

  //   // var google_req1 = base_url + queryString_1addr;

  //   // query string with both source addresses
  //   var queryString_2addr = '' + '?' + 'units=imperial' +
  //                           '&' + 'origins=' + inputData.address1.coordinates.lat +
  //                                 ','        + inputData.address1.coordinates.lng +
  //                                  pipe      + inputData.address2.coordinates.lat +
  //                                 ','        + inputData.address2.coordinates.lng +
  //                           '&' + 'destinations=' + destinations +
  //                           '&' + 'key=' + API_KEY;

  //   //var google_req2 = base_url + queryString_2addr;
  //   //var google_commute_times_from_2_origin_addresses = base_url + queryString_2addr;
  //   //console.log(google_req2);

  //   return queryString_2addr;
  // }
