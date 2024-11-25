import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

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
    private alertController: AlertController,
    private DataService:DataService
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
      this.showToast('El correo debe ser válido.', 'secondary');
      return;
    }
    if (!this.CorreoInstitucion(this.email)) {
      this.showToast('Por favor, utilice un correo de la institución.', 'secondary');
      return;
    }
  
    const isOnline = await this.DataService.isOnline();
    
    if (!isOnline) {
      this.showToast('No hay conexión a internet. El registro debe realizarse con conexión.', 'secondary');
      return;
    }
  
    // Solo si hay internet, intentamos registrar al usuario en Firebase
    const userData = { email: this.email, password: this.password };
  
    try {
      const result = await this.authService.register(this.email, this.password);
      if (result.success) {
        this.showAlert('¡Registro exitoso!', 'Has sido registrado con éxito.');
        // Guardar los datos en localStorage solo después del registro exitoso en Firebase

        const userRole = result.userRole ?? 'Invitado';
        localStorage.setItem('userEmail', this.email);
        localStorage.setItem('userRole', userRole); // Aquí se supone que tienes el rol o lo extraes del registro
        localStorage.setItem('userName', this.email.split('@')[0]);
        
        // Redirigir al login solo después de un registro exitoso
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
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
