(function () {
    "use strict";
    var app = angular.module('BlakWealth');

    app.directive('mentionDirective', mentionDirective);
    mentionDirective.$inject = ['atMentionsService'];

    function mentionDirective(atMentionsService) {

        var searchStr;

        directiveController.$inject = ['$scope', '$element', '$attrs', '$timeout'];
        function directiveController($scope, $element, $attrs, $timeout) {

            var vm = this;

            $($attrs.mentionDirective).on('keyup', findSearchStr);
            $($attrs.mentionDirective).on('click', findSearchStr);

            function findSearchStr(e) {

                var cursorPos = $($attrs.mentionDirective)[0].selectionStart;

                var searchStrLeft = "";
                var searchStrRight = "";
                var loadList = false;
                var loaduser = false;

                if (cursorPos > 0) {

                    if (cursorPos < $scope.inputvalue.length) {

                        for (var i = cursorPos; i < $scope.inputvalue.length; i++) {
                            if ($scope.inputvalue[i] === " ") {
                                break;
                            }

                            searchStrRight += $scope.inputvalue[i];
                        }
                    }

                    for (var i = cursorPos - 1; i >= 0; i--) {

                        if (($scope.inputvalue[i] === "@" && $scope.inputvalue[i - 1] === " ") || ($scope.inputvalue[i] === "@" && i === 0)) {

                            if (searchStrLeft.length === 0) {

                                loaduser = true;
                                loadList = true;
                            }

                            break;
                        } else if ($scope.inputvalue[i] === " " || $scope.inputvalue[i] === undefined) {
                            searchStrLeft = "";
                            searchStrRight = "";
                            break;
                        } else if (i === 0) {
                            searchStrLeft = "";
                            searchStrRight = "";
                            break;
                        }

                        searchStrLeft += $scope.inputvalue[i];
                    }
                }

                searchStrLeft = searchStrLeft.split("").reverse().join("");

                if (($scope.searchStr !== searchStrLeft + searchStrRight) || loaduser) {

                    $scope.searchStr = searchStrLeft + searchStrRight;

                    if ($scope.searchStr.length > 0 || loaduser) {
                        atMentionsService.getAllUser($scope.searchStr).then(getAllSuccess, getAllError);
                    }
                }

                $scope.$apply(function () {

                    if ($scope.searchStr.length > 0 || loaduser) {
                        $timeout(function () {
                            $scope.showList = true;
                        });

                        loaduser = false;

                    } else {

                        $timeout(function () {
                            $scope.showList = false;
                        });

                    }
                });

                function getAllSuccess(response) {

                    if (!response.data) {
                        $scope.showList = false;
                        $scope.userData = null;
                    } else {
                        $scope.showList = true;
                        $scope.userData = response.data;
                    }
                }

                function getAllError() {
                    console.log("getAllError");
                }

            };

            $scope.chooseItem = function (x) {

                $scope.str1 = "";
                $scope.str2 = "";
                var index1 = 0;
                var index2 = 0;

                var cursorPos = $($attrs.mentionDirective)[0].selectionStart;
                for (var i = cursorPos - 1; i >= 0; i--) {
                    if ($scope.inputvalue[i] == "@") {
                        index1 = i;
                        for (var j = 0; j <= index1; j++) {
                            $scope.str1 += $scope.inputvalue[j];
                        }
                        break;
                    }
                }

                if (cursorPos < $scope.inputvalue.length) {

                    for (var k = cursorPos; k <= $scope.inputvalue.length; k++) {
                        if ($scope.inputvalue[k] == " " || $scope.inputvalue[k] == "") {
                            index2 = k;
                            for (var l = index2; l < $scope.inputvalue.length; l++) {
                                $scope.str2 += $scope.inputvalue[l];
                            }
                            break;
                        }

                    }
                }
                else {
                    $scope.str2 = "";
                }

                $($attrs.mentionDirective).focus();
                $scope.inputvalue = $scope.str1 + x.userName + $scope.str2;

                $timeout(function () {
                    $($attrs.mentionDirective)[0].selectionStart = index1 + x.userName.length + 1;
                    $($attrs.mentionDirective)[0].selectionEnd = index1 + x.userName.length + 1;
                });
            }
        }

        return {
            restrict: 'EA',
            replace: true,
            scope: {
                inputvalue: '=',
                userData: '@'
            },
            templateUrl: 'mentions-functionality/mentionsFunctionality.html',
            controller: directiveController
        }
    }

    app.service('atMentionsService', atMentionsService);
    atMentionsService.$inject = ['$http'];
    function atMentionsService($http) {
        this.getAllUser = function (searchStr) {
            var settings = {
                url: '/api/atmentions/search?search=' + encodeURIComponent(searchStr),
                method: 'GET',
                cache: false,
                responseType: 'json'
            };

            return $http(settings);
        }
    }
})();