import { Rating } from "./Rating";

export type MyEvent = {
    created_by: number;
    id: number;
    name: string;
    description: string;
    price: number;
    category: number;
    tags: string|string[];
    place: string;
    event_date: string;
    participation_deadline: string;
    max_participants: number;
    ratings?: Rating[];
    joined_by: number[];
    is_private: boolean;
    cancelled: boolean;
    cover_image?: File | null;
  }