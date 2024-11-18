import { AngularFireModule } from '@angular/fire/compat';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FirestoreModule } from '@angular/fire/firestore'; 
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver } from '@angular/fire/auth';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase), 
    FirestoreModule, 
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebase)), 
    provideFirestore(() => getFirestore()), 
    provideAuth(() => 
      initializeAuth(getApp(), {
        persistence: [browserSessionPersistence, browserLocalPersistence],
        popupRedirectResolver: browserPopupRedirectResolver
      })
    ), 
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
