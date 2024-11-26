<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import Map from "$lib/components/Map.svelte";

	const defaultLat = 14.28611;
	const defaultLng = 48.30639;
</script>

<Map
		defaultLat={$authStore.isAuthenticated ? ($authStore.user?.lastLat ?? defaultLat) : defaultLat}
		defaultLng={$authStore.isAuthenticated ? ($authStore.user?.lastLng ?? defaultLng) : defaultLng}
		tileSheet="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>
