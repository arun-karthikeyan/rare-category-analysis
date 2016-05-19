var data = require('./birad-dataset1-data').data;

var maxSlots = 100;
var shortDataProp = {
  initialBinSize: Math.floor(data.maxTimestamps/maxSlots),
  //0 indexed offset - for slots
  plusOneBinSizeStart: (maxSlots - (data.maxTimestamps % maxSlots))
  //plus one bin size ends at 99 - the last slot
}
// Incorrect Marker Creator, takes an integer argument for y value
function getIncorrectMarker(yVal){
  var markerProp = {
    enabled: true,
    symbol: 'url(http://www.cottonafrica.com/images/cross.gif)',
    height: 10,
    width: 10
  }

  return {y: yVal, marker: markerProp};
}

function getChartFormatData(pred, truth, yVal){
  if(pred==truth){
    return yVal;
  }
  return getIncorrectMarker(yVal);
}

function getChartFormatDataWithDrilldown(pred, truth, slot, yVal){
  if(pred==truth){
    // return pred;
    return yVal;
  }
  // var incorrectMarker = getIncorrectMarker(pred);
  var incorrectMarker = getIncorrectMarker(yVal);
  incorrectMarker.drilldown = 'drill'.concat(slot);
  return incorrectMarker;
}


// ------------------------------------------------------------------------------------------------------------------------------------
//constructing shortData, chartDataShort and chartDataLong objects for each iteration each timeseries
for(var iteration=0, iterLen=data.maxIterations;iteration<iterLen; ++iteration)
{
  data.iterData[iteration].shortData = new Array(data.maxTimeseries);
  data.iterData[iteration].chartDataShort = new Array(data.maxTimeseries);
  data.iterData[iteration].chartDataDrilldown = new Array(data.maxTimeseries);

  for(var timeSeries=0, seriesLen = data.maxTimeseries; timeSeries<seriesLen; ++timeSeries){

    data.iterData[iteration].shortData[timeSeries] = [];
    data.iterData[iteration].chartDataShort[timeSeries] = [];
    data.iterData[iteration].chartDataDrilldown[timeSeries] = [];

    for(var i=0, iLen=data.iterData[iteration].longData[timeSeries].timeSeriesData.length; i<iLen;){
      var binLabel = 0;
      var trueBinLabel = 0;
      var currentSlot = [];
      var sumOfSlot = 0, countOfSlot = 0;
      for(var j=0, jLen=((data.iterData[iteration].chartDataShort[timeSeries].length>=shortDataProp.plusOneBinSizeStart)?(shortDataProp.initialBinSize+1):shortDataProp.initialBinSize); j<jLen; ++j, ++i){
        var predLabel =  data.iterData[iteration].longData[timeSeries].timeSeriesData[i];
        var trueLabel = data.trueLabels[timeSeries].timeSeriesLabel[i];
        binLabel = binLabel | predLabel;
        trueBinLabel = trueBinLabel | trueLabel;
        currentSlot.push(getChartFormatData(predLabel,trueLabel, data.actualData[timeSeries][i]));
        //newly added
        sumOfSlot = sumOfSlot + data.actualData[timeSeries][i];
        countOfSlot += 1;
      }
      data.iterData[iteration].shortData[timeSeries].push(binLabel);
      // data.iterData[iteration].shortData[timeSeries].push(sumOfSlot/countOfSlot);
      data.iterData[iteration].chartDataShort[timeSeries].push(getChartFormatDataWithDrilldown(binLabel,trueBinLabel,data.iterData[iteration].chartDataShort[timeSeries].length,(sumOfSlot/countOfSlot)));
      if(binLabel!=trueBinLabel){
        var drilldownObj = {id: (data.iterData[iteration].chartDataShort[timeSeries].length-1), data: currentSlot};
        data.iterData[iteration].chartDataDrilldown[timeSeries].push(drilldownObj);
      }
    }
  }
}

// -------------------------------------------------------------------------------------------------------------------------------------
var baseF1Data = [];
for(var i=0, j=data.maxIterations; i<j; ++i){
  baseF1Data.push(null);
}

var chartObjects = {
  f1Score: data.f1Score,
  f1ScoreBaseChartObj: {

    colors: ['#f2885f', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
    '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
    title: {
      text: 'Progressive F-Score'
    },
    xAxis: {
      title: {
        text: 'Iterations'
      }
    },
    yAxis: {
      title: {
        text: 'score'
      }
    },

    series: [{
      type: 'spline',
      dataLabels: {
        enabled: true
      },
      data: baseF1Data
    }]
  },
  timeSeriesCharts: new Array(data.maxIterations)
}

//constructing the chartObject from the JSON object
var iteration = 0;
var timeSeries = 0;
for(var iteration=0, iterLen=data.maxIterations;iteration<iterLen; ++iteration)
{
  chartObjects.timeSeriesCharts[iteration] = [];

  for(var timeSeries=0, seriesLen = data.maxTimeseries; timeSeries<seriesLen; ++timeSeries){
    var sampleChartObj = {};

    sampleChartObj.title = {
      text: 'Time Series '.concat(timeSeries)
    };

    sampleChartObj.xAxis = {
      title: {
        text: 'Timestamps'
      }
    };

    sampleChartObj.yAxis = {
      title: {
        text: 'Anomaly'
      }
    };

    sampleChartObj.plotOptions = {
      spline: {
        enableMouseTracking: true,
        animation: {
          duration: 1000
        }
      }
    };

    sampleChartObj.series = [
      {
        name: 'Iteration '.concat(iteration),
        type: 'spline',
        data: data.iterData[iteration].chartDataShort[timeSeries]
      }
    ];

    sampleChartObj.drilldown = {
      drillUpButton: {
        relativeTo: 'spacingBox',
        position: {
          align: 'left',
          x: 0,
          y: 0
        },
        theme: {
          fill: 'white',
          'stroke-width': 1,
          stroke: 'silver',
          r: 0,
          states: {
            hover: {
              fill: '#bada55'
            },
            select: {
              stroke: '#039',
              fill: '#bada55'
            }
          }
        }

      },
      series: []
    }

    for(var slot=0, slotLen=data.iterData[iteration].chartDataDrilldown[timeSeries].length;slot<slotLen;++slot){
      var currentDrilldown = {};
      currentDrilldown.id = 'drill'.concat(data.iterData[iteration].chartDataDrilldown[timeSeries][slot].id);
      currentDrilldown.data = data.iterData[iteration].chartDataDrilldown[timeSeries][slot].data;
      currentDrilldown.type = 'spline';
      sampleChartObj.drilldown.series.push(currentDrilldown);
    }
    chartObjects.timeSeriesCharts[iteration].push(sampleChartObj);
  }
}
// --------------------------------------------------------------------------------------------------------------------------------------
module.exports.chartObjects = chartObjects;
