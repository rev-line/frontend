<script lang="ts">
    import { eventMinimalStore, fetchMinimalEvents, getRegisteredUserCount } from "$lib/stores/eventMinimalStore";
    import {onMount} from "svelte";
    import * as Card from "$lib/components/ui/card";
    import {Button} from "$lib/components/ui/button";
    import {addEventToUser} from "$lib/stores/userInfoStore";

    let userCounts: Record<string, number> = {};

    onMount(() => {
        fetchMinimalEvents();

        $eventMinimalStore.forEach((event) => {
            if (!userCounts[event.id]) {
                getRegisteredUserCount(event.id).then(count => {
                    userCounts[event.id] = count;
                });
            }
        });
    })

    async function registerUserForEvent(eventId: string) {
        await addEventToUser(eventId);
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        // 1 Stunde abziehen
        date.setHours(date.getHours());

        return new Intl.DateTimeFormat('de-DE', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'UTC', // Setzt sicher, dass keine automatische Zeitzonenanpassung erfolgt
        }).format(date);
    }

</script>

<div class="container flex flex-col justify-center items-center nav-spacer">
    <h1 class="text-3xl mb-4"> Events </h1>
    {#if $eventMinimalStore.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {#each $eventMinimalStore as event}

                    <Card.Root>
                        <Card.Header>
                            <Card.Title>{event.name}</Card.Title>
                            <Card.Description>
                                {#if event.rideout}
                                    <h2 class="text">Rideout</h2>
                                {:else}
                                    <h2>Hangout</h2>
                                {/if}
                            </Card.Description>
                        </Card.Header>
                        <Card.Content>
                            {#if event.start_date}
                                <p>Start Date: {formatDate(event.start_date)}</p>
                            {/if}
                            {#if event.duration}
                                <p>End Date: {formatDate(event.duration)}</p>
                            {/if}
                            <p>Registered people: {userCounts[event.id] || 0} / {event.max_people}</p>
                            <a href={'/?event=' + btoa(event.id) + (event.start_latitude ? ('&defaultLat=' + event.start_latitude) : '') + (event.start_longitude ? ('&defaultLng=' + event.start_longitude) : '')} class="max-w-96 w-full">
                                <button class="btn btn-primary">Go to event</button>
                            </a>
                            {#if true}
                                <button class="btn btn-primary" on:click={async () => await registerUserForEvent(event.id)}>Register</button>
                            {/if}
                        </Card.Content>
                    </Card.Root>



            {/each}
        </div>
    {/if}
</div>
