<template>
    <div class="game page">
        <div
            v-if="waitingForOpponent"
            class="waiting-for-opponent"
        >
            <h2 class="title is-2">
                Waiting for your opponent...
            </h2>
            <div class="field content">
                <p>
                    Your game code is <code v-text="roomId" />
                </p>
                <div class="control content">
                    <label class="label">Send this link to your opponent:</label>
                    <input
                        class="input"
                        :value="roomLink"
                        readonly
                        type="text"
                        @click="({ target }) => target.select()"
                    >
                </div>
                <p>
                    The game will start when your opponent joins
                </p>
            </div>
        </div>

        <section
            v-if="roomJoined && opponentId"
            class="game-screen"
        >
            <h1 class="title is-2">
                {{ numGuesses }} guesses
            </h1>
            <div
                class="guesses content"
                :class="{ 'counting-down': showCountdown }"
            >
                <div
                    v-for="({ player, opponent }, roundId) in guesses"
                    :key="roundId"
                    class="guess"
                >
                    Round {{ roundId + 1 }}) Yours: <b>{{ player }}</b> / Theirs: <b>{{ opponent }}</b>
                </div>
                <!-- show countdown animation on each "guessTime" -->
                <transition name="fade">
                    <countdown-animation
                        v-if="showCountdown"
                    />
                </transition>
            </div>

            <!-- only show latest guess? -->

            <p
                v-if="playerRequestedRematch"
                class="content has-text-info"
            >
                Requested a rematch; waiting for your opponent...
            </p>
            <p
                v-if="opponentRequestedRematch"
                class="content has-text-info"
            >
                Your opponent requested a rematch!
            </p>

            <div
                v-if="showRematchButton"
                class="content"
            >
                You won!!!!!!!!!<br>
                <b-button
                    type="is-success"
                    :disabled="playerRequestedRematch"
                    :loading="playerRequestedRematch"
                    @click="requestRematch"
                >
                    Rematch
                </b-button>
            </div>

            <b-field>
                <b-input
                    v-model="guessInput"
                    class="guess-input"
                    placeholder="Your guess"
                    :disabled="!guessTime"
                    :loading="!guessTime"
                    @keyup.enter.native="sendGuess"
                />
                <p class="control">
                    <b-button
                        :disabled="(!guessInput) || (!guessTime)"
                        type="is-primary"
                        @click="sendGuess"
                    >
                        Send guess
                    </b-button>
                </p>
            </b-field>

            <p v-if="guessTime">
                <i>Waiting for <b class="has-text-primary">your guess...</b></i>
            </p>
            <p v-if="!opponentGuess">
                <i>Waiting for opponent's guess...</i>
            </p>
        </section>
    </div>
</template>

<script>
import io from 'socket.io-client';

import { startConfetti } from '@/lib/confetti';

import CountdownAnimation from '@/components/CountdownAnimation';

