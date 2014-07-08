angular.module('masonryApp', ['masonryLayout', 'infinite-scroll', 'imagesLoaded'])

.controller("LoadImages", ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {

    var busy = false,
        heights = [254, 300, 192, 450, undefined, 200, 360, 420, 270, 400, 200],
        cats = ['abstract', 'animals', 'business', 'cats', 'city', 'food', 'nightlife', 'fashion', 'people', 'nature', 'sports', 'transport'],
        stop;

    $scope.images = [];

    $scope.refresh = function() {
        $scope.images.length = 0;

        $timeout(function() { $scope.fetchNext(); }, 1000);
    };

    $scope.fetchNext = function() {
        var i=0;

        if(!busy) {
            console.log('Fetching next')
            busy = true;

            for(var i=0; i<30; i++) {
                $scope.images.push({
                    //src: '250/300/city'
                    src: '250/' + heights[i % heights.length] + '/' + cats[Math.floor(Math.random() * cats.length )]
                });    
            }

            busy = false;

        }

    };  

    $scope.$on('PROGRESS', function($event, progress) {
        console.log(progress);
    }); 

    $scope.$on('SUCCESS', function() {
        console.log("ALL LOADED");
    });

    $scope.$on('COMPLETE', function() {
        console.log('ALL LOADED WITH ATLEAST ONE FAILED');
    });

    $scope.$on('ALWAYS', function() {
        console.log("ALL DONE ALWAYS");
    });

}])
