const express = require('express');
const path = require('path');
const http = require('http');
const hbs = require('hbs');
const socketio = require('socket.io');

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
    io.emit('newMessage', 'A user has joined.');

    socket.on('newMessage', (msg, cb) => {
        socket.broadcast.emit('newMessage', `New Message: ${msg}`);
        socket.emit('newMessage', msg);
        cb(msg);
    });

    socket.on('shareLocation', (latitude, longitude, cb) => {
        socket.broadcast.emit('shareLocation', `A user has shared their location: https://google.com/maps?q=${latitude},${longitude}`);
        cb(`${latitude}, ${longitude}`)
    });

    socket.on('disconnect', () => {
        io.emit('newMessage', 'A user has left')
    });
});

// Set view engine
app.set('view engine', 'hbs');
app.set('views', viewsPath);

// Routes
app.get('/', ( req, res ) => {
    res.render('index')
});

// Start server
server.listen(port, () => {
    console.log('Server listening on port ' + port)
}); 