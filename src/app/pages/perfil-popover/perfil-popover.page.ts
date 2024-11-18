import { Component } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-popover',
  templateUrl: './perfil-popover.page.html',
  styleUrls: ['./perfil-popover.page.scss'],
})
export class PerfilPopoverPage {

  constructor(private navCtrl: NavController, private authService: AuthService, private alertController: AlertController, private popoverController: PopoverController) { }

  async goToProfile() {
    this.navCtrl.navigateForward('/perfil'); // Reemplaza '/perfil' con la ruta de tu página de perfil
    await this.popoverController.dismiss(); // Cierra el popover
  }
  async goToAsignaturas() {
    this.navCtrl.navigateForward('/escogerasignaturas'); // Reemplaza '/perfil' con la ruta de tu página de perfil
    await this.popoverController.dismiss(); // Cierra el popover
  }

  async logOut() {
    const alert = await this.alertController.create({
      header: '¿Cerrar la Sesion?',
   
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
            await this.authService.logOut(); // Llama al método de cierre de sesión
            console.log('Cerrando sesión...');
            await this.popoverController.dismiss(); // Cierra el popover
            this.navCtrl.navigateRoot('/login'); // Redirige al login o inicio después de cerrar sesión
          }
        }
      ]
    });

    await alert.present(); // Muestra el alert
  }
}