'use strict';

var app = angular.module('NovantasTakeHomeTest', []);

app.controller('ChartController', ['$scope', '$http', '$log', '$timeout',
  function($scope, $http, $log, $timeout) {
    var DATASETS = ["teletubbies", "pokemon"],
      DEFAULT_DATASET = DATASETS[0],
      COLORS = ["blue", "grey"],
      DEFAULT_COLOR = COLORS[0],
      DEFAULT_SHAPE = "circle",
      POINT_SIZE = 5,
      POINT_RADIUS = POINT_SIZE * POINT_SIZE * Math.PI,
      X_AXIS_LABEL = "Age (Years)",
      Y_AXIS_LABEL = "Height (Meters)",
      SVG_SELECTOR = "#ageHeightChart svg";

    function initScope() {
      $log.debug("Initializing the scope");
      $scope.datasets = DATASETS;
      $scope.selectedDataset = DEFAULT_DATASET;
      $scope.colors = COLORS;
      $scope.selectedColor = DEFAULT_COLOR;
      $scope.view = 'chart';
    }

    function invalidNumber(val) {
      if (isNaN(val)){
        return true;
      }
      return false;
    }

    function toPoint(key, x, y, shape, color) {
      if (invalidNumber(x) || invalidNumber(y)){
          throw "Invalid x or y values.";}

      return {
        "key": key,
        "x": x,
        "y": y,
        "shape": shape || DEFAULT_SHAPE,
        "color": color || DEFAULT_COLOR
      }
    }

    function toGroup(key, values, shape, color){
      return {
        "key": key,
        "values": values,
        "shape": shape || DEFAULT_SHAPE,
        "color": color || DEFAULT_COLOR
      }
    }

    function toRow(name, type, age, height) {
      return {
        "name": name,
        "type": type,
        "age": age,
        "height": height
      }
    }

    function getTeletubbiesGroup(data) {
      $scope.teletubbies=$scope.data.teletubbies
      var values = [],
        color = $scope.selectedColor,
        rows = [],
        group;

      data = data.teletubbies;
      for (let i =0; i<data.length; i++){//remove
         if (data[i].name==="User Input Error"){
           data.splice(i, 1)
           }
        }
      data.sort(function(a, b){
          var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
          if (nameA < nameB) //sort string ascending
              return -1
          if (nameA > nameB)
              return 1
          return 0 //default return value (no sorting)
      })
      $scope.items=$scope.teletubbies

      for (var i=0; i < data.length; i++) {
        var row = data[i],
          name = row.name,
          age = row.age,
          height = row.height,
          row = toRow(name, "teletubby", age, height),
          p;

        try {
          p = toPoint(name, age, height, null, color);
          values.push(p);
          rows.push(row);
        }
        catch(err) {
          $log.error("Unable to add point to data: " + err);
        }
      }

      $scope.tableRows = rows;
      $scope.$apply();

      group = toGroup("Teletubbies", values, null, color);

      return [group];
    }


    function getPokemonGroup(data) {
      var values = [],
        color = $scope.selectedColor,
        rows = [],
        group;

      data = data.pokemon;
      var newData=[]
      //
      for(let i = 0; i<data.rows.length; i++){
        newData = [...newData,
                      {"name": data.rows[i][0],
                      "type": data.rows[i][1],
                      "age": data.rows[i][2],
                      "height": data.rows[i][3]
                    }
                  ]
      }

      data=newData
      for (let i =0; i<data.length; i++){
         if (data[i].name==="User Input Error"){
           data.splice(i, 1)
           }
        }
      data.sort(function(a, b){
          var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
          if (nameA < nameB) //sort string ascending
              return -1
          if (nameA > nameB)
              return 1
          return 0 //default return value (no sorting)
      })
      $scope.items=data

      for (var i=0; i < data.length; i++) {
        var row = data[i],
          name = row.name,
          age = row.age,
          height = row.height,
          type = row.type,
          row = toRow(type, "pokemon", age, height),
          p;

        try {
          p = toPoint(name+" - "+type, age, height, null, color);
          values.push(p);
          rows.push(row);
        }
        catch(err) {
          $log.error("Unable to add point to data: " + err);
        }
      }

      $scope.tableRows = rows;
      $scope.$apply();

      group = toGroup("Pokemon", values, null, color);

      return [group];
    }

    function getColumnIndexMap(cols) {
      var map = {};

      for (var i=0; i < cols.length; i++) {
        var id = cols[i];

        map[id] = i;
      }
      return map;
    }
    function getData() {
      var data = $scope.data,
        selected = $scope.selectedDataset;

      if (selected === "teletubbies") {
        return getTeletubbiesGroup(data);
      } else if (selected === "pokemon") {
        return getPokemonGroup(data);
      }
    }

    function getTooltipContent(key, x, y, e, g) {
      var key = g.point.key;


      return '<h2>' + key + '</h2>';
    }

    function getChart() {
      var chart = nv.models.scatterChart()
        .forceX([0,10])
        .forceY([0,10])
        .pointRange([POINT_RADIUS, POINT_RADIUS])
        .showDistX(true)
        .showDistY(true)
        .useVoronoi(true)
        .color(d3.scale.category10().range())
        .duration(300);

      chart.dispatch.on('renderEnd', function(){
        console.log('render complete');
      });

      chart.xAxis
        .axisLabel(X_AXIS_LABEL)
        .tickFormat(d3.format('.01f'));

      chart.yAxis
        .axisLabel(Y_AXIS_LABEL)
        .tickFormat(d3.format('.01f'));

      chart.tooltipContent(getTooltipContent);

      d3.select('#ageHeightChart svg')
        .datum(getData)
        .call(chart);

      nv.utils.windowResize(chart.update);

      chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

      return chart;
    }

    function clearSvg() {
      $(SVG_SELECTOR).empty();
    }

    function drawChart() {
      clearSvg();
      nv.addGraph(getChart);
    }

    $http.jsonp('data.json').success(function(data){
      $scope.data = data;

    });


    $scope.showChart = function() {
      $scope.view = "chart";
    }

    $scope.showTable = function() {
      $scope.view = "table";


    }
    //  * $watch for changes
    //  *
    //  */

    $scope.$watch('data', function(newValue, oldValue) {
      if (!newValue){
        return;
      }
       initScope();
    });

    $scope.$watch('selectedDataset', function(newValue, oldValue) {
      if (!newValue){
        return;
      }
      drawChart();
    });

    $scope.$watch('selectedColor', function(newValue, oldValue) {
      if (!newValue){
        return;
      }
      drawChart();
    });
  }
]);
