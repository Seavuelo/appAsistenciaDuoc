import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-escogerasignaturas',
  templateUrl: './escogerasignaturas.page.html',
  styleUrls: ['./escogerasignaturas.page.scss'],
})
export class EscogerasignaturasPage implements OnInit {
  asignaturas: any[] = [];
  alumnoId: string = '';

  constructor(
    private asignaturaService: AsignaturaService,
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.alumnoId = this.authService.getCurrentUserUid() || ''; // Obtener el UID del alumno
    this.loadAsignaturas();
  }

  // Cargar las asignaturas disponibles para los alumnos
  async loadAsignaturas() {
    // Obtener todas las asignaturas disponibles
    const todasAsignaturas = await this.asignaturaService.obtenerTodasAsignaturas();

    // Obtener las asignaturas en las que el alumno está inscrito
    const asignaturasAlumno = await this.asignaturaService.obtenerAsignaturasPorAlumno(this.alumnoId);

    // Marcar las asignaturas en las que el alumno ya está inscrito
    todasAsignaturas.forEach(asignatura => {
      // Verificar si el alumno ya está inscrito
      asignatura.isSelected = asignaturasAlumno.some(
        asignaturaInscrita => asignaturaInscrita.asignatura_id === asignatura.asignatura_id
      );
    });

    // Asignar las asignaturas al componente
    this.asignaturas = todasAsignaturas;
  }

  // Guardar la selección de asignaturas
  guardarSeleccion() {
    this.asignaturas.forEach(asignatura => {
      const isSelected = asignatura.isSelected;
      this.asignaturaService.actualizarAsignaturaAlumno(asignatura.asignatura_id, this.alumnoId, isSelected);
    });

    // Redirigir al alumno a la página principal o a la página de su perfil
    this.navCtrl.back(); // O cualquier otra navegación que prefieras
  }
}