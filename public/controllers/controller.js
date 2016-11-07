'use strict';
(function() {
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
        vm.addUser = addUser;
        vm.field = '';
        vm.delete = del;
        vm.save = save;
        vm.prevPage = prevPage;
        vm.nextPage = nextPage;
        vm.delAll = delAll;
        vm.search = search;

        var getUsers = function (field) {
            if (field === undefined) {
                field = '';
            }
            $http.get('/users?limit='+limit+'&offset='+offset+'&field='+field).success(function (res) {
                vm.db = res;
                res.forEach(function(item){
                    vm.view.push(true);
                });
            })
                .error(function(data, status) {
                    console.error('Get all users error', status, data);
                });
        };

        function search(field) {
            console.log('field: ', field);
            getUsers(field);
        }

        function nextPage() {
            offset = limit*current;
            current++;
            getUsers();
        }

        function prevPage() {
            current--;
            current = current < 0 ? 0 : current;
            console.log(current);
            offset = limit*current;
            getUsers();
        }

        function delAll(){
            $http.delete('deleteall').success(function(res) {
                vm.db = res;
            })
                .error(function(data, status) {
                    console.error('Delete all users error', status, data);
                })
        }

        function save(id) {
            var ind = null;
            vm.db.forEach(function(item, index){
                if (item.id == id) {
                    ind = index;
                }
            });
            if (ind == null) {
                console.log( 'User does not exist' );
                return;
            }
            console.log('saving updates...');
            $http.put('edit/' + id, vm.db[ind])
                .success(function(res) {
                console.log(res);
                vm.view[ind] = true;
                vm.user = {};
            })
                .error(function(data, status) {
                    console.error('Update error', status, data);
                });
        }
        function addUser() {
            $http.post('add', vm.user)
                .success(function(res) {
                console.log(res);
                vm.db.push(vm.user);
                vm.view.push(true);
            })
                .error(function(data, status) {
                    console.error('Add User error', status, data);
                });
        }

        function del(id) {
            var ind = null;
            vm.db.forEach(function(item, index){
                if (item.id == id) {
                    ind = index;
                }
            });
            if (ind == null) {
                console.log( 'User does not exist' );
                return;
            }
            console.log('deleting user...');
            $http.delete('delete/' + id)
                .success(function(res) {
                console.log(res);
                vm.db.splice(ind, 1);
                vm.view.splice(ind, 1);
            })
                .error(function(data, status) {
                    console.error('Delete user error', status, data);
                })            ;
        }


        getUsers();


    }
})();
/**
 * Created by HP on 11/1/2016.
 */
