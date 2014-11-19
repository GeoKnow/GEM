angular.module('ui.jassa.facet-list', [])


/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetListCtrl', ['$rootScope', '$scope', '$q', '$timeout', function($rootScope, $scope, $q, $timeout) {

    //$scope.paginationOptions = $scope.paginationOptions || {};

    $scope.loading = $scope.loading || {data: false, pageCount: false};

    $scope.NodeUtils = jassa.rdf.NodeUtils;

    $scope.pathHead = $scope.pathHead || new jassa.facete.PathHead(new jassa.facete.Path());

    $scope.listFilter = $scope.listFilter || { limit: 10, offset: 0, concept: null };// new jassa.service.ListFilter();

    $scope.$watch('filterString', function(newValue) {
        $scope.listFilter.concept = newValue;
        //alert(newValue);
    });


    var fetchFacetList = function(path) {
        var pathExpansions = $scope.facetTreeConfig.getFacetTreeState().getPathExpansions();
        pathExpansions.clear();
        pathExpansions.add(path);
        //pathExpansions.add(new jassa.facete.Path());

        var result = $scope.facetTreeService.fetchFacetTree(path);
        return result;
    }

    var updateFacetService = function() {
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
        updateFacetService();
        //self.refresh();
    };

    $scope.$watch('[ObjectUtils.hashCode(facetTreeConfig), path]', function() {
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
        transclude: false,
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
