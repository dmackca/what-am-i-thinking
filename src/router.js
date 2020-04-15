import newId from 'kung-fu-id-generator';

import Vue from 'vue';
import Router from 'vue-router';
import Menu from './views/Menu.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            // main menu
            path: '/',
            name: 'home',
            component: Menu,
        },
        {
            // join game
            path: '/game/:gameId',
            name: 'game',
            component: () => import(/* webpackChunkName: "game" */ './views/Game.vue'),
        },
        {
            // new game: generate a new game id and redirect
            path: '/game',
            redirect: () => {
                const newGameId = newId();
                return {
                    name: 'game',
                    params: {
                        gameId: newGameId,
                    },
                };
            },
        },
    ],
});
