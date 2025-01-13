<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import maplibregl from 'maplibre-gl';
    import {io} from 'socket.io-client';
    import {toast} from "@zerodevx/svelte-toast";
    import {authStore, getUserInformationId, getUserNameById} from '$lib/stores/authStore';
    import {fetchUserInfoForOther, userInfoStore} from '$lib/stores/userInfoStore';
    import BlockScreen from "$lib/components/block-screens/BlockScreen.svelte";
    import {fetchMinimalEvents, eventMinimalStore} from "$lib/stores/eventMinimalStore";
    import {Speedometer} from "$lib/components/ui/speedometer";
    import {Button} from "$lib/components/ui/button";

    let {defaultLat, defaultLng, tileSheet} = $props();
    let map: any;
    let userMarker: any;
    let otherUserMarkers = new Map<string, maplibregl.Marker>();
    let socket: any;
    let errorMessage = $state('');
    let showMap = $state(true);
    let calculatedSpeed =  $state(0);
    let followUser = $state(true);

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
        map.on('load', () => {
            //do not follow user, if looking at event
            followUser = false;
            const urlParams = new URLSearchParams(window.location.search);
            const defaultLat = urlParams.get('defaultLat') ?? null;
            const defaultLng = urlParams.get('defaultLng') ?? null;

            if (defaultLng && defaultLat) {
                map.setCenter([defaultLng, defaultLat]);
            }
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

                    if (followUser) {
                        map.setCenter([longitude, latitude]);
                    }
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

        initRevlineMap();
        if (window) {
            // get query params
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('event');
            if (eventId) {
                console.log('Event ID: ', atob(eventId));
            }
        }
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

                getUserNameById(location.userId).then((name) => {
                    if (name) {
                        getUserInformationId(location.userId).then((userInformationID) => {
                            fetchUserInfoForOther(userInformationID).then((userInformation) => {
                               let image = `https://revline-db.programar.io/api/files/${userInformation?.collectionId}/${userInformation?.id}/${userInformation?.Photo}`;

                                marker.setPopup(new maplibregl.Popup().setHTML('<img src="' + image + '" width="50" height="50">' + '<h1>' + name + '</h1>'))
                                    .setLngLat([location.lng, location.lat])
                                    .addTo(map);
                            })
                        })
                    }
                })

                marker.addClassName("user-marker");

                //fetchUserInfoForOther(location.userId).then((userInfo) => {
                    //if (userInfo?.mapIconChoice === 'Motorcycle') {
                    //    marker.removeClassName("user-marker");
                    //    marker.addClassName('user-marker-motorcycle');
                    //}
                //});

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
    {#if !followUser}
        <Button class="fixed z-50 rounded-lg" style="bottom:10%; right: 24px; width: 64px; height: 64px" onclick={() => followUser = true}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="2 2 12 12">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
        </Button>
    {/if}
    <Speedometer calculatedSpeed={calculatedSpeed}/>
    <div id="map" style="width: 100%; height: 100vh;"></div>
{:else}
    <BlockScreen fullscreen={true} text={errorMessage}/>
{/if}

