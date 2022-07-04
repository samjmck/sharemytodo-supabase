<script lang="ts">
    import { supabase } from "./stores";

    async function signInWithTwitter() {
        await supabase.auth.signIn({
            provider: 'twitter'
        });
    }
    async function signInWithFacebook() {
        await supabase.auth.signIn({
            provider: 'facebook'
        });
    }
</script>

<div>
    <main>
        <h1>Sign in</h1>
        <button on:click={signInWithTwitter}>Sign in with Twitter</button>
        <button on:click={signInWithFacebook}>Sign in with Facebook</button>
    </main>
</div>

<style>
    div {
        position: absolute;
        z-index: 1;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 5em 0;
        background-color: #ffffff;
        top: 0;
    }
    main {
        max-width: 500px;
    }
</style>
