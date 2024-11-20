import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  //Funcion para iniciar Sesion
  async onLogin() {
    console.log('Intentando iniciar sesión con:', this.email, this.password);
    const result = await this.authService.login(this.email, this.password);
    if (result.success) {
      if (this.email.endsWith('@profesorduoc.com')) {
        this.router.navigate(['/homeprofe']);
      } else if (this.email.endsWith('@alumnoduoc.com')) {
        this.router.navigate(['/inicio']);
      }
    } else {
      this.handleLoginError(result.message);
    }
  }

  //Mostrando Alerta
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  //Para errores de inicio de sesion
  handleLoginError(errorCode: string) {
    console.error('Error de inicio de sesión:', errorCode); 
    switch (errorCode) {
      case 'auth/missing-password':
        this.showToast('Ingrese una contraseña.', 'secondary');
        break;
      case 'auth/invalid-email':
        this.showToast('Correo inválido.', 'secondary');
        break;
      default:
        this.showToast('Credenciales invalidas.', 'secondary');
        break;
    }
  }
}