import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retryWhen, delay, tap } from 'rxjs/operators';
import { Token } from './spotify/';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

    private apiBaseUrl: string = `proxy`;

    public stop: boolean;

    public username: string;

    constructor(
        private http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string) {

        this.stop = false;
    }


    public apiRequest = <T>(subUrl: string, validConsumer: Function, errorConsumer: Function) => {

        if (this.stop) return;

        return this.http.get<T>(`${this.apiBaseUrl}/${subUrl}`)
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
