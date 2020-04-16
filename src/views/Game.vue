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
                    Tell your opponent to join the room <code v-text="roomId" />, or send them this link:
                </p>
                <div class="control">
                    <input
                        class="input"
                        :value="roomLink"
                        readonly
                        type="text"
                        @click="({ target }) => target.select()"
                    >
                </div>
            </div>
        </div>

        <section
            v-if="roomJoined && opponentId"
            class="game-screen"
        >
            <h1 class="title is-2">
                {{ numGuesses }} Guesses
            </h1>
            <div class="guesses">
                <div
                    v-for="{ player, opponent } in guesses"
                    :key="`${player}-${opponent}`"
                    class="guess"
                >
                    Yours: <b>{{ player }}</b> / Theirs: <b>{{ opponent }}</b>
                </div>
            </div>

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

            <b-field v-if="showRematchButton">
                You won!!!!!!!!!
                <b-button
                    type="is-success"
                    :disabled="playerRequestedRematch"
                    :loading="playerRequestedRematch"
                    @click="requestRematch"
                >
                    Rematch
                </b-button>
            </b-field>

            <b-field>
                <b-input
                    v-model="guessInput"
                    placeholder="Your Guess"
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
                <i>waiting for <b class="has-text-primary">your guess...</b></i>
            </p>
            <p v-if="!opponentGuess">
                <i>waiting for opponent's guess...</i>
            </p>
        </section>
    </div>
</template>

<script>
import io from 'socket.io-client';

import { startConfetti } from '@/lib/confetti';

export default {
    name: 'GameView',

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
            console.log('player number changed');
            if (val === 2) {
                this.waitingForOpponent = false;
                this.$buefy.toast.open({
                    message: 'Your opponent joined the game',
                    type: 'is-info',
                });
            }

            if (prev > val) {
                this.errorFatal('a player left! game over!');
            }
        },
    },

    created() {
        // create socket connection
        this.socket = io(process.env.VUE_APP_SOCKET_URL || null);

        // handle change in number of players
        this.socket.on('number of players', ({ players }) => {
            this.numPlayers = players.length;
            console.log('players updated:', players);
            if (players.length > 1) {
                // find opponent's ID
                const opponent = players.find((id) => id !== this.playerId);
                console.log('opponent id is:', opponent);
                this.opponentId = opponent;
            }
        });

        // on room join: start game
        this.socket.on('joined room', (data) => {
            console.log('joined room!', data);
            this.roomId = data;
            this.playerId = this.socket.id;
        });
        this.socket.on('room already full', () => {
            this.errorFatal('this game already has 2 players');
        });

        // receive guess
        this.socket.on('player guessed', ({ guess, playerId, roundId }) => {
            console.log('a player guessed!', playerId, roundId);

            if (roundId !== this.currentGuessRound) {
                console.log('player guessed for the wrong round!');
                console.log('you\'re on %d and they\'re on %d', this.currentGuessRound, roundId);
                this.errorFatal('some irreconcilable out-of-sync thing happened!');
            }

            if (playerId === this.opponentId) {
                console.log('it was your opponent!');
                this.opponentGuess = guess;
            }

            if (playerId === this.playerId) {
                console.log('it was you!');
                this.playerGuess = guess;
            }

            this.checkGuesses();
        });

        // receive rematch request
        this.socket.on('request rematch', ({ playerId }) => {
            console.log(playerId, 'requested rematch');

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
        console.log('beforeDestroy!');
        this.socket.close();
        console.log('closed socket');
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
            console.log('sendGuess!', this.guessInput, this.currentGuessRound);

            if (!this.guessInput) {
                console.log('blank! no!');
                return false;
            }

            this.guessTime = false;
            this.socket.emit('guess', {
                guess: this.guessInput,
                roomId: this.roomId,
                roundId: this.currentGuessRound,
            });
        },

        checkGuesses() {
            // don't check guesses if it's still guessTime
            if (this.guessTime) {
                return;
            }

            if (this.playerGuess && this.opponentGuess) {
                this.guesses.push({
                    player: this.playerGuess,
                    opponent: this.opponentGuess,
                });

                if (this.playerGuess.toLowerCase() === this.opponentGuess.toLowerCase()) {
                    // start cheesy confetti drop effect
                    startConfetti(3000, 160);

                    // show congratulatory toast
                    this.$buefy.toast.open({
                        message: `you win! ${this.numGuesses} guesses`,
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
                message: 'starting a new game',
                type: 'is-info',
            });
        },
    },
};
</script>
