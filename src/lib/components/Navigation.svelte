<script>
    import {BadgePlus, LogIn, Map, SquareChartGantt, UserPen} from "lucide-svelte";
    import {authStore} from "$lib/stores/authStore.ts";
</script>

<div class="navigation justify-content-center">
    <div class="row">
        <div class="col-3 nav-item">
            <a href="/" data-sveltekit-reload>
                <Map/>
            </a>
        </div>
        <div class="col-3 nav-item">
            <a href="/events" data-sveltekit-reload>
                <SquareChartGantt/>
            </a>
        </div>
        <div class="col-3 nav-item">
            <a href="/create-event" data-sveltekit-reload>
                <BadgePlus/>
            </a>
        </div>
        {#if $authStore.isAuthenticated}
            <div class="col-3 nav-item">
                <a href="/my-profile" data-sveltekit-reload>
                    <UserPen/>
                </a>
            </div>
        {:else}
            <div class="col-3 nav-item">
                <a href="/login" data-sveltekit-reload>
                    <LogIn/>
                </a>
            </div>
        {/if}

    </div>
</div>
