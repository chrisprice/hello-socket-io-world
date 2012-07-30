var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var terminal = require('terminal');
var nodeTerminal = require('node-terminal');

io.set('log level', 1);
// io.set('transports', [ 'websocket' ]);

app.listen(4951);

app.use(express.static(__dirname + '/../client'));

app.get('/', function(req, res) {
	res.render('index.jade', {
		layout : false
	});
});

var clients = [];

setInterval(function() {
	nodeTerminal.clear();
	nodeTerminal.move(0, 0);

	terminal.printTable([ {
		title : 'ID',
		valueProperty : 'id',
		paddingRight : 25
	}, {
		title : 'Transport',
		valueProperty : 'transport',
		paddingRight : 15
	}, {
		title : 'Status',
		valueProperty : 'status',
		paddingRight : 15
	}, {
		title : 'Frames',
		valueProperty : 'frames',
		paddingLeft : 10
	}, {
		title : 'FPS',
		valueProperty : 'fps',
		paddingLeft : 10
	}, {
		title : 'Data',
		valueProperty : 'data',
		paddingLeft : 15
	}, {
		title : 'Rate',
		valueProperty : 'rate',
		paddingLeft : 10
	} ], clients, '');

	clients.forEach(function(client) {
		client.fps = 0;
		client.rate = 0;
	});
}, 1000);

io.sockets.on('connection', function(socket) {
	var client = {
		id : socket.id,
		transport : socket.transport,
		status : "Connected",
		frames : 0,
		fps : 0,
		data : 0,
		rate : 0
	};
	clients.push(client);
	socket.emit('init', {
		id : socket.id
	});
	socket.on('webcam', function(data) {
		client.frames++;
		client.fps++;
		var size = data.data && data.data.length;
		client.data += size;
		client.rate += size;
		socket.broadcast.volatile.emit('webcam', {
			data : data.data,
			id : socket.id
		});
	});
	socket.on('disconnect', function() {
		client.status = 'Disconnected';
		socket.broadcast.volatile.emit('peer-disconnect', {
			id : socket.id
		});
	});
});
