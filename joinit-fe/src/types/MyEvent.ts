import { Rating } from "./Rating";

export type MyEvent = {
    id: number;
    name: string;
    description: string;
    event_date: string;
    place: string;
    ratings?: Rating[];
    joined_by: number[];
  }