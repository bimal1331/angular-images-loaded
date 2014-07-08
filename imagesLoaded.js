(function() {
	'use strict';

	angular.module('imagesLoaded', [])

	.directive('imagesLoaded', ['$timeout', '$rootScope', '$q', function($timeout, $rootScope, $q) {

		var cache = {};

		/************* Helper functions **********/
		function digestPromise(func) {
			$timeout(func, 0);
		}

		function makeArray(obj) {
			var arr = [];

			if(angular.isArray(obj)) {
				arr = obj;
			}
			else if(typeof obj.length === 'number') {
				for(var i = 0, n = obj.length; i < n; i++) {
					arr.push(obj[i]);
				}
			}
			else {
				arr.push(obj);
			}

			return arr;
		}

		/*********** Constructor function ************/
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
					progressIndicators = [undefined, 'QUARTER', 'HALF', 'THREEQUARTERS', 'COMPLETE'],
					_this = this,
					imgElem, proxyImage, progress;

				this.imagesCount = totalImages;

				for(var i = 0; i < this.imagesCount; i++) {
					imgElem = imageNodes[i];

					check(imgElem);					
				}

				function loaded(bool) {
					if(bool) {
						_this.imagesLoaded++;
					}
					else {
						_this.imagesFailed++;
					}
					
					console.log('loaded', _this.imagesLoaded, _this.imagesFailed)

					if((progress = (_this.imagesLoaded + _this.imagesFailed)/Math.ceil(totalImages/4)) && (progress % 1 === 0)) {
						digestPromise(function() {
							defer.notify(progressIndicators[progress]);
						});
					}

					if(_this.imagesLoaded + _this.imagesFailed === _this.imagesCount) {
						digestPromise(function() {
							defer.resolve((_this.imagesFailed > 0) ? 'COMPLETE' : 'SUCCESS');
							defer.resolve('ALWAYS');
						});
					}

				}

				function check(img) {
					var cachedElement = cache[img.src],
						proxyImage;

					var onload = function onload() {
							// console.log('PROXY IMAGE', this);
							cache[img.src].loaded = true; 
							cache[img.src].loading = false;
							loaded(true);
							unbind();
						};

						var onerror = function onerror() {
							// console.log(img.src)
							cache[img.src].loaded = false;
							cache[img.src].loading = false;
							loaded(false);
							unbind();
						};

						var unbind = function unbind() {
							cache[img.src].node.removeEventListener('load', onload, false);
							cache[img.src].node.removeEventListener('error', onerror, false);
						};

					if(cachedElement ) {

						if(cachedElement.loaded) {
							//Image is in local cache and is loaded
							console.log('LOCAL CACHE');
							loaded(true);
						}
						else if(cachedElement.loading) {
							//HACK
							console.log('LOADING');
							cache[img.src].node.addEventListener('load', onload, false);
							cache[img.src].node.addEventListener('error', onerror, false);
							// loaded(true);
						}
						else if(cachedElement.loaded === false) {
							cache[img.src].node.addEventListener('load', onload, false);
							cache[img.src].node.addEventListener('error', onerror, false);
							cache[img.src].node.src = img.src;
						}
						// loaded(true);
					}
					else if(img.complete && img.naturalWidth > 0) {
						//Image is not in local cache but is present in browser's cache
						// console.log('BROWSER CACHE');
						cachedElement = {loaded : true};
						loaded(true);
					}
					else {
						//Image has not been loaded before, so we make a proxy image element and attach load listeners to it so that we don't interfere with the user defined listeners
						// proxyImage = new Image();

						cache[img.src] = {
							node : new Image(),
							loaded : undefined,
							loading : true
						};

						

						cache[img.src].node.addEventListener('load', onload, false);
							cache[img.src].node.addEventListener('error', onerror, false);

						cache[img.src].node.src = img.src;
					}

				}

				return defer.promise;
			}

			
		};

		return {
			restrict : 'A',
			link : function($scope, $element, $attrs) {

				var descendents = $element[0].childNodes,
					previousImagesCount = 0,
					imageNodes;

				$scope.$watch(
					function() {
						var nodes = descendents.length;
						
						return nodes;
					},
					function(newVal, oldVal) {

						if(newVal === oldVal) return;

						var collection = new ImagesCollection(),
							imageNodes = makeArray($element.find('img')),
							currentImageNodes = imageNodes.slice(previousImagesCount);

						previousImagesCount = imageNodes.length;

						digestPromise(function() {
							collection.whenImagesLoaded(currentImageNodes).then(
								function(data) {
									$scope.$broadcast(data);
								},
								function(error) {

								},
								function(progress) {
									$scope.$broadcast('PROGRESS', {status : progress});
								}
							);
						});
						
					}
				);
				
			}
		}
	}])
}());