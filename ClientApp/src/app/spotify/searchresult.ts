import { Playlist } from "./playlist";

export class SearchResult {
    playlists: {
        href: string;
        items: Playlist[];
    }
}
