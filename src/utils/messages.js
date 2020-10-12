const generateMessage = ( text, heading ) => {
    return {
        text,
        createdAt: new Date().getTime(),
        heading
    }
};

const generateLocationMessage = ( url, heading ) => {
    return {
        url,
        heading,
        createdAt: new Date().getTime()
    }
}

module.exports = { generateMessage, generateLocationMessage };