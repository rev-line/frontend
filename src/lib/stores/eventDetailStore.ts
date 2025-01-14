import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import type IEvent from '$lib/models/IEvent';

// Store for detailed event information
export const eventDetailStore = writable<IEvent | null>(null);

// Fetch event details by ID
export async function fetchEventDetails(eventId: string): Promise<void> {
    try {
        const response = await pb.collection('event').getOne<IEvent>(eventId);
        eventDetailStore.set(response);
    } catch (error) {
        console.error(`Error fetching event details for ID ${eventId}:`, error);
        eventDetailStore.set(null);
    }
}

export async function createEvent(eventData: Partial<IEvent>): Promise<void> {
    try {
        await pb.collection('event').create(eventData);
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}

// Clear the store when needed
export function clearEventDetails(): void {
    eventDetailStore.set(null);
}