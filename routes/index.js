// 'npm start' to start server at http://127.0.0.1:3000/
console.log("Analyzing trash patterns...");

var express = require('express');
var router = express.Router();

//const $ = require('jquery');
const moment = require('moment');
const https = require('https');

var areaCount = '[area count]';
var dataParsed = {};
var dateArr = [];
var today = moment().toISOString();
console.log(" =Today is " + today);

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
    console.log(" =Tracking " + areaCount + " areas");

    for (var i = 0; i < areaCount; i++) {
      var thisRoute = dataParsed[i].route_labl;
      var isOnCall = dataParsed[i].dat_lab_jj;
      var areaGeom = dataParsed[i].the_geom;

      var nextDate = dataParsed[i].date_jan_jn;
      var nextNextDate = dataParsed[i].date_jul_dc;
      var nextDateSortable = sortableDate(nextDate);
      var nextDatePretty = '';
      var nextDateClass = 'upcoming';

      if (isOnCall == 'On Call') {
        nextDatePretty = 'On-call only';
        nextDateClass = 'on-call';
      } else {
        var next = [
            nextDate,
            nextNextDate
          ].map(function (s) {
            return moment(s);
          })
          .sort(function (m) {
            return m.valueOf();
          })
          .find(function (m) {
            return m.isAfter();
          });

        if (next) {
          nextDatePretty = next.format("ll");
          nextDateSortable = moment(next).subtract(1, 'day').toISOString();
        } else {
          nextDatePretty = "No more this year!";
          nextDateClass = "past";
        }
      }

      let obj = {
        route: thisRoute,
        nextdate: nextDatePretty,
        nextdatesortable: nextDateSortable,
        nextdateclass: nextDateClass,
        geometry: areaGeom
      };

      dateArr.push(obj);

      if ((i + 1) == (areaCount)) {
        //console.log(dateArr[0]);
        console.log("Done!");
      }
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
    //dataparsed: dataParsed,
    datearr: dateArr
  });
});
module.exports = router;