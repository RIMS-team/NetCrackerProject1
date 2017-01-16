/**
 * Created by barmin on 12.01.2017.
 */
'use strict';

/**
 * InvStatusController
 * @constructor
 */

(function () {
    var modul = angular.module("invstatuses", ["ngSanitize", "ui.bootstrap", "ui.grid", "ui.grid.selection", "ui.select", "ui.grid.autoResize"]);

    modul.controller("InvStatusController", function ($scope, $http, $modal, invStatusService) {
        var _this = this;

        invStatusService.loadList()
            .success(function(InvStatusList){
                $scope.invStats = invStatusService.getList();
            }).error(function () {
                $scope.invStats = invStatusService.getList();
            });
    });

    modul.directive("invstatusesList", function () {
        return {
            templateUrl: "invstats/layout.html"
        }
    });

})();


// var InvStatusController = function($scope, $http) {
//     $scope.fetchInvStatusList = function() {
//         $http.get('invstats/invstatlist.json').success(function(InvStatusList){
//             $scope.invStats = InvStatusList;
//         });
//     };
//
//     $scope.fetchInvStatusList();
// };