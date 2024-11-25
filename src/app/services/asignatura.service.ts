import { Injectable } from '@angular/core';
import { Firestore,doc, getDoc, collection, getDocs, query, where, deleteDoc, arrayRemove, arrayUnion, updateDoc, addDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { NavigationService } from './Navigation.Service';
import { AlertController } from '@ionic/angular'; 
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  constructor(private Storage:Storage, private db: Firestore, private authService: AuthService, private NavigationService: NavigationService, private AlertController:AlertController) {}



  //Obteniendo las asignaturas segun su UID de usuario, considerando si tiene rol Alumno o Profesor
  async obtenerAsignaturasPorUsuario() {
    const uid = this.authService.getCurrentUserUid();
    if (!uid) {
      return []; 
    }
    const asignaturasRef = collection(this.db, 'asignatura');
    const qAlumnos = query(asignaturasRef, where('alumnos', 'array-contains', uid));
    const qProfesor = query(asignaturasRef, where('profesor_id', 'array-contains', uid));
    const [querySnapshotAlumnos, querySnapshotProfesor] = await Promise.all([
      getDocs(qAlumnos),
      getDocs(qProfesor),
    ]);
    const asignaturas: any[] = [];
    querySnapshotAlumnos.forEach((doc) => {
      asignaturas.push({ id: doc.id, ...doc.data() });
    });
    querySnapshotProfesor.forEach((doc) => {
      asignaturas.push({ id: doc.id, ...doc.data() });
    });
    return asignaturas;
  }
  

  //Busca las Asignaturas segun su ID, en asignatura_id
  async obtenerAsignaturaPorId(asignaturaId: string) {
    const asignaturasRef = collection(this.db, 'asignatura');
    const q = query(asignaturasRef, where('asignatura_id', '==', asignaturaId)); 
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('No existe la asignatura'); 
    }
    let asignaturaData;
    querySnapshot.forEach((doc) => {
      asignaturaData = { id: doc.id, ...doc.data() }; 
    });
    return asignaturaData; 
  }


  // Método para obtener los nombres de los alumnos por su UID
  async obtenerAlumnosPorUids(uids: string[]) {
    if (!uids || uids.length === 0) {
      return []; 
    }
    const alumnos: string[] = [];
    for (const uid of uids) {
      const alumnoRef = doc(this.db, 'usuario', uid); 
      const alumnoDoc = await getDoc(alumnoRef);
      if (alumnoDoc.exists()) {
        const data = alumnoDoc.data();
        const nombreCompleto = `${data['nombre']} ${data['segundo_nombre'] || ''} ${data['apellido_paterno']} ${data['apellido_materno']}`.trim();
        alumnos.push(nombreCompleto); 
      }
    }
    return alumnos;
  }

  // Método para obtener los nombres de los profesores por su UID
  async obtenerProfesoresPorUids(uids: string[]) {
    if (!uids || uids.length === 0) {
      return []; 
    }
    const profesores: string[] = [];
    for (const uid of uids) {
      const profesorRef = doc(this.db, 'usuario', uid); 
      const profesorDoc = await getDoc(profesorRef);
      if (profesorDoc.exists()) {
        const data = profesorDoc.data();
        const nombreCompleto = `${data['nombre']} ${data['segundo_nombre'] || ''} ${data['apellido_paterno']} ${data['apellido_materno']}`.trim();
        profesores.push(nombreCompleto); 
      }
    }
    return profesores;
  }


  //Nos devuelve las Asignaturas y Asistencias del alumno
  async obtenerAsignaturasYAsistencia(alumnoId: string): Promise<any> {
    try {
      await this.NavigationService.presentLoading('Cargando datos...');
      const asignaturasRef = collection(this.db, 'asignatura');
      const q = query(asignaturasRef, where('alumnos', 'array-contains', alumnoId)); 
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('No se encontró ninguna asignatura para el alumno');
      }
      const asignaturasConAsistencia: any[] = [];
      for (const doc of querySnapshot.docs) {
        const asignaturaData = doc.data();
        const asignaturaId = asignaturaData['asignatura_id'];
        const nombreAsignatura = asignaturaData['nombre'];
        const aula = asignaturaData['aula'];  
        const horario = asignaturaData['horario'];  
        const asistencia = await this.calcularAsistencia(asignaturaId, alumnoId);
        asignaturasConAsistencia.push({
          nombre: nombreAsignatura,
          asignatura_id: asignaturaId,
          asistencia: asistencia,
          aula: aula, 
          horario: horario, 
        });
      }
      await this.NavigationService.dismissLoading();
      return asignaturasConAsistencia;
    } catch (error) {
      await this.NavigationService.dismissLoading();
      console.error("Error al obtener las asignaturas y asistencia:", error);
      throw error;
    }
  }
  
  //Funcion para calcular la Asistencia
  async calcularAsistencia(asignaturaId: string, alumnoId: string): Promise<number> {
    try {
      const clasesRef = collection(this.db, 'clase');
      const q = query(clasesRef, where('asignatura_id', '==', asignaturaId));
      const querySnapshot = await getDocs(q);
      let clasesAsistidas = 0;
      let totalClases = 0;
      querySnapshot.forEach((claseDoc) => {
        const claseData = claseDoc.data();
        totalClases++;
        if (claseData['asistentes'].includes(alumnoId)) {
          clasesAsistidas++;
        }
      });
      const porcentajeAsistencia = totalClases > 0 ? (clasesAsistidas / totalClases) * 100 : 0;
      const porcentajeAsistenciaRedondeado = parseFloat(porcentajeAsistencia.toFixed(1));
      return porcentajeAsistenciaRedondeado;
    } catch (error) {
      console.error("Error al calcular la asistencia para la asignatura", asignaturaId, error);
      throw error;
    }
  }

  //Funcion para eliminar una Clase
  eliminarClase(codigoClase: string) {
    console.log("Eliminar clase con código:", codigoClase);
    const claseRef = doc(this.db, 'clase', codigoClase); 
    deleteDoc(claseRef).then(() => {
    }).catch(error => {
      console.error("Error al eliminar la clase:", error);
    });
  }

  //Obteniendo todas las asignaturas
  async obtenerTodasAsignaturas() {
    const asignaturasRef = collection(this.db, 'asignatura');
    const querySnapshot = await getDocs(asignaturasRef);
    const asignaturas: any[] = [];
    querySnapshot.forEach((doc) => {
      asignaturas.push({ id: doc.id, ...doc.data() });
    });
    return asignaturas;
  }

  //Obteniendo todas las asignaturas del profesor
  async obtenerAsignaturasPorProfesor() {
    const uid = this.authService.getCurrentUserUid();
    if (!uid) {
      return []; 
    }
    const asignaturasRef = collection(this.db, 'asignatura');
    const querySnapshot = await getDocs(asignaturasRef);
    const asignaturas: any[] = [];
    querySnapshot.forEach((doc) => {
      const asignaturaData = doc.data();
      if (asignaturaData['profesor_id'] && asignaturaData['profesor_id'].includes(uid)) {
        asignaturas.push({ id: doc.id, ...asignaturaData });
      }
    });
    return asignaturas;
  }

  // Actualizar la asignación del profesor a una asignatura
  updateAsignaturaProfesor(asignaturaId: string, profesorId: string, isAssigned: boolean) {
    const asignaturaRef = doc(this.db, `asignatura/${asignaturaId}`);
    if (isAssigned) {
      return updateDoc(asignaturaRef, {
        profesor_id: arrayUnion(profesorId)
      });
    } else {
      return updateDoc(asignaturaRef, {
        profesor_id: arrayRemove(profesorId)
      });
    }
  }

  //Crear una asignatura
  async crearAsignatura(asignatura: any) {
    try {
      const asignaturasCollection = collection(this.db, 'asignatura');
      await addDoc(asignaturasCollection, asignatura);
      console.log('Asignatura creada con éxito');
    } catch (error) {
      console.error('Error al crear la asignatura:', error);
    }
  }

  //Funcion para eliminar una asignatura
  async eliminarAsignatura(asignaturaId: string) {
    try {
      const asignaturasRef = collection(this.db, 'asignatura');
      const querySnapshot = await getDocs(asignaturasRef);
      if (querySnapshot.size <= 1) {
        const alert = await this.AlertController.create({
          header: 'Advertencia',
          message: 'El establecimiento no permite quedarse con 0 asignaturas.',
          buttons: ['OK']
        });
        await alert.present();
        setTimeout(() => {
          alert.dismiss();
        }, 1000);
        console.log("No se puede eliminar la última asignatura.");
        return; 
      }
      const asignaturasRefDoc = collection(this.db, 'asignatura');
      const q = query(asignaturasRefDoc, where("asignatura_id", "==", asignaturaId));
      const querySnapshotDocs = await getDocs(q);
      if (querySnapshotDocs.empty) {
        console.log("La asignatura no existe");
        return;
      }
      const asignaturaDoc = querySnapshotDocs.docs[0];
      const asignaturaDocId = asignaturaDoc.id;
      const asignaturaRef = doc(this.db, 'asignatura', asignaturaDocId);
      await deleteDoc(asignaturaRef);
      await this.eliminarClasesPorAsignaturaId(asignaturaId);
    } catch (error) {
      console.error('Error al eliminar la asignatura:', error);
    }
  }

  //Eliminando la clase por su asignatura_id, ya que cuando se elimina una asignatura, se eliminan sus clases impartidas.
  async eliminarClasesPorAsignaturaId(asignaturaId: string) {
    try {
      const clasesRef = collection(this.db, 'clase');
      const q = query(clasesRef, where("asignatura_id", "==", asignaturaId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
          console.log(`Clase con ID ${doc.id} eliminada`);
        });
      } else {
        console.log('No se encontraron clases asociadas a esta asignatura');
      }
    } catch (error) {
      console.error('Error al eliminar las clases:', error);
    }
  } 

  //Funcion para que el alumno se inscriba a sus asignaturas deseadas.
  async actualizarAsignaturaAlumno(asignaturaId: string, alumnoId: string, isSelected: boolean) {
    const asignaturasRef = collection(this.db, 'asignatura');
    const q = query(asignaturasRef, where("asignatura_id", "==", asignaturaId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`No se encontró la asignatura con ID ${asignaturaId}`);
      return;
    }
    const asignaturaDoc = querySnapshot.docs[0];
    const asignaturaRef = doc(this.db, 'asignatura', asignaturaDoc.id); 
    try {
      const asignaturaData = asignaturaDoc.data();
      const alumnosInscritos = asignaturaData['alumnos'] || []; 
      if (isSelected) {
        if (!alumnosInscritos.includes(alumnoId)) {
          await updateDoc(asignaturaRef, {
            alumnos: arrayUnion(alumnoId)
          });
          console.log(`Alumno con ID ${alumnoId} agregado a la asignatura ${asignaturaId}`);
        } else {
          console.log(`El alumno con ID ${alumnoId} ya está inscrito en la asignatura ${asignaturaId}`);
        }
      } else {
        if (alumnosInscritos.includes(alumnoId)) {
          await updateDoc(asignaturaRef, {
            alumnos: arrayRemove(alumnoId)
          });
          console.log(`Alumno con ID ${alumnoId} eliminado de la asignatura ${asignaturaId}`);
        } else {
          console.log(`El alumno con ID ${alumnoId} no está inscrito en la asignatura ${asignaturaId}`);
        }
      }
    } catch (error) {
      console.error('Error al actualizar la asignatura para el alumno:', error);
    }
  }

  //Obtener las Asignaturas segun el UID del alumno
  async obtenerAsignaturasPorAlumno(alumnoId: string) {
    const asignaturasRef = collection(this.db, 'asignatura');
    const querySnapshot = await getDocs(asignaturasRef);
    const asignaturasInscritas: any[] = [];
    querySnapshot.forEach((doc) => {
      const asignaturaData = doc.data();
      if (asignaturaData['alumnos'] && asignaturaData['alumnos'].includes(alumnoId)) {
        asignaturasInscritas.push({ ...asignaturaData, asignatura_id: asignaturaData['asignatura_id'] });
      }
    });
    return asignaturasInscritas || [];  
  }
}