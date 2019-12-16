import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchResult, Playlist } from '../spotify/';
import { SpotifyService } from '../spotify.service';

@Component({
    selector: 'app-userfinder',
    templateUrl: './userfinder.component.html',
    styleUrls: ['./userfinder.component.css']
})
export class UserfinderComponent implements OnInit {

    public keyword: string;

    public playlists: Playlist[];

    public noPlaylistsFound: boolean;

    constructor(
        private router: Router,
        private spotifyService: SpotifyService) {

    }

    ngOnInit() {
    }

    public findUsers = () => {

        this.spotifyService.stop = false;

        this.playlists = null;
        this.noPlaylistsFound = false;

        this.playlistSearch();

    }

    public selectUser = (selectedUsername: string) => {
        this.spotifyService.username = selectedUsername;
        this.router.navigate(['/', 'explore']);
    }

    private playlistSearch = () => {

        const url = `search?q=${this.keyword}&type=playlist`;

        this.spotifyService.apiRequest<SearchResult>(url,
            (result: SearchResult) => {
                this.playlists = result.playlists.items;
                if (this.playlists.length === 0)
                    this.noPlaylistsFound = true;
            },
            (error) => {
                if (this.spotifyService.HttpClientErrorHandler(error).NotFound)
                    this.noPlaylistsFound = true;
            }
        );

    }
}


