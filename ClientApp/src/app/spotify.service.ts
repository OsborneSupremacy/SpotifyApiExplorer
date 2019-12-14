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

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string) {

        this.stop = false;
    }

    public getToken = (validConsumer: Function) => {

        this.http.get<Token>(this.baseUrl + 'token').subscribe(
            (token: Token) => {
                validConsumer(token);
            },
            () => {
                console.log('Error getting token');
            }
        );
    }

    public apiRequest = <T>(subUrl: string, validConsumer: Function, errorConsumer: Function) => {

        if (this.stop) return;

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

}

