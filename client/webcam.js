define([ './jquery-1.7.2.min' ], function(__jQuery) {
	var URL = window.URL || window.webkitURL;

	function create(scale) {
		return getUserMedia({
			video : true
		}).pipe(function(stream) {
			return createFromStream(stream, scale);
		}).promise();
	}

	function createFromStream(stream, scale) {
		return new jQuery.Deferred(function(deferred) {
			var video = document.createElement("video");
			var canvas = document.createElement("canvas");
			video.src = URL.createObjectURL(stream);
			// Since video.onloadedmetadata isn't firing for
			// getUserMedia video,
			// we have to fake it.
			setTimeout(function() {
				canvas.width = (video.width = video.videoWidth) * scale;
				canvas.height = (video.height = video.videoHeight) * scale;
				video.play();
				deferred.resolve(new Webcam(video, canvas));
			}, 50);
		});
	}

	function getUserMedia(options) {
		return new jQuery.Deferred(function(deferred) {
			var getUserMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
			if (!getUserMedia) {
				deferred.reject("getUserMedia unsupported");
			} else {
				getUserMedia.call(navigator, options, function onSuccess(stream) {
					deferred.resolve(stream);
				}, function onFailure(e) {
					deferred.reject(e);
				});
			}
		});
	}

	function Webcam(video, canvas) {
		this.video = video;
		this.canvas = canvas;
	}

	Webcam.prototype.snapshot = function() {
		this.canvas.getContext("2d").drawImage(this.video, 0, 0, this.canvas.width,
				this.canvas.height);
	};

	Webcam.prototype.toDataURL = function(format, quality) {
		return this.canvas.toDataURL(format, quality);
	};

	Webcam.prototype.requestFrameDataURL = function(fps, count, format, quality) {
		var filter = this.toDataURL.bind(this, format, quality);
		return this.requestFrameNotifications(fps, count).pipe(filter, null, filter);
	};

	Webcam.prototype.getImageData = function() {
		return this.canvas.getContext("2d").getImageData(0, 0, this.canvas.width,
				this.canvas.height);
	};

	Webcam.prototype.putImageData = function(data) {
		return this.canvas.getContext("2d").putImageData(data, 0, 0);
	};

	Webcam.prototype.requestFrameImageData = function(fps, count) {
		var filter = this.getImageData.bind(this);
		return this.requestFrameNotifications(fps, count).pipe(filter, null, filter);
	};

	Webcam.prototype.requestFrameNotifications = function(fps, count) {
		var deferred = new jQuery.Deferred();
		var ms = 1000 / fps;
		var frame = 0;
		var loop = function() {
			if (++frame !== count) {
				setTimeout(loop, ms);
				this.snapshot();
				deferred.notify(frame, count);
			} else {
				deferred.resolve(frame, count);
			}
		}.bind(this);
		setTimeout(loop, ms);
		return deferred;
	};

	return {
		create : create,
		Webcam : Webcam
	};
});
