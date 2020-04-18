<template lang="html">
    <aside class="how-to-play content box">
        <h1 class="title is-2">
            How to play
        </h1>

        <p>
            <q>We all know how this is played, ...</q>
        </p>

        <ol>
            <li>Both players think of a word separately</li>
            <li>They secretly send their word to their opponent</li>
            <li>Both guesses are revealed at the same time</li>
            <li class="has-text-info has-text-weight-bold">
                Players try to figure out what word the two guesses have in common
            </li>
            <li>Keep guessing until both players guess the same word</li>
        </ol>

        <article class="message is-info">
            <div class="message-body">
                For example, if you guess <b>umbrella</b> and your opponent guesses <b>ball</b>,
                you could try guessing <b>beach</b>.
            </div>
        </article>

        <p>
            <q>...If you haven't played before, you'll pick it up!</q>
        </p>

        <div class="has-text-centered">
            <b-button
                type="is-primary"
                @click="$parent.close()"
            >
                Okay!
            </b-button>
        </div>
    </aside>
</template>

<script>
export default {
};
</script>

<style lang="scss">
.how-to-play {
    q {
        font-style: italic;
    }
}
</style>
