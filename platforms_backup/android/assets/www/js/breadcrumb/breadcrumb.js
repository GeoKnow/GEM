angular.module('ui.jassa.breadcrumb', [])


/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('BreadcrumbCtrl', ['$rootScope', '$scope', '$q', '$timeout', function($rootScope, $scope, $q, $timeout) {

    $scope.slots = [];

    var update = function() {
        var sparqlService = $scope.sparqlService;

        var path = $scope.path;

        if(sparqlService && path) {
            var steps = path.getSteps();

            var ls = jassa.sponate.LookupServiceUtils.createLookupServiceNodeLabels(sparqlService);
            // Value
            ls = new jassa.service.LookupServiceTransform(ls, function(val) { return val.displayLabel; });
            //ls = new jassa.service.LookupServicePathLabels(ls);

            var uris = jassa.facete.PathUtils.getUris(path);

            $q.when(ls.lookup(uris)).then(function(map) {

                var r = steps.map(function(step) {
                    var node = jassa.rdf.NodeFactory.createUri(step.getPropertyName());
                    var r = {
                        property: node,
                        labelInfo: {
                            displayLabel: map.get(node),
                        },
                        isInverse: step.isInverse()
                    };

                    return r;
                });

                return r;
            }).then(function(slots) {
                $scope.slots = slots;
            });

        }




        //updateFacetTreeService();
        self.refresh();
    };

    $scope.$watch('[ObjectUtils.hashCode(facetTreeConfig), path]', function() {
        update();
    }, true);

    $scope.$watch('sparqlService', function() {
        update();
    });



//    var pathToItems = function() {
//
//    };


    // TODO Add a function that splits the path according to maxSize

    var updateVisiblePath = function() {
        var path = $scope.path;
        if(path) {
            var l = path.getLength();
            var maxSize = $scope.maxSize == null ? l : $scope.maxSize;

            //console.log('offset: ' + $scope.offset);
            $scope.offset = Math.max(0, l - maxSize);
            $scope.visiblePath = $scope.maxSize ? path : new facete.Path(path.steps.slice($scope.offset));
        } else {
            $scope.offset = 0;
            $scope.visiblePath = null;
        }
    }

    $scope.$watch(function() {
        var path = $scope.path;

        var r = path ? path.hashCode() : 0;
        return r;
    }, function() {
        updateVisiblePath();
    });


    $scope.$watch(function() {
        return $scope.maxSize;
    }, function() {
        updateVisiblePath();
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
        if(path != null) {
            var steps = path.getSteps();
            var newSteps = steps.slice(0, index);

            var newPath = new jassa.facete.Path(newSteps);
            $scope.path = newPath;
        }
    };

//    $scope.selectPath = function(path) {
//        $scope.path = path;
//        //alert(path);
//    };
    //
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
            //label: '=',
            path: '=',
            maxSize: '=?',
            //plugins: '=',
            //pluginContext: '=', //plugin context
            onSelect: '&select'
        },
        controller: 'BreadcrumbCtrl',
        compile: function(elm, attrs) {
            return {
                pre: function(scope, elm, attrs, controller) {
                }
            };
//            return function link(scope, elm, attrs, controller) {
//            };
        }
    };
})

;
