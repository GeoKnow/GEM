angular.module('ui.jassa.breadcrumb', [])


/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('BreadcrumbCtrl', ['$rootScope', '$scope', '$q', '$timeout', function($rootScope, $scope, $q, $timeout) {

    var update = function() {
        //updateFacetTreeService();
        self.refresh();
    };

    $scope.$watch('[ObjectUtils.hashCode(facetTreeConfig), path]', function() {
        update();
    }, true);

    $scope.$watch('sparqlService', function() {
        update();
    });

//    $scope.selectIncoming = function(path) {
//        if($scope.facetTreeConfig) {
//            var pathToDirection = $scope.facetTreeConfig.getFacetTreeState().getPathToDirection();
//            pathToDirection.put(path, -1);
//
//        }
//    };
//
//    $scope.selectOutgoing = function(path) {
//        if($scope.facetTreeConfig) {
//            var pathToDirection = $scope.facetTreeConfig.getFacetTreeState().getPathToDirection();
//            pathToDirection.put(path, 1);
//
//        }
//    };

//    $scope.isEqual = function(a, b) {
//        var r = a == null ? b == null : a.equals(b);
//        return r;
//    };


    $scope.setPath = function(index) {
        var path = $scope.path;
        var steps = path.getSteps();
        var newSteps = steps.slice(0, index);

        var newPath = new jassa.facete.Path(newSteps);
        $scope.path = newPath;
    };

//    $scope.selectPath = function(path) {
//        $scope.path = path;
//        //alert(path);
//    };

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig)
 */
.directive('breadcrumb', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'js/breadcrumb/breadcrumb.html',
        transclude: false,
        scope: {
            sparqlService: '=',
            path: '=',
            //plugins: '=',
            //pluginContext: '=', //plugin context
            onSelect: '&select'
        },
        controller: 'BreadcrumbCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;
