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
                @keyup.enter.native="joinGame"
                @input="(val) => joinGameId = formatJoinGameId(val)"
            />
            <p class="control">
                <b-button
                    type="is-link"
                    :disabled="!joinGameId"
                    @click="joinGame"
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

    methods: {
        /**
         * redirect to the game with the given joinGameId
         */
        joinGame() {
            this.$router.push(this.joinGamePath);
        },

        /**
         * reformat "join game" id value on input
         * @param  {String} val typed/pasted input
         * @return {String}     formatted room ID
         */
        formatJoinGameId(val) {
            // trim whitespace
            let formatted = val.trim();
            // force lowercase
            formatted = formatted.toLowerCase();

            // if some dummy pastes in the whole url,
            // trim it for them
            if (formatted.startsWith('http')) {
                const idUrlPart = formatted.match(/[a-z-]+$/);
                if (idUrlPart) {
                    [formatted] = idUrlPart;
                }
            }

            // replace spaces with "-"
            const spaces = / /g;
            return formatted.replace(spaces, '-');
        },
    },
};
</script>
