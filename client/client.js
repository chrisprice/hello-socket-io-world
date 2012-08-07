require([ './comms', './webcam', './jquery' ], function(comms, webcam, $) {

	// create a connection to the server
	// http://socket.io/
	var socket = comms.connect();

	// very basic UI to deal with incoming messages
	var $selfId = $('#self-id');
	var $selfVideo = $('#self-video');
	var $selfCanvas = $('#self-canvas');
	var $remoteId = $('#remote-id');
	var $remoteImage = $('#remote-image');

	// handle incoming messages
	socket.on('init', function(data) {
		$selfId.text(data.id);
	});
	socket.on('webcam', function(data) {
		// new image received (data.data) from another user (data.id)
		$remoteId.text(data.id);
		$remoteImage.attr('src', data.data);
	});
	socket.on('peer-disconnect', function(data) {
		// peer with id=data.id disconnected
	});
	socket.on('disconnect', function(data) {
		// connection lost
	});

	// request the webcam be made available
	webcam.create().done(function(webcam) {
		// scale the webcam to save ourselves some processing
		var size = webcam.getSourceSize();
		webcam.setSize(size.width * 0.2, size.height * 0.2);

		// show the webcam video
		$selfVideo.append(webcam.video);

		// show the webcam canvas
		$selfCanvas.append(webcam.canvas);

		// request 5 fps indefinitely
		setInterval(function() {
			// grab a video still onto the canvas
			webcam.snapshot();

			// manipulate the image
			// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
			var imageData = webcam.getImageData();
			var d = imageData.data;
			for ( var i = 0, l = d.length; i < l; i += 4) {
				var r = d[i];
				var g = d[i + 1];
				var b = d[i + 2];
				// CIE luminance for the RGB
				// The human eye is bad at seeing red and blue, so we
				// de-emphasize them.
				var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
				d[i] = d[i + 1] = d[i + 2] = Math.round(v / 16) * 16;
			}

			// draw the manipulated image back onto the canvas
			webcam.putImageData(imageData);

			// if the comms are online
			if (socket.socket.connected) {
				// send a message to the server containing the canvas image as a
				// data-url
				socket.emit('webcam', {
					data : webcam.toDataURL()
				});
			}
		}, 1000 / 5);
	});

});
