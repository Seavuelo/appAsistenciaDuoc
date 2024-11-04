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

  async ngOnInit() {
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario();
  }
}
