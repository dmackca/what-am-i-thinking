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
                    :disabled="!joinGameId"
                >
                    Join Game
                </b-button>
            </p>
        </b-field>
    </div>
</template>

<script>
import { version } from '../../package.json';

export default {
    data: () => ({
        joinGameId: '',
    }),

    computed: {
        joinGamePath() {
            const joinGameId = this.joinGameId.trim();
            return `/game/${joinGameId}`;
        },

        appVersion() {
            return `v${version}`;
        },
    },
};
</script>
