/*
 * jassa-ui-angular
 * https://github.com/GeoKnow/Jassa-UI-Angular

 * Version: 0.0.4-SNAPSHOT - 2014-10-17
 * License: MIT
 */
angular.module("ui.jassa", ["ui.jassa.auto-focus","ui.jassa.blurify","ui.jassa.constraint-list","ui.jassa.facet-tree","ui.jassa.facet-typeahead","ui.jassa.facet-value-list","ui.jassa.jassa-list-browser","ui.jassa.jassa-media-list","ui.jassa.lang-select","ui.jassa.list-search","ui.jassa.pointer-events-scroll-fix","ui.jassa.resizable","ui.jassa.sparql-grid","ui.jassa.template-list"]);
angular.module('ui.jassa.auto-focus', [])

// Source: http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field
.directive('autoFocus', function($timeout, $parse) {
    return {
        link: function(scope, element, attrs) {
            var model = $parse(attrs.autoFocus);
            scope.$watch(model, function(value) {
                if(value === true) {
                    $timeout(function() {
                         element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function() {
                if(model.assign) {
                    scope.$apply(model.assign(scope, false));
                }
            });
        }
    };
})

;


angular.module('ui.jassa.blurify', [])

/**
 * Replaces text content with an alternative on blur
 * blurify="(function(model) { return 'displayValue'; })"
 *
 */
.directive('blurify', [ '$parse', function($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, element, attrs, model) {
            element.on('focus', function () {
                // Re-render the model on focus
                model.$render();
            });
            element.on('blur', function () {
                var modelVal = $parse(attrs['ngModel'])($scope);
                var labelFn = $parse(attrs['blurify'])($scope);

                if(labelFn) {
                    var val = labelFn(modelVal);
                    if(val && val.then) {
                        val.then(function(label) {
                            element.val(label);
                        });
                    } else {
                        element.val(val);
                    }
                }
//              $scope.$apply(function() {
//                  model.$setViewValue(val);
//              });
            });
        }
    };
}])

;


angular.module('ui.jassa.constraint-list', [])

.controller('ConstraintListCtrl', ['$scope', '$q', '$rootScope', function($scope, $q, $rootScope) {

    var self = this;

    var reset = function() {
        if($scope.sparqlService && $scope.facetTreeConfig) {
            var labelConfig = $scope.facetTreeConfig.getBestLiteralConfig();
            var mappedConcept = jassa.sponate.MappedConceptUtils.createMappedConceptBestLabel(labelConfig);
            var ls = jassa.sponate.LookupServiceUtils.createLookupServiceMappedConcept($scope.sparqlService, mappedConcept);
            ls = new jassa.service.LookupServiceTransform(ls, function(val) {
                return val.displayLabel || val.id;
            });
            $scope.constraintLabelsLookupService = new jassa.facete.LookupServiceConstraintLabels(ls);
        }
    };

    var refresh = function() {

        if($scope.constraintLabelsLookupService) {

            var constraints = $scope.constraintManager ? $scope.constraintManager.getConstraints() : [];
            var promise = $scope.constraintLabelsLookupService.lookup(constraints);

            $q.when(promise).then(function(map) {

                var items =_(constraints).map(function(constraint) {
                    var label = map.get(constraint);

                    var r = {
                        constraint: constraint,
                        label: label
                    };

                    return r;
                });

                $scope.constraints = items;
            });
        }
    };

    var renderConstraint = function(constraint) {
        var type = constraint.getName();

        var result;
        switch(type) {
        case 'equals':
            var pathStr = ''  + constraint.getDeclaredPath();
            if(pathStr === '') {
                pathStr = '()';
            }
            result = pathStr + ' = ' + constraint.getValue();
        break;
        default:
            result = constraint;
        }

        return result;
    };

    $scope.$watch('constraintLabelsLookupService', function() {
        refresh();
    });

    $scope.$watch('facetTreeConfig.getFacetConfig().getConstraintManager()', function(cm) {
        $scope.constraintManager = cm;
        refresh();
    }, true);

    $scope.$watch('sparqlService', function() {
        reset();
    });

    $scope.$watch('facetTreeConfig.getBestLiteralConfig()', function() {
        reset();
    }, true);

    $scope.removeConstraint = function(item) {
        $scope.constraintManager.removeConstraint(item.constraint);
    };

}])


/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig)
 */
.directive('constraintList', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/constraint-list/constraint-list.html',
        transclude: false,
        require: 'constraintList',
        scope: {
            sparqlService: '=',
            labelService: '=',
            facetTreeConfig: '=',
            onSelect: '&select'
        },
        controller: 'ConstraintListCtrl'
    };
})

;

angular.module('ui.jassa.facet-tree', [])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetTreeDirContentCtrl', ['$rootScope', '$scope', '$q', function($rootScope, $scope, $q) {

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig) 
 */
.directive('facetTreeDirContent', function($parse) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-tree/facet-tree-content.html',
        transclude: false,
        require: 'facetTree',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            plugins: '=',
            onSelect: '&select'
        },
        controller: 'FacetTreeDirContentCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;

