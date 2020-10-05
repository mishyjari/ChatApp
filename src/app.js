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
io.on('connection', () => {
    console.log('New websocket connection.')
})

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