import { Component, OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private platform: Platform) {
    // Inicialización de Firebase
    const app = initializeApp(environment.firebase);
    console.log('Firebase initialized:', app);
  }

  ngOnInit() {
    // Asegurarse de que el modo oscuro está desactivado y siempre usar el modo claro
    this.platform.ready().then(() => {
      // Forzar el modo claro en todas las plataformas
      document.documentElement.setAttribute('data-theme', 'light');
    });
  }
}
