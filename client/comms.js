define([ '/socket.io/socket.io.js' ], function(__io) {
	return {
		connect : function() {
			var socket = io.connect(undefined, {});

			// debug logging
			socket.on('connecting', function(data) {
				console.debug("connecting using ", data);
			});
			socket.on('connect_failed', function() {
				console.error("connect failed");
			});
			socket.on('connect', function(data) {
				console.log("connected successfully");
			});

			socket.on('disconnect', function(data) {
				console.log("disconnected", data);
			});

			socket.on('reconnecting', function(reconnectionDelay, reconnectionAttempts) {
				console.debug(
						"Attempting to reconnect now. If this fails the next attempt will be made in "
								+ reconnectionDelay + "ms", reconnectionAttempts);
			});
			socket.on('reconnect_failed', function() {
				console.error("could not reconnect");
			});
			socket.on('reconnect', function(transport_type, reconnectionAttempts) {
				console.log("reconnected successfully", transport_type, reconnectionAttempts);
			});

			return socket;
		}
	};
});
