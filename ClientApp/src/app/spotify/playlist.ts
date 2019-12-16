import { Track } from "./track";
import { User } from "./user";

export class Playlist {
    id: string;
    name: string;
    tracks: Track[];
    owner: User;
}