angular.module('ui.jassa.facet-tree', ['ui.jassa.template-list'])

/*
.controller('FacetDirCtrl', ['$scope', function($scope) {
    dirset.offset = dirset.listFilter.getOffset() || 0;
    dirset.limit = dirset.listFilter.getLimit() || 0;
    dirset.pageCount = dirset.limit ? Math.floor(dirset.childCountInfo.count / dirset.limit) : 1;
    dirset.currentPage = dirset.limit ? Math.floor(dirset.offset / dirset.limit) + 1 : 1;
}])
*/

.controller('FacetNodeCtrl', ['$scope', function($scope) {
    $scope.$watchCollection('[facet.incoming, facet.outgoing]', function() {
        var facet = $scope.facet;
        if(facet) {
            $scope.dirset = facet.outgoing ? facet.outgoing : facet.incoming;
        }
    });

    $scope.$watchCollection('[dirset, dirset.listFilter.getOffset(), dirset.listFilter.getLimit(), dirset.childCountInfo.count]', function() {
        var dirset = $scope.dirset;
        if(dirset) {
            dirset.offset = dirset.listFilter.getOffset() || 0;
            dirset.limit = dirset.listFilter.getLimit() || 0;
            dirset.pageCount = dirset.limit ? Math.floor(dirset.childCountInfo.count / dirset.limit) : 1;
            dirset.currentPage = dirset.limit ? Math.floor(dirset.offset / dirset.limit) + 1 : 1;
        }
    });

}])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetTreeCtrl', ['$rootScope', '$scope', '$q', '$timeout', function($rootScope, $scope, $q, $timeout) {

    var self = this;

    var updateFacetTreeService = function() {
        var isConfigured = $scope.sparqlService && $scope.facetTreeConfig;
        $scope.facetTreeService = isConfigured ? jassa.facete.FacetTreeServiceUtils.createFacetTreeService($scope.sparqlService, $scope.facetTreeConfig) : null;
    };

    var update = function() {
        updateFacetTreeService();
        self.refresh();
    };

    $scope.itemsPerPage = [10, 25, 50, 100];

    $scope.ObjectUtils = jassa.util.ObjectUtils;
    $scope.Math = Math;

    $scope.startPath = null;

    var watchList = '[ObjectUtils.hashCode(facetTreeConfig), startPath]';
    $scope.$watch(watchList, function() {
        //console.log('UpdateTree', $scope.facetTreeConfig);
        update();
    }, true);

    $scope.$watch('sparqlService', function() {
        update();
    });


    $scope.doFilter = function(pathHead, filterString) {
        var pathHeadToFilter = $scope.facetTreeConfig.getFacetTreeState().getPathHeadToFilter();
        var filter = pathHeadToFilter.get(pathHead);
        if(!filter) {
            filter = new jassa.facete.ListFilter(null, 10, 0);
            pathHeadToFilter.put(pathHead, filter);
        }

        filter.setConcept(filterString);
        filter.setOffset(0);


        //getOrCreateState(path).getListFilter().setFilter(filterString);

        //$scope.facetTreeConfig.getPathToFilterString().put(path, filterString);
        //self.refresh();
    };

    self.refresh = function() {

        if($scope.facetTreeService) {
            var promise = $scope.facetTreeService.fetchFacetTree($scope.startPath);
            $q.when(promise).then(function(data) {
                $scope.facet = data;
                //console.log('TREE: ' + JSON.stringify($scope.facet, null, 4));
            });

        } else {
            $scope.facet = null;
        }
    };

    $scope.toggleControls = function(path) {
        var pathToTags = $scope.facetTreeConfig.getPathToTags();
        //tags.showControls = !tags.showControls;
        var tags = pathToTags.get(path);
        if(!tags) {
            tags = {};
            pathToTags.put(path, tags);
        }

        tags.showControls = !tags.showControls;
    };

    $scope.toggleCollapsed = function(path) {
        var pathExpansions = $scope.facetTreeConfig.getFacetTreeState().getPathExpansions();
        jassa.util.CollectionUtils.toggleItem(pathExpansions, path);

        // No need to refresh here, as we are changing the config object
        //self.refresh();
    };

    $scope.isEqual = function(a, b) {
        var r = a == null ? b == null : a.equals(b);
        return r;
    };

    $scope.setStartPath = function(path) {
        //var p = path.getParent();
        //var isRoot = p == null || $scope.isEqual($scope.startPath, p);
        //$scope.startPath = isRoot ? null : p;

        var isRoot = path == null || $scope.isEqual($scope.startPath, path);
        $scope.startPath = isRoot ? null : path;
    };

    $scope.selectIncoming = function(path) {
        if($scope.facetTreeConfig) {
            var pathToDirection = $scope.facetTreeConfig.getFacetTreeState().getPathToDirection();
            pathToDirection.put(path, -1);

            // No need to refresh here, as we are changing the config object
            //self.refresh();
        }
    };

    $scope.selectOutgoing = function(path) {
        if($scope.facetTreeConfig) {
            var pathToDirection = $scope.facetTreeConfig.getFacetTreeState().getPathToDirection();
            pathToDirection.put(path, 1);

            // No need to refresh here, as we are changing the config object
            //self.refresh();
        }
    };


    $scope.selectPage = function(pathHead, page) {
        var pathHeadToFilter = $scope.facetTreeConfig.getFacetTreeState().getPathHeadToFilter();
        var filter = pathHeadToFilter.get(pathHead);
        if(!filter) {
            filter = new jassa.facete.ListFilter(null, 10, 0);
            pathHeadToFilter.put(pathHead, filter);
        }
        var newOffset = (page - 1) * filter.getLimit();
        filter.setOffset(newOffset);
        //console.log('newOffset: ' + newOffset);
    };

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig)
 */
