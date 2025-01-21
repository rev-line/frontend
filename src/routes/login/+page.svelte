<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import {Input} from "$lib/components/ui/input";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import {authStore, login} from "$lib/stores/authStore";
    import {goto} from "$app/navigation";
    import {schema} from "$lib/schemas/loginSchema";
    import { toast } from '@zerodevx/svelte-toast'

    let email: string = '';
    let password: string = '';
    let error_msg: string = '';
    let login_error: boolean = false;

    async function handleLogin(){
        try {
            const result = schema.safeParse({ email, password });
            error_msg = '';
            if (result.success) {
                await login(email, password);

                if($authStore.user) {
                    await goto('/');
                    toast.push('Login successful!');
                }
                else {
                    error_msg = 'Invalid login credentials!';
                    login_error = true;
                }
            } else {
                login_error = true;
                //display error returned from form validation
                let errors = result.error.format();
                if (errors.email) {
                    error_msg += errors.email._errors[0];
                }
                if (errors.password) {
                    error_msg += errors.password._errors[0];
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            error_msg = 'Invalid Login credentials';
            login_error = true;
        }
    }

</script>

<div class="flex justify-center items-center h-screen">
    <Card.Root class="w-1/2 sm:w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
        <Card.Header>
            <Card.Title>Login</Card.Title>
        </Card.Header>
        <Card.Content>
            <form>
                <Input type="text" bind:value={email} placeholder="Email" />
                <Input type="password" bind:value={password} placeholder="Password" />
                <div class="flex justify-around mt-2">
                    <Button on:click={handleLogin} class={`${buttonVariants({ variant: "outline" })} w-3/5`}>Login</Button>
                    <Button href="/login/newUser" class={`${buttonVariants({ variant: "outline" })} w-3/5`}>Register</Button>
                </div>
                {#if login_error}
                <div class="flex mt-2 justify-center w-full">
                    <div class="flex z-50 gap-8 justify-between items-start py-3 px-4 w-full bg-red-600 border border-b border-gray-200 sm:items-center dark:border-gray-700 lg:py-4 dark:bg-gray-800">
                        <p>{error_msg}</p>
                        <button onclick={() => {login_error=false;}}>X</button>
                    </div>
                </div>
                {/if}
            </form>
        </Card.Content>
    </Card.Root>

</div>