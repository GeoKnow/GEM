'use strict';

/* Controllers */

var createMapDataSource = function(sparqlService, geoMapFactory, concept, fillColor) {
            
	var attrs = {
		fillColor: fillColor,
		fontColor: fillColor,
		strokeColor: fillColor,

		stroke: true,
		strokeLinecap: 'round',
		strokeWidth: 100,
		pointRadius: 12,
		labelAlign: 'cm'
	};
	
	var result = geo.GeoDataSourceUtils.createGeoDataSourceLabels(sparqlService, geoMapFactory, concept, attrs);
	return result;
}

var searchBar = angular.module('gemMap', ['snap','ui.bootstrap', 'ui.jassa.openlayers']);

_.mixin(_.str.exports());
var rdf = Jassa.rdf;
var sparql = Jassa.sparql;
var service = Jassa.service;
var sponate = Jassa.sponate;
var facete = Jassa.facete;
var geo = Jassa.geo;

searchBar.controller('MapCtrl', ['$scope', function($scope) {

	var geoMapFactoryVirt = geo.GeoMapFactoryUtils.createWktMapFactory('http://www.w3.org/2003/01/geo/wgs84_pos#geometry', 'bif:st_intersects', 'bif:st_geomFromText');
	var geoMapFactoryAsWktVirt = geo.GeoMapFactoryUtils.createWktMapFactory('http://www.opengis.net/ont/geosparql#asWKT', 'bif:st_intersects', 'bif:st_geomFromText');
	var geoMapFactoryWgs =  geo.GeoMapFactoryUtils.wgs84MapFactory;       

	var createSparqlService = function(url, graphUris) {
		var result = new service.SparqlServiceHttp(url, graphUris);        
		result = new service.SparqlServiceCache(result);
		result = new service.SparqlServiceVirtFix(result);
		result = new service.SparqlServicePaginate(result, 1000);
		return result;
	};
	
	var sparqlServiceA = createSparqlService('http://dbpedia.org/sparql', ['http://dbpedia.org']);        
	var sparqlServiceB = createSparqlService('http://linkedgeodata.org/sparql', ['http://linkedgeodata.org']);        
	var sparqlServiceC = createSparqlService('http://localhost/data/geolink/sparql', ['http://geolink.aksw.org/']);        
	
	var conceptA = facete.ConceptUtils.createTypeConcept('http://dbpedia.org/ontology/Airport');      
	var conceptB = facete.ConceptUtils.createTypeConcept('http://linkedgeodata.org/ontology/Airport');      
	var conceptC = facete.ConceptUtils.createTypeConcept('http://www.linklion.org/ontology#Link');
			
	var createMapDataSource = function(sparqlService, geoMapFactory, concept, fillColor) {
		
		var attrs = {
			fillColor: fillColor,
			fontColor: fillColor,
			strokeColor: fillColor,
	
			stroke: true,
			strokeLinecap: 'round',
			strokeWidth: 100,
			pointRadius: 12,
			labelAlign: 'cm'
		};
		
		var result = geo.GeoDataSourceUtils.createGeoDataSourceLabels(sparqlService, geoMapFactory, concept, attrs);
		return result;
	}
	
	var bounds = new geo.Bounds(7.0, 49.0, 9, 51.0);

	$scope.dataSources = [
		createMapDataSource(sparqlServiceA, geoMapFactoryVirt, conceptA, '#CC0020'),
		createMapDataSource(sparqlServiceB, geoMapFactoryWgs, conceptB, '#2000CC')
		//createMapDataSource(sparqlServiceC, geoMapFactoryAsWktVirt, conceptC, '#663300'),
	];
	
	$scope.selectGeom = function(data) {
		alert(JSON.stringify(data));
		//console.log('Status', data);
	};
	
	$scope.mapConfig = {
		center: { lon: 8, lat: 50 },
		zoom: 8
	};

	$scope.setCenter = function() {
		$scope.mapConfig.center = { lon: 20, lat: 20 };
		$scope.mapConfig.zoom = 4;
	};

	$scope.$watch('mapConfig', function(v) {
		console.log('Config changed: ' + JSON.stringify(v));
	}, true);

    $scope.mapConfig = {
        center: { lon: 8, lat: 50 },
        zoom: 8
    };


	$scope.bar = {'value': 'Filter box goes here'};
  
	$scope.opts = {
		hyperextensible: false,
		tapToClose: true,
        touchToDrag: true,
	};
	
	
	

}]);
