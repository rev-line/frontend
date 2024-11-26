<script lang="ts">
    import {logout} from "$lib/stores/authStore";
    import {Button} from "$lib/components/ui/button";

    function handleLogout() {
        logout()
    }
</script>

<Button on:click={handleLogout}>Logout</Button>
