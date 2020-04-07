<template>
    <div class="main-menu page">
        <h1>This is the menu page</h1>

        <b-field>
            <b-button
                tag="router-link"
                to="/game/"
                type="is-primary"
            >
                New game
            </b-button>
        </b-field>

        <b-field>
            <b-input
                v-model="joinGameId"
                placeholder="room ID"
            />
            <p class="control">
                <b-button
                    tag="router-link"
                    :to="joinGamePath"
                    type="is-link"
                >
                    Join Game
                </b-button>
            </p>
        </b-field>

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
