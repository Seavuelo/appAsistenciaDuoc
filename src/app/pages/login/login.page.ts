import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { FirebaseError } from 'firebase/app';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';


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
    private toastController: ToastController,
    private DataService: DataService
  ) {}

  ngOnInit() {}

  //Funcion para iniciar Sesion
  async onLogin() {
    const isOnline = await this.DataService.isOnline();
  
    if (isOnline) {
      try {
        const result = await this.authService.login(this.email, this.password);
  
        if (result.success) {
          this.navigateToHome();
          return;
        } else {
          this.handleLoginError(result.message);
        }
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          this.handleLoginError(error.code);
        } else {
          console.error('Error desconocido:', error);
          this.showToast('Error inesperado. Intenta de nuevo.', 'danger');
        }
      }
    } else {
      // Recuperar datos del localStorage y del almacenamiento seguro
      const storedEmail = localStorage.getItem('userEmail');
      const storedUserName = localStorage.getItem('userName');
      const storedUserRole = localStorage.getItem('userRole');
  
      if (storedEmail && storedUserName && storedUserRole) {
        const storedPasswordResult = await SecureStoragePlugin.get({ key: storedEmail });
        const storedPassword = storedPasswordResult?.value;
  
        if (this.email === storedEmail && this.password === storedPassword) {
          this.navigateToHome();
        } else {
          this.showToast('Correo o contraseña incorrectos.', 'danger');
        }
      } else {
        this.showToast('No se encontraron datos de usuario almacenados en el dispositivo.', 'danger');
      }
    }
  }
  
  
  navigateToHome() {
    if (this.email.endsWith('@profesorduoc.com')) {
      this.router.navigate(['/homeprofe']);
    } else if (this.email.endsWith('@alumnoduoc.com')) {
      this.router.navigate(['/inicio']);
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