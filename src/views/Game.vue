<template>
    <div class="game page">
        <h1>This is the game page</h1>
        <h2>the <code>gameId</code> parameter is  <b>{{ gameId }}</b></h2>
        <p>there are {{ numPlayers }} in this room</p>
    </div>
</template>

<script>
import io from 'socket.io-client';

export default {
    name: 'GameView',

    data: () => ({
        socket: null,
        numPlayers: 0,
    }),

    computed: {
        gameId() {
            return this.$route.params.gameId;
        },
    },

    created() {
        // create socket connection
        this.socket = io(process.env.VUE_APP_SOCKET_URL || null);

        // mess around for debugging - @TODO: delete this
        this.socket.on('foo', (data) => {
            console.log('foo!', data);
        });
        this.socket.on('bar', (data) => {
            console.log('bar!', data);
        });

        // handle change in number of players
        this.socket.on('number of players', (numPlayers) => {
            this.numPlayers = numPlayers;
        });

        // attempt to join room
        this.socket.on('joined room', (data) => {
            console.log('joined room!', data);
        });
        this.socket.emit('join room', this.gameId);
    },

    mounted() {
        console.log('mounted');
    },

    beforeDestroy() {
        console.log('beforeDestroy!');
        this.socket.close();
        console.log('closed socket');
    },
};
</script>
