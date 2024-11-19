export default interface IRideoutWaypoint {
    id: string;
    event_id?: string; // Reference to event collection
    longitude?: string;
    latitude?: string;
}