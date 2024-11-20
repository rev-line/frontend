<script lang="ts">
	import { authStore, logout } from '$lib/stores/authStore';
	import {goto} from "$app/navigation";
	import Map from "$lib/components/Map.svelte";

	const defaultLat = 14.28611;
	const defaultLng = 48.30639;


	function handleLogout() {
		logout();
		goto('/login');
	}
</script>

<Map
		defaultLat={$authStore.isAuthenticated ? ($authStore.user?.lastLat ?? defaultLat) : defaultLat}
		defaultLng={$authStore.isAuthenticated ? ($authStore.user?.lastLng ?? defaultLng) : defaultLng}
		tileSheet="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>
