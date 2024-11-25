import { Component, OnInit } from '@angular/core';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
import { Firestore, doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@capacitor/geolocation';
import { NavigationService } from 'src/app/services/Navigation.Service';
import { DataService } from 'src/app/services/data.service';
import { Network } from '@capacitor/network';

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
  locationMessage: string | null = null; 
  //Ubicacion DUOC: { lat: -36.79538244183323, lng: -73.06152573267023 }; 
  //Ubicacion Casa Seba: { lat: -36.60909853022575, lng: -72.96350965358964 };
  readonly institutionCoords = { lat: -36.79538244183323, lng: -73.06152573267023 }; 
  readonly allowedDistance = 120; 
  offlineData: any[] = []; 

  constructor(
    private alertController: AlertController,
    private firestore: Firestore,
    private dataService: DataService,  
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
        await this.syncOfflineData();
      }
    });
  }
  

  //Aqui se ve si se tienen los permisos de camara activos o cumple con los requisitos, para despues proceder a scanear.
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
    //Aqui si no hay conexion, se guardan los datos para enviarlo cuando haya conexion.
    const networkStatus = await Network.getStatus();
    if (!networkStatus.connected) {
      await this.saveOfflineData({ codigoQR, alumnoId, latitude: this.latitude, longitude: this.longitude });
      this.presentAlert('A la espera de conexión', 'Se guardó tu asistencia localmente. Se enviará cuando haya conexión.');
      await this.NavigationService.dismissLoading();  
      return;
    }
    await this.processQR(codigoQR, alumnoId);  
  }
  

  //Ya escaneado el QR se procesa esto, te deja presente o te avisa de algun error
  async processQR(codigoQR: string, alumnoId: string) {
    try {
      await this.NavigationService.presentLoading('Procesando QR...');
      
      // Obtener referencia de la clase con el código QR
      const claseRef = doc(this.firestore, `clase/${codigoQR}`);
      const claseSnap = await getDoc(claseRef);
      
      if (!claseSnap.exists()) {
        await this.NavigationService.dismissLoading();
        await this.presentAlert('QR inválido', 'El código QR no corresponde a ninguna clase.');
        return;
      }
  
      const claseData = claseSnap.data();
  
      // Verificar si el alumno ya está registrado en esta clase
      if (claseData['asistentes'] && claseData['asistentes'].includes(alumnoId)) {
        await this.NavigationService.dismissLoading();
        await this.presentAlert('Ya estás presente', 'Ya estás registrado en esta clase.');
        return;
      }
  
      // Obtener el asignatura_id vinculado a la clase
      const asignaturaId = claseData['asignatura_id'];
      if (!asignaturaId) {
        await this.NavigationService.dismissLoading();
        await this.presentAlert('Error', 'No se encontró información de la asignatura para esta clase.');
        return;
      }
  
      // Verificar si el alumno pertenece a la asignatura
      const asignaturaRef = doc(this.firestore, `asignatura/${asignaturaId}`);
      const asignaturaSnap = await getDoc(asignaturaRef);
  
      if (!asignaturaSnap.exists()) {
        await this.NavigationService.dismissLoading();
        await this.presentAlert('Error', 'No se encontró información de la asignatura.');
        return;
      }
  
      const asignaturaData = asignaturaSnap.data();
  
      if (!asignaturaData['alumnos'] || !asignaturaData['alumnos'].includes(alumnoId)) {
        await this.NavigationService.dismissLoading();
        await this.presentAlert(
          'No perteneces a esta clase',
          'Tu usuario no está registrado en la asignatura vinculada a esta clase.'
        );
        return;
      }
  
      // Registrar asistencia del alumno
      await updateDoc(claseRef, {
        asistentes: arrayUnion(alumnoId),
      });
  
      await this.NavigationService.dismissLoading();
      await this.presentAlert('Asistencia registrada', 'Tu asistencia ha sido registrada exitosamente.');
    } catch (error) {
      console.error('Error al procesar QR:', error);
      await this.NavigationService.dismissLoading();
      await this.presentAlert('Error', 'Hubo un problema al registrar tu asistencia. Intenta nuevamente.');
    } finally {
      await this.NavigationService.dismissLoading();
    }
  }
  
  
  
  //Para salvar los datos sin internet.
  async saveOfflineData(data: any) {
    this.offlineData.push(data);
    await this.dataService.saveOfflineData(this.offlineData);  
  }


  //Para sincronizar los datos una vez que llega el internet
  async syncOfflineData() {
    if (this.offlineData.length > 0) {
      for (const data of this.offlineData) {
        const { codigoQR, alumnoId } = data;
        await this.processQR(codigoQR, alumnoId);  
      }
      this.offlineData = [];  
      await this.dataService.clearOfflineData();  
    }
  }


  //Requiriendo permisos
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }


  //Para dar nuestra ubicacion.
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

  //Esto se usa para calcular la distancia en metros entre 2 puntos, para asegurar que estemos en el duoc o en el rango permitido.
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