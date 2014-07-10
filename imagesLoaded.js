(function() {
	'use strict';

	angular.module('imagesLoaded', [])

	.directive('imagesLoaded', ['$timeout', '$rootScope', '$q', function($timeout, $rootScope, $q) {

		var cache = {};

		var broadcastMessages = {
			progress : ['QUARTER', 'HALF', 'THREEQUARTERS', 'FULL'],
			successful : 'SUCCESS',
			complete : 'FAIL',
			always : 'ALWAYS'
		};

		/************* Helper functions **********/
		function digestPromise(func) {
			$timeout(func, 0);
		}

		/*********** Constructors ************/

		function ImageNode(src, func, inBrowserCache) {
			this.loaded = undefined;
			this.loading = true;

			if(!inBrowserCache) {				
				this.node = new Image();
				this.bind(func);
				this.node.src = src;
			}
			else {
				this.__onload(func, true);
			}
			
		}

		ImageNode.prototype = {
			constructor : ImageNode,

			bind : function(func) {
				var _this = this;
				this.node.addEventListener('load', function() { _this.__onload(func, true) }, false);
				this.node.addEventListener('error', function() { _this.__onload(func, false) }, false);
			},

			__onload : function(func, success) {
				this.loaded = success;
				this.loading = false;

				if(success && this.node) {
					delete this.node;
				}				

				func(success);
			}
		};

		function ImagesCollection(useProgressEvents) {
			this.imagesCount = 0;
			this.imagesLoaded = 0;
			this.imagesFailed = 0;
			this.useProgressEvents = useProgressEvents;
		}

		ImagesCollection.prototype = {
			constructor : ImagesCollection,

			whenImagesLoaded : function(imageNodes) {
				var defer = $q.defer(),
					totalImages = imageNodes.length,
					_this = this,
					imgElem, proxyImage;

				this.imagesCount = totalImages;

				for(var i = 0; i < this.imagesCount; i++) {
					imgElem = imageNodes[i];

					check(imgElem);					
				}

				function increment(bool) {
					var progress;

					if(bool) {
						_this.imagesLoaded++;
					}
					else {
						_this.imagesFailed++;
					}

					if(_this.useProgressEvents && (progress = (_this.imagesLoaded + _this.imagesFailed)/Math.ceil(totalImages/4)) && (progress % 1 === 0) && progress < 4) {
						digestPromise(function() {
							defer.notify(broadcastMessages.progress[progress-1]);
						});
					}

					if(_this.imagesLoaded + _this.imagesFailed === _this.imagesCount) {
						digestPromise(function() {
							defer.notify(broadcastMessages.progress[3]);
							defer.resolve((_this.imagesFailed > 0) ? broadcastMessages.complete : broadcastMessages.success);
						});
					}

				}

				function check(img) {
					var source = img.src,
						cachedElement = cache[source],
						proxyImage;

					if(cachedElement ) {

						if(cachedElement.loaded) {
							//Image is in local cache and is loaded
							increment(true);
						}
						else if(cachedElement.loading) {
							//Image is currently being loaded and it's being checked again before successful load, so we wait for the image to load
							cachedElement.bind(increment);
						}
						else if(cachedElement.loaded === false) {
							cachedElement.bind(increment);
							cachedElement.node.src = source;
						}
						
					}
					else if(img.complete && img.naturalWidth > 0) {
						//Image is not in local cache but is present in browser's cache
						cache[source] = new ImageNode(source, increment, true);
					}
					else {
						//Image has not been loaded before, so we make a proxy image element and attach load listeners to it
						cache[source] = new ImageNode(source, increment);

					}

				}

				return defer.promise;
			}

			
		};

		//Directive consfiguration object
		return {
			restrict : 'A',
			link : function($scope, $element, $attrs) {

				var descendents = $element[0].childNodes,
					useProgressEvents = $attrs.useProgressEvents === 'yes' ? true : false,
					previousImagesCount = 0,
					imageNodes;

				$scope.$watch(
					function() {
						var nodes = descendents.length;
						
						return nodes;
					},
					function(newVal) {

						if(!newVal) return;

						var collection = new ImagesCollection(useProgressEvents),
							imageNodes = $element.find('img'),
							currentImageNodes = Array.prototype.slice.call(imageNodes, previousImagesCount);

						previousImagesCount = imageNodes.length;

						digestPromise(function() {
							collection.whenImagesLoaded(currentImageNodes).then(
								function(data) {
									$scope.$broadcast(data);
									$scope.$broadcast(broadcastMessages.always);
								},
								function(error) {

								},
								function(progress) {
									useProgressEvents && $scope.$broadcast('PROGRESS', {status : progress});
								}
							);
						});
						
					}
				);
				
			}
		}
	}])
}());