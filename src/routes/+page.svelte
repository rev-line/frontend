<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import Map from "$lib/components/Map.svelte";
	import {onMount} from "svelte";
	import {goto} from "$app/navigation";
	import {toast} from "@zerodevx/svelte-toast";

	const defaultLat = 14.28611;
	const defaultLng = 48.30639;

	onMount(()  => {
		if (!$authStore.isAuthenticated) {
			//redirect user if not authenticated
			goto('/login');
		}
	});
</script>
<Map
		defaultLat={$authStore.isAuthenticated ? ($authStore.user?.lastLat ?? defaultLat) : defaultLat}
		defaultLng={$authStore.isAuthenticated ? ($authStore.user?.lastLng ?? defaultLng) : defaultLng}
		tileSheet="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>
