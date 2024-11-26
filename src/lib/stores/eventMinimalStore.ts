import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import type IEvent from '$lib/models/IEvent';

// Define the minimal event type
export type EventMinimal = Pick<IEvent, 'id' | 'name' | 'max_people' | 'rideout' | 'hangout'>;

// Store for minimal event information
export const eventMinimalStore = writable<EventMinimal[]>([]);

// Fetch all events with minimal information
export async function fetchMinimalEvents(): Promise<void> {
    try {
        const response = await pb.collection('event').getFullList<EventMinimal>({
            fields: 'id,name,max_people,rideout,hangout', // Fetch only these fields
        });
        eventMinimalStore.set(response);
        console.log(response);
    } catch (error) {
        console.error('Error fetching minimal events:', error);
        eventMinimalStore.set([]);
    }
}