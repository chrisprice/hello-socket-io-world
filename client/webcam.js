define(function(_0) {

	function WebcamFactory() {
	}

	WebcamFactory.prototype.create = function(scale, success, failure) {
		this.getUserMedia({
			video : true
		}, function onSuccess(stream) {
			success(this.createFromStream(scale, stream));
		}.bind(this), function onFailure(e) {
			console.error(e);
			failure(e);
		});

	};

	WebcamFactory.prototype.createFromStream = function(scale, stream) {
		var video = document.createElement("video");
		var canvas = document.createElement("canvas");
		video.src = this.URL.createObjectURL(stream);
		// Since video.onloadedmetadata isn't firing for getUserMedia video, we
		// have to fake it.
		setTimeout(function() {
			canvas.width = (video.width = video.videoWidth) * scale;
			canvas.height = (video.height = video.videoHeight) * scale;
			video.play();
		}, 50);
		return new Webcam(video, canvas);
	};

	WebcamFactory.prototype.getUserMedia = function(options, success, failure) {
		var getUserMedia = navigator.webkitGetUserMedia
				|| navigator.getUserMedia;
		if (!getUserMedia) {
			failure("Unsupported");
			return;
		}
		return getUserMedia.apply(navigator, arguments);
	};

	WebcamFactory.prototype.URL = window.URL || window.webkitURL;

	function Webcam(video, canvas) {
		this.video = video;
		this.canvas = canvas;
	}

	Webcam.prototype.snapshot = function() {
		this.canvas.getContext("2d").drawImage(this.video, 0, 0,
				this.canvas.width, this.canvas.height);
	};

	Webcam.prototype.toDataURL = function(format, quality) {
		this.snapshot();
		return this.canvas.toDataURL(format, quality);
	};

	Webcam.prototype.getImageData = function() {
		this.snapshot();
		return this.canvas.getContext("2d").getImageData(0, 0,
				this.canvas.width, this.canvas.height);
	};

	return {
		WebcamFactory : WebcamFactory,
		Webcam : Webcam
	};
});
