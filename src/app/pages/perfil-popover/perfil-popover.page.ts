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

  //Ir al Perfil
  async goToProfile() {
    this.navCtrl.navigateForward('/perfil'); 
    await this.popoverController.dismiss(); 
  }

  //Metodo para Cerrar sesion
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
            await this.authService.logOut(); 
            console.log('Cerrando sesión...');
            await this.popoverController.dismiss(); 
            this.navCtrl.navigateRoot('/login'); 
          }
        }
      ]
    });
    await alert.present(); 
  }
}