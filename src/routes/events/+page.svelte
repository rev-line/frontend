<script lang="ts">
    import { eventMinimalStore, fetchMinimalEvents } from "$lib/stores/eventMinimalStore";
    import {onMount} from "svelte";
    import * as Card from "$lib/components/ui/card";
    import {fetchEventDetails, eventDetailStore} from "$lib/stores/eventDetailStore";

    onMount(() => {
        fetchMinimalEvents();
        fetchEventDetails("30hxjmj4bfmsjrs");

        console.log($eventDetailStore)
    })
</script>

<div class="container">
    <h1> events </h1>

    {#if $eventMinimalStore.length > 0}
            {#each $eventMinimalStore as event}
                <Card.Root class="mt-2">
                    <Card.Header>
                        <Card.Title>{event.name}</Card.Title>
                        <Card.Description>Card Description</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <p>ID: {event.id}</p>
                    </Card.Content>
                    <Card.Footer>
                        <p>Card Footer</p>
                    </Card.Footer>
                </Card.Root>
            {/each}
    {/if}
</div>

