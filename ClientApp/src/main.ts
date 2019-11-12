import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}

export var getSpotifyBaseUrl = (): string => {
    return `https://api.spotify.com/v1`;
};

const providers = [
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    { provide: 'SPOTIFY_BASE_URL', useFactory: getSpotifyBaseUrl, deps: [] }
];

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
    .catch(err => console.log(err));


