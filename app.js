angular.module('masonryApp', ['imagesLoaded'])

.controller("LoadImages", ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {

    var busy = false,
        total = 20,
        heights = [undefined, 250, 251, 252, 253, 254],
        cats = ['abstract', 'animals', 'business', 'cats', 'city', 'food', 'nightlife', 'fashion', 'people', 'nature', 'sports', 'transport'],
        stop;

    $scope.images = [];
    $scope.images2 = [];

    $scope.refresh = function() {
        $scope.images.length = 0;

        $timeout(function() { $scope.fetchNext(); }, 1000);
    };

    $scope.fetchNext = function(load) {
       
        if(!busy) {
            console.log('Fetching next')
            busy = true;

            for(var i=0; i<total; i++) {
                if(load === 0 || load === 2) {
                    $scope.images.push({
                        //src: '250/300/city'
                        src: (i%7 === 0 ? undefined : Math.floor(Math.random()*10)+250) + '/250/' + cats[Math.floor(Math.random() * cats.length )]
                    });    
                }

                if(load === 1 || load === 2) {
                    $scope.images2.push({
                        src: (i%7 === 0 ? undefined : Math.floor(Math.random()*10)+200) + '/200/' + cats[Math.floor(Math.random() * cats.length )]
                    });    
                }
                    
            }

            busy = false;

        }

    };

    $scope.fetchNext(2);  

}])

.controller("Ctrl1", ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {    

    $scope.progress = 0;   

    $scope.$watch('images.length', function(val) {
        if(val) $scope.progress = 1;
    }); 

    $scope.addMore = function() {
        $scope.fetchNext(0);
    };

    $scope.$on('PROGRESS', function($event, progress) {
        console.log(progress);
        switch(progress.status) {
            case 'QUARTER':
                $scope.progress = Math.ceil(30/4);
                break;
            case 'HALF':
                $scope.progress = Math.ceil(30/2);
                break;
            case 'THREEQUARTERS':
                $scope.progress = Math.ceil(30*3/4);
                break;
            case 'FULL':
                $scope.progress = 30;
                $timeout(function() { $scope.progress = 0; }, 300);
                break;
        }
    }); 

    $scope.$on('SUCCESS', function() {
        console.log("ALL LOADED");
    });

    $scope.$on('FAIL', function() {
        console.log('ALL LOADED WITH ATLEAST ONE FAILED');
    });

    $scope.$on('ALWAYS', function() {
        console.log("ALL DONE ALWAYS");        
    });

}])

.controller('Ctrl2', ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {
    $scope.progress = 0; 

    $scope.$watch('images2.length', function(val) {
        if(val) $scope.progress = 1;
    });   

    $scope.addMore = function() {
        $scope.fetchNext(1);
    };

    $scope.$on('PROGRESS', function($event, progress) {
        console.log(progress);
        switch(progress.status) {
            case 'QUARTER':
                $scope.progress = Math.ceil(30/4);
                break;
            case 'HALF':
                $scope.progress = Math.ceil(30/2);
                break;
            case 'THREEQUARTERS':
                $scope.progress = Math.ceil(30*3/4);
                break;
            case 'FULL':
                $scope.progress = 30;
                $timeout(function() { $scope.progress = 0; }, 300);
                break;
        }
    }); 

    $scope.$on('SUCCESS', function() {
        console.log("ALL LOADED");
    });

    $scope.$on('FAIL', function() {
        console.log('ALL LOADED WITH ATLEAST ONE FAILED');
    });

    $scope.$on('ALWAYS', function() {
        console.log("ALL DONE ALWAYS");
    });
}])
