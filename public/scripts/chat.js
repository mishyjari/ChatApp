const socket = io();

const $messageForm = document.getElementById('newMessageForm');
const $messageFormInput = $messageForm.elements.message;
const $messageFormButton = document.getElementById('newMessageButton');
const $shareLocationButton = document.getElementById('shareLocationButton');
const $messages = document.getElementById('messages');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('share-location-template').innerHTML;

socket.on('newMessage', msg => {
    const html = Mustache.render(messageTemplate, { 
        msg: msg.text,
        heading: msg.heading,
        createdAt: moment(msg.createdAt).format("H:mm")
    });    
    $messages.insertAdjacentHTML('beforeend', html)
});

socket.on('shareLocation', locationObj => {
    const html = Mustache.render(locationTemplate, { 
        url: locationObj.url,
        heading: locationObj.heading,
        createdAt: moment(locationObj.createdAt).format("H:mm")
     });
    $messages.insertAdjacentHTML('beforeend', html)
});


$messageForm.addEventListener('submit', e => {
    e.preventDefault();

    const msg = $messageFormInput.value;

    if ( msg ) {
        $messageFormButton.setAttribute('disabled', 'diabled');

        socket.emit('newMessage', msg, msg => {
            $messageFormButton.removeAttribute('disabled');
            $messageFormInput.value = '';
            $messageFormInput.focus();
        });
    }
});

$shareLocationButton.addEventListener('click', () => {
    if ( !navigator.geolocation ) {
        return alert('Geolocation is not supported!')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled');
    $shareLocationButton.innerText = 'Fetching...'

    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        socket.emit('shareLocation', latitude, longitude, coords => {
            $shareLocationButton.removeAttribute('disabled');
            $shareLocationButton.innerText = 'Share Location'
        })
    })
})