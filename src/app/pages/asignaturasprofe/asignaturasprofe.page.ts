import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';

@Component({
  selector: 'app-asignaturasprofe',
  templateUrl: './asignaturasprofe.page.html',
  styleUrls: ['./asignaturasprofe.page.scss'],
})
export class AsignaturasprofePage implements OnInit {
  asignaturas: any[] = [];

  constructor(private asignaturaService: AsignaturaService) {}

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.cargarAsignaturas();

    
  }

  async cargarAsignaturas() {
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario();
  }
}
