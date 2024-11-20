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
    this.alumnoId = this.authService.getCurrentUserUid() || ''; 
    this.loadAsignaturas();
  }

  // Cargar las asignaturas disponibles para los alumnos
  async loadAsignaturas() {
    const todasAsignaturas = await this.asignaturaService.obtenerTodasAsignaturas();
    const asignaturasAlumno = await this.asignaturaService.obtenerAsignaturasPorAlumno(this.alumnoId);
    todasAsignaturas.forEach(asignatura => {
      asignatura.isSelected = asignaturasAlumno.some(
        asignaturaInscrita => asignaturaInscrita.asignatura_id === asignatura.asignatura_id
      );
    });

    this.asignaturas = todasAsignaturas;
  }

  // Guardar la selección de asignaturas
  guardarSeleccion() {
    this.asignaturas.forEach(asignatura => {
      const isSelected = asignatura.isSelected;
      this.asignaturaService.actualizarAsignaturaAlumno(asignatura.asignatura_id, this.alumnoId, isSelected);
    });

    // Redirigir al alumno a la página de asignaturas
    this.navCtrl.back(); 
  }
}