import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import { authStore } from "$lib/stores/authStore";
import type IUserInfo from '$lib/models/IUserInfo';
import type IVehicle from '$lib/models/IVehicle';
import type IEvent from '$lib/models/IEvent';
import { get } from 'svelte/store';
import {fetchEventDetails} from "$lib/stores/eventDetailStore";

// Stores for user info and related data
export const userInfoStore = writable<IUserInfo | null>(null);
export const userVehiclesStore = writable<IVehicle[]>([]);
export const userUpcomingEventsStore = writable<IEvent[]>([]);
export const userPastEventsStore = writable<IEvent[]>([]);

export async function fetchUserInfo(userId: string) {
    try {
        const userInfo = await pb.collection('user_info').getOne(userId);
        userInfoStore.set(userInfo);

        // Fetch vehicles if available
        if (userInfo.vehicles?.length > 0) {
            await fetchUserVehicles(userInfo.vehicles);
        } else {
            userVehiclesStore.set([]); // No vehicles
        }

        // Fetch upcoming events if available
        if (userInfo.upcoming_events?.length > 0) {
            await fetchUserEvents(userInfo.upcoming_events, userUpcomingEventsStore);
        } else {
            userUpcomingEventsStore.set([]); // No upcoming events
        }

        // Fetch past events if available
        if (userInfo.past_events?.length > 0) {
            await fetchUserEvents(userInfo.past_events, userPastEventsStore);
        } else {
            userPastEventsStore.set([]); // No past events
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        userInfoStore.set(null);
        userVehiclesStore.set([]);
        userUpcomingEventsStore.set([]);
        userPastEventsStore.set([]);
    }
}

export async function fetchUserInfoForOther(userId: string) {
    try {
        return await pb.collection('user_info').getOne(userId);
    } catch (error) {
        console.error('Error fetching user info:', error);
        userInfoStore.set(null);
        userVehiclesStore.set([]);
        userUpcomingEventsStore.set([]);
        userPastEventsStore.set([]);
    }
}

export async function fetchUserVehicles(vehicleIds: string[]) {
    try {
        const vehiclePromises = vehicleIds.map((id) =>
            pb.collection('vehicle').getOne<IVehicle>(id)
        );
        const vehicles = await Promise.all(vehiclePromises);
        userVehiclesStore.set(vehicles); // Set resolved vehicles
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        userVehiclesStore.set([]);
    }
}

export async function fetchUserEvents(eventIds: string[], targetStore: typeof userUpcomingEventsStore | typeof userPastEventsStore) {
    try {
        const eventPromises = eventIds.map((id) =>
            pb.collection('event').getOne<IEvent>(id)
        );
        const events = await Promise.all(eventPromises);
        targetStore.set(events); // Set resolved events
    } catch (error) {
        console.error('Error fetching events:', error);
        targetStore.set([]);
    }
}

export async function deleteVehicle(vehicleId: string, userInfoId: string) {
    try {
        await pb.collection('vehicle').delete(vehicleId);
        const userInfo = await pb.collection('user_info').getOne<IUserInfo>(userInfoId);
        const updatedVehicles = userInfo.vehicles?.filter((id) => id !== vehicleId) || [];
        await pb.collection('user_info').update(userInfoId, { vehicles: updatedVehicles });

        userVehiclesStore.update((vehicles) => vehicles.filter((vehicle) => vehicle.id !== vehicleId));
    } catch (error) {
        console.error('Error deleting vehicle:', error);
    }
}

export async function updateVehicles(vehicles: IVehicle[]) {
    try {
        const updatePromises = vehicles.map((vehicle) =>
            pb.collection('vehicle').update(vehicle.id, {
                type: vehicle.type,
                brand: vehicle.brand,
            })
        );
        await Promise.all(updatePromises);

        // Update the store with the new vehicles
        userVehiclesStore.set(vehicles);
    } catch (error) {
        console.error('Error updating vehicles:', error);
    }
}

export async function createVehicle(
    userInfoId: string,
    vehicle: { type: string; brand: string }
) {
    try {
        const newVehicle = await pb.collection('vehicle').create({
            type: vehicle.type,
            brand: vehicle.brand,
        });

        const userInfo = await pb.collection('user_info').getOne<IUserInfo>(userInfoId);
        const updatedVehicleIds = [...(userInfo.vehicles || []), newVehicle.id];
        await pb.collection('user_info').update(userInfoId, { vehicles: updatedVehicleIds });
        userVehiclesStore.update((vehicles) => [...vehicles, newVehicle]);
    } catch (error) {
        console.error('Error creating vehicle:', error);
    }
}

export async function updateUserInfo(userInformation_id: string, updates: Partial<IUserInfo>) {
    try {
        const updatedUserInfo = await pb.collection('user_info').update(userInformation_id, updates);
        userInfoStore.set(updatedUserInfo);
    } catch (error) {
        console.error('Error updating user information:', error);
    }
}

export async function createUserInfo() {
    try {
        const userInfo = await pb.collection('user_info').create({});
        userInfoStore.set(userInfo);
        console.log(userInfo);
    } catch (error) {
        console.error('Error creating user_info:', error);
    }
}

export async function addEventToUser(eventId: string): Promise<void> {
    try {
        // Get the current authenticated user
        const authState = get(authStore);

        if (!authState.isAuthenticated || !authState.user) {
            throw new Error('User is not logged in.');
        }

        // Fetch the user's info
        const userInfoId = authState.user.user_informations;


        const userInfo = await pb.collection('user_info').getOne<IUserInfo>(userInfoId);
        console.log(userInfo);

        // Check if the event is already in the upcoming events
        const upcomingEvents = userInfo.upcoming_events || [];

        console.log(upcomingEvents)
        if (upcomingEvents.includes(eventId)) {
            console.log('Event is already in the upcoming events.');
            return;
        }

        // Add the event ID to the user's upcoming events
        const updatedUpcomingEvents = [...upcomingEvents, eventId];
        await pb.collection('user_info').update(userInfoId, { upcoming_events: updatedUpcomingEvents });

        // Fetch the event details
        const eventDetails = await pb.collection('event').getOne<IEvent>(eventId);

        console.log(eventDetails);

        // Update the userUpcomingEventsStore
        // userUpcomingEventsStore.update((events) => [...events, eventDetails]);

        console.log(`Event ${eventId} added to the user's upcoming events.`);
    } catch (error) {
        console.error('Error adding event to user:', error);
    }
}


authStore.subscribe((authState) => {
    if (authState.isAuthenticated && authState.user) {
        fetchUserInfo(authState.user.user_informations).then();
    } else {
        userInfoStore.set(null);
        userVehiclesStore.set([]);
        userUpcomingEventsStore.set([]);
        userPastEventsStore.set([]);
    }
});