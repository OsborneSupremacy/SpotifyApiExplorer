import { Component, OnInit, Inject } from '@angular/core';
import { UserPlaylists, Track, AudioFeatures, Artist, Genre, Metric, MetricEnvelope, Playlist, PlaylistMeta, PlaylistTrackMeta } from '../spotify/';
import { SpotifyService } from '../spotify.service';

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
    public procesedPlaylists: number;

    public tracks: Track[];
    public processedTracks: number;

    public audioFeatures: AudioFeatures[];
    public processedArtists: number;

    public artists: Artist[];

    public genres: Genre[];

    public selectedMetric: Metric;

    public metricsEnvelope: MetricEnvelope;

    public limits: Limits;

    constructor(
        private spotifyService: SpotifyService
    ) {

        this.limits = {
            Playlists: 20,
            Tracks: 100
        };

        this.metricsEnvelope = new MetricEnvelope();

    }

    ngOnInit = () => {
    }

    // add reset feature

    public findUser = () => {

        this.spotifyService.stop = false;

        this.procesedPlaylists = 0;
        this.processedArtists = 0;
        this.processedTracks = 0;

        this.userPlaylists = null;

        this.userNotFound = false;
        this.tracks = new Array();
        this.artists = new Array();
        this.genres = new Array();
        this.audioFeatures = new Array();
        this.metricsEnvelope.Populated = false;

        this.userPlaylistsApiRequest(
            () => this.getPlayListMetadatum(
                this.getArtistGenres
            )
        );
    }

    private userPlaylistsApiRequest = (next: Function) => {

        const url = `users/${this.spotifyUserName}/playlists?limit=${this.limits.Playlists}`;

        this.spotifyService.apiRequest<UserPlaylists>(url,
            (result: UserPlaylists) => {
                this.userPlaylists = result;
                this.userPlaylists.items.sort((a, b) => {
                    return a.name >= b.name ? 1 : -1; // sort by name initially
                });
                next();
            },
            (error) => {
                if (this.HttpClientErrorHandler(error).NotFound)
                    this.userNotFound = true;
            }
        );
    }

    private getPlayListMetadatum = (next: Function) => {

        for (let playlist of this.userPlaylists.items) {
            if (this.spotifyService.stop) break;
            playlist.tracks = new Array();

            let url = `playlists/${playlist.id}/tracks?limit=${this.limits.Tracks}`;

            this.spotifyService.apiRequest<PlaylistMeta>(url,
                (result: PlaylistMeta) => {
                    this.createTrackAndArtistLists(playlist, result.items);
                    this.procesedPlaylists += 1;
                    // once all playlists have been processed, get artist genres
                    if (this.procesedPlaylists >= this.userPlaylists.items.length)
                        next();
                },
                (error) => {
                    this.HttpClientErrorHandler(error);
                    this.procesedPlaylists += 1;
                }
            );

        }
    }

    private getArtistGenres = () => {

        for (let artist of this.artists) {
            if (this.spotifyService.stop) break;

            if (!artist.id) {
                this.processedArtists += 1;
                continue; // skip artists without an ID
            }

            const url = `artists/${artist.id}`;

            this.spotifyService.apiRequest<Artist>(url,
                (result: Artist) => {
                    result.tracks = artist.tracks;
                    this.addArtistGenresToList(result);
                    this.processedArtists += 1;
                },
                (error) => {
                    this.HttpClientErrorHandler(error);
                    this.processedArtists += 1;
                }
            );
        }
    }

    private addArtistGenresToList = (artist: Artist) => {
        for (let genreName of artist.genres) {
            if (this.spotifyService.stop) break;
            let selectedGenre = this.genres.find((g: Genre) => {
                return genreName === g.name;
            });
            if (selectedGenre) {
                selectedGenre.artists.push(artist);
            } else {
                selectedGenre = {
                    name: genreName,
                    artists: [ artist ],
                    tracks: new Array()
                };
                this.genres.push(selectedGenre);
            }
            for (let track of artist.tracks)
                selectedGenre.tracks.push(track);
            this.sortGenres();
        }
    }

    private createTrackAndArtistLists = (playlist: Playlist, items: PlaylistTrackMeta[]) => {
        // loop through tracks, adding their artists to list
        for (let meta of items) {
            if (this.spotifyService.stop) break;
            if (meta.track === null) continue; // occassionally a track's meta will not have a track
            playlist.tracks.push(meta.track);
            this.tracks.push(meta.track);
            this.addTrackArtistsToList(meta.track);

            if (meta.track.id === null) {
                this.processedTracks += 1;
                continue;
            }
            this.getAudioFeatures(meta.track);
        }
        this.sortPlaylists();
        this.sortArtists();
    }

    private addTrackArtistsToList = (track: Track) => {
        for (let artist of track.artists) {
            if (this.spotifyService.stop) break;
            // add artist to list only if not already in list
            let existingArtist = this.artists.find((art: Artist) => {
                return art.id === artist.id;
            });
            if (existingArtist)
                existingArtist.tracks.push(track);
            if (!existingArtist) {
                artist.tracks = [ track ];
                this.artists.push(artist);
            }
        }
    }

    private getAudioFeatures = (track: Track) => {

        const url = `audio-features/${track.id}`;

        this.spotifyService.apiRequest<AudioFeatures>(url,
            (result: AudioFeatures) => {
                this.audioFeatures.push(result);
                track.audioFeatures = result;
                this.calculateMetrics();
                this.processedTracks += 1;
            },
            (error) => {
                this.HttpClientErrorHandler(error);
                this.processedTracks += 1;
            }
        );
    }

    private calculateMetrics = () => {
        this.metricsEnvelope.Calculate(this.audioFeatures);
    }

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


    public closeMetricsDialog = () => {
        this.selectedMetric = null;
    };

    public selectMetric = (metric: Metric) => {
        this.selectedMetric = metric;
    }
    // end - utility functions

}

class Limits {
    Playlists = 20;
    Tracks = 100;
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
