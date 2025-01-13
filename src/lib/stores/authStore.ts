import { writable } from 'svelte/store';
import { pb } from '../pocketbase/pocketbase.js';
import type AuthState from "$lib/models/IAuthState";

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
		console.log(pb.authStore.model);
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

export const createUser = async (email: string, password: string): Promise<void> => {
	try {
		const userData = {
			email,
			password,
			passwordConfirm: password
		};

		const newUser = await pb.collection('users').create(userData);
		console.log('User created:', newUser);

		await login(email, password);
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
};

export async function updateUsername(userId: string, newUsername: string) {
	try {
		const currentUser = await pb.collection('users').getOne(userId);

		if (currentUser.username !== newUsername) {
			 await pb.collection('users').update(userId, {
				username: newUsername,
			 });
		} else {
			console.log('The new username is the same as the current username. No update performed.');
		}
	} catch (error) {
		console.error('Error updating username:', error);
	}
}

export const linkUserInformation = async (userId: string, userInformationId: string) => {
	if(pb.authStore.model?.id === null || pb.authStore.model?.id !== userId){
		console.log("You are not loggedin");
		return;
	}

	try {
		await pb.collection('users').update(userId, {
			"user_informations": userInformationId
		});
	} catch (error) {
		console.log(error);
	}
}

export const getUserInformationId = async (userId: string) => {
	try {
		const user = await pb.collection('users').getOne(userId);
		return user.user_informations;
	} catch (error) {
		console.log(error);
	}
}

export const getUserNameById = async (userId: string) => {
	try {
		const user = await pb.collection('users').getOne(userId);
		return user.username;
	} catch (error) {
		console.log(error);
	}
}

initAuth();