import { Component, OnInit } from '@angular/core';
import { UserPlaylists, Track, AudioFeatures, Artist, Genre, Metric, MetricEnvelope, Playlist, PlaylistMeta, PlaylistTrackMeta } from '../spotify/';
import { SpotifyService } from '../spotify.service';

@Component({
    selector: 'app-userfinder',
    templateUrl: './userfinder.component.html',
    styleUrls: ['./userfinder.component.css']
})
export class UserfinderComponent implements OnInit {

    public keyword: string;

    constructor(private spotifyService: SpotifyService) {


    }

    ngOnInit() {
    }

    public findUsers = () => {


    }

}
