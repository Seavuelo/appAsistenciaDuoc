import { AngularFireModule } from '@angular/fire/compat';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FirestoreModule } from '@angular/fire/firestore'; // Importa AngularFirestoreModule
import { environment } from '../environments/environment'; // Asegúrate de tener el archivo de entorno configurado
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp, getApp } from 'firebase/app';
import { provideFirestore } from '@angular/fire/firestore';
import { provideAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver } from '@angular/fire/auth';
import { getFirestore } from 'firebase/firestore';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx'; // Importa BarcodeScanner

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase), // Inicializa Firebase con tu configuración
    FirestoreModule, 
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BarcodeScanner, provideFirebaseApp(() => initializeApp(environment.firebase)), // Inicializa Firebase
    provideFirestore(() => getFirestore()), // Provee Firestore
    provideAuth(() => 
      initializeAuth(getApp(), {
        persistence: [browserSessionPersistence, browserLocalPersistence],
        popupRedirectResolver: browserPopupRedirectResolver
      })
    ), // Provee Auth
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}