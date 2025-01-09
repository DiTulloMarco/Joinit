import { Category } from "./Category";

export type CreateEventFormType = {
    name: string;
    event_date: Date;
    participation_deadline: Date;
    place: string;
    description: string;
    joined_by: number[];
    created_by: number;
    category?: Category;
    tags?: string;
    price?: number;
    image?: string;
    max_participants?: number;
    is_private: boolean;
}