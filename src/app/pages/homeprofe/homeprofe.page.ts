import { Itemlist } from 'src/app/interfaces/itemlist';
import { PerfilPopoverPage } from '../perfil-popover/perfil-popover.page'; // Importa el componente
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, AlertController, PopoverController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-homeprofe',
  templateUrl: './homeprofe.page.html',
  styleUrls: ['./homeprofe.page.scss'],
})
export class HomeprofePage implements OnInit {
  private backButtonSubscription: any;
  private popover: any; // Guardamos la referencia del popover

  constructor(
    private popoverController: PopoverController,
    private Platform:Platform,
    private AuthService:AuthService,
    private AlertController:AlertController,
    private NavController:NavController
  ) {}

  ngOnInit() {
    // Suscripción al botón de retroceso
    this.backButtonSubscription = this.Platform.backButton.subscribeWithPriority(10, async () => {
      // Llama a la alerta cuando se presiona el botón de retroceso
      if (this.popover) {
        // Si el popover está abierto, no hacer nada, solo cerrar el popover
        await this.popover.dismiss();
      } else {
        // Si no hay popover, muestra la alerta de cierre de sesión
        await this.logOut();
      }
    });
  }

  ngOnDestroy() {
    // Desuscribe el evento cuando dejas la página
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }


  async openPopover(event: Event) {
    // Crear y mostrar el popover
    this.popover = await this.popoverController.create({
      component: PerfilPopoverPage,
      event: event,
      translucent: true,
    });
    await this.popover.present();
  }
  async logOut() {
    // Alerta de confirmación para cerrar sesión
    const alert = await this.AlertController.create({
      header: '¿Cerrar la Sesión?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          }
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.AuthService.logOut(); // Llama al método de cierre de sesión
            console.log('Cerrando sesión...');
            this.NavController.navigateRoot('/login'); // Redirige al login después de cerrar sesión
          }
        }
      ]
    });

    await alert.present(); // Muestra la alerta
  }

  vinculos: Itemlist[] = [
    {
      ruta: '/asignaturasprofe',
      titulo: 'Asignaturas',
      icono: 'bulb-outline'
    },
    {
      ruta: '/asistenciaprofe',
      titulo: 'Clases',
      icono: 'folder-open-outline'
    }
  ];
}