.directive('facetTree', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-tree/facet-tree-item.html',
        transclude: false,
        require: 'facetTree',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            plugins: '=',
            pluginContext: '=', //plugin context
            onSelect: '&select'
        },
        controller: 'FacetTreeCtrl',
        compile: function(elm, attrs) {
            return function link(scope, elm, attrs, controller) {
            };
        }
    };
})

;

angular.module('ui.jassa.facet-typeahead', [])

/**
 * facet-typeahead
 *
 */
.directive('facetTypeahead', ['$compile', '$q', '$parse', function($compile, $q, $parse) {

    //var rdf = jassa.rdf;
    var sponate = jassa.sponate;
    var facete = jassa.facete;

    var parsePathSpec = function(pathSpec) {
        var result = pathSpec instanceof facete.Path ? pathSpec : facete.Path.parse(pathSpec);
        return result;
    };

    var makeListService = function(lsSpec, ftac) {
        var result;

        if(!lsSpec) {
            throw new Error('No specification for building a list service provided');
        }
        else if(Object.prototype.toString.call(lsSpec) === '[object String]') {
            var store = ftac.store;

            result = store.getListService(lsSpec);
            if(!result) {
                throw new Error('No collection with name ' + lsSpec + ' found');
            }
        }
        else if(lsSpec instanceof sponate.MappedConcept) {
            var sparqlServiceA = ftac.sparqlService;
            result = jassa.sponate.ListServiceUtils.createListServiceMappedConcept(sparqlServiceA, lsSpec);
        }
        else if(lsSpec instanceof sponate.MappedConceptSource) {
            var mappedConcept = lsSpec.getMappedConcept();
            var sparqlServiceB = lsSpec.getSparqlService();

            result = jassa.sponate.ListServiceUtils.createListServiceMappedConcept(sparqlServiceB, mappedConcept);
        }
        else if(lsSpec instanceof service.ListService) {
            result = lsSpec;
        }
        else {
            throw new Error('Unsupported list service type', lsSpec);
        }

        return result;
    };

    var createConstraints = function(idToModelPathMapping, searchFn, selectionOnly) {

        var result = [];
        var keys = Object.keys(idToModelPathMapping);
        keys.forEach(function(key) {
            var item = idToModelPathMapping[key];
            var scope = item.scope;
            var r;

            var val = item.modelExpr(scope);

            var pathSpec = item.pathExpr(scope);
            var path = parsePathSpec(pathSpec); //facete.PathUtils.

            var valStr;
            if(!selectionOnly && Object.prototype.toString.call(val) === '[object String]' && (valStr = val.trim()) !== '') {

                if(searchFn) {
                    var concept = searchFn(valStr);
                    r = new jassa.facete.ConstraintConcept(path, concept);
                } else {
                    //throw new Error('No keyword search strategy specified');
                    r = new jassa.facete.ConstraintRegex(path, valStr);
                }
            }
            else if(val && val.id) {
                var id = val.id;
                var node = jassa.rdf.NodeFactory.createUri(id);
                r = new jassa.facete.ConstraintEquals(path, node);
            }
            else {
                r = null;
            }

            //console.log('Result constraint: ', r.createElementsAndExprs(config.facetConfig.getRootFacetNode()));

            if(r) {
                result.push(r);
            }
        });

        return result;
    };

    var FacetTypeAheadServiceAngular = function($scope, $q, configExpr, id, listServiceExpr) {
        this.$scope = $scope;
        this.$q = $q;

        this.configExpr = configExpr;
        this.id = id;
        this.listServiceExpr = listServiceExpr;
    };

    FacetTypeAheadServiceAngular.prototype.getSuggestions = function(filterString) {
        var config = this.configExpr(this.$scope);

        //var sparqlService = config.sparqlService;

        // Get the attributes from the config
        var idToModelPathMapping = config.idToModelPathMapping;

        var modelPathMapping = idToModelPathMapping[this.id];

        if(!modelPathMapping) {
            throw new Error('Cannot retrieve model-path mapping for facet-typeahead directive with id ' + id);
        }

        //var limit = modelPathMapping.limit || config.defaultLimit || 10;
        //var offset = modelPathMapping.offset || config.defaultOffset || 0;


        var pathSpec = modelPathMapping.pathExpr(this.$scope);
        var path = parsePathSpec(pathSpec);


        var lsSpec = this.listServiceExpr(this.$scope);
        var listService = makeListService(lsSpec, config);

        // Clone the constraints just for this set of suggestions
/*
        var fc = config.facetConfig;
        var cm = fc.getConstraintManager();
        var cmClone = cm.shallowClone();


        var facetConfig = new facete.FacetConfig();
        facetConfig.setConstraintManager(cmClone);
        facetConfig.setBaseConcept(fc.getBaseConcept());
        facetConfig.setRootFacetNode(fc.getRootFacetNode());
*/

        var facetConfig = config.facetConfig;
        var cmClone = facetConfig.getConstraintManager();

        // Compile constraints
        var constraints = createConstraints(idToModelPathMapping, config.search);

        _(constraints).each(function(constraint) {
            // Remove other constraints on the path
            var paths = constraint.getDeclaredPaths();
            paths.forEach(function(path) {
                var cs = cmClone.getConstraintsByPath(path);
                cs.forEach(function(c) {
                    cmClone.removeConstraint(c);
                });
            });

            cmClone.addConstraint(constraint);
        });

        //console.log('Constraints ', idToModelPathMapping, constraints);

        var facetValueConceptService = new jassa.facete.FacetValueConceptServiceExact(facetConfig);

        var result = facetValueConceptService.prepareConcept(path, false).then(function(concept) {
            //console.log('Path ' + path);
            //console.log('Concept: ' + concept);


            var r = listService.fetchItems(concept, 10).then(function(items) {
                var s = items.map(function(item) {
                    return item.val;
                });

                return s;
            });
            return r;
        });

        return result;

    };


    return {
        restrict: 'A',
        scope: true,
        //require: 'ngModel',
        // We need to run this directive before the the ui-bootstrap's type-ahead directive!
        priority: 1001,

        // Prevent angular calling other directives - we do it manually
        terminal: true,

        compile: function(elem, attrs) {

            if(!this.instanceId) {
                this.instanceId = 0;
            }

            var instanceId = 'facetTypeAhead-' + (this.instanceId++);

            var modelExprStr = attrs['ngModel'];
            var configExprStr = attrs['facetTypeahead'];
            var pathExprStr = attrs['facetTypeaheadPath'];
            var listServiceExprStr = attrs['facetTypeaheadSuggestions'];
            var labelAttr = attrs['facetTypeaheadLabel'];
            var modelAttr = attrs['facetTypeaheadModel'];

            labelAttr = labelAttr || 'id';
            modelAttr = modelAttr || 'id';
            // Add the URI-label directive

            console.log('labelAttr', labelAttr);
            console.log('modelAttr', modelAttr);

            // Remove the attribute to prevent endless loop in compilation
            elem.removeAttr('facet-typeahead');
            elem.removeAttr('facet-typeahead-path');
            elem.removeAttr('facet-typeahead-suggestions');
            elem.removeAttr('facet-typeahead-label');
            elem.removeAttr('facet-typeahead-model');


            //var newAttrVal = 'item.id as item.displayLabel for item in facetTypeAheadService.getSuggestions($viewValue)';
            var tmp = modelAttr ? '.' + modelAttr : '';
            var newAttrVal = 'item as item' + tmp + ' for item in facetTypeAheadService.getSuggestions($viewValue)';
            elem.attr('typeahead', newAttrVal);


            elem.attr('blurify', 'labelFn');

            return {
                pre: function(scope, elem, attrs) {

                    var modelExpr = $parse(modelExprStr);
                    var pathExpr = $parse(pathExprStr);
                    var configExpr = $parse(configExprStr);
                    var listServiceExpr = $parse(listServiceExprStr);

                    scope.labelFn = function(str) {
                        var model = modelExpr(scope);
                        var val = model ? model[labelAttr] : null;
                        var r = val ? val : str;
                        return r;
                    };


                    // Note: We do not need to watch the config, because we retrieve the most
                    // recent values when the suggestions are requested
                    // However, we need to register/unregister the directive from the config object when this changes
                    scope.$watch(configExprStr, function(newConfig, oldConfig) {

                        // Unregister from old config
                        if(oldConfig && oldConfig != newConfig && oldConfig.modelToPathMapping) {
                            delete oldConfig.idToModelPathMapping[instanceId];
                        }

                        if(newConfig) {
                            if(!newConfig.idToModelPathMapping) {
                                newConfig.idToModelPathMapping = {};
                            }

                            newConfig.idToModelPathMapping[instanceId] = {
                                modelExpr: modelExpr,
                                modelExprStr: modelExprStr,
                                pathExprStr: pathExprStr,
                                pathExpr: pathExpr,
                                scope: scope
                            };


                            newConfig.getConstraints = function(selectionOnly) {
                                var result = createConstraints(newConfig.idToModelPathMapping, newConfig.search, selectionOnly);
                                return result;
                            };
                        }
                    });


                    scope.facetTypeAheadService = new FacetTypeAheadServiceAngular(scope, $q, configExpr, instanceId, listServiceExpr);
                },

                post: function(scope, elem, attr) {
                    // Continue processing any further directives
                    $compile(elem)(scope);
                }
            };
        }
    };
}])

