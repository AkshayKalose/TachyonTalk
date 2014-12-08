// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');

var http = require('http');

var querystring = require('querystring');

// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});

	app.get('/create', function(req,res){

		// Generate unique id for the room
		var id = Math.round((Math.random() * 1000000));

		// Redirect to the random room
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){

		// Render the chant.html view
		res.render('chat');
	});

	// Initialize a new socket.io application, named 'chat'
	var chat = io.of('/socket').on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			var room = findClientsSocket(io,data,'/socket');
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id, '/socket');
			// Only two people per room are allowed
			if (room.length < 2) {

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
				socket.lang = data.lang;

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);


				// Add the client to the room
				socket.join(data.id);

				if (room.length == 1) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			var room = findClientsSocket(io,socket.room,'/socket');

			var sender, receiver;

			if (room[0].username == data.user) {
				sender   = room[0];
				receiver = room[1];
			} else {
				sender   = room[1];
				receiver = room[0];
			}

			getAndSendTranslatedMessage(true, data.msg, sender.lang, receiver.lang, socket, data, undefined, 0);

		});
	});
};

function getAndSendTranslatedMessage(send, messageO, flang, tlang, socket, data, other_lang, retries) {
	url = "http://api.mymemory.translated.net/get?" + querystring.stringify({q: messageO}) + "&langpair=" + flang + "|" + tlang + "&mt=1";

	var messageT;

	var request = http.get(url, function (response) {
	    // data is streamed in chunks from the server
	    // so we have to handle the "data" event    
	    var buffer = "", 
	        json,
	        route;

	    response.on("data", function (chunk) {
	        buffer += chunk;
	    }); 

	    response.on("end", function (err) {
	        // finished transferring data
	        // dump the raw data
	        //console.log(buffer);
	        //console.log("\n");
	        json = JSON.parse(buffer);
	        //console.log(json);
	        messageT = json.responseData.translatedText;

	        // use machine translation
	        for (var mat in json.matches) {
	        	if ((json.matches[mat].reference).indexOf('Machine Translation') > -1) {
	        		messageT = json.matches[mat].translation;
	        		break;
	        	}
	        }

	        if (messageT == null && send) {
	        	alternateTranslate(true, messageO, flang, tlang, socket, data, retries);
	        }
	        if (messageT != null && !send) {
	        	alternateTranslate(false, messageT, flang, other_lang, socket, data, retries);
	        }
	        if (send) sendTranslatedText(messageT, socket, data);

	        // null while taking alternate pathway
	        // WORST CASE SCENARIO - Could not be translated.
	        // Sometimes, must re-request couple times to get proper translation.
	        // if alternate pathway(getting to english) fails
	        if (messageT == null && !send) {
	        	// maximum of 3 retries to translate.
	        	if (retries < 3) {
	        		getAndSendTranslatedMessage(true, messageO, flang, other_lang, socket, data, undefined, retries + 1);
	        	} else {
	        		sendTranslatedText('Could not be translated.', socket, data);
	        	}
	        }
	    }); 
	}); 
}

// provides alternate translation pathway. flang -> English(en) -> tlang
function alternateTranslate(first, message, flang, tlang, socket, data, retries) {
	console.log('Taking Alternate Translation Pathway');
	if (first) {
		getAndSendTranslatedMessage(false, message, flang, 'en', socket, data, tlang, retries);
	} else {
		getAndSendTranslatedMessage(true, message, 'en', tlang, socket, data, flang, retries);
	}
}

function sendTranslatedText(message, socket, data) {
	socket.broadcast.to(socket.room).emit('receive', {msg: message, user: data.user, img: data.img});
}

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}


