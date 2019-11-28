import { Artist } from "./artist";
import { Track } from "./track";

export class Genre {
    name: string;
    artists: Artist[];
    tracks: Track[];
}
