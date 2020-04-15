<template>
    <div id="app">
        <div id="nav">
            <router-link to="/">
                "What am I thinking?" {{ appVersion }}
            </router-link>
        </div>
        <router-view />
    </div>
</template>

<script>
import { version } from '../package.json';

export default {
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
