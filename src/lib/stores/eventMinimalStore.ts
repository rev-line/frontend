import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import type IEvent from '$lib/models/IEvent';

// Define the minimal event type
export type EventMinimal = Pick<IEvent, 'id' | 'name' | 'max_people' | 'rideout' | 'hangout' | 'start_longitude' | 'start_latitude' | 'start_date' | 'duration'>;

// Store for minimal event information
export const eventMinimalStore = writable<EventMinimal[]>([]);

// Fetch all events with minimal information
export async function fetchMinimalEvents(): Promise<void> {
    try {
        const response = await pb.collection('event').getFullList<EventMinimal>({
            fields: 'id,name,max_people,rideout,hangout,start_longitude,start_latitude,start_date,duration',
        });

        // Get the current date
        const now = new Date();

        // Filter events based on the start and end date
        const validEvents = response.filter(event => {
            const startDate = event.start_date ? new Date(event.start_date) : null;
            const endDate = event.duration ? new Date(event.duration) : null;

            return (
                (!startDate || startDate >= now) ||
                (!endDate || endDate >= now)
            );
        });

        eventMinimalStore.set(validEvents);
    } catch (error) {
        console.error('Error fetching minimal events:', error);
        eventMinimalStore.set([]);
    }
}

export async function getRegisteredUserCount(eventId: string): Promise<number> {
    try {
        // Filter users where the event is in the upcoming_events relation
        const users = await pb.collection('user_info').getFullList({
            filter: `upcoming_events ?~ "${eventId}"`,
        });

        return users.length;
    } catch (error) {
        console.error('Error fetching registered users:', error);
        return 0;
    }
}
