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
    // Cargar las asignaturas a cargo del profesor
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario();
    // Cargar las clases por cada asignatura_id
    for (const asignatura of this.asignaturas) {
      const clases = await this.claseService.obtenerClasesPorAsignatura(asignatura.asignatura_id);
      // Ordenar las clases de menor a mayor según 'fecha-hora'
      clases.sort((a, b) => a['fecha-hora'].toDate() - b['fecha-hora'].toDate());
      this.clases[asignatura.asignatura_id] = clases;
    }
  }
  //Te lleva a la pagina de detalles de la clase
  verDetallesClase(codigo: string) {
    this.router.navigate(['/detallesclaseprofe', codigo]);
  }

  //Aqui se eliminan las clases
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
