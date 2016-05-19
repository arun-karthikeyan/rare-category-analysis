var express = require('express');
var chartObjects = require('./birad-dataset1-chartobjects').chartObjects;
// var actualData = require('./birad-dataset1-data').data;

var biradRouter = express.Router();

biradRouter.route('/dataset1')
.all(function(req, res, next){
  res.status(200);
  res.set({'Content-Type': 'application/json'});
  // res.writeHead(200, {'Content-Type': 'text/plain'});
  next();
})
.get(function(req, res, next){
  res.end(JSON.stringify(chartObjects));
  // res.end(JSON.stringify(actualData));
});

module.exports = biradRouter;
