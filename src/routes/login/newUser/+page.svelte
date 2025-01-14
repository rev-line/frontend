<script lang="ts">
    import {Input} from "$lib/components/ui/input";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import { authStore, createUser, linkUserInformation} from "$lib/stores/authStore";
    import {userInfoStore, createUserInfo} from "$lib/stores/userInfoStore";
    import {goto} from "$app/navigation";
    import * as Card from "$lib/components/ui/card";
    import { schema } from '$lib/schemas/registrationSchema';
    import {toast} from "@zerodevx/svelte-toast";

    let email: string = '';
    let password: string = '';

    let accept_agb = false;
    let accept_dsgvo = false;

    let register_error = false;
    let error_msg = '';
    let errors = {};

    async function createNewUser(){
        try {
            const result = schema.safeParse({ email, password });
            error_msg = '';
            if (result.success) {
                await createUser(email, password);

                if($authStore.user)
                    await createUserInfo();
                await linkUserInformation($authStore?.user.id, $userInfoStore?.id);
                goto('/my-profile');
                toast.push('Registration successful!');
                errors = {}; // Clear previous errors
            } else {
                register_error = true;
                errors = result.error.format();
                if (errors.email) {
                    error_msg += errors.email._errors[0];
                }
                if (errors.password) {
                    error_msg += errors.password._errors[0];
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            error_msg = 'An unexpected error occurred';
            register_error = true;
        }
    }

</script>

<div class="flex justify-center items-center h-screen w-full">
    <div class="flex flex-col items-center w-full max-w-lg">
        <Card.Root class="flex-col w-full">
            <Card.Header>
                <Card.Title>Create new User</Card.Title>
            </Card.Header>
            <Card.Content>
                <form>
                    <Input type="text" bind:value={email} placeholder="Email" />
                    <Input type="password" bind:value={password} placeholder="Password" />
                    <div class="flex justify-around mt-2 w-full">
                        {#if accept_agb && accept_dsgvo}
                            <Button on:click={createNewUser} class={`${buttonVariants({ variant: "outline" })} w-2/5`}>Create User</Button>
                        {:else}
                            <Button disabled class={`${buttonVariants({ variant: "outline" })} w-2/5`}>Create User</Button>
                        {/if}

                        <Button href="/" class={`${buttonVariants({ variant: "outline" })} w-2/5`}>Cancel</Button>
                    </div>
                </form>
                {#if !accept_dsgvo || !accept_agb}
                    <label for="disabled_submit" class="text-center text-gray-500 text-xs">Please accept our Terms and DSGVO conditions to continue</label>
                {/if}
                <br>
                <label for="agb">I accept the <a target="_blank" href="https://cdn.programar.io/lAGa5/bODaPOSa61.pdf/raw" class="underline">Terms and Conditions</a></label>
                <input id="agb" type="checkbox" bind:checked={accept_agb}>
                <br>
                <label for="dsgvo">I accept the <a target="_blank" href="https://cdn.programar.io/lAGa5/YOkoLinu84.pdf/raw" class="underline">DSGVO conditions</a></label>
                <input id="dsgvo" type="checkbox" bind:checked={accept_dsgvo}>
            </Card.Content>
        </Card.Root>

        {#if register_error}
            <div class="flex mt-2 justify-center w-full">
                <div class="flex z-50 gap-8 justify-between items-start py-3 px-4 w-full bg-red-600 border border-b border-gray-200 sm:items-center dark:border-gray-700 lg:py-4 dark:bg-gray-800">
                    <p>{error_msg}</p>
                    <button onclick={() => {register_error=false;}}>X</button>
                </div>
            </div>
        {/if}
    </div>
</div>
