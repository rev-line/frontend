<script lang="ts">
    import { createEvent } from '$lib/stores/eventDetailStore';
    import type IEvent from '$lib/models/IEvent';
    import {goto} from "$app/navigation";

    // Define the form data with default values
    let eventData: Partial<IEvent> = {
        name: '',
        hangout: false,
        rideout: false,
        car: false,
        motorcycle: false,
        theme: '',
        start_date: '',
        duration: '',
        max_people: null,
        start_longitude: '',
        start_latitude: ''
    };

    // Handle form submission
    async function handleSubmit(event: Event) {
        event.preventDefault();
        try {
            await createEvent(eventData); // Call the event creation function
            await goto('/events')
        } catch (error) {
            console.error('Error creating event:', error);
        }
    }
</script>


<div class="container mx-auto max-w-lg p-6 bg-white shadow-md rounded-md nav-spacer">
    <h1 class="text-3xl font-bold text-center mb-6">Create Event</h1>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <!-- Name -->
        <div class="flex flex-col">
            <label for="name" class="font-medium mb-1">Event Name</label>
            <input
                    type="text"
                    id="name"
                    name="name"
                    bind:value={eventData.name}
                    placeholder="Enter event name"
                    required
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Hangout -->
        <div class="flex items-center space-x-2">
            <input
                    type="checkbox"
                    name="hangout"
                    id="hangout"
                    bind:checked={eventData.hangout}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="hangout" class="font-medium">Hangout</label>
        </div>

        <!-- Rideout -->
        <div class="flex items-center space-x-2">
            <input
                    type="checkbox"
                    name="rideout"
                    id="rideout"
                    bind:checked={eventData.rideout}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="rideout" class="font-medium">Rideout</label>
        </div>

        <!-- Car -->
        <div class="flex items-center space-x-2">
            <input
                    type="checkbox"
                    name="car"
                    id="car"
                    bind:checked={eventData.car}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="car" class="font-medium">Car</label>
        </div>

        <!-- Motorcycle -->
        <div class="flex items-center space-x-2">
            <input
                    type="checkbox"
                    name="motorcycle"
                    id="motorcycle"
                    bind:checked={eventData.motorcycle}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="motorcycle" class="font-medium">Motorcycle</label>
        </div>

        <!-- Theme -->
        <div class="flex flex-col">
            <label for="theme" class="font-medium mb-1">Theme</label>
            <input
                    type="text"
                    id="theme"
                    name="theme"
                    bind:value={eventData.theme}
                    placeholder="Enter event theme"
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Start Date -->
        <div class="flex flex-col">
            <label for="start_date" class="font-medium mb-1">Start Date</label>
            <input
                    type="datetime-local"
                    id="start_date"
                    name="start_date"
                    bind:value={eventData.start_date}
                    required
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Duration -->
        <div class="flex flex-col">
            <label for="duration" class="font-medium mb-1">End Date</label>
            <input
                    type="datetime-local"
                    id="duration"
                    name="duration"
                    bind:value={eventData.duration}
                    required
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Max People -->
        <div class="flex flex-col">
            <label for="max_people" class="font-medium mb-1">Max People</label>
            <input
                    type="number"
                    id="max_people"
                    name="max_people"
                    bind:value={eventData.max_people}
                    min="1"
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Start Longitude -->
        <div class="flex flex-col">
            <label for="start_longitude" class="font-medium mb-1">Start Longitude</label>
            <input
                    type="text"
                    id="start_longitude"
                    name="start_longitude"
                    bind:value={eventData.start_longitude}
                    placeholder="Enter start longitude"
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Start Latitude -->
        <div class="flex flex-col">
            <label for="start_latitude" class="font-medium mb-1">Start Latitude</label>
            <input
                    type="text"
                    id="start_latitude"
                    name="start_latitude"
                    bind:value={eventData.start_latitude}
                    placeholder="Enter start latitude"
                    class="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- Submit Button -->
        <div class="text-center mt-6">
            <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Create Event
            </button>
        </div>
    </form>
</div>
