angular.module('luegg.directives', [])

// Adapted version from https://github.com/Luegg/angularjs-scroll-glue/blob/master/src/scrollglue.js
.directive('scrollGlue', ['$parse', '$timeout', function($parse, $timeout) {
    function unboundState(initValue){
        var activated = initValue;
        return {
            getValue: function(){
                return activated;
            },
            setValue: function(value){
                activated = value;
            }
        };
    }

    function oneWayBindingState(getter, scope){
        return {
            getValue: function(){
                return getter(scope);
            },
            setValue: function(){}
        }
    }

    function twoWayBindingState(getter, setter, scope){
        return {
            getValue: function(){
                return getter(scope);
            },
            setValue: function(value){
                if(value !== getter(scope)){
                    scope.$apply(function(){
                        setter(scope, value);
                    });
                }
            }
        };
    }

    function createActivationState(attr, scope){
        if(attr !== ""){
            var getter = $parse(attr);
            if(getter.assign !== undefined){
                return twoWayBindingState(getter, getter.assign, scope);
            } else {
                return oneWayBindingState(getter, scope);
            }
        } else {
            return unboundState(true);
        }
    }

    return {
        priority: 1,
        restrict: 'A',
        link: function(scope, $el, attrs){
            var el = $el[0],
                activationState = createActivationState(attrs.scrollGlue, scope);

            function scrollToBottom(){
                el.scrollTop = el.scrollHeight;
            }

            function scrollToRight(){
                el.scrollLeft = el.scrollWidth;
            }

            function onScopeChanges(scope){
                if(activationState.getValue() && !shouldActivateAutoScroll()){
                    //scrollToBottom();
                    //$timeout(scrollToRight, 50);
                    scrollToRight();
                }
            }

            function shouldActivateAutoScroll(){
                // + 1 catches off by one errors in chrome
                //return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
                var result = el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
                return result;
            }

            function onScroll(){
                activationState.setValue(shouldActivateAutoScroll());
            }

            scope.$watch(function() {
                return el.clientWidth;
            }, function(w) {
                console.log('client width: ', w, el.scrollWidth);
                onScopeChanges();
            });

            scope.$watch(onScopeChanges);
            $el.bind('scroll', onScroll);
        }
    };
}])

;
