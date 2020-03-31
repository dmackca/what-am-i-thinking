<template>
    <div class="main-menu page">
        <h1>This is the menu page</h1>

        <ul>
            <li>
                <router-link to="/game/">
                    New game
                </router-link>
            </li>
            <li>
                <router-link :to="joinGamePath">
                    Join game:
                </router-link>
                <b-input
                    v-model="joinGameId"
                    placeholder="room ID"
                />
            </li>
        </ul>

        <img
            alt="Vue logo"
            src="../assets/logo.png"
        >
    </div>
</template>

<script>
export default {
    data: () => ({
        joinGameId: '',
    }),

    computed: {
        joinGamePath() {
            return `/game/${this.joinGameId}`;
        },
    },
};
</script>
