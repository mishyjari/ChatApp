const express = require('express');
const path = require('path');
const http = require('http');
const hbs = require('hbs');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js');

// Set up Express server
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);

// Paths for views
const publicPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');

app.use(express.static(publicPath));

// Socket.io config
let count = 0;
io.on('connection', socket => {

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ username, room, id: socket.id });

        if ( error ) {
            return callback(error)
        }        

        username = user.username;
        room = user.room;

        socket.join(room);

        socket.emit('newMessage', generateMessage('The Beep-Boop Bot', `Welcome, ${username}!`));
        socket.broadcast.to(room).emit('newMessage', generateMessage('The Beep-Boop Bot', `${username} has joined the chat room.`));

        io.to(room).emit('roomData', {
            room,
            users: getUsersInRoom(room)
        })

        callback();
    })

    socket.on('newMessage', (msg, cb) => {
        const user = getUser(socket.id);

        if ( user ) {
            socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.username, msg));
            socket.emit('newMessage', generateMessage('Me', msg));
            cb(msg);
        }
    });

    socket.on('shareLocation', (latitude, longitude, cb) => {
        const user = getUser(socket.id)

        if ( user ) {
            socket.broadcast.to(user.room).emit('shareLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`));
            socket.emit('shareLocation', generateLocationMessage('Me', `https://google.com/maps?q=${latitude},${longitude}`))
            cb(`${latitude}, ${longitude}`);
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if ( user ) {
            io.to(user.room).emit('newMessage', generateMessage(`${user.username} has left!`));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

});

// Set view engine
// app.set('view engine', 'hbs');
// app.set('views', viewsPath);

// Routes
// app.get('/', ( req, res ) => {
//     res.render('index')
// });

// Start server
server.listen(port, () => {
    console.log('Server listening on port ' + port)
}); 