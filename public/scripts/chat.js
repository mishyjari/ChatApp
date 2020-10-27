const socket = io();

const $messageForm = document.getElementById('newMessageForm');
const $messageFormInput = $messageForm.elements.message;
const $messageFormButton = document.getElementById('newMessageButton');
const $shareLocationButton = document.getElementById('shareLocationButton');
const $messages = document.getElementById('messages');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('share-location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Get height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Total height of messages container
    const contentHeight = $messages.scrollHeight;

    // Scroll position
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if ( contentHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('newMessage', msg => {
    const html = Mustache.render(messageTemplate, { 
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format("H:mm")
    });    
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('shareLocation', locationObj => {
    const html = Mustache.render(locationTemplate, { 
        username: locationObj.username,
        url: locationObj.url,
        createdAt: moment(locationObj.createdAt).format("H:mm")
     });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.getElementById('sidebar').innerHTML = html;
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
});

socket.emit('join', { username, room }, error => {
    if ( error ) {
        alert(error);
        location.href = '/'
    }
})