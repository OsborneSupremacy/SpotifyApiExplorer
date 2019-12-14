import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { SpotifyService } from './app/spotify.service';


const providers = [
    {
        provide: 'BASE_URL',
        useFactory: () => { return document.getElementsByTagName('base')[0].href; }, deps: []
    },
    {
        provide: 'SPOTIFY_BASE_URL',
        useValue: `https://api.spotify.com/v1`, deps: []
    },
    {
        provide: SpotifyService,
        useClass: SpotifyService, deps: []
    }
];

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
    .catch(err => console.log(err));


