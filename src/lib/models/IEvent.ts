export default interface IEvent{
    id: string;
    name?: string;
    hangout?: boolean;
    rideout?: boolean;
    car?: boolean;
    motorcycle?: boolean;
    theme?: string;
    start_date?: string; // ISO 8601 Date format
    duration?: string; // ISO 8601 Date format
    max_people?: number;
    start_longitude?: number;
    start_latitude?: number;
    waypoints?: string[];
}
