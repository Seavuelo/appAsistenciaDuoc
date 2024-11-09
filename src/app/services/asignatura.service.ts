import { Injectable } from '@angular/core';
import { Firestore,doc, getDoc, collection, getDocs, query, where, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { NavigationService } from './Navigation.Service';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  constructor(private db: Firestore, private authService: AuthService, private NavigationService: NavigationService) {}

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
  async obtenerAsignaturasYAsistencia(alumnoId: string): Promise<any> {
    try {
      // Mostrar la pantalla de carga
      await this.NavigationService.presentLoading('Cargando datos...');
  
      // 1. Buscar todas las asignaturas en las que el alumno está inscrito
      const asignaturasRef = collection(this.db, 'asignatura');
      const q = query(asignaturasRef, where('alumnos', 'array-contains', alumnoId)); // Buscar por alumno
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error('No se encontró ninguna asignatura para el alumno');
      }
  
      // 2. Inicializar un array para guardar los resultados
      const asignaturasConAsistencia: any[] = [];
  
      // 3. Iterar sobre todas las asignaturas donde el alumno está inscrito
      for (const doc of querySnapshot.docs) {
        const asignaturaData = doc.data();
        const asignaturaId = asignaturaData['asignatura_id'];
        const nombreAsignatura = asignaturaData['nombre'];
        const aula = asignaturaData['aula'];  // Agregar aula
        const horario = asignaturaData['horario'];  // Agregar horario
  
        // Calcular asistencia para esta asignatura
        const asistencia = await this.calcularAsistencia(asignaturaId, alumnoId);
  
        // Guardar los resultados
        asignaturasConAsistencia.push({
          nombre: nombreAsignatura,
          asignatura_id: asignaturaId,
          asistencia: asistencia,
          aula: aula, // Agregar aula
          horario: horario, // Agregar horario
        });
      }
  
      // Ocultar la pantalla de carga después de obtener los datos
      await this.NavigationService.dismissLoading();
  
      return asignaturasConAsistencia;
    } catch (error) {
      // Asegurarse de que la pantalla de carga se cierre en caso de error
      await this.NavigationService.dismissLoading();
      console.error("Error al obtener las asignaturas y asistencia:", error);
      throw error;
    }
  }
  
  
  async calcularAsistencia(asignaturaId: string, alumnoId: string): Promise<number> {
    try {
      // 1. Buscar las clases asociadas a la asignatura
      const clasesRef = collection(this.db, 'clase');
      const q = query(clasesRef, where('asignatura_id', '==', asignaturaId));
      const querySnapshot = await getDocs(q);
  
      let clasesAsistidas = 0;
      let totalClases = 0;
  
      // 2. Calcular la asistencia: iterar sobre las clases de la asignatura
      querySnapshot.forEach((claseDoc) => {
        const claseData = claseDoc.data();
        totalClases++;
  
        // Verificar si el alumno está presente en la clase
        if (claseData['asistentes'].includes(alumnoId)) {
          clasesAsistidas++;
        }
      });
  
      // 3. Calcular el porcentaje de asistencia
      const porcentajeAsistencia = totalClases > 0 ? (clasesAsistidas / totalClases) * 100 : 0;
      const porcentajeAsistenciaRedondeado = parseFloat(porcentajeAsistencia.toFixed(1));

      return porcentajeAsistenciaRedondeado;
    } catch (error) {
      console.error("Error al calcular la asistencia para la asignatura", asignaturaId, error);
      throw error;
    }
  }
  eliminarClase(codigoClase: string) {
    // Aquí puedes agregar la lógica para eliminar la clase desde la base de datos
    console.log("Eliminar clase con código:", codigoClase);
    // Llamar a Firestore para eliminar el documento correspondiente
    const claseRef = doc(this.db, 'clase', codigoClase); // Reemplaza 'clase' con la colección adecuada
    deleteDoc(claseRef).then(() => {
      console.log("Clase eliminada exitosamente");
      // Aquí puedes actualizar el UI si es necesario
    }).catch(error => {
      console.error("Error al eliminar la clase:", error);
    });
  }
  
}