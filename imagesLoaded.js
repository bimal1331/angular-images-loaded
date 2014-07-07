(function() {
	'use strict';

	angular.module('imagesLoaded', [])

	.directive('imagesLoaded', ['$timeout', '$rootScope', '$q', function($timeout, $rootScope, $q) {

		var cache = {};

		function between(x, min, max) {
		  	return x >= min && x <= max;
		}

		function digestPromise(func) {
			$timeout(func, 0);
		}

		function ImagesCollection() {

			this.imagesCount;
			this.imagesLoaded = 0;
			this.imagesFailed = 0;

		}

		ImagesCollection.prototype = {
			constructor : ImagesCollection,

			whenImagesLoaded : function(imageNodes) {
				var defer = $q.defer(),
					totalImages = imageNodes.length,
					progressChunk = Math.ceil(totalImages/4),
					progressIndicators = [undefined, 'QUARTER', 'HALF', 'THREEQUARTERS', 'COMPLETE'],
					_this = this,
					imgElem, proxyImage;

				this.imagesCount = totalImages;

				for(var i = 0; i < this.imagesCount; i++) {
					imgElem = imageNodes[i];

					check(imgElem);					
				}

				function loaded(bool) {
					if(bool) {
						_this.imagesLoaded += 1;
					}
					else {
						_this.imagesFailed += 1;
					}
					
					console.log('loaded', _this.imagesLoaded, _this.imagesFailed)

					var progress = (_this.imagesLoaded + _this.imagesFailed)/progressChunk;

					if(progress % 1 === 0) {
						digestPromise(function() {
							defer.notify(progressIndicators[progress]);
						});
					}

				}

				function check(img) {
					var proxyImage;

					if(cache[img.src]) {

						// if(cache[img.src].loaded) {
						// 	//Image is in local cache and is loaded
						// 	console.log('LOCAL CACHE');
						// 	loaded(true);
						// }
						// else if(cache[img.src].loading) {
						// 	//HACK
						// 	loaded(true);
						// }
						// else if(cache[img.src].loaded === undefined) {

						// }
						loaded(true);
					}
					else if(img.complete && img.naturalWidth > 0) {
						//Image is not in local cache but is present in browser's cache
						console.log('BROWSER CACHE');
						cache[img.src] = {loaded : true};
						loaded(true);
					}
					else {
						//Image has not been loaded before, so we make a proxy image element and attach load listeners to it so that we don't interfere with the user defined listeners
						proxyImage = new Image();

						cache[img.src] = {
							loaded : undefined,
							loading : true
						};

						proxyImage.addEventListener('load', function() {
							console.log('PROXY IMAGE');
							cache[img.src].loaded = true; 
							cache[img.src].loading = false;
							loaded(true);
						}, true);

						proxyImage.addEventListener('error', function() {
							console.log(img.src)
							cache[img.src].loaded = false;
							cache[img.src].loading = false;
							loaded(false);
						}, true);

						proxyImage.src = img.src;
					}

				}

				return defer.promise;
			}

			
		};

		return {
			restrict : 'A',
			link : function($scope, $element, $attrs) {

				var descendents = $element[0].childNodes,
					imageNodes;

				$scope.$watch(
					function() {
						// console.time('start')
						var nodes = descendents.length;
						// console.timeEnd('start');
						return nodes;
					},
					function(newVal, oldVal) {

						if(newVal === oldVal) return;

						var collection = new ImagesCollection(),
							imageNodes = $element.find('img');

						//Wait for ng-src interpolation
						$timeout(function() {

							collection.whenImagesLoaded(imageNodes).then(
								function(data) {
									if(data == 'ALWAYS') {
										console.log('BROADCASTING DONE')
										$scope.$broadcast('ALWAYS');
									}
								},
								function(error) {

								},
								function(progress) {
									$scope.$broadcast(progress);
								}
							);

						}, 0);
						
					}
				);
				
			}
		}
	}])
}());