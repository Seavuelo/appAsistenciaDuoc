import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { Firestore, doc, getDoc, setDoc, getDocs, writeBatch, arrayUnion, collection} from '@angular/fire/firestore'; 
import { Router } from '@angular/router'; // Importa Router
import { Storage } from '@ionic/storage-angular';
import { NavigationService } from './Navigation.Service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private auth = getAuth(); 

  constructor(private storage: Storage, private db: Firestore,private router: Router, private NavigationService: NavigationService) {
    this.init(); // Inicializa el almacenamiento

  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }
// Nuevo método para obtener el UID del usuario actual
getCurrentUserUid(): string | null {
  const user = this.auth.currentUser;
  return user ? user.uid : null; // Retorna el UID si el usuario está autenticado, de lo contrario null
}
async register(email: string, password: string) {
  await this.NavigationService.presentLoading('Cargando datos...');

  try {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;
    console.log(`Usuario registrado: ${email}`);
    
    // Definir el rol basado en el correo institucional
    let rol: string;
    if (email.endsWith('@alumnoduoc.com')) {
      rol = 'Alumno';
    } else if (email.endsWith('@profesorduoc.com')) {
      rol = 'Profesor';
    } else {
      rol = 'Invitado'; // O cualquier rol por defecto si no coincide
    }
    const nombre = email.split('@')[0]; // Obtiene el texto antes de "@"

    // Crear el objeto de usuario
    const userInfo = {
      correo_institucional: email,
      rol: rol,
      apellido_materno: '', // Vacío por defecto
      apellido_paterno: '', // Vacío por defecto
      correo_personal: '',  // Vacío por defecto
      nombre: nombre,       // Nombre basado en la parte antes de "@"
      segundo_nombre: '',   // Vacío por defecto
      // Aquí puedes agregar más campos si es necesario
    };

    // Guardar la información del usuario en Firestore con su UID como ID
    await setDoc(doc(this.db, 'usuario', uid), userInfo);

    return { success: true, user: userCredential.user };
  } catch (error: any) {
    // Si ocurre un error, retorna el error
    return { success: false, message: error.code };
  } finally {
    // Oculta el indicador de carga después de realizar la operación
    await this.NavigationService.dismissLoading();
  }
}


async login(email: string, password: string): Promise<any> {
  // Muestra el indicador de carga
  await this.NavigationService.presentLoading('Cargando datos...');

  try {
    // Inicia sesión con Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    console.log(`Usuario autenticado: ${userCredential.user.email}`);

    // Guardar UID en local storage
    await this._storage?.set('user_uid', userCredential.user.uid);

    // Retorna el éxito
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    // Si ocurre un error, retorna el error
    console.error('Error en login:', error);
    return { success: false, message: error.code };
  } finally {
    // Oculta el indicador de carga después de realizar la operación
    await this.NavigationService.dismissLoading();
  }
}

  

  async logOut() {
    try {
      await signOut(this.auth);
      console.log('Usuario cerrado sesión');
      await this._storage?.remove('user_uid'); // Elimina UID de local storage
      this.router.navigate(['/login']); // Redirige a login
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
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
        return true; // Sesión existente
      }
    }
    return false; // No hay sesión almacenada
  }
  
}