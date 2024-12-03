<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import maplibregl from 'maplibre-gl';
    import {io} from 'socket.io-client';
    import {toast} from "@zerodevx/svelte-toast";
    import {authStore} from '$lib/stores/authStore';
    import {fetchUserInfoForOther, userInfoStore} from '$lib/stores/userInfoStore';
    import BlockScreen from "$lib/components/block-screens/BlockScreen.svelte";
    import {fetchMinimalEvents, eventMinimalStore} from "$lib/stores/eventMinimalStore";
    import {Speedometer} from "$lib/components/ui/speedometer";

    let {defaultLat, defaultLng, tileSheet} = $props();
    let map: any;
    let userMarker: any;
    let otherUserMarkers = new Map<string, maplibregl.Marker>();
    let socket: any;
    let errorMessage = $state('');
    let showMap = $state(true);
    let calculatedSpeed =  $state(0);

    // we're running into an issue, where the map requires user input before it can be interacted with/ loaded
    // also, sometimes we receive the error "failed to fetch" from the cdn - might be related to the same issue
    let debugLine = "[" + Date.now() + "] Map.svelte: defaultLat: " + defaultLat + ", defaultLng: " + defaultLng + ", tileSheet: " + tileSheet;

    const initRevlineMap = () => {
        map = new maplibregl.Map({
            container: 'map',
            style: tileSheet,
            center: [defaultLng, defaultLat],
            zoom: 15,
        });

        socket = io('https://revline-express.programar.io/');

        if (!socket) {
            toast.push('Could not establish socket connection.');
            showMap = false;
        }

        debugLine += " - socket: " + socket;

        if (navigator.geolocation) {

            debugLine += " - navigator.geolocation is available";
            navigator.geolocation.watchPosition(
                (position) => {
                    const {latitude, longitude, speed} = position.coords;
                    const userLocation = {lat: latitude, lng: longitude, userId: $authStore.user?.id};

                    calculatedSpeed = speed !== null ? speed * 3.6 : 0;

                    socket.emit('locationUpdate', userLocation);

                    if (!userMarker) {

                        let popup = new maplibregl.Popup();
                        popup.setHTML('<h1>You are here</h1>')._closeButton.classList.add('d-none')

                        userMarker = new maplibregl.Marker({className: `self-user-marker`})
                            .setPopup(popup)
                            .setLngLat([longitude, latitude])
                            .addTo(map);

                        userInfoStore.subscribe(() => {
                            let isMotorcycle = $userInfoStore?.mapIconChoice === 'Motorcycle';

                            console.log($userInfoStore, $userInfoStore?.mapIconChoice, isMotorcycle);

                            if (isMotorcycle) {
                                userMarker.removeClassName('self-user-marker');
                                userMarker.addClassName('self-user-marker-motorcycle');
                            } else {
                                userMarker.removeClassName('self-user-marker-motorcycle');
                                userMarker.addClassName('self-user-marker');
                            }
                        })
                    } else {
                        userMarker.setLngLat([longitude, latitude]);
                    }

                    debugLine += " - userMarker: true";

                    map.setCenter([longitude, latitude]);
                },
                (error) => {
                    toast.push('Please allow location access to use this feature.');
                    console.error('Error watching position:', error);
                    errorMessage = 'Please allow location access to use this feature.';
                    showMap = false;
                },
                {enableHighAccuracy: true}
            );
        } else {
            toast.push('Geolocation is not available in your browser');
            console.error('Geolocation is not available');
        }

        fetchMinimalEvents().then(() => {
            $eventMinimalStore.map((event) => {
                let eventMarker = new maplibregl.Marker()
                    .setPopup(new maplibregl.Popup().setHTML('<h1>' + event.name + '</h1>'))
                    .setLngLat([event!.start_longitude!, event!.start_latitude!]);
                eventMarker.addClassName('event-marker');
                eventMarker.addTo(map);
            });
        });

        socket.on('userLocations', (locations: any) => {
            console.log('Updated user locations:', locations);
            updateMarkers(locations);
        });
    }


    onMount(() => {
        if (!$authStore.isAuthenticated) {
            errorMessage = 'Please log in to use this feature.';
            showMap = false;
            return;
        }

        if (window) {
            // get query params
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('event');
            if (eventId) {
                console.log('Event ID: ', atob(eventId));
            }
        }


        initRevlineMap();
        console.log(debugLine);
    });

    onDestroy(() => {
        if (map) {
            map.remove();
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
                let marker = new maplibregl.Marker({color: 'red'})
                    .setPopup(new maplibregl.Popup().setHTML('<h1>' + location.userId + '</h1>'))
                    .setLngLat([location.lng, location.lat])
                    .addTo(map);

                marker.addClassName("user-marker");

                fetchUserInfoForOther(location.userId).then((userInfo) => {
                    if (userInfo?.mapIconChoice === 'Motorcycle') {
                        marker.removeClassName("user-marker");
                        marker.addClassName('user-marker-motorcycle');
                    }
                });

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
    <Speedometer calculatedSpeed={calculatedSpeed}/>
    <div id="map" style="width: 100%; height: 100vh;"></div>
{:else}
    <BlockScreen fullscreen={true} text={errorMessage}/>
{/if}

