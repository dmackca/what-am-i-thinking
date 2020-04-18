<template lang="html">
    <div
        class="countdown-animation has-text-primary"
    >
        <div><span>Three...</span></div>
        <div><span>Two...</span></div>
        <div class="one">
            <span>One...</span>
        </div>
    </div>
</template>

<script>
export default {

};
</script>

<style lang="scss">
.countdown-animation {
    @keyframes scaleUpFadeIn {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }

    position: absolute;
    width: 300px;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    > div {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 700;
        font-size: 2.25rem;
        $stroke-color: #222;
        text-shadow:
                    -1px -1px 1px $stroke-color,
                    1px 1px 1px $stroke-color,
                    -1px 0px 1px $stroke-color,
                    0px -1px 1px $stroke-color,
                    0px 1px 1px $stroke-color,
                    1px 0px 1px $stroke-color,
                    -2px -1px 6px #626;

        $duration: 0.6s;
        opacity: 0;
        animation: scaleUpFadeIn $duration;

        &:nth-child(1) {
            z-index: 3;
        }
        &:nth-child(2) {
            z-index: 2;
            animation-delay: $duration;
        }
        &:nth-child(3) {
            z-index: 1;
            animation-delay: 2 * $duration;
        }
    }
}
</style>