;


angular.module('ui.jassa.facet-value-list', [])

/**
 * Controller for the SPARQL based FacetTree
 * Supports nested incoming and outgoing properties
 *
 */
.controller('FacetValueListCtrl', ['$rootScope', '$scope', '$q', function($rootScope, $scope, $q) {

    $scope.filterText = '';

    $scope.pagination = {
        totalItems: 0,
        currentPage: 1,
        maxSize: 5
    };

    $scope.path = null;
    var facetValueService = null;

    var updateFacetValueService = function() {
        var isConfigured = $scope.sparqlService && $scope.facetTreeConfig && $scope.path;

        //facetValueService = isConfigured ? new jassa.facete.FacetValueService($scope.sparqlService, $scope.facetTreeConfig) : null;
        if(isConfigured) {
            var facetConfig = $scope.facetTreeConfig.getFacetConfig();
            facetValueService = new facete.FacetValueService($scope.sparqlService, facetConfig, 5000000);
        }
    };

    var refresh = function() {
        var path = $scope.path;

        if(!facetValueService || !path) {
            $scope.totalItems = 0;
            $scope.facetValues = [];
            return;
        }

        facetValueService.prepareTableService($scope.path, true)
            .then(function(ls) {

                var filter = null;
                var pageSize = 10;
                var offset = ($scope.pagination.currentPage - 1) * pageSize;

                var countPromise = ls.fetchCount(filter);
                var dataPromise = ls.fetchItems(filter, pageSize, offset);

                $q.when(countPromise).then(function(countInfo) {
                    //console.log('countInfo: ', countInfo);

                    $scope.pagination.totalItems = countInfo.count;
                });

                $q.when(dataPromise).then(function(entries) {
                    var items = entries.map(function(entry) {
                        var labelInfo = entry.val.labelInfo = {};
                        labelInfo.displayLabel = '' + entry.key;
                        //console.log('entry: ', entry);

                        var path = $scope.path;
                        entry.val.node = entry.key;
                        entry.val.path = path;

                        entry.val.tags = {};

                        return entry.val;
                    });
                    var cm = $scope.facetTreeConfig.getFacetConfig().getConstraintManager();
                    var cs = cm.getConstraintsByPath(path);
                    var values = {};
                    cs.forEach(function(c) {
                        if(c.getName() === 'equals') {
                            values[c.getValue()] = true;
                        }
                    });

                    items.forEach(function(item) {
                        var isConstrained = values['' + item.node];
                        item.tags.isConstrainedEqual = isConstrained;
                    });

                    $scope.facetValues = items;
                });
            });
    };

    var update = function() {
        updateFacetValueService();
        refresh();
    };

    $scope.ObjectUtils = jassa.util.ObjectUtils;

    var watchList = '[ObjectUtils.hashCode(facetTreeConfig), "" + path, pagination.currentPage]';
    $scope.$watch(watchList, function() {
        update();
    }, true);

    $scope.$watch('sparqlService', function() {
        update();
    });



    $scope.toggleConstraint = function(item) {
        var constraintManager = $scope.facetTreeConfig.getFacetConfig().getConstraintManager();

        var path = $scope.path;
        var node = item.node;
        var constraint = new jassa.facete.ConstraintEquals(path, node);

        // TODO Integrate a toggle constraint method into the filterManager
        constraintManager.toggleConstraint(constraint);
    };

    $scope.filterTable = function(filterText) {
        $scope.filterText = filterText;
        update();
    };


    /*
    $scope.$on('facete:facetSelected', function(ev, path) {

        $scope.currentPage = 1;
        $scope.path = path;

        updateItems();
    });

    $scope.$on('facete:constraintsChanged', function() {
        updateItems();
    });
    */
//  $scope.firstText = '<<';
//  $scope.previousText = '<';
//  $scope.nextText = '>';
//  $scope.lastText = '>>';

}])

