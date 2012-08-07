define(
		[ './jquery' ],
		function($) {
			var URL = window.URL || window.webkitURL;
			var ERROR_TEXT = '<a href="http://www.html5rocks.com/en/tutorials/getusermedia/intro/#toc-enabling">'
					+ 'Your browser either does not support getUserMedia,'
					+ ' it is not enabled or you have denied access to the device.</a>';

			function create() {
				return getUserMedia({
					video : true
				}).pipe(function(stream) {
					return createFromStream(stream);
				}).promise();
			}

			function createFromStream(stream) {
				return new $.Deferred(function(deferred) {
					var video = document.createElement("video");
					var canvas = document.createElement("canvas");
					video.src = URL.createObjectURL(stream);
					// Since video.onloadedmetadata isn't firing for
					// getUserMedia video,
					// we have to fake it.
					setTimeout(function() {
						video.width = canvas.width = video.videoWidth;
						video.height = canvas.height = video.videoHeight;
						video.play();
						deferred.resolve(new Webcam(video, canvas));
					}, 50);
				});
			}

			function getUserMedia(options) {
				return new $.Deferred(function(deferred) {
					var getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
					if (!getUserMedia) {
						deferred.reject("getUserMedia unsupported");
					} else {
						getUserMedia.call(navigator, options, function onSuccess(stream) {
							deferred.resolve(stream);
						}, function onFailure(e) {
							deferred.reject(ERROR_TEXT);
						});
					}
				});
			}

			function Webcam(video, canvas) {
				this.video = video;
				this.canvas = canvas;
				this.ctx2d = this.canvas.getContext("2d");
			}

			Webcam.prototype.getSourceSize = function() {
				return {
					width : this.video.videoWidth,
					height : this.video.videoHeight
				};
			};

			Webcam.prototype.setSize = function(width, height) {
				this.video.width = this.canvas.width = width;
				this.video.height = this.canvas.height = height;
				this.snapshot();
			};

			Webcam.prototype.snapshot = function() {
				this.ctx2d.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
			};

			Webcam.prototype.toDataURL = function(format, quality) {
				return this.canvas.toDataURL(format, quality);
			};

			Webcam.prototype.getImageData = function() {
				return this.ctx2d.getImageData(0, 0, this.canvas.width, this.canvas.height);
			};

			Webcam.prototype.putImageData = function(data) {
				return this.ctx2d.putImageData(data, 0, 0);
			};

			Webcam.prototype.createImageData = function(data) {
				return this.ctx2d.createImageData(this.canvas.width, this.canvas.height);
			};

			return {
				create : create,
				Webcam : Webcam
			};
		});