'use strict';
(function () {
    angular.module('app', ['ui.router'])
        .config(config)
        .controller('mainCtrl', mainController)
        .controller('tasksCtrl', tasksController)
        .controller('statCtrl', statController);

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/pers');

        $stateProvider
            .state('/pers', {
                url: '',
                controller: 'mainCtrl',
                templateUrl: 'pages/pers.html',
                controllerAs: 'vm',
                id: "home"
            })
            .state('/tasks', {
                url: '/tasks',
                controller: 'tasksCtrl',
                templateUrl: 'pages/tasks.html',
                controllerAs: 'vm',
                id: "home"
            })
            .state('/stat', {
                url: '/stat',
                controller: 'statCtrl',
                templateUrl: 'pages/stat.html',
                controllerAs: 'vm',
                id: "home"
            });

    }
    function mainController($http) {
        var vm = this;
        var limit = 3;
        var offset = 0;
        var current = 1;
        vm.db = [];
        vm.view = [];
        vm.user = {};
        vm.addPers = addPers;
        vm.field = '';
        vm.delete = del;
        vm.updatepers = updatepers;
        vm.delAll = delAll;
        vm.search = search;

        var getPersonal = function (field) {

            $http.get('/personal').success(function (res) {
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

        function updatepers(id) {
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
            console.log('saving updates...', vm.db[ind]);
            $http.put('/editpers/' + id, vm.db[ind])
                .success(function (res) {
                    console.log(res);
                    vm.db = res;
                    vm.view[ind] = true;
                    vm.pers = {};
                })
                .error(function (data, status) {
                    console.error('Update error', status, data);
                });
        }

        function addPers() {
            console.log(vm.pers);
            $http.post('/addpers', vm.pers)
                .success(function (res) {
                    console.log(res);
                    vm.db = res;
                    vm.view.push(true);
                    vm.pers = {};
                })
                .error(function (data, status) {
                    console.error('Add personal error', status, data);
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
            $http.delete('deletepers/' + id)
                .success(function (res) {
                    console.log(res);
                    vm.db.splice(ind, 1);
                    vm.view.splice(ind, 1);
                })
                .error(function (data, status) {
                    console.error('Delete user error', status, data);
                });
        }


        getPersonal();


    }

    function tasksController($http) {
        console.log('tasks');
        var vm = this;
        vm.personal = [];
        vm.task = {
            name: '',
            status: false,
            pers: [],
        };
        vm.tasks = [];
        vm.view = [];
        vm.addTask = add;
        vm.delete = del;
        vm.updatetask = updatetask;
        vm.searchTask = searchTask;
        vm.search = {
            name: ''
        };

        function searchTask(){
            var searchStr = "name="+vm.search.name;
            $http.get('/searchtask/?'+searchStr)
                .success(function(res){
                    res.forEach(function(itm){
                        vm.view.push(true);
                        itm.exec.forEach(function(item, index){
                            itm.exec[index] = item[0];
                        })
                    });
                    vm.tasks = res;
                    vm.tasks['pers'] = [];
                })
                .error(function(data, status){
                    console.error('Get tasks error', status, data);
                });
        }

        var getTasks = function() {
            $http.get('gettasks')
            .success(function(res){
                    res.forEach(function(itm){
                        vm.view.push(true);
                        itm.exec.forEach(function(item, index){
                            itm.exec[index] = item[0];
                        })
                    });
                    vm.tasks = res;
                    vm.tasks['pers'] = [];
                })
                .error(function(data, status){
                    console.error('Get tasks error', status, data);
                });
        };
        getTasks();

        function add() {
            $http.post('/addtask', vm.task)
            .success(function(res){
                    res.forEach(function(itm){
                        itm.exec.forEach(function(item, index){
                            itm.exec[index] = item[0];
                        })
                    });
                    vm.tasks = res;
                    vm.tasks['pers'] = [];
                    vm.view.push(true);
                    vm.task = {};
                })
            .error(function(data, status){
                    console.error('Add task error', status, data);
                })
        }

        function del(id) {
            $http.delete('/deltask/' + id)
            .success(function(res) {
                    res.forEach(function(itm){
                        vm.view.push(true);
                        itm.exec.forEach(function(item, index){
                            itm.exec[index] = item[0];
                        })
                    });
                    vm.tasks = res;
                    vm.tasks['pers'] = [];
                })
                .error(function(data, status){
                    console.error('Delete tasks error', status, data);
                });
        }

        function updatetask(id) {
            vm.tasks.forEach(function(item, index) {
                if (item._id == id) {
                    delete item.exec;
                    var obj = vm.tasks[index];
                    $http.put('/updatetask/'+id, obj)
                        .success(function(res) {
                            res.forEach(function(itm){
                                itm.exec.forEach(function(item, index){
                                    itm.exec[index] = item[0];
                                });
                            });
                            vm.tasks = res;
                            vm.tasks['pers'] = [];
                            vm.view[index] = true;
                        })
                        .error(function(data, status){
                            console.error('Delete tasks error', status, data);
                        });
                }
            });
        }

        var getPersonal = function () {

            $http.get('/personal').success(function (res) {
                vm.personal = res;
                res.forEach(function (item) {
                    vm.view.push(true);
                });
            })
                .error(function (data, status) {
                    console.error('Get all users error', status, data);
                });
        };

        getPersonal();

    }
    function statController($http) {
        var vm = this;
        vm.db = [];

        var getStats = function() {
            $http.get('/getstats')
            .success(function(res) {
                    console.log(res);
                    vm.db = res;
                });
        }
        getStats();    }
})();
/**
 * Created by HP on 11/1/2016.
 */
