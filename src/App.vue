<template>
    <div
        id="app"
        class="section"
    >
        <div class="container">
            <div id="nav">
                <router-link
                    to="/"
                    class="title is-1 has-text-light fancy-header"
                >
                    What am I thinking?
                </router-link>
                <aside class="header-meta">
                    <b-button
                        icon-left="question-circle"
                        icon-pack="fa"
                        size="is-small"
                        type="is-info"
                        class="instructions-button"
                        @click="showHowToPlay = true"
                    >
                        Instructions
                    </b-button>
                    <h2 class="subtitle is-7 version-display is-aligned-right">
                        version {{ appVersion }}
                    </h2>
                </aside>
                <hr>
            </div>
            <router-view />
            <b-modal
                :active.sync="showHowToPlay"
                trap-focus
                aria-role="dialog"
                aria-modal
                width="25em"
            >
                <how-to-play />
            </b-modal>
        </div>
    </div>
</template>

<script>
import HowToPlay from '@/views/HowToPlay';
import { version } from '../package.json';

export default {
    components: {
        HowToPlay,
    },

    data: () => ({
        showHowToPlay: false,
    }),

    computed: {
        appVersion() {
            return `${version}`;
        },
    },
};
</script>

<style lang="scss">
#app {
    .fancy-header {
        font-family: 'Rock Salt', cursive;
        text-shadow: 2px 1px 1px #222;
    }

    .header-meta {
        position: absolute;
        right: 1em;
        top: 1em;

        .version-display {
            opacity: 0.5;
        }
    }
}
</style>
