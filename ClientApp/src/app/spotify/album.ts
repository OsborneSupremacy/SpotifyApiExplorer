import { Artist } from "./artist";

export class Album {
    id: string;
    name: string;
    release_date: string;
    artists: Artist[];
}
