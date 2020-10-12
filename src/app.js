const express = require('express');
const path = require('path');
const http = require('http');
const hbs = require('hbs');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');

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
    socket.emit('newMessage', generateMessage('Welcome', 'Friendly Robot'));
    socket.broadcast.emit('newMessage', generateMessage('A User has joined', 'Friendly Robot'));

    socket.on('newMessage', (msg, cb) => {
        socket.broadcast.emit('newMessage', generateMessage(msg, 'New Message'));
        socket.emit('newMessage', generateMessage(msg, 'Me'));
        cb(msg);
    });

    socket.on('shareLocation', (latitude, longitude, cb) => {
        socket.broadcast.emit('shareLocation', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, 'A user has shared their location'));
        socket.emit('shareLocation', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, 'My Location'))
        cb(`${latitude}, ${longitude}`);
    });

    socket.on('disconnect', () => {
        io.emit('newMessage', generateMessage('A user has left', 'Friendly Robot'))
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