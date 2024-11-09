import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { ClaseService } from 'src/app/services/clase.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importa AlertController
import { ChangeDetectorRef } from '@angular/core'; // Importa ChangeDetectorRef

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
    private alertController: AlertController, // Inyecta AlertController
    private cdr: ChangeDetectorRef // Inyecta ChangeDetectorRef para actualizar la vista
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

  async eliminarClase(codigoClase: string, asignaturaId: string) {
    // Mostrar alerta de confirmación
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de que quiere eliminar esta clase?',
      buttons: [
        {
          text: 'No',
          role: 'cancel', // Si elige 'No', no hace nada
        },
        {
          text: 'Sí',
          handler: async () => {
            // Si elige 'Sí', eliminar la clase de la base de datos
            await this.asignaturaService.eliminarClase(codigoClase);
            
            // Eliminar la clase de la lista localmente (sin tener que recargar la página)
            this.clases[asignaturaId] = this.clases[asignaturaId].filter(clase => clase.codigo !== codigoClase);

            // Forzar la actualización de la vista si es necesario
            this.cdr.detectChanges();
          }
        }
      ]
    });

    await alert.present();
  }
}
