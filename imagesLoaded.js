(function() {
	'use strict';

	angular.module('imagesLoaded', [])

	.directive('imagesLoaded', ['$timeout', function($timeout) {

		function ImagesLoaded(elem) {
			var cache = {};



			this.imagesCount;
			this.imagesLoaded = 0;

			this.attachListeners(elem);

		}

		ImagesLoaded.prototype = {
			constructor : ImagesLoaded,

			__incrementCount : function() {
				if(++this.imagesLoaded === this.imagesCount) {
					window.alert('ALL IMAGES LOADED');
				}

				console.log(Math.ceil(this.imagesLoaded*100/this.imagesCount), '%');
			},

			attachListeners : function(elem) {
				var imageNodes = elem.find('img'),
					imgElem;

				this.imagesCount = imageNodes.length;
				var self = this;

				var increment = this.__incrementCount.bind(this);

				$timeout(function() {
					for(var i = 0; i < self.imagesCount; i++) {
						imgElem = imageNodes[i];
						// console.log(imgElem.complete, imgElem.naturalWidth, imgElem.src);

						if(imgElem.complete !== true) {
							imgElem.addEventListener('load', increment, true);
							imgElem.addEventListener('error', self.__incrementCount, true);
						}
						else {
							// this.__incrementCount();
						}
					}
				}, 0);

				
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

						if(newVal !== oldVal) {
							var loader = new ImagesLoaded($element);	
						}
						
					}
				);
				
			}
		}
	}])
}());