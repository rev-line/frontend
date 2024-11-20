<script lang="ts">
	import '../app.css';
    import Navigation from "$lib/components/Navigation.svelte";
    import 'maplibre-gl/dist/maplibre-gl.css';
    let { children } = $props();
</script>

{@render children()}
<Navigation/>
