(function() {
    'use strict';

    angular
        .module('mdPickers')
        .directive('mdpTimePicker', mdpTimePicker);

    /** @ngInject */
    function mdpTimePicker($mdpTimePicker, $timeout) {
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            transclude: true,
            template: function(element, attrs) {
                var noFloat = angular.isDefined(attrs.mdpNoFloat),
                    placeholder = angular.isDefined(attrs.mdpPlaceholder) ? attrs.mdpPlaceholder : "",
                    openOnClick = angular.isDefined(attrs.mdpOpenOnClick) ? true : false;

                var mask = '';
                if (attrs.mdpMask === 'true') {
                    mask = attrs.mdpFormat;
                    if (!attrs.mdpFormat) {
                        mask = '29:59';
                    } else {
                        mask = mask.replace('HH', '29');
                        mask = mask.replace('mm', '59');
                        mask = mask.replace('ss', '59');
                    }
                    mask = ' mask="' + mask + '" restrict="reject"'
                }

                return '<div layout layout-align="start start">' +
                    '<md-button ng-disabled="disabled" class="md-icon-button" ng-click="showPicker($event)">' +
                    '<md-icon md-svg-icon="mdp-access-time"></md-icon>' +
                    '</md-button>' +
                    '<md-input-container flex' + (noFloat ? ' md-no-float' : '') + ' md-is-error="isError()">' +
                    '<input ng-disabled="disabled"' + mask + ' ng-model="strValue" type="{{ ::type }}" aria-label="' + placeholder + '" placeholder="' + placeholder + '"' + (openOnClick ? ' ng-click="showPicker($event)" ' : '') + ' />' +
                    '</md-input-container>' +
                    '</div>';
            },
            scope: {
                'timeFormat': '@mdpFormat',
                'placeholder': '@mdpPlaceholder',
                'autoSwitch': '=?mdpAutoSwitch',
                'disabled': '=?mdpDisabled',
                'mdpMask': '=',
                'mdpModel': '=mdpModel',
                'parentMinTime': '=mdpParentMinTime',
                'minTime': '=mdpMinTime'
                            },
            link: linkFn
        };

        return directive;

        function linkFn(scope, element, attrs, ngModel, $transclude) {
            var inputElement = angular.element(element[0].querySelector('input')),
                inputContainer = angular.element(element[0].querySelector('md-input-container')),
                inputContainerCtrl = inputContainer.controller('mdInputContainer');

            $transclude(function(clone) {
                inputContainer.append(clone);
            });

            var messages = angular.element(inputContainer[0].querySelector('[ng-messages]'));

            scope.type = 'text';
            scope.timeFormat = scope.timeFormat || 'HH:mm';
            scope.autoSwitch = scope.autoSwitch || false;
            //scope.resetFormat = scope.timeFormat.replace(/\w/g, '0');

            if (!angular.isDefined(scope.disabled)) {
                scope.disabled = attrs.hasOwnProperty('mdpDisabled');
            }

        /*scope.$watch(function() {
                return ngModel.$error;
            }, function(newValue, oldValue) {
                inputContainerCtrl.setInvalid(!ngModel.$pristine && !!Object.keys(ngModel.$error).length);
            }, true);*/

            // update input element if model has changed
            ngModel.$formatters.unshift(function(value) {
                var time = angular.isDate(value) && moment(value);
                if (time && time.isValid()) {
                    updateInputElement(time.format(scope.timeFormat));
                } else {
                    updateInputElement('');
                }
            });

            ngModel.$validators.format = function(modelValue, viewValue) {
                return !viewValue || angular.isDate(viewValue) || moment(viewValue, scope.timeFormat, true).isValid();
            };


            ngModel.$parsers.unshift(function(value) {
                var parsed = moment(value, scope.timeFormat, true);
                if (parsed.isValid()) {
                    if (angular.isDate(ngModel.$modelValue)) {
                        var originalModel = moment(ngModel.$modelValue);
                        originalModel.minutes(parsed.minutes());
                        originalModel.hours(parsed.hours());
                        originalModel.seconds(parsed.seconds());

                        parsed = originalModel;
                    }
                    return parsed.toDate();
                } else
                    if(angular.isDate(ngModel.$modelValue)){
                        return ngModel.$modelValue;
                    }

            });

            // update input element value
            function updateInputElement(value) {
                if (value) {
                    inputElement[0].size = value.length + 1;
                    inputElement[0].value = value;
                } else {
                    inputElement[0].value = '';
                }
                inputContainerCtrl.setHasValue(!ngModel.$isEmpty(value));
            }

            function updateTime(time) {
                var value = moment(time, angular.isDate(time) ? null : scope.timeFormat, true),
                    strValue = value.format(scope.timeFormat);
                
                if (value.isValid()) {
                    updateInputElement(strValue);
                    ngModel.$setViewValue(strValue);
                } else {
                    // updateInputElement(time);
                    // ngModel.$setViewValue(scope.resetFormat);
                }

                if (!ngModel.$pristine &&
                    messages.hasClass('md-auto-hide') &&
                    inputContainer.hasClass('md-input-invalid')) messages.removeClass('md-auto-hide');

                ngModel.$render();
            }

            scope.$watch('mdpModel', function(newVal, oldVal, scope){
               
               if(newVal && oldVal){
                    newVal = moment(newVal);
                    oldVal = moment(oldVal);
                    if(newVal.isAfter(oldVal) || newVal.isBefore(oldVal)){
                        
                        if(scope.minTime){
                            var minTime = moment(scope.minTime);
                            var afterTime = moment(scope.mdpModel);
                            if((minTime.isAfter(afterTime) || minTime.isAfter(afterTime))&& minTime.startOf('days').isSame(afterTime.startOf('days')))
                            {
                                inputContainerCtrl.setInvalid(true);
                            }
                            else{
                                inputContainerCtrl.setInvalid(false);
                            }
                        }
                        else{
                            inputContainerCtrl.setInvalid(false);
                        }
                    }
                    else{
                        if(scope.minTime){
                            var minTime = moment(scope.minTime);
                            var afterTime = moment(scope.mdpModel);
                            if((minTime.isAfter(afterTime) || minTime.isAfter(afterTime)) && minTime.startOf('days').isSame(afterTime.startOf('days')))
                            {
                                inputContainerCtrl.setInvalid(true);
                            }
                            else{
                                inputContainerCtrl.setInvalid(false);
                            }
                        }
                        else{
                            inputContainerCtrl.setInvalid(false);
                        }
                    }
                }

                if(newVal && !oldVal){
                    if(scope.minTime){
                            var minTime = moment(scope.minTime);
                            var afterTime = moment(scope.mdpModel);
                            if((minTime.isAfter(afterTime) || minTime.isSame(afterTime)) && minTime.startOf('days').isSame(afterTime.startOf('days')))
                            {
                               inputContainerCtrl.setInvalid(true);
                            }
                        }
                        else{
                            inputContainerCtrl.setInvalid(false);
                        }
                }

                if(!newVal){
                    inputContainerCtrl.setInvalid(true);
                }
            });

           scope.$watch('minTime', function(newVal, oldVal, scope){
                
                if(newVal && oldVal){
                    newVal = moment(newVal);
                    oldVal = moment(oldVal);
                    if(newVal.isAfter(oldVal) || newVal.isBefore(oldVal)){
                        
                        var minTime = moment(scope.minTime);
                        var afterTime = moment(scope.mdpModel);
                        if((minTime.isAfter(afterTime) || minTime.isSame(afterTime)) && minTime.startOf('days').isSame(afterTime.startOf('days')))
                        {
                            inputContainerCtrl.setInvalid(true);
                        }
                        else{
                            inputContainerCtrl.setInvalid(false);
                        }
                    }
                }
                if(newVal && !oldVal){
                    if(scope.minTime){
                        var minTime = moment(scope.minTime);
                        var afterTime = moment(scope.mdpModel);
                        if((minTime.isAfter(afterTime) || minTime.isSame(afterTime)) && minTime.startOf('days').isSame(afterTime.startOf('days')))
                        {
                            inputContainerCtrl.setInvalid(true);
                        }
                    }
                }
            });

            if (scope.mdpModel) {
                var value = moment(scope.mdpModel, angular.isDate(scope.mdpModel) ? null : scope.timeFormat, true);
                scope.strValue = value.format(scope.timeFormat);
            }

            scope.showPicker = function(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    minTime: scope.minTime,
                    targetEvent: ev,
                    autoSwitch: scope.autoSwitch
                }).then(function(time) {
                    updateTime(time, true);
                });
            };

            function onInputElementEvents(event) {
                if (event.target.value !== ngModel.$viewVaue)
                    updateTime(event.target.value);
            }

            inputElement.on('reset input blur', onInputElementEvents);

            scope.$on('$destroy', function() {
                inputElement.off('reset input blur', onInputElementEvents);
            });
        }
    }

})();
