import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@capacitor/geolocation';
import { NavigationService } from 'src/app/services/Navigation.Service';
import { DataService } from 'src/app/services/data.service';
import { Network } from '@capacitor/network';
import { Auth } from '@angular/fire/auth';

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
  readonly institutionCoords =  { lat: -36.79538244183323, lng: -73.06152573267023 }; 
  readonly allowedDistance = 120; // Rango en metros
  offlineData: any[] = [];  // Arreglo para guardar datos offline

  constructor(
    private alertController: AlertController,
    private firestore: Firestore,
    private dataService: DataService,  // Usando DataService para almacenar QR
    private NavigationService: NavigationService,
    private AuthService:AuthService
  ) {}

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    // Escuchar cambios en la red
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        // Si estamos conectados, intenta enviar los datos almacenados
        await this.syncOfflineData();
      }
    });
  }

  async scan(): Promise<void> {
    await this.NavigationService.presentLoading('Cargando datos...');
  
    const granted = await this.requestPermissions();
  
    if (!granted) {
      this.presentAlert('Permiso denegado', 'Para usar la aplicación, autoriza los permisos de cámara.');
      await this.NavigationService.dismissLoading();
      return;
    }
  
    const position = await this.checkLocation();
    this.locationMessage = position ? `Ubicación actual: ${this.latitude?.toFixed(6)}, ${this.longitude?.toFixed(6)}` : 'No se pudo obtener la ubicación.';
  
    if (!position) {
      this.presentAlert('Ubicación no permitida', 'No estás dentro del área permitida para registrar asistencia.' + this.locationMessage);
      await this.NavigationService.dismissLoading();
      return;
    }
  
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes = barcodes;
  
    if (barcodes.length === 0) {
      this.presentAlert('QR inválido', 'No se detectó ningún código QR.');
      await this.NavigationService.dismissLoading();
      return;
    }
  
    const codigoQR = barcodes[0].rawValue;
    const alumnoId = this.AuthService.getCurrentUserUid();
  
    if (!alumnoId) {
      this.presentAlert('Error', 'No se ha podido obtener el ID del usuario. Asegúrate de estar autenticado.');
      await this.NavigationService.dismissLoading();
      return;
    }
  
    if (!codigoQR || codigoQR.length !== 5) {
      this.presentAlert('QR inválido', 'El código QR escaneado no es válido.');
      await this.NavigationService.dismissLoading();
      return;
    }
  
    // Verifica el estado de la red
    const networkStatus = await Network.getStatus();
    if (!networkStatus.connected) {
      // Si está desconectado, guarda los datos localmente
      await this.saveOfflineData({ codigoQR, alumnoId, latitude: this.latitude, longitude: this.longitude });
      this.presentAlert('A la espera de conexión', 'Se guardó tu asistencia localmente. Se enviará cuando haya conexión.');
      await this.NavigationService.dismissLoading();
      return;
    }
  
    // Si está en línea, procesa el QR como de costumbre
    await this.processQR(codigoQR, alumnoId);
    await this.NavigationService.dismissLoading();
  }
  

  async processQR(codigoQR: string, alumnoId: string) {
    try {
      await this.NavigationService.presentLoading('Cargando datos...');
  
      const claseRef = doc(this.firestore, `clase/${codigoQR}`);
      const claseSnap = await getDoc(claseRef);
  
      if (!claseSnap.exists()) {
        await this.presentAlert('QR inválido', 'El código QR no corresponde a ninguna clase.');
        return;  // Salir antes de continuar
      }
  
      const claseData = claseSnap.data();
  
      if (claseData['asistentes'] && claseData['asistentes'].includes(alumnoId)) {
        await this.presentAlert('Ya estás presente', 'Ya estás registrado en esta clase.');
        return;  // Salir antes de continuar
      }
  
      await updateDoc(claseRef, {
        asistentes: arrayUnion(alumnoId)
      });
  
      await this.presentAlert('Asistencia registrada', 'Tu asistencia ha sido registrada exitosamente.');
    } catch (error) {
      console.error('Error al procesar QR:', error);
      await this.presentAlert('Error', 'Hubo un problema al registrar tu asistencia. Intenta nuevamente.');
    } finally {
      // Siempre cerrar el loading spinner
      await this.NavigationService.dismissLoading();
    }
  }
  

  async saveOfflineData(data: any) {
    this.offlineData.push(data);
    await this.dataService.saveOfflineData(this.offlineData);  // Guarda los datos en el servicio o almacenamiento local
  }

  async syncOfflineData() {
    if (this.offlineData.length > 0) {
      for (const data of this.offlineData) {
        const { codigoQR, alumnoId } = data;
        await this.processQR(codigoQR, alumnoId);  // Vuelve a procesar los datos
      }
      this.offlineData = [];  // Limpia los datos una vez sincronizados
      await this.dataService.clearOfflineData();  // Elimina los datos almacenados localmente
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async checkLocation(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          this.presentAlert('Permiso denegado', 'La aplicación necesita acceso a la ubicación para funcionar.');
          return false;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      const distance = this.calculateDistance(this.institutionCoords.lat, this.institutionCoords.lng, this.latitude, this.longitude);
      return distance <= this.allowedDistance;
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      this.presentAlert('Error de ubicación', 'No se pudo obtener la ubicación. Intenta nuevamente más tarde.');
      return false;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}