<script lang="ts">
    import { MapLibre } from 'svelte-maplibre';
    import { onMount, onDestroy } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import { io } from 'socket.io-client';
    import {toast} from "@zerodevx/svelte-toast";
    import { authStore } from '$lib/stores/authStore';
    import BlockScreen from "$lib/components/block-screens/BlockScreen.svelte";
    let { defaultLat, defaultLng, tileSheet } = $props();
    let map: any;
    let userMarker: any;
    let otherUserMarkers = new Map<string, maplibregl.Marker>();
    let socket: any;
    let errorMessage =  $state('');
    let showMap = $state(true);

    if(!$authStore.isAuthenticated) {
        // this way, we can verify the status is actually correct before showing the error message
        setTimeout(() => {
            errorMessage = 'Please log in to use this feature.';
            showMap = false;
        }, 750);
    }

    const initRevlineMap = () => {
        map = new maplibregl.Map({
            container: 'map',
            style: tileSheet,
            center: [defaultLng, defaultLat],
            zoom: 15,
        });

        // placeholder
        socket = io('https://revline-express.programar.io/');

        if(!socket) {
            toast.push('Could not establish socket connection.');
            showMap = false;
        }

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userLocation = { lat: latitude, lng: longitude, userId: $authStore.user?.id};

                    socket.emit('locationUpdate', userLocation);

                    if (!userMarker) {
                        userMarker = new maplibregl.Marker({ color: 'blue', className: 'self-user-marker' })
                            .setPopup(new maplibregl.Popup().setHTML('<h1>You are here</h1>'))
                            .setLngLat([longitude, latitude])
                            .addTo(map);
                    } else {
                        userMarker.setLngLat([longitude, latitude]);
                    }

                    map.setCenter([longitude, latitude]);
                },
                (error) => {
                    toast.push('Please allow location access to use this feature.');
                    console.error('Error watching position:', error);
                    errorMessage = 'Please allow location access to use this feature.';
                    showMap = false;
                },
                { enableHighAccuracy: true }
            );
        } else {
            toast.push('Geolocation is not available in your browser');
            console.error('Geolocation is not available');
        }

        socket.on('userLocations', (locations: any) => {
            console.log('Updated user locations:', locations);
            updateMarkers(locations);
        });
    }



    onMount(() => {
        if(!$authStore.isAuthenticated) {
            errorMessage = 'Please log in to use this feature.';
            showMap = false;
            return;
        }
        initRevlineMap();
    });

    onDestroy(() => {
        if(map) {
            map.destroy();
        }

        if (socket) {
            socket.disconnect();
        }

        if (userMarker) {
            userMarker.remove();
        }

        otherUserMarkers.forEach((marker) => marker.remove());
    });

    function updateMarkers(locations: any) {
        const existingIds = new Set();

        locations.forEach((location: any) => {
            const id = `${location.lat}-${location.lng}`;

            existingIds.add(id);

            if (!otherUserMarkers.has(id)) {
                const marker = new maplibregl.Marker({ color: 'red' })
                    .setPopup(new maplibregl.Popup().setHTML('<h1>' + location.userId + '</h1>'))
                    .setLngLat([location.lng, location.lat])
                    .addTo(map);

                otherUserMarkers.set(id, marker);
            } else {
                otherUserMarkers.get(id)?.setLngLat([location.lng, location.lat]);
            }
        });

        otherUserMarkers.forEach((marker, id) => {
            if (!existingIds.has(id)) {
                marker.remove();
                otherUserMarkers.delete(id);
            }
        });
    }
</script>

{#if showMap}
    <div id="map" style="width: 100%; height: 100vh;"> </div>
    {:else}
    <BlockScreen fullscreen={true} text={errorMessage} />
{/if}

