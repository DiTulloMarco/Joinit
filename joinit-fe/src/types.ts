
export interface User {
  id: number;
  name: string;
  email: string;
  birthDate: Date;
}

export interface MyEvent {
    id: number;
    title: string;
    desc: string;
    date?: string;
    location?: string;
  }