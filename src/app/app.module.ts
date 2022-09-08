import { NgModule } from '@angular/core';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { MobileSpeedCameraService } from './demo/service/mobile-camera-speed.service';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy }, MobileSpeedCameraService, DatePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
