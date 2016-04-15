(function() {
    'use strict';

    angular
        .module('mdPickers')
        .factory('mdpDatePickerService', mdpDatePickerService);

    /** @ngInject */
    function mdpDatePickerService() {

        var service = {
            formatValidator: formatValidator,
            minDateValidator: minDateValidator,
            maxDateValidator: maxDateValidator,
            filterValidator: filterValidator
        };

        return service;

        function formatValidator(value, format) {
            var notVal = !value, isDate=angular.isDate(value), isValid=moment(value, format).isValid();
            return notVal || isDate || isValid;
        }

        function minDateValidator(value, format, minDate) {
            //debugger;
            if (minDate) {
                minDate = moment(minDate);
                var date = angular.isDate(value) ? moment(value) : moment(value, format);
                
                var notVal = !value, isDate = angular.isDate(value), minDateValid = !minDate.isValid(), isAfter = date.isAfter(minDate) || date.isSame(minDate);
                
                return notVal || isDate || minDateValid || isAfter;
            }
        
            return true;
        }

        function maxDateValidator(value, format, maxDate) {
            if (maxDate) {
                maxDate = moment(maxDate);
                var date = angular.isDate(value) ? moment(value) : moment(value, format);

                var notVal = !value, isDate = angular.isDate(value), maxDateValid = !maxDate.isValid(), isBefore = date.isBefore(maxDate);
                return notVal || isDate || maxDateValid || isBefore;
            }
            return true;
        }

        function filterValidator(value, format, filter) {
            if (filter) {
                var date = angular.isDate(value) ? moment(value) : moment(value, format);
                var notVal = !value, isDate=angular.isDate(value), notFunction=!angular.isFunction(filter), notFilter=!filter(date);
                return notVal || isDate || notFunction || notFilter;
            }
            return true;
        }

    }
})();
