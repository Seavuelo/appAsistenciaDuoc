import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  asignaturas: any[] = []; 

  constructor(private asignaturaService: AsignaturaService, private authService: AuthService) {}

  async ngOnInit() {
  }
  // Obtenemops el UID del alumno actual y con eso obtenemos las Asignaturas y su Asistencia
  async ionViewWillEnter() {
    const alumnoId = this.authService.getCurrentUserUid(); 
    if (alumnoId) {
      try {
        const asignaturasConAsistencia = await this.asignaturaService.obtenerAsignaturasYAsistencia(alumnoId);
        this.asignaturas = asignaturasConAsistencia; 
      } catch (error) {
        console.error('Error al obtener las asignaturas o la asistencia:', error);
      }
    } else {
      console.error("No se encontró el UID del alumno.");
    }

    
  }
}
