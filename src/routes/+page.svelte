<script lang="ts">
	import { authStore, logout } from '$lib/stores/authStore';
	import {Button, buttonVariants} from "$lib/components/ui/button";
	import {goto} from "$app/navigation";
	import Navigation from "$lib/components/Navigation.svelte";

	function handleLogout() {
		logout();
		goto('/login');
	}
</script>



<Navigation/>
{#if $authStore.isAuthenticated}
	<p>Welcome, {$authStore.user?.email}!</p>
{/if}


{#if $authStore.isAuthenticated}
	<Button on:click={handleLogout} class={buttonVariants({ variant: "outline" })}>Logout</Button>
{:else}
	<h1>Kein User ist angemeldet</h1>
{/if}