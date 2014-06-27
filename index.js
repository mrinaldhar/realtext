var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)

app.get('/', function(req, res) {
		res.sendfile('index.html');
		});
var usernames = {};
var numUsers = 0;

io.sockets.on('connection', function(socket) {
		var addedUser = false;

		console.log('A client connected.');
		socket.on('disconnect', function() {
			console.log(socket.username+' has disconnected.');
			if (addedUser) {
			delete usernames[socket.id];
			--numUsers;
			io.emit('updatelist', usernames);
			}
			});
		socket.on('chatmsg', function(data){
			console.log('you are: '+socket.username+', sending to: '+ data.to+' message: '+data.msg);
			// io.emit('chatmsg', { to: data.to, msg: data.msg});

			var to = data.to;
			// console.log(io.sockets.connected[to]);
			io.sockets.connected[to].emit('chatmsg', {from: socket.id, to: data.to, msg: data.msg});
			});
		
		socket.on('add user', function(username) {
			console.log('User: '+socket.username+'. Total connected: '+numUsers);
			socket.username = username;
			usernames[socket.id]=username;
			++numUsers;
			addedUser = true;
			io.emit('updatelist', usernames);
			});	
		socket.on('chatsent', function(to) {
			io.sockets.connected[to].emit('chatsent', 'okay'); //design flaw. its sent to everybody.
			});
		socket.on('asktotalk', function(data) {
			var to = data.to;
			var from = data.from;
			var fname = usernames[from];
			// console.log(data.);
			io.sockets.connected[to].emit('asktotalk', {fname: fname, fid: from});
		});
		socket.on('perm_granted', function(data) {
			var to = data.to;
			// console.log(io.sockets.connected[to]);
			io.sockets.connected[to].emit('perm_granted', {fromid: data.from, fromname: socket.username});

		});
		});
http.listen(3000, function() {
		console.log('Listening on 3000');
		});
