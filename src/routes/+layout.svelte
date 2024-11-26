<script lang="ts">
	import '../app.css';
    import Navigation from "$lib/components/Navigation.svelte";
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { SvelteToast } from '@zerodevx/svelte-toast'
    let { children } = $props();

    const toastOptions = {
        duration: 5000,
        position: 'top-right',
        type: 'warning',
        dismissible: true,
        pauseOnHover: true,
        label: 'Close',
        icon: 'CheckIcon',
    }
</script>

{@render children()}
<SvelteToast options={toastOptions} />
<Navigation/>
