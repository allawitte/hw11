'use strict';
(function () {
    angular.module('app', [])
        .controller('mainCtrl', mainController);
    function mainController($http) {
        var vm = this;
        var limit = 3;
        var offset = 0;
        var current = 1;
        vm.db = [];
        vm.view = [];
        vm.user = {};
        vm.addContact = addContact;
        vm.field = '';
        vm.delete = del;
        vm.update = update;
        vm.delAll = delAll;
        vm.search = search;

        var getUsers = function (field) {

            $http.get('/contacts').success(function (res) {
                vm.db = res;
                console.log(res);
                res.forEach(function (item) {
                    vm.view.push(true);
                });
            })
                .error(function (data, status) {
                    console.error('Get all users error', status, data);
                });
        };

        function search() {
            console.log('field: ',vm.find);
            var searchStr ='';
            for (var key in vm.find) {
                if(vm.find[key]) {
                    searchStr += "&"+key+'='+vm.find[key];
                }
            }
            searchStr = searchStr.substring(1);
            if (searchStr.length > 1) {
                searchStr = '?'+searchStr;
            }
            console.log('searchStr: ', searchStr);
            $http.get('/search'+searchStr).success(function (res) {
                vm.db = res;
                console.log(res);
                res.forEach(function (item) {
                    vm.view.push(true);
                });
            })
                .error(function (data, status) {
                    console.error('Find contacts error', status, data);
                });
        }


        function delAll() {
            $http.delete('deleteall').success(function (res) {
                vm.db = [];
            })
                .error(function (data, status) {
                    console.error('Delete all users error', status, data);
                })
        }

        function update(id) {
            var ind = null;
            vm.db.forEach(function (item, index) {
                if (item._id == id) {
                    ind = index;
                }
            });
            if (ind == null) {
                console.log('User does not exist');
                return;
            }
            console.log('saving updates...');
            $http.put('/edit/' + id, vm.db[ind])
                .success(function (res) {
                    console.log(res);
                    vm.view[ind] = true;
                    vm.user = {};
                })
                .error(function (data, status) {
                    console.error('Update error', status, data);
                });
        }

        function addContact() {
            console.log(vm.user);
            $http.post('/add', vm.user)
                .success(function (res) {
                    console.log(res);
                    vm.db.push(vm.user);
                    vm.view.push(true);
                    vm.user = {};
                })
                .error(function (data, status) {
                    console.error('Add User error', status, data);
                });
        }

        function del(id) {
            var ind = null;
            vm.db.forEach(function (item, index) {
                if (item._id == id) {
                    ind = index;
                }
            });
            if (ind == null) {
                console.log('User does not exist');
                return;
            }
            console.log('deleting user...');
            $http.delete('delete/' + id)
                .success(function (res) {
                    console.log(res);
                    vm.db.splice(ind, 1);
                    vm.view.splice(ind, 1);
                })
                .error(function (data, status) {
                    console.error('Delete user error', status, data);
                });
        }


        getUsers();


    }
})();
/**
 * Created by HP on 11/1/2016.
 */
