import { Album } from "./album";
import { AudioFeatures } from "./audiofeatures";
import { Artist } from "./artist";

export class Track {
    id: string;
    name: string;
    popularity: number;
    album: Album;
    audioFeatures: AudioFeatures;
    artists: Artist[];
}
