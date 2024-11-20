<script lang="ts">
    import { MapLibre } from 'svelte-maplibre';
    import { onMount, onDestroy } from 'svelte';
    import maplibregl from 'maplibre-gl';
    import { io } from 'socket.io-client';
    let { defaultLat, defaultLng, tileSheet } = $props();
    let map: any;
    let userMarker: any;
    let otherUserMarkers = new Map<string, maplibregl.Marker>();
    let socket: any;

    onMount(() => {
        map = new maplibregl.Map({
            container: 'map',
            style: tileSheet,
            center: [defaultLng, defaultLat],
            zoom: 15,
        });

        // placeholder
        socket = io('http://localhost:3000');

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userLocation = { lat: latitude, lng: longitude };

                    socket.emit('locationUpdate', userLocation);

                    if (!userMarker) {
                        userMarker = new maplibregl.Marker({ color: 'blue' })
                            .setLngLat([longitude, latitude])
                            .addTo(map);
                    } else {
                        userMarker.setLngLat([longitude, latitude]);
                    }

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

        socket.on('userLocations', (locations: any) => {
            console.log('Updated user locations:', locations);
            updateMarkers(locations);
        });
    });

    onDestroy(() => {
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

<div id="map" style="width: 100%; height: 90vh;"></div>
