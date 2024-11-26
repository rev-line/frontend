<script lang="ts">
    import { eventMinimalStore, fetchMinimalEvents } from "$lib/stores/eventMinimalStore";
    import {onMount} from "svelte";
    import * as Card from "$lib/components/ui/card";
    import {goto} from "$app/navigation";

    onMount(() => {
        fetchMinimalEvents();
    })

    function handleRedirectDetailView(){
        goto('/');
    }
</script>

<div class="container flex flex-col justify-center items-center">
    <h1 class="text-3xl"> Events </h1>

    {#if $eventMinimalStore.length > 0}
            {#each $eventMinimalStore as event}
                <button class="w-3/4" on:click={handleRedirectDetailView}>
                    <Card.Root class="mt-2" >
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
                </button>
            {/each}
    {/if}
</div>

