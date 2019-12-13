import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { ExploreComponent } from './explore/explore.component';
import { UserfinderComponent } from './userfinder/userfinder.component';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        ExploreComponent,
        UserfinderComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', component: ExploreComponent, pathMatch: 'full' },
            { path: 'explore', component: ExploreComponent },
            { path: 'userfinder', component: UserfinderComponent },
        ])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
