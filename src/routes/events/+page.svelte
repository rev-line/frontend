<script lang="ts">
    import { eventMinimalStore, fetchMinimalEvents } from "$lib/stores/eventMinimalStore";
    import {onMount} from "svelte";
    import * as Card from "$lib/components/ui/card";

    onMount(() => {
        fetchMinimalEvents();
    })
</script>

<div class="container flex flex-col justify-center items-center nav-spacer">
    <h1 class="text-3xl mb-4"> Events </h1>

    {#if $eventMinimalStore.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {#each $eventMinimalStore as event}
                <a href={'/?event=' + btoa(event.id) + (event.start_latitude ? ('&defaultLat=' + event.start_latitude) : '') + (event.start_longitude ? ('&defaultLng=' + event.start_longitude) : '')} class="max-w-96 w-full">
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
                            <p>ID: {event.id}</p>
                            <p>Max people: {event.max_people}</p>
                        </Card.Content>
                    </Card.Root>
                </a>
            {/each}
        </div>
    {/if}
</div>
