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
    const app = initializeApp(environment.firebase);
    console.log('Firebase initialized:', app);
    this.initializeApp();

  }
ngOnInit() {
  
}
initializeApp() {
  this.platform.ready().then(() => {
    document.body.classList.add('dark');
  });
}
}
