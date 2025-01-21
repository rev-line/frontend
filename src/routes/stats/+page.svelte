<script lang="ts">
    import Chart, {type ChartItem} from 'chart.js/auto';
    import {onMount} from "svelte";
    import {fetchEventCreationCount, fetchUserCountByMonth} from "$lib/stores/userInfoStore";
    import * as Card from "$lib/components/ui/card";
    export const prerender = false;

    onMount(async () => {
        const userCount = await fetchUserCountByMonth();

        new Chart( document.getElementById("user-chart") as unknown as ChartItem , {
            type: "bar",
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                datasets: [
                    {
                        label: "Users",
                        data: userCount,
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                    },
                ],
            },
        });


        const eventCount = await fetchEventCreationCount();

        new Chart( document.getElementById("event-chart") as unknown as ChartItem , {
            type: "polarArea",
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                datasets: [
                    {
                        label: "Events",
                        data: eventCount,
                        backgroundColor: "rgba(29,85,121,0.2)",
                        borderColor: "rgb(28,176,17)",
                        borderWidth: 1,
                    },
                ],
            },
        });
    })

</script>

<div class="container-fluid">
    <div class="row">
        <div class="col-12 text-center">
            <Card.Root class="mx-1">
                <Card.Content>
                    <h1>Statistics</h1>
                </Card.Content>
            </Card.Root>
        </div>
        <div class="col-12 mt-3">
            <div class="row justify-content-center align-items-center">
                <Card.Root class="">
                    <Card.Content>
                        <div style="width: 500px;"><canvas id="user-chart"></canvas></div>
                    </Card.Content>
                </Card.Root>
                <Card.Root class="">
                    <Card.Content>
                        <div style="width: 450px; margin-top: 35px"><canvas id="event-chart"></canvas></div>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    </div>
</div>
