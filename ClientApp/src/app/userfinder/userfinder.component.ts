import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-userfinder',
    templateUrl: './userfinder.component.html',
    styleUrls: ['./userfinder.component.css']
})
export class UserfinderComponent implements OnInit {

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
        @Inject('SPOTIFY_BASE_URL') private apiBaseUrl: string
    ) {


    }

    ngOnInit() {
    }

    public findUsers = () => {


    }

}
