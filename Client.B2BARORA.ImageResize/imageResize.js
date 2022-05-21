
	'use strict';

	//polifill
	if ( !window.devicePixelRatio ) { // if not support
		
		window.getDevicePixelRatio = function () {
			var ratio = 1;
			// To account for zoom, change to use deviceXDPI instead of systemXDPI
			if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
				// Only allow for values > 1
				ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
			}
			else if (window.devicePixelRatio !== undefined) {
				ratio = window.devicePixelRatio;
			}
			return ratio;
		};
	}
	else
		window.getDevicePixelRatio = function(){ return window.devicePixelRatio; };
	
	if (!performance) {
		window.performance = {};
	}
	if (!performance.now) {
		performance.now = function () { return new Date().valueOf(); };
	}
	
	(function() {
		
		var imagesResizer = {};	// public for that scope object
		
		(function(){ // new scope
			
			// class for cached image, for resize
			var rImage = function(img) {

				// scale type for resize image, sending to server
				var scaleType 	= '2';
				
				// img html-element
				this.img = img;
				
				var domain = img.getAttribute('data-domain');
				var src    = img.getAttribute('data-src');
				var mode   = img.getAttribute('data-mode');

				var $img = $(this.img);

				if (typeof mode != "undefined" || mode != null) scaleType = mode;
				
				// resize to specify size, here because need private fields 'domain', 'img' and 'src' 
				this.resizeTo = function(width, height) {
					
					// get pure src, expected format of url in src is : /file/path/to/image, we cut /file part
					var pureSrc = src.substr( src.indexOf('/',1) + 1 );

					var checkSize = size => {
						return size <= 0
							? false
							: size;
					};
					
					var urlForResizedImg = domain + '/upload/scale/'+ checkSize(width) +'/'+ checkSize(height) +'/'+ scaleType +'/' + pureSrc;

					if (!checkSize(width) || !checkSize(height)) {
						console.error(urlForResizedImg);
						return;
					}
					
					{ // set sizes by onload
						var _this = this;
						
						$img.bind('load', function setSizesInCache(){
						
							_this.height = _this.getCurrentHeight();
							_this.width = _this.getCurrentWidth();
							
							// setTimeout( function() {
								// console.log('Image resized to : width '+ _this.width + ' height ' + _this.height );
							// }, 200);
							
							$img.unbind('load', setSizesInCache);
						});
					}
					
					//this.img.src =  null; // for old ie, not tested how it affects
					if ($.Lazy) {
						// if lazy plugin available
						$(this.img)
							.attr('data-o riginal', urlForResizedImg)
							.removeAttr('src')
							.removeData('lazy-handled')
							.Lazy({ attribute  : 'data-original', handledName : 'lazy-handled' });
					} else {
						// old-fashioned load-it-all-at-once
						this.img.src = urlForResizedImg;
					}
					
				};
				
				// accessing to private $img.height()
				this.getCurrentHeight = function(){ 
					return Math.round( $img.height() * scale );
				};
				
				// accessing to private $img.width()
				this.getCurrentWidth = function(){ 
					return Math.round( $img.width() * scale );
				};
				
				// init current value, usualy it contain old-previous values
				// this.height = this.getCurrentHeight(); commented because in ie image already have not zero size
				// this.width  = this.getCurrentWidth();
				this.resizeTo(this.getCurrentWidth(), this.getCurrentHeight()); // for ie resize immediately
				
				// set resize handler
				// var self = this;
				
				// this.resizeHandler = function () {
					// self.resize();
				// };
				
				// $(window).resize(resizeHandler);
				//
			};
			
			rImage.prototype.onPage = function () {
				return this.img != null && document.body.contains(this.img);
			};
			
			rImage.prototype.inBlock = function (block) {
				return this.img != null && block != null && block.contains(this.img);
			};
			
			rImage.prototype.destroy = function () {
				$(window).off("resize", this.resizeHandler);
				
				delete this.img;
				delete this.resizeTo;
				delete this.getCurrentHeight;
				delete this.getCurrentWidth;
			};
			
			
			(function(){ // private methods for rImage class
				
				var minImageSizeDiff = 16; // min diff image for resize
				
				function percentsDelta(_old, _new) { // get difference between values in percent relative _old
				
					var oneP = _old / 100;
					return Math.abs( ( _new / oneP ) - 100 );
				}
				
				rImage.prototype.resize = function(){
					
					var cWidth = this.getCurrentWidth();
					var cHeight = this.getCurrentHeight();
					
					var oldWidth = this.width;
					var oldHeight = this.height;
					
					if ( oldHeight && oldWidth ) {
						var widthNoNeedResize = cWidth  <= oldWidth  || percentsDelta(oldWidth, cWidth) < minImageSizeDiff;
						var heightNoNeedResize = cHeight <= oldHeight || percentsDelta(oldHeight, cHeight) < minImageSizeDiff;
						
						if (widthNoNeedResize && heightNoNeedResize) {
							return;
						}						
					}
					
					this.resizeTo(cWidth, cHeight);
				};
				
			})();
			
		
			var images 			= null;
			var dynamicAddedImages= [];
			//var imagesForResize = [];
			var imgSelector = 'img[data-src][data-domain]';
			
			var scale = null;
			
			/**
			 *	@function resize images matches imageSelector in given block or in document
			 *  @param{DOMElement} block - native dom element
			 */
			imagesResizer.resize = function(block){
				var startTime = performance.now();
				
				scale = window.getDevicePixelRatio();
				
				// if images not filled
				if( images == null ) {
					// get images by selector
					var imagesElements = document.querySelectorAll(imgSelector);
					
					// if not have an image -- don't try do anythyng and go away
					if (imagesElements.length == 0)
						return;
				
					// create array
					images = new Array(imagesElements.length);
					// and save as our class
					for(var i=0; i<imagesElements.length; i+=1) {
						images[i] = new rImage( imagesElements[i] );
					}
				}
				
				var resizedImages = 0;
				
				// if have images
				if ( images ) {
					if (typeof block === "undefined") {					
						// loop by them 
						for(var i=0; i < images.length; i+=1) {		
							var rImg = images[i];
							// and resize
							rImg.resize();
							resizedImages += 1;
						}					
						
						for(var k=0; k < dynamicAddedImages.length; k+=1) {	
							var rImg = dynamicAddedImages[k];
							
							if (rImg.onPage()) {
								rImg.resize();
								resizedImages += 1;
							} else {
								rImg.destroy();
								dynamicAddedImages.splice(k, 1); // remove image at k position
								k-=1;
							}	
						}
					} else {
						// loop by them 
						for(var i=0; i < images.length; i+=1) {		
							var rImg = images[i];
							
							if (rImg.inBlock(block)) {
								rImg.resize();
								resizedImages += 1;
							}
						}					
						
						for(var k=0; k < dynamicAddedImages.length; k+=1) {
							var rImg = dynamicAddedImages[k];
							
							// if image still on page
							if (rImg.onPage()) {
								if (rImg.inBlock(block)) {
									// resize only if image in given block
									rImg.resize();
									resizedImages += 1;									
								}
							} else {
								// delete image if no still on page
								rImg.destroy();
								dynamicAddedImages.splice(k, 1); // remove image at k position
								k-=1;
							}	
						}
					}
				}
				
				var endTime = performance.now();
				
				console.log('Resized ' + resizedImages + ' images, ' + (endTime - startTime).toFixed(2) + ' ms');
			};
			
			imagesResizer.addImages = function (block) {
				var startTime = performance.now();
				
				var imagesAdded = 0;
				var newImages = block.querySelectorAll(imgSelector);
				
				// check deleted from DOM images and del from memory
				for(var k=0; k < dynamicAddedImages.length; k+=1) {	
					var rImg = dynamicAddedImages[k];
					
					if (!rImg.onPage()) {
						rImg.destroy();
						dynamicAddedImages.splice(k, 1); // remove image at k position
						k-=1;
					}	
				}
				
				for(var ni=0; ni < newImages.length; ni+=1) {
					
					var newImage = newImages[ni];
				
					var imageAlreadyKnown = false;
					
					for(var i=0; i<dynamicAddedImages.length; i+=1) {
						var resizeImg = dynamicAddedImages[i];
						
						if(newImage === resizeImg.img) {
							// already have that image
							imageAlreadyKnown = true;
						}
					}
					
					if (!imageAlreadyKnown) {
						var resizeImg = new rImage(newImage);
						resizeImg.resize();
						imagesAdded += 1;
						dynamicAddedImages.push(resizeImg);
					}
				}
				
				var endTime = performance.now();
				
				console.log('Add '+ imagesAdded +' new images to resizer and resize, ' + (endTime - startTime).toFixed(2) + ' ms');
			};
			
		})();
		
				
		$(document).ready(function() {
			// if lazy plugin available - make it lazy! (need "data-original" attrubite instead of "src")
			if ($.Lazy) $('img[data-original]').Lazy({ attribute  : 'data-original', handledName : 'lazy-handled' });

			imagesResizer.resize(); // init
			$(window).resize( function() { 
				imagesResizer.resize(); 
			});
		});
		
		window.cje.imagesResizer = imagesResizer;
		
		$(document).on('NeedResize', function (e, block) {
			if (block == null) {
				throw new TypeError('block must be dom element');
			}
			
			imagesResizer.addImages(block);
		});
		
	})();