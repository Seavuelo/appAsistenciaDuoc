// src/app/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentPage: string = '';
  private loading: any;

  constructor(private loadingController: LoadingController) {}

  setCurrentPage(page: string) {
    this.currentPage = page;
  }

  isHomePage(): boolean {
    return this.currentPage === 'inicio';
  }
  
  async presentLoading(message: string = 'Cargando...') {
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent',
      duration: 0  // No tiene duración límite, solo se oculta cuando se llama a dismiss
    });
    await this.loading.present();
  }

  // Oculta el indicador de carga
  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
