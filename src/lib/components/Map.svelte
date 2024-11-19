<script lang="ts">
    import { MapLibre } from 'svelte-maplibre';
    let {defaultLat, defaultLng, tileSheet} = $props();
    import { onMount, onDestroy } from 'svelte';
    import maplibregl from 'maplibre-gl';

    let map: any;
    let userMarker: any;
    let userLocation = $state({
        lat: 0,
        lng: 0
    }); // Default coordinates
    let watchId: number | undefined;

    onMount(() => {

    });

    onDestroy(() => {
        if (watchId !== undefined) {
            navigator.geolocation.clearWatch(watchId);
        }

        // Clean up the marker
        if (userMarker) {
            userMarker.remove();
        }
    });

   const initRevlineMap = (() => {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userLocation = { lat: latitude, lng: longitude };
                    console.log('User location:', userLocation);
                        if (!userMarker) {
                            // Create the marker for the first time
                            userMarker = new maplibregl.Marker()
                                .setLngLat([longitude, latitude])
                                .addTo(map);
                            console.log('Marker added:', [longitude, latitude]);
                        } else {
                            // Update the marker position
                            userMarker.setLngLat([longitude, latitude]);
                            console.log('Marker updated:', [longitude, latitude]);
                        }

                        // Optional: Update the map center to follow the user
                        map.setCenter([longitude, latitude]);
                },
                (error) => {
                    console.error('Error watching position:', error);
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    })

</script>

<MapLibre
        center={[userLocation.lng ?? defaultLat, userLocation.lat ?? defaultLng]}
        zoom={12}
        class="map"
        standardControls
        onload={initRevlineMap}
        style={tileSheet} />

<style>
    :global(.map) {
        height: 90vh;
    }
</style>