/**
 * The actual dependencies are:
 * - sparqlServiceFactory
 * - facetTreeConfig
 * - labelMap (maybe this should be part of the facetTreeConfig)
 */
.directive('facetValueList', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/facet-value-list/facet-value-list.html',
        transclude: false,
        require: 'facetValueList',
        scope: {
            sparqlService: '=',
            facetTreeConfig: '=',
            path: '=',
            onSelect: '&select'
        },
        controller: 'FacetValueListCtrl'
//        compile: function(elm, attrs) {
//            return function link(scope, elm, attrs, controller) {
//            };
//        }
    };
})

;

angular.module('ui.jassa.jassa-list-browser', [])

//.controller('JassaListBrowserCtrl', ['$scope', function($scope) {
//
//}])

.directive('jassaListBrowser', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            listService: '=',
            filter: '=',
            limit: '=',
            offset: '=',
            totalItems: '=',
            items: '=',
            maxSize: '=',
            langs: '=', // Extra attribute that is deep watched on changes for triggering refreshs
            availableLangs: '=',
            doFilter: '=',
            searchModes: '=',
            activeSearchMode: '=',
            context: '=' // Extra data that can be passed in // TODO I would prefer access to the parent scope
        },
        templateUrl: 'template/jassa-list-browser/jassa-list-browser.html',
        //controller: 'JassaListBrowserCtrl'
    };
})

