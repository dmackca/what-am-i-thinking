/**
 * broadcast number of players to a room
 * @param  {Server} io       Server instance
 * @param  {String} roomId name of the room to notify
 */
function updateRoomClients(io, roomId) {
    io.in(roomId).clients((error, clients) => {
        console.log('room name', roomId, 'current clients:', clients);
        // tell the clients how many are in the room
        io.in(roomId).emit('number of players', {
            players: clients,
        });
    });
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        const playerId = socket.id;
        console.log('a user connected to socket');

        socket.on('join room', (roomId) => {
            console.log(socket.id, 'trying to join room', roomId);
            io.in(roomId).clients((error, clients) => {
                console.log('current clients:', clients);
                if (clients.length >= 2) {
                    console.log(`already 2 in ${roomId} the room! not joining`);
                    io.to(socket.id).emit('room already full', roomId);
                } else {
                    socket.join(roomId);
                    console.log(socket.id, 'joined room', roomId);
                    io.to(socket.id).emit('joined room', roomId);
                    updateRoomClients(io, roomId);
                }
            });
        });

        socket.on('guess', ({ guess, roomId, roundId }) => {
            console.log(playerId, 'guessed', guess, 'in', roomId, roundId);
            io.in(roomId).emit('player guessed', {
                playerId,
                guess,
                roundId,
            });
        });

        // on player disconnection, notify the rooms they were in
        socket.on('disconnecting', () => {
            const { rooms } = socket;
            console.log(socket.id, 'disconnecting');

            socket.on('disconnect', () => {
                console.log('and disconnected.');
                console.log('was in rooms: ', rooms);
                Object.keys(rooms).forEach((roomId) => {
                    // skip the disconnected client's own id namespace
                    if (roomId === socket.id) return;
                    // notify the room that someone left
                    updateRoomClients(io, roomId);
                    io.in(roomId).emit('player left', null);
                });
            });
        });
    });
};
