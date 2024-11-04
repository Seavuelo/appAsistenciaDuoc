import { Injectable } from '@angular/core';
import { Firestore,doc, getDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  constructor(private db: Firestore, private authService: AuthService) {}

  async obtenerAsignaturasPorUsuario() {
    const uid = this.authService.getCurrentUserUid(); // Obtener el UID del usuario actual
    if (!uid) {
      return []; // Retorna un array vacío si el usuario no está autenticado
    }

    const asignaturasRef = collection(this.db, 'asignatura');

    // Realizar dos consultas, una para 'alumnos' y otra para 'profesor_id'
    const qAlumnos = query(asignaturasRef, where('alumnos', 'array-contains', uid));
    const qProfesor = query(asignaturasRef, where('profesor_id', 'array-contains', uid));

    const [querySnapshotAlumnos, querySnapshotProfesor] = await Promise.all([
      getDocs(qAlumnos),
      getDocs(qProfesor),
    ]);

    const asignaturas: any[] = [];

    // Agregar resultados de la consulta de alumnos
    querySnapshotAlumnos.forEach((doc) => {
      asignaturas.push({ id: doc.id, ...doc.data() });
    });

    // Agregar resultados de la consulta de profesores
    querySnapshotProfesor.forEach((doc) => {
      asignaturas.push({ id: doc.id, ...doc.data() });
    });

    return asignaturas;
  }
  
  async obtenerAsignaturaPorId(asignaturaId: string) {
    const asignaturasRef = collection(this.db, 'asignatura');
    const q = query(asignaturasRef, where('asignatura_id', '==', asignaturaId)); // Busca por el campo `asignatura_id`
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error('No existe la asignatura'); // Si no se encuentra ningún documento
    }
  
    let asignaturaData;
    querySnapshot.forEach((doc) => {
      asignaturaData = { id: doc.id, ...doc.data() }; // Obtiene el primer documento encontrado
    });
  
    return asignaturaData; // Retorna la información de la asignatura
  }
  // Método para obtener los nombres de los alumnos
  async obtenerAlumnosPorUids(uids: string[]) {
    const alumnos: string[] = [];
    for (const uid of uids) {
      const alumnoRef = doc(this.db, 'usuario', uid); // Accede a la colección 'Usuario'
      const alumnoDoc = await getDoc(alumnoRef);
      if (alumnoDoc.exists()) {
        // Extrae el nombre completo del alumno
        const data = alumnoDoc.data();
        const nombreCompleto = `${data['nombre']} ${data['segundo_nombre'] || ''} ${data['apellido_paterno']} ${data['apellido_materno']}`.trim();
        alumnos.push(nombreCompleto); // Agrega el nombre completo a la lista
      }
    }
    return alumnos;
  }

  // Método para obtener los nombres de los profesores
  async obtenerProfesoresPorUids(uids: string[]) {
    const profesores: string[] = [];
    for (const uid of uids) {
      const profesorRef = doc(this.db, 'usuario', uid); // Accede a la colección 'Usuario'
      const profesorDoc = await getDoc(profesorRef);
      if (profesorDoc.exists()) {
        // Extrae el nombre completo del profesor
        const data = profesorDoc.data();
        const nombreCompleto = `${data['nombre']} ${data['segundo_nombre'] || ''} ${data['apellido_paterno']} ${data['apellido_materno']}`.trim();
        profesores.push(nombreCompleto); // Agrega el nombre completo a la lista
      }
    }
    return profesores;
  }
}