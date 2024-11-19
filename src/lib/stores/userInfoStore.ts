import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
// import { authStore } from './authStore';
import type IUserInfo from '$lib/models/IUserInfo';

export const userInfoStore = writable<IUserInfo | null>(null);

export async function fetchUserInfo(userId: string) {
    try {
        const userInfo = await pb.collection('user_info').getOne(userId);
        console.log('Fetched user info:', userInfo);
        userInfoStore.set(userInfo);
    } catch (error) {
        console.error('Error fetching user info:', error);
        userInfoStore.set(null);
    }
}

// authStore.subscribe((authState) => {
//     if (authState.isAuthenticated && authState.user) {
//         fetchUserInfo(authState.user.id).then();
//     } else {
//         userInfoStore.set(null);
//     }
// });