;

angular.module('ui.jassa.jassa-media-list', [])

.controller('JassaMediaListCtrl', ['$scope', '$q', '$timeout', function($scope, $q, $timeout) {
    $scope.currentPage = 1;

    // TODO Get rid of the $timeouts - not sure why $q.when alone breaks when we return results from cache

    $scope.doRefresh = function() {
        $q.when($scope.listService.fetchCount($scope.filter)).then(function(countInfo) {
            $timeout(function() {
                $scope.totalItems = countInfo.count;
            });
        });

        $q.when($scope.listService.fetchItems($scope.filter, $scope.limit, $scope.offset)).then(function(items) {
            $timeout(function() {
                $scope.items = items.map(function(item) {
                    return item.val;
                });
            });
        });
    };


    $scope.$watch('offset', function() {
        $scope.currentPage = Math.floor($scope.offset / $scope.limit) + 1;
    });

    $scope.$watch('currentPage', function() {
        $scope.offset = ($scope.currentPage - 1) * $scope.limit;
    });


    $scope.$watch('[filter, limit, offset, refresh]', $scope.doRefresh, true);
    $scope.$watch('listService', $scope.doRefresh);
}])

.directive('jassaMediaList', [function() {
    return {
        restrict: 'EA',
        templateUrl: 'template/jassa-media-list/jassa-media-list.html',
        transclude: true,
        replace: true,
        scope: {
            listService: '=',
            filter: '=',
            limit: '=',
            offset: '=',
            totalItems: '=',
            //currentPage: '=',
            items: '=',
            maxSize: '=',
            refresh: '=', // Extra attribute that is deep watched on changes for triggering refreshs
            context: '=' // Extra data that can be passed in // TODO I would prefer access to the parent scope
        },
        controller: 'JassaMediaListCtrl',
        link: function(scope, element, attrs, ctrl, transcludeFn) {
            transcludeFn(scope, function(clone, scope) {
                var e = element.find('ng-transclude');
                var p = e.parent();
                e.remove();
                p.append(clone);
            });
        }
    };
}])

;

angular.module('ui.jassa.lang-select', ['ui.sortable', 'ui.keypress', 'ngSanitize'])

.controller('LangSelectCtrl', ['$scope', function($scope) {
    $scope.newLang = '';
    $scope.showLangInput = false;

    var removeIntent = false;

    $scope.sortConfig = {
        placeholder: 'lang-sortable-placeholder',
        receive: function(e, ui) { removeIntent = false; },
        over: function(e, ui) { removeIntent = false; },
        out: function(e, ui) { removeIntent = true; },
        beforeStop: function(e, ui) {
            if (removeIntent === true) {
                var lang = ui.item.context.textContent;
                if(lang) {
                    lang = lang.trim();
                    var i = $scope.langs.indexOf(lang);
                    $scope.langs.splice(i, 1);
                    ui.item.remove();
                }
            }
        },
        stop: function() {
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };

    $scope.getLangSuggestions = function() {
        var obj = $scope.availableLangs;

        var result;
        if(!obj) {
            result = [];
        }
        else if(Array.isArray(obj)) {
            result = obj;
        }
        else if(obj instanceof Function) {
            result = obj();
        }
        else {
            result = [];
        }

        return result;
    };

    $scope.confirmAddLang = function(lang) {

        var i = $scope.langs.indexOf(lang);
        if(i < 0) {
            $scope.langs.push(lang);
        }
        $scope.showLangInput = false;
        $scope.newLang = '';
    };
}])

.directive('langSelect', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/lang-select/lang-select.html',
        scope: {
            langs: '=',
            availableLangs: '='
        },
        controller: 'LangSelectCtrl',
    };
})

;


angular.module('ui.jassa.list-search', [])

.controller('ListSearchCtrl', ['$scope', function($scope) {
    // Don't ask me why this assignment does not trigger a digest
    // if performed inline in the directive...
    $scope.setActiveSearchMode = function(searchMode) {
        $scope.activeSearchMode = searchMode;
    };
}])

.directive('listSearch', function() {
    return {
        restrict: 'EA',
        scope: {
            searchModes: '=',
            activeSearchMode: '=',
            ngModel: '=',
            onSubmit: '&submit'
        },
        controller: 'ListSearchCtrl',
        templateUrl: 'template/list-search/list-search.html'
    };
})

;


angular.module('ui.jassa.pointer-events-scroll-fix', [])

/**
 * Scrollbars on overflow divs with pointer-events: none are not clickable on chrome/chromium.
 * This directive sets pointer-events to auto when scrollbars are needed and thus assumed to be visible.
 *
 */
