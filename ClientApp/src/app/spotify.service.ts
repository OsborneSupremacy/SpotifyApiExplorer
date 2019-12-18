import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retryWhen, delay, tap } from 'rxjs/operators';
import { Token } from './spotify/';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

    private apiBaseUrl: string = `https://api.spotify.com/v1`;

    public stop: boolean;

    public username: string;

    private token: Token;

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string) {

        this.stop = false;
    }

    private tokenIsValid(): boolean {

        if (!this.token) return false;

        if (this.token.expire_time > new Date()) {
            console.log('token is still good');
            return true;
        } else {
            console.log('token needs to be refreshed');
            return false;
        }

    }

    public getToken = (validConsumer: Function) => {

        if (this.tokenIsValid())
            validConsumer(this.token);

        let tokenStart = new Date();

        this.http.get<Token>(this.baseUrl + 'token').subscribe(
            (token: Token) => {
                token.expire_time = new Date(tokenStart.getTime() + token.expires_in);
                this.token = token;
                validConsumer(this.token);
            },
            () => {
                console.log('Error getting token');
            }
        );
    }

    public apiRequest = <T>(subUrl: string, validConsumer: Function, errorConsumer: Function) => {

        if (this.stop) return;

        // need to update this to not retry on 404
        this.getToken((token: Token) => {
            return this.http.get<T>(`${this.apiBaseUrl}/${subUrl}`, { headers: { 'Authorization': 'Bearer ' + token.access_token } })
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

    public HttpClientErrorHandler = (error: any) => {
        let hce = new HttpClientError();
        if (error.status === 404) {
            hce.NotFound = true;
            return hce;
        }
        console.log('Unhandled error', error);
        hce.Unexpected = true;
        return hce;
    };
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
