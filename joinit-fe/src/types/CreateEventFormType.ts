export type CreateEventFormType = {
    name: string;
    event_date: Date;
    participation_deadline: Date;
    place: string;
    description: string;
    joined_by: number[];
    created_by: number;
}