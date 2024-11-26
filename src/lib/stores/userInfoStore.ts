import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import { authStore } from "$lib/stores/authStore";
import type IUserInfo from '$lib/models/IUserInfo';
import type IVehicle from '$lib/models/IVehicle';
import type IEvent from '$lib/models/IEvent';

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
            fetchUserVehicles(userInfo.vehicles);
        } else {
            userVehiclesStore.set([]); // No vehicles
        }

        // Fetch upcoming events if available
        if (userInfo.upcoming_events?.length > 0) {
            fetchUserEvents(userInfo.upcoming_events, userUpcomingEventsStore);
        } else {
            userUpcomingEventsStore.set([]); // No upcoming events
        }

        // Fetch past events if available
        if (userInfo.past_events?.length > 0) {
            fetchUserEvents(userInfo.past_events, userPastEventsStore);
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

// Subscribe to authStore for automatic user info fetching
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