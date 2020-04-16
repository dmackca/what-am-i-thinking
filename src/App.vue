<template>
    <div
        id="app"
        class="section"
    >
        <div class="container">
            <div id="nav">
                <router-link to="/">
                    "What am I thinking?" {{ appVersion }}
                </router-link>
                <b-button
                    size="is-small"
                    type="is-info"
                    @click="showHowToPlay = true"
                >
                    Instructions
                </b-button>
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
            return `v${version}`;
        },
    },
};
</script>

<style lang="scss">
#app {
    .version {

    }
}
</style>
