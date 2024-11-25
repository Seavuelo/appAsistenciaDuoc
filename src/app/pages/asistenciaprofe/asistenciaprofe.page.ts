import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { ClaseService } from 'src/app/services/clase.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; 
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-asistenciaprofe',
  templateUrl: './asistenciaprofe.page.html',
  styleUrls: ['./asistenciaprofe.page.scss'],
})
export class AsistenciaprofePage implements OnInit {
  asignaturas: any[] = [];
  clases: { [key: string]: any[] } = {}; 

  constructor(
    private asignaturaService: AsignaturaService,
    private claseService: ClaseService,
    private router: Router,
    private alertController: AlertController, 
    private cdr: ChangeDetectorRef 
  ) {}

  async ngOnInit() {
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario();
    for (const asignatura of this.asignaturas) {
      const clases = await this.claseService.obtenerClasesPorAsignatura(asignatura.asignatura_id);
      clases.sort((a, b) => a['fecha-hora'].toDate() - b['fecha-hora'].toDate());
      this.clases[asignatura.asignatura_id] = clases;
    }
  }
  verDetallesClase(codigo: string) {
    this.router.navigate(['/detallesclaseprofe', codigo]);
  }

  async eliminarClase(codigoClase: string, asignaturaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de que quiere eliminar esta clase?',
      buttons: [
        {
          text: 'No',
          role: 'cancel', 
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.asignaturaService.eliminarClase(codigoClase);
            this.clases[asignaturaId] = this.clases[asignaturaId].filter(clase => clase.codigo !== codigoClase);
            this.cdr.detectChanges();
          }
        }
      ]
    });
    await alert.present();
  }
}
