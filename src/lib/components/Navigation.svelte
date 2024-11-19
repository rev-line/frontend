<script>
    import {BadgePlus, Map, SquareChartGantt, UserPen} from "lucide-svelte";
</script>

<div class="navigation justify-content-center">
    <div class="row">
        <div class="col-3">
            <a href="/">
                <Map/>
            </a>
        </div>
        <div class="col-3">
            <a href="/events">
                <SquareChartGantt/>
            </a>
        </div>
        <div class="col-3">
            <a href="/create-event">
                <BadgePlus/>
            </a>
        </div>
        <div class="col-3">
            <a href="/my-profile">
                <UserPen/>
            </a>
        </div>
    </div>
</div>
