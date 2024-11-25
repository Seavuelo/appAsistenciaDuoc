import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { Firestore, doc, getDoc, setDoc, collection, query, where, getDocs} from '@angular/fire/firestore'; 
import { Router } from '@angular/router'; 
import { Storage } from '@ionic/storage-angular';
import { NavigationService } from './Navigation.Service';
import { User } from 'firebase/auth';
import { Network } from '@capacitor/network';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private auth = getAuth(); 
  onlineStatus: boolean = true;


  constructor(private storage: Storage, private db: Firestore,private router: Router, private NavigationService: NavigationService) {
    this.init(); 

  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.auth.currentUser; 
  }

getCurrentUserUid(): string | null {
  const user = this.auth.currentUser;
  return user ? user.uid : null; 
}

async register(email: string, password: string) {
  await this.NavigationService.presentLoading('Cargando datos...');

  try {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;
    console.log(`Usuario registrado: ${email}`);

    // Determinar el rol basado en el correo electrónico
    let rol: string;
    if (email.endsWith('@alumnoduoc.com')) {
      rol = 'Alumno';
    } else if (email.endsWith('@profesorduoc.com')) {
      rol = 'Profesor';
    } else {
      rol = 'Invitado'; 
    }

    const nombre = email.split('@')[0]; 

    const userInfo = {
      correo_institucional: email,
      rol: rol,
      apellido_materno: '', 
      apellido_paterno: '', 
      correo_personal: '',  
      nombre: nombre,       
      segundo_nombre: '', 
    };

    // Guardar la información del usuario en Firestore
    await setDoc(doc(this.db, 'usuario', uid), userInfo);

    // Guardar la contraseña de forma segura en el dispositivo
    await SecureStoragePlugin.set({ key: email, value: password });

    // Guardar el correo, rol y nombre en localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', rol);
    localStorage.setItem('userName', nombre);

    // Retornar el éxito del registro con el rol
    return { success: true, user: userCredential.user, userRole: rol };
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    return { success: false, message: error.code };
  } finally {
    await this.NavigationService.dismissLoading();
  }
}


async login(email: string, password: string): Promise<any> {
  await this.NavigationService.presentLoading('Cargando datos...');

  try {
    // Intentar iniciar sesión con Firebase
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    console.log(`Usuario autenticado: ${userCredential.user.email}`);

    // Guardar UID en el almacenamiento interno
    await this._storage?.set('user_uid', userCredential.user.uid);

    // Obtener datos del usuario desde Firebase
    const userEmail = userCredential.user.email || '';
    const userName = userEmail.split('@')[0];
    const userRole = await this.fetchUserRole(userCredential.user.uid);

    // Guardar datos en localStorage
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);

    // Guardar contraseña en almacenamiento seguro
    await SecureStoragePlugin.set({
      key: userEmail,
      value: password,
    });

    // Retornar éxito del login
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Error en login:', error);
    return { success: false, message: error.code };
  } finally {
    await this.NavigationService.dismissLoading();
  }
}

  

  async logOut() {
    try {
      await signOut(this.auth);
      console.log('Usuario cerrado sesión');
      await this._storage?.remove('user_uid'); 
      this.router.navigate(['/login']); 
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async storePassword(email: string, password: string) {
    try {
      await SecureStoragePlugin.set({ key: email, value: password });
      console.log('Contraseña almacenada de forma segura');
    } catch (error) {
      console.error('Error al guardar la contraseña:', error);
    }
  }

  async retrievePassword(email: string) {
    try {
      const { value } = await SecureStoragePlugin.get({ key: email });
      return value;
    } catch (error) {
      console.error('Error al recuperar la contraseña:', error);
      return null;
    }
  }
  

  async getUserInfo(uid: string) {
    const userDoc = doc(this.db, 'usuario', uid);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      return null;
    }
  }

  async updateUserInfo(uid: string, userInfo: any) {
    const userDoc = doc(this.db, 'usuario', uid);
    try {
      await setDoc(userDoc, userInfo, { merge: true });
      console.log('Información del usuario actualizada');
    } catch (error) {
      console.error('Error al actualizar la información:', error);
    }
  }

  async checkStoredSession(): Promise<boolean> {
    const storedUid = await this._storage?.get('user_uid');
    if (storedUid) {
      const user = this.auth.currentUser;
      if (user && user.uid === storedUid) {
        console.log('Sesión de usuario existente: ', user.email);
        return true; 
      }
    }
    return false; 
  }
    // Verificar si hay usuarios duplicados
    async checkForDuplicateUser(email: string): Promise<boolean> {
      const usersRef = collection(this.db, 'users');
      const emailQuery = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(emailQuery);
      return !querySnapshot.empty;
    }

    async checkAndSyncDuplicates(currentUser: any) {
      if (currentUser && currentUser.email) {
        const isDuplicate = await this.checkForDuplicateUser(currentUser.email);
        if (isDuplicate) {
          await this.logOut();
          this.router.navigate(['/login'], {
            queryParams: { error: 'Usuario duplicado. Intente con otro correo.' }
          });
        }
      } else {
        this.router.navigate(['/login']);
      }
    }

    async syncOfflineUsers() {
      const offlineUsers = await this.getOfflineUsers();
      
      for (const user of offlineUsers) {
        try {
          const isDuplicate = await this.checkForDuplicateUser(user.email);
          if (isDuplicate) {
            await this.logOut();
            this.router.navigate(['/login'], {
              queryParams: { error: 'El correo ya está registrado. Intente con otro correo.' }
            });
            return; 
          }
          await this.login(user.email, user.password);

          await this.register(user.email, user.password);
  
        } catch (error) {
          console.error(`Error al sincronizar usuario ${user.email}:`, error);
        }
      }
  
      // Limpiar la lista de usuarios offline una vez sincronizados
      await this.setData('offlineUsers', []); 
    }
  

    initializeNetworkEvents() {
      Network.addListener('networkStatusChange', async status => {
        this.onlineStatus = status.connected;
        if (this.onlineStatus) {
          const offlineUsers = await this.getOfflineUsers();
          if (offlineUsers.length > 0) {
            await this.syncOfflineUsers();
            await this.checkAndSyncDuplicates(await this.getCurrentUser());
          }
        }
      });
    }

    async getOfflineUsers() {
      return await this.getData('offlineUsers');
    }

    async getData(key: string) {
      return await this.storage.get(key);
    }

    async setData(key: string, value: any) {
      await this.storage.set(key, value);
    }
    
    private async fetchUserRole(uid: string): Promise<string> {
      const docRef = doc(this.db, 'usuario', uid);
      const docSnap = await getDoc(docRef);
    
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data['rol'] || 'Invitado';
      }
    
      return 'Invitado'; // Valor por defecto si no hay información
    }

 }