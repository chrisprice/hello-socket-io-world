require([ './comms', './webcam', './jquery-1.7.2.min' ], function(comms, webcam, __jquery) {

	var socket = comms.connect();
	window.socket = socket;

	var scale = 0.4;

	var deferred = webcam.create(scale);
	deferred.done(function(webcam) {
		webcam.requestFrameImageData(5, 0).progress(function(imageData) {
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
			webcam.putImageData(imageData);
			if (socket.socket.connected) {
				socket.emit('webcam', {
					data : webcam.toDataURL()
				});
			}
		});
		$('body')/* .append(webcam.video) */.append(webcam.canvas);
	});
	deferred.fail(function(e) {
		console.log(e);
	});

	var $list = $('<ul/>').appendTo('body');
	var imagesById = {};
	function lookupImage(id) {
		var $img = imagesById[id];
		if (imagesById[id]) {
			return $img;
		}
		$img = $('<img/>');
		imagesById[id] = $img;
		var $item = $('<li/>').text(id).append($img);
		$list.append($item);
		return $img;
	}

	socket.on('init', function(data) {
		$list.prepend($('<li/>').text(data.id));
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

});
