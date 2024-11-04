import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NavigationService } from 'src/app/services/Navigation.Service';
import { Itemlist } from 'src/app/interfaces/itemlist';
import { PerfilPopoverPage } from '../perfil-popover/perfil-popover.page';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, OnDestroy {
  private backButtonSubscription: any;

  constructor(
    private platform: Platform,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.navigationService.setCurrentPage('inicio');

    // Escuchar el evento de retroceso y guardar la suscripción
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.navigationService.isHomePage()) {
      }
    });
  }

  ngOnDestroy() {
    // Desuscribirse del evento de retroceso cuando se abandona InicioPage
    this.backButtonSubscription.unsubscribe();
  }

  

  async openPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: PerfilPopoverPage,
      event: event,
      translucent: true,
    });
    await popover.present();
  }
  

  vinculos: Itemlist[] = [
    { ruta: '/asistencia', titulo: 'Asistencia', icono: 'walk' },
    { ruta: '/registrar-asistencia', titulo: 'Registrar Asistencia', icono: 'qr-code-outline' },
  ];
}
