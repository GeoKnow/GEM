'use strict';

/* Controllers */

var searchBar = angular.module('gemMap', ['snap']);


searchBar.controller('MapCtrl', ['$scope', function($scope) {
		$scope.bar = {"value" : "Filter text here"};
}]);
