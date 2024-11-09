import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  asignaturas: any[] = []; // Aquí almacenaremos las asignaturas con su asistencia calculada

  constructor(private asignaturaService: AsignaturaService, private authService: AuthService) {}

  async ngOnInit() {
    const alumnoId = this.authService.getCurrentUserUid(); // Obtener el UID del alumno actual
    if (alumnoId) {
      try {
        // Llamamos a la función que obtiene las asignaturas y su asistencia
        const asignaturasConAsistencia = await this.asignaturaService.obtenerAsignaturasYAsistencia(alumnoId);
        this.asignaturas = asignaturasConAsistencia; // Asignamos las asignaturas con su asistencia calculada
      } catch (error) {
        console.error('Error al obtener las asignaturas o la asistencia:', error);
      }
    } else {
      console.error("No se encontró el UID del alumno.");
    }
  }
}
