module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected to socket');

        // reply
        io.to(socket.id).emit('foo', { color: 'red' });
        io.to(socket.id).emit('bar', { color: 'blue' });
    });
};
