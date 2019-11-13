import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-explore',
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

    // temporary
    spotifyUserName: string = "VisionsFugitive";

    public userNotFound: boolean = false;

    public userPlaylists: UserPlaylists;

    public tracks: Track[];

    public audioFeatures: AudioFeatures[];

    public avgAudioFeatures: AudioFeatures;

    public artists: Artist[];

    public genres: Genre[];

    // track limit per playlist (100 is max and default)
    private trackLimit: number = 100;

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
        @Inject('SPOTIFY_BASE_URL') private apiBaseUrl: string
    ) {

    }

    ngOnInit() {
    }

    public findUser() {

        this.userNotFound = false;
        this.tracks = new Array();
        this.artists = new Array();
        this.genres = new Array();
        this.audioFeatures = new Array();
        this.avgAudioFeatures = new AudioFeatures();

        this.tokenRequester().subscribe(
            (result) => {
                this.getUserPlayLists(result);
            },
            (error) => this.HttpClientErrorHandler(error)
        );

    }

    private getUserPlayLists = (token: Token) => {
        this.playListRequestor(token).subscribe(
            (result) => {
                this.userPlaylists = result;
                this.userPlaylists.items.sort((a, b) => {
                    return a.name >= b.name ? 1 : -1; // sort by name initially
                });
                this.getPlayListMetadatum(token);
            },
            (error) => {
                if (this.HttpClientErrorHandler(error).NotFound)
                    this.userNotFound = true;
            }
        );
    }

    private getPlayListMetadatum = (token: Token) => {

        var processed = 0;

        for (let playlist of this.userPlaylists.items) {
            playlist.tracks = new Array();
            this.playListMetaRequestor(token, playlist).subscribe(
                (result) => {
                    this.createTrackAndArtistLists(playlist, result.items);
                    processed += 1;
                    // once all playlists have been processed, move on to next step
                    if (processed >= this.userPlaylists.items.length)
                        this.getArtistGenres(token);
                },
                (error) => {
                    this.HttpClientErrorHandler(error);
                    processed += 1;
                }
            );
        }
    }

    private getArtistGenres = (token: Token) => {
        let processed = 0;
        for (let artist of this.artists) {

            if (!artist.id) { // skip artists without an ID
                processed += 1;
                continue;
            }

            this.artistRequestor(token, artist).subscribe(
                (result) => {
                    result.tracks = artist.tracks;
                    this.addArtistGenresToList(result);
                    processed += 1;
                    // one all artists have been processed, move on to next step
                    if(processed >= this.artists.length)
                        this.getAudioFeatures(token);
                },
                (error) => {
                    this.HttpClientErrorHandler(error)
                    processed += 1;
                }
            );
        }
    }

    private addArtistGenresToList(artist: Artist) {
        for (let genreName of artist.genres) {
            let selectedGenre = this.genres.find((g: Genre) => {
                return genreName === g.name;
            });
            if (selectedGenre) {
                selectedGenre.artists.push(artist);
            } else {
                selectedGenre = new Genre();
                selectedGenre.name = genreName;
                selectedGenre.artists = new Array();
                selectedGenre.tracks = new Array();
                selectedGenre.artists.push(artist);
                this.genres.push(selectedGenre);
            }
            for (let track of artist.tracks)
                selectedGenre.tracks.push(track);
            this.sortGenres();
        }
    }

    private createTrackAndArtistLists = (playlist: PlayList, items: PlaylistTrackMeta[]) => {
        // loop through tracks, adding their artists to list
        for (let meta of items) {
            if (meta.track === null) continue; // occassionally a track's meta will not have a track
            playlist.tracks.push(meta.track);
            this.tracks.push(meta.track);
            this.addTrackArtistsToList(meta.track);
        }
        this.sortPlaylists();
        this.sortArtists();
    }

    private addTrackArtistsToList = (track: Track) => {
        for (let artist of track.artists) {
            // add artist to list only if not already in list
            let existingArtist = this.artists.find((art: Artist) => {
                return art.id === artist.id;
            });
            if (existingArtist)
                existingArtist.tracks.push(track);
            if (!existingArtist) {
                artist.tracks = new Array();
                artist.tracks.push(track);
                this.artists.push(artist);
            }
        }
    }

    private getAudioFeatures = (token: Token) => {
        for (let track of this.tracks) {
            this.audioFeaturesRequestor(token, track).subscribe(
                (result) => {
                    this.audioFeatures.push(result);
                    track.audioFeatures = result;
                    this.calculateMetrics();
                },
                (error) => this.HttpClientErrorHandler(error)
            );
        }
    }

    private calculateMetrics = () => {
        this.avgAudioFeatures.danceability = this.calcAverage(this.audioFeatures.map(a => a.danceability));
        this.avgAudioFeatures.energy = this.calcAverage(this.audioFeatures.map(a => a.energy));
        this.avgAudioFeatures.loudness = this.calcAverage(this.audioFeatures.map(a => a.loudness));
        this.avgAudioFeatures.speechiness = this.calcAverage(this.audioFeatures.map(a => a.speechiness));
        this.avgAudioFeatures.acousticness = this.calcAverage(this.audioFeatures.map(a => a.acousticness));
        this.avgAudioFeatures.instrumentalness = this.calcAverage(this.audioFeatures.map(a => a.instrumentalness));
        this.avgAudioFeatures.liveness = this.calcAverage(this.audioFeatures.map(a => a.liveness));
        this.avgAudioFeatures.valence = this.calcAverage(this.audioFeatures.map(a => a.valence));
        this.avgAudioFeatures.tempo = this.calcAverage(this.audioFeatures.map(a => a.tempo));
    }

    // begin - HttpClient Observables
    private tokenRequester = () => {
        return this.http.get<Token>(this.baseUrl + 'token');
    }

    private playListRequestor = (token: Token) => {
        let url = `${this.apiBaseUrl}/users/${this.spotifyUserName}/playlists`;
        return this.http.get<UserPlaylists>(url, { headers: { 'Authorization': 'Bearer ' + token.access_token } });
    }

    private playListMetaRequestor = (token: Token, playlist: PlayList) => {
        let url = `${this.apiBaseUrl}/playlists/${playlist.id}/tracks?limit=${this.trackLimit}`;
        return this.http.get<PlayListMeta>(url, { headers: { 'Authorization': 'Bearer ' + token.access_token } });
    }

    private artistRequestor = (token: Token, artist: Artist) => {
        let url = `${this.apiBaseUrl}/artists/${artist.id}`;
        return this.http.get<Artist>(url, { headers: { 'Authorization': 'Bearer ' + token.access_token } });
    }

    private audioFeaturesRequestor = (token: Token, track: Track) => {
        let url = `${this.apiBaseUrl}/audio-features/${track.id}`;
        return this.http.get<AudioFeatures>(url, { headers: { 'Authorization': 'Bearer ' + token.access_token } });
    }

    // end - HttpClient Observables


    // begin - utility functions
    private sortPlaylists = () => {
        this.userPlaylists.items.sort((a, b) => {
            if (a.tracks.length === b.tracks.length)
                return a.name >= b.name ? 1 : -1;
            else
                return b.tracks.length >= a.tracks.length ? 1 : -1;
        });
    }

    private sortArtists = () => {
        this.artists.sort((a, b) => {
            if (a.tracks.length === b.tracks.length)
                return a.name >= b.name ? 1 : -1;
            else
                return b.tracks.length >= a.tracks.length ? 1 : -1;
        });
    }

    private sortGenres = () => {
        this.genres.sort((a, b) => {
            if (a.tracks.length === b.tracks.length)
                return a.name >= b.name ? 1 : -1;
            else
                return b.tracks.length >= a.tracks.length ? 1 : -1;
        });
    }

    private HttpClientErrorHandler = (error: any) => {
        let hce = new HttpClientError();
        if (error.status === 404) {
            hce.NotFound = true;
            return hce;
        }
        console.log('Unhandled error', error);
        hce.Unexpected = true;
        return hce;
    };

    private calcAverage = list => list.reduce((prev, curr) => prev + curr) / list.length;
    // end - utility functions

}

class HttpClientError {

    NotFound: boolean;
    RateLimit: boolean;
    Unexpected: boolean;

    constructor() {
        this.NotFound = false;
        this.RateLimit = false;
        this.Unexpected = false;
    }

}

class Genre {
    name: string;
    artists: Artist[];
    tracks: Track[];
}

interface UserPlaylists {
    items: PlayList[];
}

interface PlayList {
    id: string;
    name: string;
    tracks: Track[];
}

interface PlayListMeta {
    items: PlaylistTrackMeta[];
}

interface PlaylistTrackMeta {
    track: Track;
}

interface Track {
    id: string;
    name: string;
    popularity: number;
    album: Album;
    audioFeatures: AudioFeatures;
    artists: Artist[];
}

interface Album {
    id: string;
    name: string;
    release_date: string;
    artists: Artist[];
}

interface Artist {
    id: string;
    name: string;
    genres: string[];
    tracks: Track[];
}

class AudioFeatures {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    duration_ms: number;
    time_signature: number;
    id: string;
}

interface Token {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}
