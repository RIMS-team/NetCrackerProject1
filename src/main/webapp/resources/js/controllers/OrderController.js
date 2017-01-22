/**
 * Created by Elina on 11.01.2017.
 */
'use strict';

/**
 * OrderController
 * @constructor
 */

// var OrderController = function($scope, $http) {
//
//     $scope.fetchOrderList = function() {
//         $http.get('order/all').success(function(orderList){
//             $scope.order = orderList;
//         });
//     };
//
//     $scope.fetchOrderList();
// };


(function () {
    var app = angular.module("orders", ["ngSanitize","angularUtils.directives.dirPagination", "ui.bootstrap", "ui.grid",
        "ui.grid.selection", "ui.select", "ui.grid.autoResize", "ordstatuses"]);
    //////    var app = angular.module("orders", []);

        app.service('ordEditService', ordEditService);

        app.controller("OrderController", function ($scope, $http, $uibModal, ordStatusService, getByIdService, ordListService) {
        var _this = this;

        $scope.editRecord = {};
        $scope.ordStatuses = [];
        $scope.ordInventoryNums = [];
        $scope.ordEmployees = [];
        $scope.ordUsers = [];

        // _this.isRowSelected = false;
        // _this.maxSize = 5;
        // _this.totalPages = 1;
        // _this.size = 22;
        // _this.totalElements = 0;
        // _this.currentPage = 1;
        // _this.sort = null;
        // _this.isLast = false;
        // _this.elementsOnPage = 0;
        //
        // $scope.items = [];

        $scope.loadData = function() {
            $http.get('order/all').success(function(orderList){
                $scope.orders = orderList;
            });

            ordListService.loadInvList()
                .success(function(invList){
                    $scope.ordInventoryNums = ordListService.getInvList();
                }).error(function () {
                $scope.ordInventoryNums = ordListService.getInvList();
            });
        };

        $scope.checkInvType = function (order) {
            if (order.inventoryType == 'Карта')
                return true;
            else
                return false;
        };

        $scope.updateOrder = function (editRec) {
            editRec.date = editRec.date.value;
            editRec.statusId = editRec.selectedStatus.id;
            editRec.inventoryId = editRec.selectedInv.id;
            editRec.inventoryNum = editRec.selectedInv.inventoryNum;
            editRec.employeeId = editRec.selectedEmp.id;
            editRec.userId = editRec.selectedUser.id;
            $http.post('order/update', editRec).success(function () {
                $scope.loadData();
            }).error(function () {
                console.log("Error sending update request!");
            });
        };

        $scope.addNewOrder = function (editRec) {
            editRec.date = editRec.date.value;
            editRec.statusId = editRec.selectedStatus.id;
            editRec.inventoryId = editRec.selectedInv.id;
            editRec.inventoryNum = editRec.selectedInv.inventoryNum;
            editRec.employeeId = editRec.selectedEmp.id;
            editRec.userId = editRec.selectedUser.id;
            $http.post('order/add', editRec).success(function () {
                $scope.loadData();
            }).error(function () {
                console.log("Error sending insert request!");
            });
        };

        $scope.removeOrder = function (id) {
            $http.delete('order/remove/' + id).success(function () {
                $scope.loadData();
                // $scope.editRecord.id = '';
                // $scope.editRecord.statusId = '';
                // $scope.editRecord.statusName = '';
                // $scope.editRecord.inventoryNum = '';
            });
        };

        $scope.sort = function (keyname) {
            $scope.sortKey=keyname;
            $scope.reverse=!$scope.reverse;
        };

        $scope.loadData();

        _this.openEditor = function (order) {
            var editRec = {};
            if (order) {
                editRec.id = order.id;
                // editRec.date5 = $filter('date')(new Date(),'yyyy-MM-dd');
                editRec.date = {value: new Date(order.date)};
                editRec.statusId = order.statusId;
                editRec.selectedStatus = getByIdService.getById(order.statusId, $scope.ordStatuses);
                editRec.inventoryId = order.inventoryId;
                //editRec.inventoryNum = order.inventoryNum;
                editRec.selectedInv = getByIdService.getById(order.inventoryId, $scope.ordInventoryNums);
                editRec.employeeId = order.employeeId;
                editRec.selectedEmp = getByIdService.getById(order.employeeId, $scope.ordEmployees);
                editRec.userId = order.userId;
                editRec.selectedUser = getByIdService.getById(order.userId, $scope.ordUsers);
            }
            else {
                var expDate = new Date();
                expDate.setDate(expDate.getDate() + 1);
                editRec.date = {value: expDate};
                editRec.selectedStatus = getByIdService.getById(5, $scope.ordStatuses); // ISSUED (Открыт)
                $http.get('/user/getAuthorizedUser').success(function(user){
                    editRec.selectedUser = getByIdService.getById(user.id, $scope.ordUsers);
                });
            }

            var uibModalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'updateOrder.html',
           //     templateUrl: 'ttt.html',
                controller: 'OrderEditController'
                ,resolve: {
                    ordStatuses: function () {
                        return $scope.ordStatuses;
                    },
                    ordInventoryNums: function () {
                        return $scope.ordInventoryNums;
                    },
                    ordEmployees: function () {
                        return $scope.ordEmployees;
                    },
                    ordUsers: function () {
                        return $scope.ordUsers;
                    },
                    editRecord: function () {
                        return editRec;
                    }
                }
            });

            uibModalInstance.result.then(function (editRec) {
                //modal ok
                if (order) {
                    $scope.updateOrder(editRec);
                }
                else {
                    $scope.addNewOrder(editRec);
                }
            }, function () {
                // modal cancel
            });
        };

        $scope.openUpdateEditor = function (order) {
            _this.openEditor(order);
        };

        $scope.openInsertEditor = function () {
            _this.openEditor(null);
        };

        ordStatusService.loadList()
            .success(function(OrdStatusList){
                $scope.ordStatuses = ordStatusService.getList();
            }).error(function () {
            $scope.ordStatuses = ordStatusService.getList();
        });

        // ordListService.loadInvList()
        //     .success(function(invList){
        //         $scope.ordInventoryNums = ordListService.getInvList();
        //     }).error(function () {
        //     $scope.ordInventoryNums = ordListService.getInvList();
        // });

        ordListService.loadEmpList()
            .success(function(empList){
                $scope.ordEmployees = ordListService.getEmpList();
            }).error(function () {
            $scope.ordEmployees = ordListService.getEmpList();
        });

        ordListService.loadUserList()
            .success(function(userList){
                $scope.ordUsers = ordListService.getUserList();
            }).error(function () {
            $scope.ordUsers = ordListService.getUserList();
        });
    });

    app.controller('OrderEditController',
        ['$scope','$uibModalInstance', 'editRecord', 'ordStatuses', 'ordInventoryNums', 'ordEmployees', 'ordUsers',
        function ($scope, uibModalInstance, editRec, ordStatuses, ordInventoryNums, ordEmployees, ordUsers) {

        $scope.editRecord = editRec;
        $scope.ordStatuses = ordStatuses;
        $scope.ordInventoryNums = ordInventoryNums;
        $scope.ordEmployees = ordEmployees;
        $scope.ordUsers = ordUsers;

        $scope.ok = function () {
            // if (validation)
            uibModalInstance.close($scope.editRecord);
            // else
            //   show error msg
        };

        $scope.close = function () {
            uibModalInstance.dismiss('cancel');
        };
    }]);
    
    app.directive("ordersList", function () {
        return {
            //restrict: "E",
            templateUrl: "order/layout.html"
        }
    });

})();