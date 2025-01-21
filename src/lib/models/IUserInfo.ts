export default interface UserInfo {
    id: string;
    Photo?: File; // Assumed to be a file object or URL
    looking_rideouts?: boolean;
    looking_hangouts?: boolean;
    radius?: number;
    pref_driving?: boolean;
    pref_hosting?: boolean;
    current_last_longitude?: string;
    current_last_latitude?: string;
    vehicles?: string[]; // Array of vehicle references
    upcoming_events?: string[]; // Array of event references
    past_events?: string[]; // Array of event references
    collectionId: string;
    mapIconChoice: "Car" | "Motorcycle";
    created?: string;
}
