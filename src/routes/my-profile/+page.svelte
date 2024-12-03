<script lang="ts">
    import {logout} from "$lib/stores/authStore";
    import {userInfoStore} from "$lib/stores/userInfoStore";
    import {authStore} from "$lib/stores/authStore";
    import {onMount} from "svelte";


    let image = $state('');

    let username = $state('');
    let hangout = $state(true);
    let rideout = $state(true);
    let radius = $state(50);

    onMount(() => {
       authStore.subscribe(() => {
           userInfoStore.subscribe(a => {
               if (a)
                   image = `https://revline-db.programar.io/api/files/${a.collectionId}/${a.id}/${a.Photo}`;
           });
       })
    });

    function handleLogout() {
        logout();

        // TODO: Navigate back, cant be fucked to implement, cause server side BS
    }

    function save() {
        console.log("save");
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

    .content {
        margin-inline: auto;
    }

    .profile-form {
        margin-inline: auto;
        max-width: 30em;
    }
</style>

<div class="content">
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
        <input type="number" min="0" placeholder="radius" class="form-control" bind:value={radius} />

        <div class="d-flex flex-row gap-2 mt-2">
            <button onclick={save} class="btn btn-success">save</button>
            <button onclick={handleLogout} class="btn btn-danger">logout</button>
        </div>
    </form>
</div>
