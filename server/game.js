/**
 * broadcast number of players to a room
 * @param  {Server} io       Server instance
 * @param  {String} roomName name of the room to notify
 */
function updateRoomClients(io, roomName) {
    io.in(roomName).clients((error, clients) => {
        console.log('room name', roomName, 'current clients:', clients);
        // tell the clients how many are in the room
        io.in(roomName).emit('number of players', clients.length);
    });
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('a user connected to socket');

        // reply to new connections (@TODO: delete this lol)
        io.to(socket.id).emit('foo', { color: 'red' });
        io.to(socket.id).emit('bar', { color: 'blue' });

        socket.on('join room', (roomName) => {
            console.log(socket.id, 'trying to join room', roomName);
            io.in(roomName).clients((error, clients) => {
                console.log('current clients:', clients);
                if (clients.length >= 2) {
                    console.log(`already 2 in ${roomName} the room! not joining`);
                    io.to(socket.id).emit('room already full', roomName);
                } else {
                    socket.join(roomName);
                    console.log(socket.id, 'joined room', roomName);
                    io.to(socket.id).emit('joined room', roomName);
                    updateRoomClients(io, roomName);
                }
            });
        });

        // on player disconnection, notify the rooms they were in
        socket.on('disconnecting', () => {
            const { rooms } = socket;
            console.log(socket.id, 'disconnecting');

            socket.on('disconnect', () => {
                console.log('and disconnected.');
                console.log('was in rooms: ', rooms);
                Object.keys(rooms).forEach((roomName) => {
                    // skip the disconnected client's own id namespace
                    if (roomName === socket.id) return;
                    // notify the room that someone left
                    updateRoomClients(io, roomName);
                    io.in(roomName).emit('player left', null);
                });
            });
        });
    });
};