.directive('pointerEventsScrollFix', function() {
    return {
        restrict: 'A',
        //scope: 
        compile: function() {
            return {
                post: function(scope, elem, attrs) {

                    // TODO Registering (jQuery) plugins in a directive is actually an anti-pattern - either get rid of this or move the plugin to a common location
                    if(!jQuery.fn.hasScrollBar) {
                        jQuery.fn.hasScrollBar = function() {
                            var el = this.get(0);
                            if(!el) {
                                console.log('Should not happen');
                                return false;
                            }

                            var result = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
                            //console.log('Checked scrollbar state: ', result);
                            return result;
                        };
                    }
                    
                    var backup = null;
                    
                    scope.$watch(
                        function () { return jQuery(elem).hasScrollBar(); },
                        function (hasScrollBar) {
                            console.log('Scrollbar state: ', hasScrollBar, backup);
                            if(hasScrollBar) {
                                if(!backup) {
                                    backup = elem.css('pointer-events');
                                    elem.css('pointer-events', 'auto');
                                }
                            } else if(backup) {
                                elem.css('pointer-events', backup);
                                backup = null;
                            }
                        }
                    );
                }
            };
        }
    };
})

;


angular.module('ui.jassa.resizable', [])

/**
 *
 * <div resizable="resizableConfig" bounds="myBoundObject" on-resize-init="onResizeInit(bounds)" on-resize="onResize(evt, ui, bounds)" style="width: 50px; height: 50px;">
 *
 * On init, the the directive will invoke on-resize-init with the original css properties (not the computed values).
 * This allows resetting the size
 * Also, on init, the given bounds will be overridden, however, afterwards the directive will listen for changes
 */
.directive('resizable', function () {
    //var resizableConfig = {...};
    return {
        restrict: 'A',
        scope: {
            resizable: '=',
            onResize: '&onResize',
            onResizeInit: '&onResizeInit',
            bounds: '='
        },
        compile: function() {
            return {
                post: function(scope, elem, attrs) {
                    if(!scope.bounds) {
                        scope.bounds = {};
                    }

                    var isInitialized = false;

                    var onConfigChange = function(newConfig) {
                        //console.log('Setting config', newConfig);
                        if(isInitialized) {
                            jQuery(elem).resizable('destroy');
                        }

                        jQuery(elem).resizable(newConfig);
                        
                        isInitialized = true;
                    };
                    

                    var propNames = ['top', 'bottom', 'width', 'height'];
                    
                    var getCssPropMap = function(propNames) {
                        var data = elem.prop('style');
                        var result = _(data).pick(propNames);
                        
                        return result;
                    };
                    
                    var setCssPropMap = function(propMap) {
                        _(propMap).each(function(v, k) {
                            //console.log('css prop', k, v);
                            elem.css(k, v);
                        });
                    };

                    var bounds = getCssPropMap(propNames);
                    angular.copy(bounds, scope.bounds);
                    
                    if(scope.onResizeInit) {
                        scope.onResizeInit({
                            bounds: bounds
                        });
                    }
                    
                    var onBoundsChange = function(newBounds, oldBounds) {
                        //console.log('setting bounds', newBounds, oldBounds);
                        setCssPropMap(newBounds);
                    };
                    
                    scope.$watch('bounds', onBoundsChange, true);

                    jQuery(elem).on('resizestop', function (evt, ui) {
                        
                        var bounds = getCssPropMap(propNames);
                        angular.copy(bounds, scope.bounds);
                        //console.log('sigh', bounds);
                        
                        if (scope.onResize) {
                            scope.onResize(evt, ui, bounds);
                        }
                        
                        if(!scope.$$phase) {
                            scope.$apply();
                        }
                    });

                    scope.$watch('resizable', onConfigChange);
                    //onConfigChange(scope.resizable);
                }
            };
        }
    };
})

;



angular.module('ui.jassa.sparql-grid', [])

