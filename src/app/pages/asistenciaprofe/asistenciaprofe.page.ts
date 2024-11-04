import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { ClaseService } from 'src/app/services/clase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asistenciaprofe',
  templateUrl: './asistenciaprofe.page.html',
  styleUrls: ['./asistenciaprofe.page.scss'],
})
export class AsistenciaprofePage implements OnInit {
  asignaturas: any[] = [];
  clases: { [key: string]: any[] } = {}; // Objeto para almacenar clases por asignatura_id

  constructor(
    private asignaturaService: AsignaturaService,
    private claseService: ClaseService,
    private router: Router,
  ) {}

  async ngOnInit() {
    // Cargar las asignaturas a cargo del profesor
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario();

    // Cargar las clases por cada asignatura_id
    for (const asignatura of this.asignaturas) {
      const clases = await this.claseService.obtenerClasesPorAsignatura(asignatura.asignatura_id);
      this.clases[asignatura.asignatura_id] = clases;
    }
  }
  verDetallesClase(codigo: string) {
    this.router.navigate(['/detallesclaseprofe', codigo]);
  }
}
