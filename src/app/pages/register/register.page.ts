import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {}

  // Método de registro con sus errores
  async onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.showToast('Rellene todos los campos.', 'secondary');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden.', 'secondary');
      return;
    }
    if (!this.CorreoValido(this.email)) {
      this.showToast('El correo debe ser valido', 'secondary');
      return;
    }
    if (!this.CorreoInstitucion(this.email)) {
      this.showToast('Por favor, utilice un correo de la institución.', 'secondary');
      return;
    }
    try {
      const result = await this.authService.register(this.email, this.password);
      if (result) { 
        this.showAlert('¡Registro exitoso!', 'Has sido registrado con éxito.');
      } 
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      this.handleError(error.code);
    }
  }

// Expresión regular para validar correo
  CorreoValido(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailPattern.test(email);
  }

  //Para validar que el Email sea del Instituto
  CorreoInstitucion(email: string): boolean {
    return email.endsWith('@profesorduoc.com') || email.endsWith('@alumnoduoc.com');
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000, 
      color,          
      position: 'top'
    });
    toast.present();
  }


  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'Aceptar',
        handler: () => {
          this.router.navigate(['/login']);  
        }
      }]
    });
    await alert.present();
  }
  
  // Manejo de errores específicos de Firebase
  handleError(errorCode: string) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        this.showToast('El correo ya está registrado.', 'secondary');
        break;
      case 'auth/weak-password':
        this.showToast('La contraseña es muy débil. Escoja una más segura.', 'secondary');
        break;
      default:
        this.showToast('Error inesperado.', 'secondary');
        break;
    }
  }
}
