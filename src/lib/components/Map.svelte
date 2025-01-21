<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import maplibregl, {type MapLibreEvent} from 'maplibre-gl';
    import {io} from 'socket.io-client';
    import {toast} from "@zerodevx/svelte-toast";
    import {authStore, getUserById} from '$lib/stores/authStore';
    import {addEventToUser, fetchUserInfoForOther, userInfoStore} from '$lib/stores/userInfoStore';
    import BlockScreen from "$lib/components/block-screens/BlockScreen.svelte";
    import {fetchMinimalEvents, eventMinimalStore} from "$lib/stores/eventMinimalStore";
    import {Speedometer} from "$lib/components/ui/speedometer";
    import {Button} from "$lib/components/ui/button";
    import {goto} from "$app/navigation";
    import Supercluster from "supercluster";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    let {defaultLat, defaultLng, tileSheet} = $props();
    let map: any;
    let userMarker: any;
    let otherUserMarkers = new Map<string, maplibregl.Marker>();
    let otherUserList = new Map<string, object>();
    let socket: any;
    let errorMessage = $state('');
    let showMap = $state(true);
    let calculatedSpeed =  $state(0);
    let followUser = $state(true);
    let eventCreation = $state(true);
    let events: any = $state([]);
    let zoomLevel: any = $state(15);

    // we're running into an issue, where the map requires user input before it can be interacted with/ loaded
    // also, sometimes we receive the error "failed to fetch" from the cdn - might be related to the same issue
    let debugLine = "[" + Date.now() + "] Map.svelte: defaultLat: " + defaultLat + ", defaultLng: " + defaultLng + ", tileSheet: " + tileSheet;

    async function registerForEvent(eventId: string): Promise<void> {
        await addEventToUser(eventId);
    }

    function createEventMarker() {
        eventCreation = !eventCreation;
        if (map) {
            // On click on map, place marker for event creation
            map.on('click', async (e) => {
                let lat = e.lngLat.lat;
                let lng = e.lngLat.lng;
                let popup = new maplibregl.Popup();
                let link = "/create-event?lat=" + lat + "&lng=" + lng;
                const eventMarker = new maplibregl.Marker({className: `event-marker`})
                    .setPopup(popup)
                    .setLngLat([lng, lat])
                    .addTo(map);
                try {
                    await goto(link);

                } catch (e) {
                    console.error(e);
                }
            });
        }
    }
    const initRevlineMap = () => {
        // Create map
        map = new maplibregl.Map({
            container: 'map',
            style: tileSheet,
            center: [defaultLng, defaultLat],
            zoom: 15,

        });

        // Center map on user on load
        map.on('load', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const defaultLat = urlParams.get('defaultLat') ?? null;
            const defaultLng = urlParams.get('defaultLng') ?? null;

           // map.setLayoutProperty('user-marker', 'icon-allow-overlap', true);
           // map.setLayoutProperty('user-marker-motorcycle', 'icon-allow-overlap', true);
           // map.setLayoutProperty('event-marker', 'icon-allow-overlap', true);

            if (defaultLng && defaultLat) {
                followUser = false;
                map.setCenter([defaultLng, defaultLat]);
            }
        });


        map.on('dragstart', () => {
            //stop following user on map dragging
            followUser = false;
        });

        // Initialize Websocket for streaming data
        socket = io('https://revline-express.programar.io/');

        if (!socket) {
            toast.push('Could not establish socket connection.');
            showMap = false;
        }

        debugLine += " - socket: " + socket;
        if (navigator.geolocation) {
            // Update position on map when user moves
            debugLine += " - navigator.geolocation is available";
            navigator.geolocation.watchPosition(
                (position) => {
                    const {latitude, longitude, speed} = position.coords;
                    const userLocation = {lat: latitude, lng: longitude, userId: $authStore.user?.id};

                    calculatedSpeed = speed !== null ? speed * 3.6 : 0;

                    socket.emit('locationUpdate', userLocation);

                    if (!userMarker) {
                        // Add popover on user marker
                        let popup = new maplibregl.Popup();
                        popup.setHTML('<h1>You are here</h1>')._closeButton.classList.add('d-none')

                        // Create user marker (Motorcycle or car) depending on user settings
                        userMarker = new maplibregl.Marker({className: `self-user-marker`})
                            .setPopup(popup)
                            .setLngLat([longitude, latitude])
                            .addTo(map);
                        userMarker.getElement().style.zIndex = 0;

                        userInfoStore.subscribe(() => {
                            let isMotorcycle = $userInfoStore?.mapIconChoice === 'Motorcycle';

                            // Set css class to show the according svg
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
                // Create markers for events
                let eventMarker = new maplibregl.Marker()
                    .setPopup(new maplibregl.Popup().setHTML(
                        '<h1>' + event.name + '</h1>' +
                        '<br><button class="btn btn-primary" onclick="navigateToEvent(' + [event!.start_longitude!, event!.start_latitude!] + ')">Navigate to event</button>'))
                    .setLngLat([event!.start_longitude!, event!.start_latitude!]);
                eventMarker.addClassName('event-marker');
                eventMarker.addTo(map);
                events.push({id: event, lng: event!.start_longitude!, lat: event!.start_latitude!});
            });
        });

        // Listen for other user's location changes
        socket.on('userLocations', (locations: any) => {
            updateMarkers(locations);
        });

        map.on('zoomend', () => {
            // Group close markers together so they don't overlap
            let zoomLevel = map.getZoom();
            if(zoomLevel > 16) {
                document.querySelectorAll('.maplibregl-marker:not(.event-marker)').forEach((marker) => {
                    marker.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.maplibregl-marker:not(.event-marker)').forEach((marker) => {
                    marker.style.display = 'none';
                });
            }
        })
    }

    // Only show map if user is logged in
    onMount(async () => {
        if (!$authStore.isAuthenticated) {
            errorMessage = 'Please log in to use this feature.';
            showMap = false;
            return;
        }

        initRevlineMap();
    });

    $effect(() => {
        if (window && events.length > 0) {
            if (window) {
                // get query params
                const urlParams = new URLSearchParams(window.location.search);
                const eventId = urlParams.get('event');
                if (eventId) {
                    // Move map to event when navigated to event by url
                    const event = events.find((event: any) => event[0].id === atob(eventId));
                    if (event) {
                        map.setCenter([event.lng, event.lat]);
                    }
                }
            }
        }
    });

    // Clean up on destroy
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

    // Center map on user
    function setUserLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            const {latitude, longitude, speed} = position.coords;
            if (map) {
                map.setCenter([longitude, latitude]);
            }
            if (!followUser) {
                followUser = true;
            }
        });
    }

    function updateMarkers(locations: any) {
        const existingIds = new Set();

        locations.forEach((location: any) => {
            const id = `${location.lat}-${location.lng}-${location.userId}`;

            existingIds.add(id);

            if (!otherUserMarkers.has(id)) {
                let marker = new maplibregl.Marker({color: 'red'})

                getUserById(location.userId).then((user) => {
                        if(!user) return;

                        // Fetch user information so marker's popover can show profile picture/name
                        fetchUserInfoForOther(user.user_informations).then((userInformation) => {
                            let image = `https://revline-db.programar.io/api/files/${userInformation?.collectionId}/${userInformation?.id}/${userInformation?.Photo}`;

                            marker.setPopup(new maplibregl.Popup().setHTML('<img src="' + image + '" width="50" height="50">' + '<h1>' + user.username + '</h1>'))
                                .setLngLat([location.lng, location.lat])
                                .addTo(map).addClassName('user-marker');

                            if (userInformation?.mapIconChoice === 'Motorcycle') {
                                marker.removeClassName("user-marker");
                                marker.addClassName('user-marker-motorcycle');
                            }

                            //add username and location of other users to map for display
                            if (user.id != $authStore.user?.id) {
                                otherUserList.set(user.username, {lng: location.lng, lat: location.lat});
                            }

                        }).catch((err) => {
                            console.error('Error getting user name:', err);
                            let name = "Unknown User";
                            marker.setPopup(new maplibregl.Popup().setHTML('<h1>' + name + '</h1>'))
                                .setLngLat([location.lng, location.lat])
                                .addTo(map);
                            marker.addClassName('user-marker');
                        });
                    }).catch((err) => {
                        console.error('Error getting user name:', err);
                        let name = "Unknown User";
                        marker.setPopup(new maplibregl.Popup().setHTML('<h1>' + name + '</h1>'))
                            .setLngLat([location.lng, location.lat])
                            .addTo(map);
                        marker.addClassName('user-marker');
                    });




                otherUserMarkers.set(id, marker);
            } else {
                otherUserMarkers.get(id)?.setLngLat([location.lng, location.lat]);
            }
        });

        // Remove old markers
        otherUserMarkers.forEach((marker, id) => {
            if (!existingIds.has(id)) {
                marker.remove();
                otherUserMarkers.delete(id);
            }
        });


        let points = locations.map((location: any) => {
            return {
                type: 'Feature',
                properties: {
                    cluster: false,
                    userId: location.userId
                },
                geometry: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                }
            };
        });

        const cluster = new Supercluster({ radius: 50, maxZoom: 16, extent: 256 });
        cluster.load(points);

        // Get clusters for a zoom level
        const clusters = cluster.getClusters([-180, -85, 180, 85], 10); // Adjust zoom level

        if(!map.getSource('clusters')) {
            map.addSource('clusters', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                cluster: true,
                clusterRadius: 50,
                clusterMaxZoom: 16
            });
        }

        if(!map.getLayer('clusters')) {
            // Add cluster circles
            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'clusters',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#00ffe8',
                    'circle-radius': 15
                }
            }, 'unclustered-points');
            map.addLayer({
                id: 'simple-cluster-count\'',
                type: 'symbol',
                source: 'clusters',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count}',
                    'text-size': 12,
                },
            }, 'unclustered-points');

            map.addLayer({
                id: 'unclustered-points',
                type: 'circle',
                source: 'clusters',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#11b4da',
                    'circle-radius': 5
                }
            });
        }

        // Update source data with clusters
        const clustersData = cluster.getClusters([-180, -85, 180, 85], Math.floor(map.getZoom()));
        map.getSource('clusters').setData({
            type: 'FeatureCollection',
            features: clustersData
        });
    }
    function showOtherUser(lng, lat) {
        if (map) {
            map.setCenter([lng, lat]);
            followUser = false;
        }
    }
</script>

{#if showMap}
    <DropdownMenu.Root >
        <DropdownMenu.Trigger asChild let:builder>
            <Button class="fixed z-50 rounded-lg" style="top: 16px; left: 16px" builders={[builder]}>
                <p class="font-bold">
                    Show Users
                </p>
            </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="bg-white">
            <DropdownMenu.Group>
                {#each [...otherUserList] as [user, coords]}
                    <DropdownMenu.Item onclick={() => showOtherUser(coords.lng, coords.lat)}>{user}</DropdownMenu.Item>
                {/each}
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
    {#if eventCreation}
        <Button class="fixed z-50 rounded-lg" style="bottom:20%; right: 24px; width: 64px; height: 64px" onclick={createEventMarker}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus" viewBox="4 4 8 8">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
            </svg>
        </Button>
    {/if}
    <Button class="fixed z-50 rounded-lg" style="bottom:10%; right: 24px; width: 64px; height: 64px" onclick={setUserLocation}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="2 2 12 12">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>
    </Button>
    <Speedometer calculatedSpeed={calculatedSpeed}/>
    <div id="map" style="width: 100%; height: 100vh;"></div>
{:else}
    <BlockScreen fullscreen={true} text={errorMessage}/>
{/if}

