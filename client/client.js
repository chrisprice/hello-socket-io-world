require([ './comms', './webcam', './jquery-1.7.2.min' ], function(comms, webcam, __jquery) {

	// create a connection to the server
	// http://socket.io/
	var socket = comms.connect();

	// very basic UI to deal with incoming messages
	var $container = $('body');
	var $list = $('<div/>').appendTo($container);
	var $self = $('<div/>').appendTo($container);

	var imagesById = {};
	function lookupImage(id) {
		return $img = imagesById[id]
				|| (imagesById[id] = $('<img/>').attr('title', id).appendTo($list));
	}

	// handle incoming messages
	socket.on('init', function(data) {
		$self.attr('title', data.id);
	});
	socket.on('webcam', function(data) {
		lookupImage(data.id).attr('src', data.data);
	});
	socket.on('peer-disconnect', function(data) {
		lookupImage(data.id).parent().remove();
	});
	socket.on('disconnect', function(data) {
		$list.empty();
		imagesById = {};
	});

	// request the webcam be made available
	webcam.create(0.4).done(function(webcam) {
		// show the webcam after it has been scaled onto the local canvas
		$self.prepend(webcam.canvas);

		// request 5 fps indefinitely of imagedata objects
		// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
		webcam.requestFrameImageData(5, 0).progress(function(imageData) {
			// manipulate the image
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
			// draw the image back onto the canvas
			webcam.putImageData(imageData);
			// if the comms are online
			if (socket.socket.connected) {
				// send a message to the server containing the canvas image as a
				// data-url
				socket.emit('webcam', {
					data : webcam.toDataURL()
				});
			}
		});
	});

});
