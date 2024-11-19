import type {AuthModel} from "pocketbase";

export default interface AuthState {
    isAuthenticated: boolean;
    user: AuthModel | null;
}