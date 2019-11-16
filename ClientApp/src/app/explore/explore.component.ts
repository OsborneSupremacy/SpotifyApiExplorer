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

    public artists: Artist[];

    public genres: Genre[];

    public selectedMetric: Metric;

    public metrics: Metric[];

    public metricsEnvelope: MetricEnvelope;

    // track limit per playlist (100 is max and default)
    private trackLimit: number = 100;

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
        @Inject('SPOTIFY_BASE_URL') private apiBaseUrl: string
    ) {

        this.metricsEnvelope = <MetricEnvelope>{ Populated: false };

        this.metricsEnvelope.Danceability = <Metric>{
            Title: `Danceability`,
            Content: `Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Energy = <Metric>{
            Title: `Energy`,
            Content: `Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Loudness = <Metric>{
            Title: `Loudness`,
            Content: `The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.`,
            ImageFile: ``,
            Unit: `dB`,
            Min: -60,
            Max: 0
        };

        this.metricsEnvelope.Valence = <Metric>{
            Title: `Valence`,
            Content: `A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Speechiness = <Metric>{
            Title: `Speechiness`,
            Content: `Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Acousticness = <Metric>{
            Title: `Acousticness`,
            Content: `A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Instrumentalness = <Metric>{
            Title: `Instrumentalness`,
            Content: `Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Liveness = <Metric>{
            Title: `Liveness`,
            Content: `Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.`,
            Unit: ``,
            Min: 0,
            Max: 1
        };

        this.metricsEnvelope.Tempo = <Metric>{
            Title: `Tempo`,
            Content: `The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.`,
            Unit: `BPM`,
            Min: 0,
            Max: 250
        };

        this.metrics = new Array();
        this.metrics.push(this.metricsEnvelope.Danceability);
        this.metrics.push(this.metricsEnvelope.Energy);
        this.metrics.push(this.metricsEnvelope.Loudness);
        this.metrics.push(this.metricsEnvelope.Valence);
        this.metrics.push(this.metricsEnvelope.Speechiness);
        this.metrics.push(this.metricsEnvelope.Acousticness);
        this.metrics.push(this.metricsEnvelope.Instrumentalness);
        this.metrics.push(this.metricsEnvelope.Liveness);
        this.metrics.push(this.metricsEnvelope.Tempo);
    }

    ngOnInit() {
    }

    public findUser() {

        this.userNotFound = false;
        this.tracks = new Array();
        this.artists = new Array();
        this.genres = new Array();
        this.audioFeatures = new Array();
        this.metricsEnvelope.Populated = false;

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
            if (track.id === null) continue;
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


    public closeMetricsDialog = () => {
        this.selectedMetric = null;
    };

    public selectMetric = (metric: Metric) => {
        this.selectedMetric = metric;
    }
    // end - utility functions

}

class Metric {
    Title: string;
    Content: string;
    ImageFile: string;
    Unit: string;
    Min: number;
    Max: number;
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
