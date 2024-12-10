<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import {userVehiclesStore, fetchUserInfo,deleteVehicle, updateVehicles, createVehicle} from "$lib/stores/userInfoStore";
    import {authStore} from "$lib/stores/authStore";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import type IVehicle from "$lib/models/IVehicle";
    import {Input} from "$lib/components/ui/input";

    let vehicles:Array<IVehicle> = $state([]);
    let newVehicles: Array<IVehicle> = $state([]);
    let markedVehiclesToDelete: Array<string> = $state([]);

    let newVehicle = $state({brand:"", type:""});

    onMount(async () => {
        if($authStore.user){
            if($authStore.user.user_informations){
                await fetchUserInfo($authStore.user.user_informations);

                if($userVehiclesStore.length > 0)
                    vehicles = $userVehiclesStore;
            }
        }
    })

    async function handleSave(){
        await updateVehicles(vehicles);

        for(let vehicle of newVehicles){
            let brand = vehicle.brand ? vehicle.brand : "";
            let type = vehicle.type ? vehicle.type : "";

            await createVehicle($authStore.user?.user_informations, {brand, type});
        }

        for(let vehicleId of markedVehiclesToDelete){
            await deleteVehicle(vehicleId, $authStore.user?.user_informations);
        }

        goto("/my-profile");
    }

    async function removeNewVehicleFromList(id:string){
        newVehicles = newVehicles.filter((vehicle) => vehicle.id !== id);
    }

    async function handleNewVehicle(){
        let brand = newVehicle.brand;
        let type = newVehicle.type;
        let id = crypto.randomUUID();

        newVehicles.push({id,brand, type});

        clearNewVehicle();
    }

    function clearNewVehicle(){
        newVehicle.brand = "";
        newVehicle.type = "";
    }

    async function handleMarkForDeletion(vehicleId:string){
        markedVehiclesToDelete.push(vehicleId);
    }

    async function removeFromMarkedForDeletion(vehicleId:string){
        markedVehiclesToDelete = markedVehiclesToDelete.filter((id) => id !== vehicleId);
    }

</script>

<div class="container flex justify-center">
    <Card.Root class="w-4/5 m-12">
        <Card.Header>
            <Card.Title>Vehicle</Card.Title>
        </Card.Header>
        <Card.Content>
                {#each vehicles as vehicle}
                    <Card.Root class="m-4">
                        <Card.Content>
                            <div class="my-2">
                                <label for="brand">Brand</label>
                                <Input name="brand" placeholder="vehicle brand" bind:value={vehicle.brand}/>
                            </div>
                            <div class="my-2">
                                <label for="type">Type</label>
                                <Input name="type" placeholder="vehicle type" bind:value={vehicle.type}/>
                            </div>
                            <div class="flex justify-end gap-2 mt-4">
                                {#if !markedVehiclesToDelete.includes(vehicle.id)}
                                    <button onclick={async () => await handleMarkForDeletion(vehicle.id)} class="btn btn-danger">Add deletion mark</button>
                                {:else}
                                    <button onclick={async () => await removeFromMarkedForDeletion(vehicle.id)} class="btn btn-success">Remove deletion mark</button>
                                {/if}
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}
                {#each newVehicles as vehicle}
                    <Card.Root class="m-4">
                        <Card.Content>
                            <div class="my-2">
                                <label for="brand">Brand</label>
                                <Input name="brand" placeholder="vehicle brand" bind:value={vehicle.brand}/>
                            </div>
                            <div class="my-2">
                                <label for="type">Type</label>
                                <Input name="type" placeholder="vehicle type" bind:value={vehicle.type}/>
                            </div>
                            <div class="flex flex-col justify-end gap-2 mt-4">
                                <p>This vehicle is not saved yet. To save changes click "save changes"</p>
                                <button onclick={async () => await removeNewVehicleFromList(vehicle.id)} class="btn btn-danger">Remove vehicle</button>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/each}

            <Card.Root class="m-4">
                <Card.Header>
                    <h2>New Vehicle</h2>
                </Card.Header>
                <Card.Content>
                    <div class="my-2">
                        <label for="brand">Brand</label>
                        <Input name="brand" placeholder="vehicle brand" bind:value={newVehicle.brand}/>
                    </div>
                    <div class="my-2">
                        <label for="type">Type</label>
                        <Input name="type" placeholder="vehicle type" bind:value={newVehicle.type}/>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <button onclick={async () => handleNewVehicle()} class="btn btn-success">Create Vehicle</button>
                        <button onclick={async () => clearNewVehicle()} class="btn btn-primary">Clear Vehicle</button>
                    </div>
                </Card.Content>
            </Card.Root>

            <button onclick={handleSave} class="btn btn-primary">Save changes</button>
            <button onclick={() => goto("/my-profile")} class="btn btn-danger">cancel</button>
        </Card.Content>
    </Card.Root>
</div>