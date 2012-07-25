require([ '/socket.io/socket.io.js', './webcam', './jquery-1.7.2.min' ],
		function(__io, webcam, __jquery) {

			var socket = io.connect(undefined, {});
			window.socket = socket;

			var scale = 0.02;

			new webcam.WebcamFactory().create(scale,
					function onSuccess(webcam) {
						setInterval(function() {
							if (socket.socket.connected) {
								socket.emit('webcam', {
									data : webcam.toDataURL("image/png")
								});
							}
						}, 1000 / 30);
					}, function onFailure(e) {
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

			socket.on('connect_failed', function(data) {
				$list.empty();
				imagesById = {};
				console.warn("connect failed");
			});
			socket.on('disconnect', function(data) {
				$list.empty();
				imagesById = {};
				console.warn("disconnected");
			});
			socket.on('reconnecting', function(reconnectionDelay,
					reconnectionAttempts) {
				console.warn(
						"Attempting to reconnect now. If this fails the next attempt will be made in "
								+ reconnectionDelay + "ms",
						reconnectionAttempts);
			});
			socket.on('reconnect_failed', function() {
				console.warn("could not reconnect");
			});
			socket.on('reconnect', function(transport_type,
					reconnectionAttempts) {
				console.log("reconnected successfully", transport_type,
						reconnectionAttempts);
			});
		});
