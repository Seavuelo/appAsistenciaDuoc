import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 
import { Firestore, doc, getDoc, setDoc} from '@angular/fire/firestore'; 
import { Router } from '@angular/router'; // Importa Router


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;
  private auth = getAuth(); 

  constructor(private storage: Storage, private db: Firestore,private router: Router) {
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
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
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

      // Crear el objeto de usuario
      const userInfo = {
        correo_institucional: email,
        rol: rol,
        apellido_materno: '', // Vacío por defecto
        apellido_paterno: '', // Vacío por defecto
        correo_personal: '',  // Vacío por defecto
        nombre: '',           // Vacío por defecto
        segundo_nombre: '',   // Vacío por defecto
        // Aquí puedes agregar más campos si es necesario
      };

      // Guardar la información del usuario en Firestore con su UID como ID
      await setDoc(doc(this.db, 'usuario', userCredential.user.uid), userInfo);
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, message: error.code };
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log(`Usuario autenticado: ${userCredential.user.email}`);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, message: error.code };
    }
  }

  async logOut() {
    try {
      await signOut(this.auth);
      console.log('Usuario cerrado sesión');
      this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
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

}