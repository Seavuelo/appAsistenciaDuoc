import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';
import { Firestore, collection, query, getDocs, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  onlineStatus: boolean = true;
  offlineData: any[] = []; 

  constructor(
    private storage: Storage, 
    private firestore: Firestore,  
    private router: Router
  ) {
    this.init();
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
 

  // Verificar si estamos conectados a la red
  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.onlineStatus = status.connected;
    return this.onlineStatus;
  }

  // Guardar datos cuando el dispositivo esté offline
  async saveOfflineData(data: any) {
    this.offlineData.push(data);
    await this.setData('offlineData', this.offlineData); 
  }

  // Sincronizar los datos guardados mientras el dispositivo estuvo offline
  async syncOfflineData() {
    if (this.offlineData.length > 0) {
      for (const data of this.offlineData) {
        const { codigoQR, alumnoId } = data;
        await this.processQR(codigoQR, alumnoId); 
      }
      this.offlineData = []; 
      await this.setData('offlineData', []);
    }
  }

  // Este es un ejemplo de cómo podrías procesar los datos del QR cuando la conexión esté disponible
  async processQR(codigoQR: string, alumnoId: string) {
    console.log(`Procesando QR: ${codigoQR} para el alumno: ${alumnoId}`);
  }

  // Limpiar los datos almacenados localmente
  async clearOfflineData() {
    this.offlineData = [];
    await this.setData('offlineData', []); 
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



  // Guardar usuarios offline
  async saveOfflineUser(userData: any) {
    const offlineUsers = (await this.getData('offlineUsers')) || [];
    offlineUsers.push(userData);
    await this.setData('offlineUsers', offlineUsers);
  }

  // Obtener los usuarios offline
  

  // Obtener el usuario actual
  async getCurrentUser() {
    return await this.getData('currentUser');
  }

  // Verificar el estado de la conexión
  async isOnline(): Promise<boolean> {
    return await this.checkNetworkStatus();
  }
}
