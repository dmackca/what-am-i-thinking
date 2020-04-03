<template>
    <div class="game page">
        <h1>This is the game page</h1>
        <h2>the <code>gameId</code> parameter is  {{ $route.params.gameId }}</h2>
    </div>
</template>

<script>
import io from 'socket.io-client';

export default {
    name: 'GameView',

    mounted() {
        const socket = io(process.env.VUE_APP_SOCKET_URL || null);
        socket.on('foo', (data) => {
            console.log('foo!', data);
        });
        socket.on('bar', (data) => {
            console.log('bar!', data);
        });
    },
};
</script>
