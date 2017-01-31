/**
 * Created by Elina on 11.01.2017.
 */
'use strict';

/**
 * OrderController
 * @constructor
 */



(function () {
    var app = angular.module("orders", ["ngSanitize","angularUtils.directives.dirPagination", "ui.bootstrap" ,   "ordstatuses" ]);


    app.controller("OrderController", function ($scope, $http, $uibModal ,  ordStatusService, getByIdService, ordListService) {
        var _this = this;
        $scope.pageSize;
        $scope.names = [5,10,25,50,100];
        $scope.selectedName=5;

        $scope.editRecord = {};
        $scope.ordStatuses = [];
        $scope.ordInventoryNums = [];
        $scope.ordEmployees = [];
        $scope.ordUsers = [];

        $scope.sort = function (keyname) {
            $scope.sortKey=keyname;
            $scope.reverse=!$scope.reverse;
        };

        $scope.isSortKey = function(keyname) {
            return $scope.sortKey == keyname;
        };

        $scope.startsWith = function (actual, expected) {
            var lowerStr = (actual + "").toLowerCase();
            return lowerStr.indexOf(expected.toLowerCase()) === 0;
        };


//================
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
            if (order.inventoryType == 'Card')
                return true;
            else
                return false;
        };

        $scope.updateOrder = function (editRec) {
            // console.log("updateOrder");
            // console.log(editRec);
            // debugger;

            editRec.date = editRec.date.value;
            editRec.statusId = editRec.selectedStatus.id;
            editRec.inventoryId = editRec.selectedInv.id;
            editRec.inventoryNum = editRec.selectedInv.inventoryNum;
            editRec.employeeId = editRec.selectedEmp.id;
            // editRec.userId = editRec.selectedUser.id;
            editRec.userId = $scope.curUser.id;
            $http.post('order/update', editRec).success(function (error) {
                $scope.loadData();
                if(error.id_num != 0) {
                    alert(error.error_m);
                }
            }).error(function () {
                console.log("Error sending update request!");
            });
        };

        $scope.addNewOrder = function (editRec) {
            // console.log("addNewOrder");
            // console.log(editRec);
            // debugger;

            editRec.date = editRec.date.value;
            // editRec.statusId = editRec.selectedStatus.id;
            editRec.statusId = 5;  // ISSUED (Открыт)
            editRec.inventoryId = editRec.selectedInv.id;
            editRec.inventoryNum = editRec.selectedInv.inventoryNum;
            editRec.employeeId = editRec.selectedEmp.id;
            // editRec.userId = editRec.selectedUser.id;
            editRec.userId = editRec.userId;
            $http.post('order/add', editRec).success(function (error) {
                $scope.loadData();
                if(error.id_num != 0) {
                    alert(error.error_m);
                }
            }).error(function () {
                console.log("Error sending insert request!");
            });
        };

        $scope.removeOrder = function (id) {
            // console.log("removeOrder");
            // console.log(id);
            // debugger;

            $http.delete('order/remove/' + id).success(function (error) {
                $scope.loadData();
                if(error.id_num != 0) {
                    alert(error.error_m);
                }
            });
        };

        $scope.loadData();

        _this.openEditor = function (order) {
            var editRec = {};
            if (order) {
                editRec.id = order.id;
                // editRec.date5 = $filter('date')(new Date(),'yyyy-MM-dd');
                editRec.openDate = {value: new Date(order.createDate)};
                editRec.date = {value: new Date(order.date)};
                editRec.statusId = order.statusId;
                editRec.selectedStatus = getByIdService.getById(order.statusId, $scope.ordStatuses);
                editRec.inventoryId = order.inventoryId;
                //editRec.inventoryNum = order.inventoryNum;
                editRec.selectedInv = getByIdService.getById(order.inventoryId, $scope.ordInventoryNums);
                editRec.employeeId = order.employeeId;
                editRec.selectedEmp = getByIdService.getById(order.employeeId, $scope.ordEmployees);
                editRec.userId = order.userId;
                // editRec.selectedUser = getByIdService.getById(order.userId, $scope.ordUsers);
                editRec.user = order.userFullName;
                editRec.editorId = order.editorId;
                editRec.editor = order.editorFullName;
            }
            else {
                editRec.openDate = {value: new Date()};
                var expDate = new Date();
                expDate.setDate(expDate.getDate() + 1);
                editRec.date = {value: expDate};
                //editRec.selectedStatus = getByIdService.getById(5, $scope.ordStatuses); // ISSUED (Открыт)
                // $http.get('/user/getAuthorizedUser').success(function(user){
                //     // editRec.selectedUser = getByIdService.getById(user.id, $scope.ordUsers);
                //     editRec.userId = user.id;
                //     editRec.user = user.fullName;
                //
                // });
                editRec.userId = $scope.curUser.id;
                editRec.user = $scope.curUser.fullName;
            }

            var uibModalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'updateOrder.html',
                controller: 'OrderEditController',
                resolve: {
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

            uibModalInstance.rendered.then(function(){
                $("#inventoryn").chosen();
                $("#inventory").chosen();
                $("#employee").chosen();
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