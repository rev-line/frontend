<script>
    import {BadgePlus, ChartAreaIcon, Map, SquareChartGantt, UserPen} from "lucide-svelte";
    import {authStore} from "$lib/stores/authStore";
</script>

{#if $authStore.isAuthenticated}
    <div class="navigation justify-content-center">
        <div class="row">
            <div class="col nav-item">
                <a href="/" data-sveltekit-reload>
                    <Map/>
                </a>
            </div>
            <div class="col nav-item">
                <a href="/events" data-sveltekit-reload>
                    <SquareChartGantt/>
                </a>
            </div>
            <div class="col nav-item">
                <a href="/create-event" data-sveltekit-reload>
                    <BadgePlus/>
                </a>
            </div>
            <div class="col nav-item">
                <a href="/my-profile" data-sveltekit-reload>
                    <UserPen/>
                </a>
            </div>
            <div class="col nav-item">
                <a href="/stats" data-sveltekit-reload>
                    <ChartAreaIcon/>
                </a>
            </div>
        </div>
    </div>
{/if}
