<script lang="ts">
    import {logout} from "$lib/stores/authStore";
    import {userInfoStore, updateUserInfo} from "$lib/stores/userInfoStore";
    import {authStore,updateUsername} from "$lib/stores/authStore";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import * as Card from "$lib/components/ui/card";


    let image = $state('');
    let username = $state('');
    let hangout = $state(true);
    let rideout = $state(true);
    let radius = $state(50);

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
               }

           });
       })
    });

    function handleLogout() {
        logout();

        if(!$authStore.isAuthenticated)
            goto("/login");
    }

    async function handleSave() {
        await updateUsername($authStore.user!.id, username);

        await updateUserInfo($userInfoStore!.id, {
            looking_hangouts: hangout,
            looking_rideouts: rideout,
            radius: radius
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
    <Card.Root class="w-1/2 m-12">
        <Card.Header>
            <Card.Title>My Profile</Card.Title>
        </Card.Header>
        <Card.Content>
            <form class="profile-form d-flex flex-column gap-2 mt-4">
                {#if image}
                    <img src={image ?? 'empty-user.png'} alt="profile" class="profile-img mb-4">
                {:else}
                    <div class="profile-img mb-4"></div>
                {/if}

                <input type="text" placeholder="username" class="form-control" bind:value={username} />
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switchHangout" bind:checked={hangout} />
                    <label class="form-check-label" for="switchHangout">Look for hangouts</label>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="switchRideout" bind:checked={rideout} />
                    <label class="form-check-label" for="switchRideout">Look for rideouts</label>
                </div>
                <label for="radius">Event search radius</label>
                <input type="number" min="0" placeholder="radius" class="form-control" bind:value={radius} />

                <a href="/my-profile/vehicle" class="btn btn-primary">Edit Vehicle</a>

                <div class="d-flex flex-row gap-2 mt-2">
                    <a href="/" onclick={async () => handleSave()} class="btn btn-success">save</a>
                    <a href="/login" onclick={handleLogout} class="btn btn-danger">logout</a>
                </div>
            </form>
        </Card.Content>
    </Card.Root>
</div>