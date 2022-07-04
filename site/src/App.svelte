<script lang="ts">
    import { isLoggedIn } from "./stores";
    import LoginModal from "./LoginModal.svelte";
    import List from "./List.svelte";

    import { lists } from "./stores";

</script>

<div class:signed-in={$isLoggedIn}>
    <LoginModal />
</div>

{#each $lists as list}
    <List list={list} />
{/each}

<style>
    :root {
        font-size: 1.2em;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    :global(body) {
        margin: 0;
    }
    div.signed-in {
        display: none;
    }
</style>
