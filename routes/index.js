// 'npm start' to start server at http://127.0.0.1:3000/

var express = require('express');
var router = express.Router();

//const $ = require('jquery');
const moment = require('moment');
const https = require('https');

var areaCount = '[area count]';
var dataParsed = {};
var dateArr = [];
var today = moment().toISOString();
console.log("today is " + today);

function sortableDate(date) {
  moment(date, 'll').toISOString();
  return date;
}

https.get('https://data.austintexas.gov/resource/ffwg-tmw3.json', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    dataParsed = JSON.parse(data);
    areaCount = Object.keys(dataParsed).length;
    //console.log('areaCount = ' + areaCount);

    for (var i = 0; i < areaCount; i++) {
      var thisRoute = dataParsed[i].route_labl;

      var nextDate = dataParsed[i].date_jan_jn;
      var nextNextDate = dataParsed[i].date_jul_dc;
      var nextDateSortable = sortableDate(nextDate);
      var nextDatePretty = '';
      var nextDateClass = '';

      var next = [
        nextDate,
        nextNextDate
      ].map(function(s){
        return moment(s);
      })
      .sort(function(m){
        return m.valueOf();
      })
      .find(function(m){return m.isAfter();});
      
      if (next) {
        nextDatePretty = next.format("ll");
        nextDateSortable = moment(next).subtract(1, 'day').toISOString();
      }
      else {
        nextDatePretty = "No more this year!";
        nextDateClass = "past";
      }

      let obj = {
        route: thisRoute,
        nextdate: nextDatePretty,
        nextdatesortable: nextDateSortable,
        nextdateclass: nextDateClass,
      };

      dateArr.push(obj);

      /*console.log("- - - - - - - - - - - - - - - -");
      console.log(obj);
      console.log(nextDatePretty + " should match " + nextDateSortable);*/
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

/*-------------------------------------------------------------*/
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Scavengr',
    areacount: areaCount,
    dataparsed: dataParsed,
    datearr: dateArr
  });
});
console.log("Ready!");
module.exports = router;