export default {
    name: 'GameView',

    components: {
        CountdownAnimation,
    },

    data: () => ({
        socket: null,
        waitingForOpponent: true,
        numPlayers: 0,
        roomId: null,
        playerId: null,
        opponentId: null,
        opponentGuess: '', // guess from server
        guesses: [],
        guessInput: '',
        playerGuess: '', // guess from server
        guessTime: true,
        showRematchButton: false,
        playerRequestedRematch: false,
        opponentRequestedRematch: false,
        showCountdown: false,
    }),

    computed: {
        gameId() {
            return this.$route.params.gameId;
        },

        roomJoined() {
            return this.roomId !== null;
        },

        numGuesses() {
            return this.guesses.length;
        },

        currentGuessRound() {
            return this.numGuesses + 1;
        },

        roomLink() {
            return window.location.href;
        },
    },

    watch: {
        numPlayers(val, prev) {
            if (val === 2) {
                this.waitingForOpponent = false;
                this.$buefy.toast.open({
                    message: 'Your opponent joined the game',
                    type: 'is-info',
                });
            }

            if (prev > val) {
                this.errorFatal('A player left! Game over!');
            }
        },
    },

    created() {
        // create socket connection
        this.socket = io(process.env.VUE_APP_SOCKET_URL || null);

        // handle change in number of players
        this.socket.on('number of players', ({ players }) => {
            this.numPlayers = players.length;
            if (players.length > 1) {
                // find opponent's ID
                const opponent = players.find((id) => id !== this.playerId);
                this.opponentId = opponent;
            }
        });

        // on room join: start game
        this.socket.on('joined room', (data) => {
            this.roomId = data;
            this.playerId = this.socket.id;
        });
        this.socket.on('room already full', () => {
            this.errorFatal('This game already has 2 players');
        });

        // receive guess
        this.socket.on('player guessed', ({ guess, playerId, roundId }) => {
            if (roundId !== this.currentGuessRound) {
                this.errorFatal('Some irreconcilable out-of-sync thing happened!');
            }

            if (playerId === this.opponentId) {
                this.opponentGuess = guess;
            }

            if (playerId === this.playerId) {
                this.playerGuess = guess;
            }

            this.checkGuesses();
        });

        // receive rematch request
        this.socket.on('request rematch', ({ playerId }) => {
            if (playerId === this.opponentId) {
                this.opponentRequestedRematch = true;
            }

            if (this.playerRequestedRematch && this.opponentRequestedRematch) {
                this.reset();
            }
        });

        // attempt to join room
        this.socket.emit('join room', this.gameId);
    },

    beforeDestroy() {
        this.socket.close();
    },

    methods: {
        // display a snackbar for fatal errors and then go back to the homepage
        errorFatal(message) {
            // disconnect from socket
            this.socket.close();
            // show error message
            this.$buefy.snackbar.open({
                message,
                type: 'is-danger',
                // position: 'is-top',
                actionText: 'Aww, man!',
                indefinite: true,
                onAction: () => {
                    this.$router.push({ name: 'home' });
                },
            });
        },

        sendGuess() {
            if (!this.guessInput) {
                return false;
            }

            this.guessTime = false;
            this.socket.emit('guess', {
                guess: this.guessInput,
                roomId: this.roomId,
                roundId: this.currentGuessRound,
            });

            return true;
        },

        startCountdown() {
            this.showCountdown = true;
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.showCountdown = false;
                    resolve();
                }, 2000);
            });
        },

        async checkGuesses() {
            // don't check guesses if it's still guessTime
            if (this.guessTime) {
                return;
            }

            if (this.playerGuess && this.opponentGuess) {
                await this.startCountdown();

                this.guesses.push({
                    player: this.playerGuess,
                    opponent: this.opponentGuess,
                });

                if (this.playerGuess.toLowerCase() === this.opponentGuess.toLowerCase()) {
                    // start cheesy confetti drop effect
                    startConfetti(3000, 160);

                    // show congratulatory toast
                    this.$buefy.toast.open({
                        message: `You win! ${this.numGuesses} guesses`,
                        type: 'is-success',
                        duration: 7000,
                    });
                    this.guessInput = '';
                    this.playerGuess = '';
                    this.showRematchButton = true;
                } else {
                    // new round
                    this.guessInput = '';
                    this.playerGuess = '';
                    this.opponentGuess = '';
                    this.guessTime = true;
                }
            }
        },

        requestRematch() {
            this.playerRequestedRematch = true;
            this.socket.emit('request rematch', {
                roomId: this.roomId,
            });
        },

        /**
         * reset state for a rematch
         */
        reset() {
            this.opponentGuess = '';
            this.guesses = [];
            this.guessInput = '';
            this.playerGuess = '';
            this.guessTime = true;
            this.showRematchButton = false;
            this.playerRequestedRematch = false;
            this.opponentRequestedRematch = false;

            this.$buefy.toast.open({
                message: 'Starting a new game',
                type: 'is-info',
            });
        },
    },
};
</script>

<style lang="scss">
.fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.guesses {
    position: relative;
    min-height: 4rem;

    &.counting-down {
        .guess {
            opacity: .3;
        }
    }
}

.guess-input {
    width: 15rem;
}
</style>
