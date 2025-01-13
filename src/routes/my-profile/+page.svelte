<script lang="ts">
    import {logout} from "$lib/stores/authStore";
    import {userInfoStore, updateUserInfo} from "$lib/stores/userInfoStore";
    import {authStore,updateUsername} from "$lib/stores/authStore";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import * as Card from "$lib/components/ui/card";
    import * as Select from "$lib/components/ui/select";

    let image = $state('');
    let imageData: File;
    let username = $state('');
    let hangout = $state(true);
    let rideout = $state(true);
    let radius = $state(50);
    let pref_driving = $state(false);
    let pref_hosting = $state(false);
    let mapIcon = $state("Car");
    let visible = $state(true);

    onMount(() => {
        authStore.subscribe(() => {
           if($authStore.user){
               username = $authStore.user.username;
           }
           userInfoStore.subscribe(userInformation => {
               if (userInformation)
               {
                    image = `https://revline-db.programar.io/api/files/${userInformation.collectionId}/${userInformation.id}/${userInformation.Photo}`;
                    hangout = !!userInformation.looking_hangouts;
                    rideout = !!userInformation.looking_rideouts;
                    radius = userInformation.radius ? userInformation.radius : 25;
                    pref_driving = !!userInformation.pref_driving;
                    pref_hosting = !!userInformation.pref_hosting;
                    mapIcon = userInformation.mapIconChoice ? userInformation.mapIconChoice : 'Car';
                    visible = (image !== '') ? true : false;
               }

           });
       })
    });

    function handleLogout() {
        logout();

        if(!$authStore.isAuthenticated)
            goto("/login");
    }

    var handleProfileImageChange = function(event) {
        var reader = new FileReader();
        reader.onloadend = function(){
            image = reader.result;
            imageData = event.target.files[0];
            visible = true;
        }
        reader.readAsDataURL(event.target.files[0]);
    };

    function closeProfileImage() {
        visible = false;
        imageData = null;
    }

    async function handleSave() {
        await updateUsername($authStore.user!.id, username);

        await updateUserInfo($userInfoStore!.id, {
            Photo: imageData,
            looking_hangouts: hangout,
            looking_rideouts: rideout,
            radius: radius,
            pref_driving: pref_driving,
            pref_hosting: pref_hosting,
            mapIconChoice: mapIcon == "Car" ? "Car" : "Motorcycle"
        });
    }
</script>

<style>
    .profile-img {
        width: min(100%, 15em);

        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 1em;

        margin: auto;
    }

    .profile-form {
        margin-inline: auto;
        max-width: 30em;
    }
</style>

<div class="container flex justify-center">
    <Card.Root class="w-4/5 mb-24 mt-12">
        <Card.Header>
            <Card.Title>My Profile</Card.Title>
        </Card.Header>
        <Card.Content>
            <form id="userForm" class="profile-form d-flex flex-column gap-2 mt-4">
                <label class="btn border w-fit" for="fileInput">Upload Picture</label>
                <input id="fileInput" type="file" style="display:none"  onchange={handleProfileImageChange} accept="image/*" />
                {#if image}
                    {#if visible}
                        <div class="flex z-50 gap-8 justify-between items-start py-3 px-4 w-full bg-gray-50 border border-b border-gray-200 sm:items-center dark:border-gray-700 lg:py-4 dark:bg-gray-800">
                            <img src={image ?? 'empty-user.png'} alt="profile" class="profile-img mb-4">
                            <button onclick={closeProfileImage}>X</button>
                        </div>
                    {/if}

                {:else}
                    <div class="profile-img mb-4"></div>
                {/if}

                <input type="text" placeholder="username" class="form-control" bind:value={username} />
                <div class="form-check form-switch my-1">
                    <input class="form-check-input" type="checkbox" id="switchHangout" bind:checked={hangout} />
                    <label class="form-check-label" for="switchHangout">Look for hangouts</label>
                </div>
                <div class="form-check form-switch my-1">
                    <input class="form-check-input" type="checkbox" id="switchRideout" bind:checked={rideout} />
                    <label class="form-check-label" for="switchRideout">Look for rideouts</label>
                </div>
                <div class="my-1">
                    <label for="radius">Event search radius</label>
                    <input type="number" min="0" placeholder="radius" class="form-control" bind:value={radius} />
                </div>
                <div class="form-check form-switch my-1">
                    <input class="form-check-input" type="checkbox" id="pref_driving" bind:checked={pref_driving} />
                    <label class="form-check-label" for="pref_driving">Prefer driving</label>
                </div>
                <div class="form-check form-switch my-1">
                    <input class="form-check-input" type="checkbox" id="pref_hosting" bind:checked={pref_hosting} />
                    <label class="form-check-label" for="pref_hosting">Prefer hosting</label>
                </div>
                <div class="mb-4">
                    <Select.Root>
                        <Select.Trigger class="">
                            <Select.Value placeholder={mapIcon} />
                        </Select.Trigger>
                        <Select.Content class="bg-white">
                            <Select.Item on:click={() => mapIcon = "Car"} value="Car">Car</Select.Item>
                            <Select.Item on:click={() => mapIcon = "Motorcycle"} value="Motorcycle">Motorcycle</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </div>
                <a href="/my-profile/vehicle" class="btn btn-primary">Edit Vehicle</a>

                <div class="d-flex flex-row gap-2 mt-2">
                    <a href="/" onclick={async () => handleSave()} class="btn btn-success">save</a>
                    <a href="/login" onclick={handleLogout} class="btn btn-danger">logout</a>
                </div>
            </form>
        </Card.Content>
    </Card.Root>
</div>