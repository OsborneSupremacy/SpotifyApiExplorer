import { Track } from "./track";
import { User } from "./user";

export class Playlist {
    id: string;
    name: string;
    tracks: {
        href: string;
        total: number;
    }
    // populated by app; not returned by Spotify
    foundtracks: Track[];
    owner: User;
}
