const users = [];

const addUser = ({ id, username, room }) => {
    // Sanitize
    username = username.trim().toLowerCase() || null;
    room = room.trim().toLowerCase() || null;

    // Validate
    if ( !username || !room ) {
        return { error: 'Username and room are required!' }
    };

    // Check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username)
    if ( existingUser ) {
        return { error: 'Username is in use!'}
    };

    // Store user
    const user = { id, username, room }
    users.push(user)

    return { user }
}

const removeUser = id => {
    const userIndex = users.findIndex(user => user.id === id);

    if ( userIndex < 0 ) {
        return { error: 'User not found' }
    }
    
    return users.splice(userIndex,1)[0]
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => users
    .filter(user => user.room.toLowerCase() === room.toLowerCase())

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