.controller('SparqlGridCtrl', ['$scope', '$rootScope', '$q', function($scope, $rootScope, $q) {

    var rdf = jassa.rdf;
    var sparql = jassa.sparql;
    var service = jassa.service;
    var util = jassa.util;
    var sponate = jassa.sponate;
    var facete = jassas.facete;
    
    var syncTableMod = function(sortInfo, tableMod) {
        
        var newSortConditions = [];
        for(var i = 0; i < sortInfo.fields.length; ++i) {
            var columnId = sortInfo.fields[i];
            var dir = sortInfo.directions[i];
            
            var d = 0;
            if(dir === 'asc') {
                d = 1;
            }
            else if(dir === 'desc') {
                d = -1;
            }
            
            if(d !== 0) {
                var sortCondition = new facete.SortCondition(columnId, d);
                newSortConditions.push(sortCondition);
            }
        }

        var oldSortConditions = tableMod.getSortConditions();
        
        var isTheSame = _(newSortConditions).isEqual(oldSortConditions);
        if(!isTheSame) {
            util.ArrayUtils.replace(oldSortConditions, newSortConditions);
        }

    };

    
    var createTableService = function() {
        var config = $scope.config;
        
        var sparqlService = $scope.sparqlService;
        var queryFactory = config ? config.queryFactory : null;
        
        var query = queryFactory ? queryFactory.createQuery() : null;
        
        var result = new service.SparqlTableService(sparqlService, query);
        
        return result;
    };


    
    $scope.$watch('gridOptions.sortInfo', function(sortInfo) {
        var config = $scope.config;

        var tableMod = config ? config.tableMod : null;

        if(tableMod != null) {
            syncTableMod(sortInfo, tableMod);
        }
        
        $scope.refreshData();
    }, true);


    $scope.$watch('[pagingOptions, filterOptions]', function (newVal, oldVal) {
        $scope.refreshData();
    }, true);
    
    var update = function() {
        $scope.refresh();
    };
    
    
    $scope.ObjectUtils = util.ObjectUtils;
    
    $scope.$watch('[ObjectUtils.hashCode(config), disableRequests]', function (newVal, oldVal) {
        update();
    }, true);
    
    $scope.$watch('sparqlService', function() {
        update();
    });
    
    
    $scope.totalServerItems = 0;
        
    $scope.pagingOptions = {
        pageSizes: [10, 50, 100],
        pageSize: 10,
        currentPage: 1
    };

    $scope.refresh = function() {
        var tableService = createTableService();

        if($scope.disableRequests) {
            util.ArrayUtils.clear($scope.myData);
            return;
        }
        

        $scope.refreshSchema(tableService);
        $scope.refreshPageCount(tableService);
        $scope.refreshData(tableService);
    };

    $scope.refreshSchema = function(tableService) {
        tableService = tableService || createTableService();

        var oldSchema = $scope.colDefs;
        var newSchema = tableService.getSchema();
        
        var isTheSame = _(newSchema).isEqual(oldSchema);
        if(!isTheSame) {
            $scope.colDefs = newSchema;
        }
    };

    $scope.refreshPageCount = function(tableService) {
        tableService = tableService || createTableService();
        
        var promise = tableService.fetchCount();

        jassa.sponate.angular.bridgePromise(promise, $q.defer(), $scope, function(countInfo) {
            // Note: There is also countInfo.hasMoreItems and countInfo.limit (limit where the count was cut off)
            $scope.totalServerItems = countInfo.count;
        });
    };
    
    $scope.refreshData = function(tableService) {
        tableService = tableService || createTableService();

        var page = $scope.pagingOptions.currentPage;
        var pageSize = $scope.pagingOptions.pageSize;
        
        var offset = (page - 1) * pageSize;

        
        var promise = tableService.fetchData(pageSize, offset);

        jassa.sponate.angular.bridgePromise(promise, $q.defer(), $scope, function(data) {
            var isTheSame = _(data).isEqual($scope.myData);
            if(!isTheSame) {
                $scope.myData = data;
            }
            //util.ArrayUtils.replace($scope.myData, data);
            
            // Using equals gives digest iterations exceeded errors; could be https://github.com/angular-ui/ng-grid/issues/873
            //$scope.myData = data;
        });
    };

        
    var plugins = [];
    
    if(ngGridFlexibleHeightPlugin) {
        // js-hint will complain on lower case ctor call
        var PluginCtor = ngGridFlexibleHeightPlugin;
        
        plugins.push(new PluginCtor(30));
    }
    
    $scope.myData = [];
    
    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        useExternalSorting: true,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        enableHighlighting: true,
        sortInfo: {
            fields: [],
            directions: [],
            columns: []
        },
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        plugins: plugins,
        columnDefs: 'colDefs'
    };

    

    //$scope.refresh();
}])


/**
 * 
 * 
 * config: {
 *     queryFactory: qf,
 *     tableMod: tm
 * }
 * 
 */
.directive('sparqlGrid', ['$parse', function($parse) {
    return {
        restrict: 'EA', // says that this directive is only for html elements
        replace: true,
        //template: '<div></div>',
        templateUrl: 'template/sparql-grid/sparql-grid.html',
        controller: 'SparqlGridCtrl',
        scope: {
            sparqlService: '=',
            config: '=',
            disableRequests: '=',
            onSelect: '&select',
            onUnselect: '&unselect'
        },
        link: function (scope, element, attrs) {
            
        }
    };
}])

;
    
/*    
var createQueryCountQuery = function(query, outputVar) {
    //TODO Deterimine whether a sub query is needed
    var result = new sparql.Query();
    var e = new sparql.ElementSubQuery(query);
    result.getElements().push(e);
    result.getProjectVars().add(outputVar, new sparql.E_Count());
    
    return result;
};
*/

angular.module('ui.jassa.template-list', [])

/**
 *
 */
.controller('TemplateListCtrl', ['$scope', function($scope) {
}])

/**
 *
 */
.directive('templateList', ['$compile', function($compile) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/template-list/template-list.html',
        transclude: true,
        //require: 'templateList',
        scope: {
            templates: '=',
            data: '=',
            context: '='
        },
        controller: 'TemplateListCtrl',
        compile: function() {
            return {
                pre: function(scope, elm, attrs) {
                    angular.forEach(scope.templates, function(template) {
                        var li = $compile('<li style="display: inline;"></li>')(scope);
                        
                        var element = $compile(template)(scope);
                        li.append(element);
                        
                        elm.append(li);
                    });
                }
            };
        }
    };
}])

;
