<template>
    <div class="game page container">
        <h1>This is the game page</h1>
        <h2>the <code>gameId</code> parameter is  <b>{{ gameId }}</b></h2>
        <p>there are {{ numPlayers }} in this room</p>
        <p># of guesses: {{ numGuesses }}</p>
        <section
            v-if="roomJoined && opponentId"
            class="game-screen section"
        >
            joined the room! {{ roomId }}<br>
            my ID: {{ playerId }}<br>
            opponent ID: {{ opponentId }}<br>

            <hr>

            <h1 class="title is-2">
                Guesses
            </h1>
            <div class="guesses">
                <div
                    v-for="{ player, opponent } in guesses"
                    :key="`${player}-${opponent}`"
                    class="guess"
                >
                    Mine: <b>{{ player }}</b> / Theirs: <b>{{ opponent }}</b>
                </div>
            </div>

            <b-field v-if="showNewGameButton">
                You won!!!!!!!!!
                <b-button
                    type="is-success"
                    @click="reset"
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

export default {
    name: 'GameView',

    data: () => ({
        socket: null,
        numPlayers: 0,
        roomId: null,
        playerId: null,
        opponentId: null,
        opponentGuess: '',
        guesses: [],
        guessInput: '',
        guessTime: true,
        showNewGameButton: false,
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
    },

    watch: {
        numPlayers(val, prev) {
            console.log('player number changed');
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
            } else {
                console.log('but this was was not opponent', 'it was', playerId);
            }
            this.checkGuesses();
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

            if (this.guessInput && this.opponentGuess) {
                this.guesses.push({
                    player: this.guessInput,
                    opponent: this.opponentGuess,
                });

                if (this.guessInput.toLowerCase() === this.opponentGuess.toLowerCase()) {
                    this.$buefy.toast.open({
                        message: `you win! ${this.numGuesses} guesses`,
                        type: 'is-success',
                        duration: 7000,
                    });
                    this.showNewGameButton = true;
                } else {
                    // new round
                    this.guessInput = '';
                    this.opponentGuess = '';
                    this.guessTime = true;
                }
            }
        },

        /**
         * reset state for a rematch
         */
        reset() {
            this.opponentGuess = '';
            this.guesses = [];
            this.guessInput = '';
            this.guessTime = true;
            this.showNewGameButton = false;
        },
    },
};
</script>
