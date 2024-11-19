import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import type AuthState from "$lib/models/IAuthState";
import {fetchUserInfo} from "$lib/stores/userInfoStore";



export const authStore = writable<AuthState>({
	isAuthenticated: false,
	user: null,
});

function initAuth() {
	const isAuthenticated = pb.authStore.isValid;
	const user = pb.authStore.model;

	authStore.set({ isAuthenticated, user });

	pb.authStore.onChange(() => {
		console.log("Store changed");
		authStore.set({
			isAuthenticated: pb.authStore.isValid,
			user: pb.authStore.model,
		});
	});
}

export const login = async (email: string, password: string): Promise<void> => {
	try {
		await pb.collection('users').authWithPassword(email, password);
		authStore.set({
			isAuthenticated: pb.authStore.isValid,
			user: pb.authStore.model,
		});
	} catch (error) {
		throw error;
	}
};

export const logout = (): void => {
	pb.authStore.clear();
	authStore.set({
		isAuthenticated: false,
		user: null,
	});
};

initAuth();