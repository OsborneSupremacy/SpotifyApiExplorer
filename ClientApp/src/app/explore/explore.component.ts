import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { catchError, retry, retryWhen, delay, take, tap } from 'rxjs/operators';
import { Type } from '@angular/compiler';

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

    public metrics: Metric[];

    public metricsEnvelope: MetricEnvelope;

    public limits: Limits;

    public stop: boolean;

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
        @Inject('SPOTIFY_BASE_URL') private apiBaseUrl: string
    ) {

        this.limits = {
            Playlists: 20,
            Tracks: 100
        };

        this.metricsEnvelope = <MetricEnvelope>{
            Populated: false,

            Danceability: {
                Title: `Danceability`,
                Content: `Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Energy: {
                Title: `Energy`,
                Content: `Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Loudness: {
                Title: `Loudness`,
                Content: `The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.`,
                ImageFile: ``,
                Unit: `dB`,
                Min: -49,
                Max: 2,
                NominalMin: -60,
                NominalMax: 0
            },

            Valence: {
                Title: `Valence`,
                Content: `A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Speechiness: {
                Title: `Speechiness`,
                Content: `Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Acousticness: {
                Title: `Acousticness`,
                Content: `A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Instrumentalness: {
                Title: `Instrumentalness`,
                Content: `Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Liveness: {
                Title: `Liveness`,
                Content: `Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.`,
                Unit: ``,
                Min: 0,
                Max: 1,
                NominalMin: 0,
                NominalMax: 1
            },

            Tempo: {
                Title: `Tempo`,
                Content: `The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.`,
                Unit: `BPM`,
                Min: 0,
                Max: 250,
                NominalMin: 0,
                NominalMax: 250
            }

        };

        this.metrics = [
            this.metricsEnvelope.Danceability,
            this.metricsEnvelope.Energy,
            this.metricsEnvelope.Loudness,
            this.metricsEnvelope.Valence,
            this.metricsEnvelope.Speechiness,
            this.metricsEnvelope.Acousticness,
            this.metricsEnvelope.Instrumentalness,
            this.metricsEnvelope.Liveness,
            this.metricsEnvelope.Tempo
        ]

    }

    ngOnInit() {
    }

    public findUser() {

        this.stop = false;

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

    // refactor this will callbacks
    private getToken = (validConsumer: Function): Observable<Token> => {

        if (this.stop) return;

        this.http.get<Token>(this.baseUrl + 'token').subscribe(
            (token: Token) => {
                validConsumer(token);
            },
            () => {
                console.log('Error getting token');
            }
        );

    }

    private spotifyApiRequest = <T>(url: string, validConsumer: Function, errorConsumer: Function) => {

        if (this.stop) return;

        this.getToken((token: Token) => {
            return this.http.get<T>(url, { headers: { 'Authorization': 'Bearer ' + token.access_token } })
                .pipe(
                    retryWhen(errors =>
                        errors.pipe(
                            delay(10000),
                            tap(errorStatus => {
                                console.log(errorStatus.error.error.status);
                                console.log(errorStatus);
                                console.log('Retrying...');
                            })
                        )
                    )
                )
                .subscribe(
                    (result: T) => validConsumer(result),
                    (error) => errorConsumer(error)
                );
        });
    }

    private userPlaylistsApiRequest = (next: Function) => {

        const url = `${this.apiBaseUrl}/users/${this.spotifyUserName}/playlists?limit=${this.limits.Playlists}`;

        this.spotifyApiRequest<UserPlaylists>(url,
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
            if (this.stop) break;
            playlist.tracks = new Array();

            let url = `${this.apiBaseUrl}/playlists/${playlist.id}/tracks?limit=${this.limits.Tracks}`;

            this.spotifyApiRequest<PlayListMeta>(url,
                (result: PlayListMeta) => {
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
            if (this.stop) break;

            if (!artist.id) {
                this.processedArtists += 1;
                continue; // skip artists without an ID
            }

            let url = `${this.apiBaseUrl}/artists/${artist.id}`;

            this.spotifyApiRequest<Artist>(url,
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
            if (this.stop) break;
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

    private createTrackAndArtistLists = (playlist: PlayList, items: PlaylistTrackMeta[]) => {
        // loop through tracks, adding their artists to list
        for (let meta of items) {
            if (this.stop) break;
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
            if (this.stop) break;
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

        let url = `${this.apiBaseUrl}/audio-features/${track.id}`;

        this.spotifyApiRequest<AudioFeatures>(url,
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

        this.metricsEnvelope.Populated = true;
        this.metricsEnvelope.Danceability.Value = this.calcAverage(this.audioFeatures.map(a => a.danceability));
        this.metricsEnvelope.Energy.Value = this.calcAverage(this.audioFeatures.map(a => a.energy));
        this.metricsEnvelope.Loudness.Value = this.calcAverage(this.audioFeatures.map(a => a.loudness));
        this.metricsEnvelope.Speechiness.Value = this.calcAverage(this.audioFeatures.map(a => a.speechiness));
        this.metricsEnvelope.Acousticness.Value = this.calcAverage(this.audioFeatures.map(a => a.acousticness));
        this.metricsEnvelope.Instrumentalness.Value = this.calcAverage(this.audioFeatures.map(a => a.instrumentalness));
        this.metricsEnvelope.Liveness.Value = this.calcAverage(this.audioFeatures.map(a => a.liveness));
        this.metricsEnvelope.Valence.Value = this.calcAverage(this.audioFeatures.map(a => a.valence));
        this.metricsEnvelope.Tempo.Value = this.calcAverage(this.audioFeatures.map(a => a.tempo));

        for (let metric of this.metrics) {
            let mp = (metric.Value / (metric.Max - metric.Min));
            if (mp < 0)
                mp = 1.0 + mp;
            metric.MarkerPercentage = mp * 100.0;
        }
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

    private calcAverage = list => list.reduce((prev, curr) => prev + curr) / list.length;

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

class Metric {
    Title: string;
    Content: string;
    ImageFile: string;
    Unit: string;
    Min: number;
    Max: number;
    NominalMin: number;
    NominalMax: number;
    Value: number;
    MarkerPercentage: number;
}

class MetricEnvelope {
    Populated: boolean;
    Danceability: Metric;
    Energy: Metric;
    Loudness: Metric;
    Valence: Metric;
    Speechiness: Metric;
    Acousticness: Metric;
    Instrumentalness: Metric;
    Liveness: Metric;
    Tempo: Metric;
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

class Genre { }

interface Genre {
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

class AudioFeatures { }

interface AudioFeatures {
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
