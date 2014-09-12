angular-images-loaded
---------------------
####Image load detector with progress events
+ Directive can be nested now ***(NEW)***
+ Detects images load for all images inside an element and broadcasts angular progress events
+ Works with ***ng-repeat***.
+ Can be used on different elements
+ Need not worry about asynchronous image elements insertion into DOM


#####DEMO
http://bimal1331.github.io/angular-images-loaded

#####REQUIREMENTS
+ Angularjs 1.2+ only

#####INSTALLATION
+ Download imagesLoaded.min.js and include it with your JS files.
+ Include module ***imagesLoaded*** in your main app module.

#####USAGE
+ Put directive ***data-images-loaded*** on an element containing images.

  ***Eg.***

	``` html
  <div data-images-loaded>
	<div data-ng-repeat="image in images">
			<img ng-src="http://lorempixel.com/{{image.src}}">
		  <div>Foo Bar</div>
	</div>
  </div>
	```
	
+ You can nest the directive

  ***Eg.***
  
  
	``` html
  <div data-images-loaded>
  	..................
  	
  	<div data-images-loaded>
		<div data-ng-repeat="image in images1">
				<img ng-src="http://lorempixel.com/{{image.src}}">
			  <div>Foo Bar</div>
		</div>
	</div>
	
	<div data-images-loaded>
		<div data-ng-repeat="image in images2">
				<img ng-src="http://lorempixel.com/{{image.src}}">
			  <div>Foo Bar</div>
		</div>
	</div>
  </div>
	```

  That's it!

#####EVENTS(Always available)
+ ***SUCCESS*** - All images have been successfully loaded
+ ***FAIL*** - All images have been loaded with atleast 1 failed image
+ ***ALWAYS*** - All images are done, whether successfully loaded or failed to load. This event is always broadcasted
  
  ***Subscribe to these events in your controller as shown below***

  ``` js
  $scope.$on('SUCCESS', function() {
    console.log('ALL LOADED');
  });

  $scope.$on('FAIL', function() {
    console.log('ALL LOADED WITH ATLEAST ONE FAILED');
  });

   $scope.$on('ALWAYS', function() {
    console.log('ALL DONE ALWAYS');        
  });
  ```
  
#####PROGRESS EVENTS
+ ***QUARTER*** - One fourth of total images have been loaded/failed
+ ***HALF*** - Half of total images have been loaded/failed
+ ***THREEQUARTERS*** - Three fourth of total images have been loaded/failed
+ ***FULL*** - All images have been loaded/failed

  Main event is ***PROGRESS***, other events are received in the callback via ***progress.status***

  ***Subscribe to these progress events in your controller as shown below***

  ``` js
  $scope.$on('PROGRESS', function($event, progress) {
    console.log(progress);
    switch(progress.status) {
        case 'QUARTER':
            $scope.progress = 25;
            break;
        case 'HALF':
            $scope.progress = 50;
            break;
        case 'THREEQUARTERS':
            $scope.progress = 75;
            break;
        case 'FULL':
            $scope.progress = 100;
            break;
    }
  });
  ```
  
#####Note :-
1.  To listen to progress events, use attribute ***data-use-progress-events*** as shown below -

  ```html
  <div data-images-loaded data-use-progress-events="yes">
  	<div data-ng-repeat="image in images">
  			<img ng-src="http://lorempixel.com/{{image.src}}"/>
  		  <div>Foo Bar</div>
  	</div>
  </div>
   ```
  
+ data-use-progress-events="***yes***"  to listen to progress events
+ data-use-progress-events="***no***" to skip progress events and just listen to main events
	
  This approach is taken to minimise ***$digest*** cycles in case you wish to skip progress events, since all angular-specific changes take place in the $digest cycle. That's why, I have kept progress events to a minimum, otherwise ***N*** images load will cause ***N*** $digest cycles to notify the subscriber, which can hamper performance.

2.  Use $event.stopPropagation() in your controller when using progress events and nesting the directive, otherwise you'll receive same notification multiple times.


#####Credits
Ideas taken from https://github.com/desandro/imagesloaded

#####Thanks for reading, Cheers!
