<script>
    import {BadgePlus, Map, SquareChartGantt, UserPen} from "lucide-svelte";
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
        <div class="col-3 nav-item">
            <a href="/my-profile" data-sveltekit-reload>
                <UserPen/>
            </a>
        </div>
    </div>
</div>
