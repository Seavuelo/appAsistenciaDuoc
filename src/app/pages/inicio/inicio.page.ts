import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, AlertController, PopoverController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Itemlist } from 'src/app/interfaces/itemlist';
import { PerfilPopoverPage } from '../perfil-popover/perfil-popover.page';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  private backButtonSubscription: any;
  private popover: any; 

  constructor(
    private popoverController: PopoverController,
    private Platform:Platform,
    private AuthService:AuthService,
    private AlertController:AlertController,
    private NavController:NavController
  ) {}

  ngOnInit() {
    this.backButtonSubscription = this.Platform.backButton.subscribeWithPriority(10, async () => {
      if (this.popover) {
        await this.popover.dismiss();
      } else {
        await this.logOut();
      }
    });
  }

  ngOnDestroy() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  //Mostrar el Popover
  async openPopover(event: Event) {
    this.popover = await this.popoverController.create({
      component: PerfilPopoverPage,
      event: event,
      translucent: true,
    });
    await this.popover.present();
  }

  //Alerta de confirmación para cerrar sesión
  async logOut() {
    const alert = await this.AlertController.create({
      header: '¿Cerrar la Sesión?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.AuthService.logOut(); 
            this.NavController.navigateRoot('/login'); 
          }
        }
      ]
    });
    await alert.present(); 
  }

  vinculos: Itemlist[] = [
    { ruta: '/asistencia', 
      titulo: 'Tus Asignaturas', 
      icono: 'book' },

    { ruta: '/registrar-asistencia', 
      titulo: 'Registrar Asistencia', 
      icono: 'qr-code-outline' },
  ];
}
