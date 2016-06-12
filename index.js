var csvWriter = require('csv-write-stream'),
    completedInsertions,
    config = require('./config.json'),
    fs = require('fs'),
    host = 'api.uber.com',
    https = require('https'),
    interval = config.requestInterval,
    locations = require('./locations.json').locations,
    mode = process.argv[2],
    dataWriteFunction,
    db,
    resetDatabase,
    sqlite3,
    writer;

// Checks runtime mode to set desired data type
if(mode == 'sqlite'){
  dataWriteFunction = writePriceToDB;
  resetDatasource = resetDatabase;
  sqlite3 = require('sqlite3').verbose();
  resetDatasource();
  db.run('CREATE TABLE `prices` (	`timestamp`	TEXT, `location`	TEXT, `service`	TEXT,  `estimate`	REAL,'
  + '`minimum`REAL,	`low_estimate` REAL, `high_estimate` REAL, `surge`	REAL);');
  db.close();
}else{
  writer = csvWriter({headers: ['timestamp', 'location', 'service', 'estimate', 'minimum', 'low_estimate', 'high_estimate', 'surge']});
  resetDatasource = resetCSV;
  resetDatasource();
  dataWriteFunction = writePriceToCSV;
}


//Trigger data scrape to run at configured interval
setInterval(scrapePrices, interval);

// Completes one interation of a price scrape for all locations in locations.json
function scrapePrices(){
  resetDatasource();
  completedInsertions = 0;

  // iterate over locations and retrieve price data for each
  locations.forEach(function(location){
    requestHeader = {
      'Authorization': 'Token ' + config.serverToken
    }

    // create request query string
    var apiFunction ='/v1/estimates/price?start_latitude=' + location.latitude
      + '&start_longitude=' + location.longitude + '&end_latitude=' +
      + config.rideDestination.latitude + '&end_longitude=' + config.rideDestination.longitude

    // make a request for price data to uber api endpoint
    https.get({
        host: host,
        path : apiFunction,
        headers: requestHeader
    }, function(response) {
      var body = '';

      response.on('data', function(d) {
        body+=d;
      });

      response.on('end', function() {
        responseObj = JSON.parse(body);
        prices = responseObj.prices;
        var services = ['POOL', 'uberX', 'uberXL'];

        prices.forEach(function(price){
          if(services.indexOf(price.localized_display_name) > -1){
              dataWriteFunction(price, location.name);
          }
        });
      });
    });

  });
}

// Writes a row of prices data into a  sqlite database
function writePriceToDB(price, location){
  var query = 'INSERT INTO prices (timestamp, location, service, estimate, minimum, low_estimate, high_estimate, surge)'
   + ' VALUES (?,?,?,?,?,?,?,?)';
  var timestamp = new Date();

  db.run(query, [timestamp.toUTCString(), location, price.localized_display_name, parseDollarPrice(price.estimate),
    price.minimum, price.low_estimate, price.high_estimate, price.surge_multiplier]);

  completedInsertions ++;
  if(completedInsertions.length === locations.length){
    db.close();
  }
}

// Writes a row of price data into a csv file
function writePriceToCSV(price, location){
  var timestamp = new Date();

  writer.write([timestamp.toUTCString(), location, price.localized_display_name, parseDollarPrice(price.estimate),
    price.minimum, price.low_estimate, price.high_estimate, price.surge_multiplier]);
}

function resetDatabase(){
  db = new sqlite3.Database('./data.db');
}

function resetCSV(){
  writer.pipe(fs.createWriteStream('data.csv'));
}

//Parses price into float.  If price is a range (12-16), null is returned.
function parseDollarPrice(price){
  if(price.indexOf('-') > -1){
    return null;
  }else{
    price = price.replace('$', '');
    return parseFloat(price);
  }
}
