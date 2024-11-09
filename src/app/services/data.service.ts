import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  isOnline: boolean = true;
  offlineData: any[] = [];  // Aquí guardaremos los datos mientras el dispositivo esté offline

  constructor(private storage: Storage) {
    this.init();
    this.initializeNetworkEvents();
  }

  async init() {
    await this.storage.create();
  }

  // Guardar datos en el almacenamiento local
  async setData(key: string, value: any) {
    await this.storage.set(key, value);
  }

  // Obtener datos del almacenamiento local
  async getData(key: string) {
    return await this.storage.get(key);
  }

  // Inicializar eventos de red para monitorear el estado de la conexión
  initializeNetworkEvents() {
    Network.addListener('networkStatusChange', status => {
      this.isOnline = status.connected;
      console.log('Network status changed', status);
    });
  }

  // Verificar si estamos conectados a la red
  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
    return this.isOnline;
  }

  // Guardar datos cuando el dispositivo esté offline
  async saveOfflineData(data: any) {
    this.offlineData.push(data);
    await this.setData('offlineData', this.offlineData); // Guarda los datos en el almacenamiento local
  }

  // Sincronizar los datos guardados mientras el dispositivo estuvo offline
  async syncOfflineData() {
    if (this.offlineData.length > 0) {
      for (const data of this.offlineData) {
        const { codigoQR, alumnoId } = data;
        await this.processQR(codigoQR, alumnoId); // Vuelve a procesar los datos
      }
      this.offlineData = []; // Limpia los datos una vez sincronizados
      await this.setData('offlineData', []); // Elimina los datos almacenados localmente
    }
  }

  // Este es un ejemplo de cómo podrías procesar los datos del QR cuando la conexión esté disponible
  async processQR(codigoQR: string, alumnoId: string) {
    // Aquí deberías incluir la lógica para procesar el QR y guardar la asistencia en Firebase
    console.log(`Procesando QR: ${codigoQR} para el alumno: ${alumnoId}`);
    // Llamar a Firestore para guardar los datos o realizar alguna acción con el QR
  }

  // Limpiar los datos almacenados localmente
  async clearOfflineData() {
    this.offlineData = [];
    await this.setData('offlineData', []); // Elimina los datos guardados
  }

  // Obtener los datos offline almacenados
  async getOfflineData() {
    return await this.getData('offlineData');
  }

  // Obtener la ubicación del dispositivo (si es necesario)
  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      return position;
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      return null;
    }
  }
}

