import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-registrar-asistencia',
  templateUrl: './registrar-asistencia.page.html',
  styleUrls: ['./registrar-asistencia.page.scss'],
})
export class RegistrarAsistenciaPage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  latitude: number | null = null;
  longitude: number | null = null;
  locationMessage: string | null = null; // Variable para mostrar mensaje de ubicación
  //Ubicacion DUOC: { lat: -36.79538244183323, lng: -73.06152573267023 }; 
  //Ubicacion Casa Seba: { lat: -36.60909853022575, lng: -72.96350965358964 };
  readonly institutionCoords = { lat: -36.60909853022575, lng: -72.96350965358964 };
  readonly allowedDistance = 120; // Rango en metros

  constructor(
    private alertController: AlertController,
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  ngOnInit() {
    
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();

    if (!granted) {
      this.presentAlert(
        'Permiso denegado',
        'Para usar la aplicación, autoriza los permisos de cámara.'
      );
      return;
    }

    const position = await this.checkLocation(); // Obtener ubicación al presionar el botón
    this.locationMessage = position ? `Ubicación actual: ${this.latitude?.toFixed(6)}, ${this.longitude?.toFixed(6)}` : 'No se pudo obtener la ubicación.';

    // Verificar si el usuario está en el área permitida
    if (!position) {
      this.presentAlert(
        'Ubicación no permitida',
        'No estás dentro del área permitida para registrar asistencia. ' + this.locationMessage
      );
      return;
    }

    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes = barcodes;

    if (barcodes.length === 0) {
      this.presentAlert('QR inválido', 'No se detectó ningún código QR.');
      return;
    }

    const codigoQR = barcodes[0].rawValue;
    const alumnoId = this.authService.getCurrentUserUid();

    if (!codigoQR || codigoQR.length !== 5) {
      this.presentAlert('QR inválido', 'El código QR escaneado no es válido.');
      return;
    }

    const claseRef = doc(this.firestore, `clase/${codigoQR}`);
    const claseSnap = await getDoc(claseRef);

    if (!claseSnap.exists()) {
      this.presentAlert('QR inválido', 'El código QR no corresponde a ninguna clase.');
      return;
    }

    const claseData = claseSnap.data();

    if (claseData['asistentes'] && claseData['asistentes'].includes(alumnoId)) {
      this.presentAlert('Ya estás presente', 'Ya estás registrado en esta clase.');
      return;
    }

    await updateDoc(claseRef, {
      asistentes: arrayUnion(alumnoId)
    });

    this.presentAlert('Asistencia registrada', 'Tu asistencia ha sido registrada exitosamente.');
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async checkLocation(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      
      // Verificar si los permisos de ubicación están concedidos
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          this.presentAlert('Permiso denegado', 'La aplicación necesita acceso a la ubicación para funcionar.');
          return false; // No se concedieron permisos
        }
      }
  
      // Obtener la posición actual
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Usar alta precisión
        timeout: 10000, // Tiempo de espera para obtener la ubicación
      });
  
      this.latitude = position.coords.latitude; // Asignar latitud
      this.longitude = position.coords.longitude; // Asignar longitud
      
      // Mensaje de ubicación
      this.locationMessage = `Ubicación actual: ${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
      
      const distance = this.calculateDistance(
        this.institutionCoords.lat,
        this.institutionCoords.lng,
        this.latitude,
        this.longitude
      );
  
      return distance <= this.allowedDistance; // Retorna true si está dentro del rango permitido
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
  
      // Mensajes de error mejorados
      let message = 'No se pudo obtener la ubicación. Intenta nuevamente más tarde.';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          message = 'La aplicación no tiene permisos para acceder a la ubicación. Por favor, habilítalos en la configuración.';
        } else if (error.message.includes('Location unavailable')) {
          message = 'No se pudo obtener la ubicación. Asegúrate de que el GPS esté habilitado y que tengas una buena conexión.';
        }
      }
  
      this.presentAlert('Error de ubicación', message);
  
      // Limpiar la latitud y longitud
      this.latitude = null;
      this.longitude = null;
      this.locationMessage = message; // Mantener el mensaje en el mismo formato
      
      return false; // No se pudo obtener la ubicación
    }
  }
  
  

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  async presentAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
