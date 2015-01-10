angular.module('ui.jassa.facet-list', [])


/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetListCtrl', ['$rootScope', '$scope', '$q', '$timeout', function($rootScope, $scope, $q, $timeout) {

    $scope.showConstraints = false;

    $scope.ObjectUtils = jassa.util.ObjectUtils;
    //$scope.paginationOptions = $scope.paginationOptions || {};

    $scope.loading = $scope.loading || {data: false, pageCount: false};

    $scope.NodeUtils = jassa.rdf.NodeUtils;

    $scope.pathHead = $scope.pathHead || new jassa.facete.PathHead(new jassa.facete.Path());

    $scope.listFilter = $scope.listFilter || { limit: 10, offset: 0, concept: null };// new jassa.service.ListFilter();


    $scope.facetValuePath = null;


    $scope.$watch('filterString', function(newValue) {
        $scope.listFilter.concept = newValue;
        //alert(newValue);
    });

    $scope.descendFacet = function(property) {
        var pathHead = $scope.pathHead;

        var newStep = new jassa.facete.Step(property.getUri(), pathHead.isInverse());
        var newPath = pathHead.getPath().copyAppendStep(newStep);
        $scope.pathHead = new jassa.facete.PathHead(newPath, pathHead.isInverse());
    };

    $scope.showFacetValues = function(property) {
        //alert(JSON.stringify(property));
        var pathHead = $scope.pathHead;

        $scope.facetValuePath = pathHead.getPath().copyAppendStep(new jassa.facete.Step(property.getUri(), pathHead.isInverse()));
    };

    var updateFacetValueService = function() {
        //console.log('Updating facet values');
        var facetValueService = new jassa.facete.FacetValueService($scope.sparqlService, $scope.facetTreeConfig.getFacetConfig(), 5000000);

        var path = $scope.facetValuePath;

        $q.when(facetValueService.prepareTableService(path, true)).then(function(listService) {
            listService = new jassa.service.ListServiceTransformItems(listService, function(entries) {

                var cm = $scope.facetTreeConfig.getFacetConfig().getConstraintManager();
                var cs = cm.getConstraintsByPath(path);
                var values = {};
                cs.forEach(function(c) {
                    if(c.getName() === 'equals') {
                        values[c.getValue()] = true;
                    }
                });

                entries.forEach(function(entry) {
                    var item = entry.val;

                    var isConstrained = values['' + item.node];
                    item.isConstrainedEqual = isConstrained;
                });
                //$scope.facetValues = items;
                return entries;
            });


            $scope.listService = listService;
        });

        /*
        facetValueService.prepareTableService(path, false).then(function(ls) {

            $scope.listService = listService;
            var bestLabelConfig = new sparql.BestLabelConfig();
            var labelRelation = sparql.LabelUtils.createRelationPrefLabels(bestLabelConfig);
            var filterConcept = sparql.KeywordSearchUtils.createConceptRegex(labelRelation, 'Germany', true);

            return ls.fetchItems(filterConcept, 10);
        }).then(function(items) {
            items[0].val.bindings[0].get(rdf.NodeFactory.createVar('c_1')).getLiteralValue().should.equal(1094);
            console.log('FACET VALUES\n ' + JSON.stringify(items, null, 4));
        });
        */

    };

    $scope.toggleConstraint = function(node) {
        var path = $scope.facetValuePath;

        var constraintManager = $scope.facetTreeConfig.getFacetConfig().getConstraintManager();

        //var node = item.node;
        var constraint = new jassa.facete.ConstraintEquals(path, node);

        // TODO Integrate a toggle constraint method into the filterManager
        constraintManager.toggleConstraint(constraint);
    };


//    var fetchFacetList = function(path) {
//        var pathExpansions = $scope.facetTreeConfig.getFacetTreeState().getPathExpansions();
//        pathExpansions.clear();
//        pathExpansions.add(path);
//        //pathExpansions.add(new jassa.facete.Path());
//
//        var result = $scope.facetTreeService.fetchFacetTree(path);
//        return result;
//    };

    var updateFacetService = function() {
        console.log('Updating facets');
        var isConfigured = $scope.sparqlService && $scope.facetTreeConfig;
        var facetTreeService = isConfigured ? jassa.facete.FacetTreeServiceUtils.createFacetTreeService($scope.sparqlService, $scope.facetTreeConfig) : null;

        if(facetTreeService != null) {
            // TODO This may be a hack as we break encapsulation
            // The question is whether it should be allowed to get the facetService from a facetTreeService
            var facetService = facetTreeService.facetService;

            $q.when(facetService.prepareListService($scope.pathHead)).then(function(listService) {
                $scope.listService = listService;
            });
        }
    };

    var update = function() {
        if($scope.facetValuePath == null) {
            updateFacetService();
        } else {
            updateFacetValueService();
        }
    };

//    $scope.$watch(function() {
//        var path = $scope.facetValuePath
//        var r = path == null ? null : '' + path;
//        return r;
//    }, function(str) {
//        if(str == null) {
//            updateFacetService();
//        } else {
//            updateFacetValueService();
//        }
//    }, true);

    $scope.$watch('[ObjectUtils.hashCode(facetTreeConfig), pathHead, facetValuePath]', function() {
        update();
    }, true);

    $scope.$watch('sparqlService', function() {
        update();
    });
}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig)
 */
.directive('facetList', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'js/facet-list/facet-list.html',
        //transclude: false,
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            //facetConfig: '=',
            listFilter: '=?',
            pathHead: '=?',
            //plugins: '=',
            //pluginContext: '=', //plugin context
            paginationOptions: '=?',
            loading: '=?',
            onSelect: '&select'
        },
        controller: 'FacetListCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;
