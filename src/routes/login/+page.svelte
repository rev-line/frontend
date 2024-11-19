<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import {Input} from "$lib/components/ui/input";
    import {Button, buttonVariants} from "$lib/components/ui/button";
    import { authStore, login} from "$lib/stores/authStore";
    import {goto} from "$app/navigation";

    let email: string = '';
    let password: string = '';

    function handleLogin(){
        try {
            login(email, password);

            if($authStore.user)
                goto('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    }

</script>

<div class="flex justify-center items-center h-screen">
    <Card.Root class="w-1/2 sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4">
        <Card.Header>
            <Card.Title>Login</Card.Title>
        </Card.Header>
        <Card.Content>
            <form>
                <Input type="text" bind:value={email} placeholder="Email" />
                <Input type="password" bind:value={password} placeholder="Password" />
                <Button on:click={handleLogin} class={buttonVariants({ variant: "outline" })}>Login</Button>
            </form>
        </Card.Content>
    </Card.Root>

</div>