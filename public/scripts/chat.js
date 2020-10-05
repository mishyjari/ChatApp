const socket = io();

socket.on('newMessage', msg => {
    console.log(`${msg}`)
});

socket.on('shareLocation', msg => {
    console.log(msg)
    
})

document.getElementById('newMessageForm')
    .addEventListener('submit', e => {
        e.preventDefault();
        const msg = e.target.elements.message.value;
        socket.emit('newMessage', msg, msg => {
            console.log(`Me: ${msg}`)
        });
    });

document.getElementById('shareLocation')
    .addEventListener('click', () => {
        if ( !navigator.geolocation ) {
            return alert('Geolocation is not supported!')
        }

        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            socket.emit('shareLocation', latitude, longitude, coords => {
                console.log(`You have shared your location: ${coords}`)
            })
        })
    })