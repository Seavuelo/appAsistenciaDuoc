import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AuthService } from 'src/app/services/auth.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-escogerasignaturasprofe',
  templateUrl: './escogerasignaturasprofe.page.html',
  styleUrls: ['./escogerasignaturasprofe.page.scss'],
})
export class EscogerasignaturasprofePage implements OnInit {
  asignaturas: any[] = [];
  profesorId: string = '';

  constructor(
    private AsignaturaService: AsignaturaService,
    private authService: AuthService,
    private navCtrl: NavController,
    private AlertController:AlertController,
  ) { }

  ngOnInit() {
    this.profesorId = this.authService.getCurrentUserUid() || ''; 
  }

  async ionViewWillEnter() {
    this.loadAsignaturas();

    
  }

  // Función para cargar todas las asignaturas
  async loadAsignaturas() {
    const todasAsignaturas = await this.AsignaturaService.obtenerTodasAsignaturas();
    const asignaturasProfesor = await this.AsignaturaService.obtenerAsignaturasPorProfesor();
    todasAsignaturas.forEach(asignatura => {
      asignatura.isSelected = asignaturasProfesor.some(
        profAsignatura => profAsignatura.id === asignatura.id
      );
    });

    this.asignaturas = todasAsignaturas;
  }

  // Función para guardar los cambios de selección
  guardarCambios() {
    this.asignaturas.forEach(asignatura => {
      const isSelected = asignatura.isSelected;
      this.AsignaturaService.updateAsignaturaProfesor(asignatura.id, this.profesorId, isSelected);
    });

    // Redirigir al profesor a la página de asignaturas
    this.navCtrl.back();
  }

  // Función para confirmar la eliminación de una asignatura
  async confirmarEliminacion(asignaturaId: string) {
    const alert = await this.AlertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar esta asignatura? Al hacer esto, los alumnos tendrán que inscribirse de nuevo y las clases serán eliminadas.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Sí, eliminar',
          handler: () => {
            this.eliminarAsignatura(asignaturaId);
          }
        }
      ]
    });

    await alert.present();
  }

  // Función para eliminar la asignatura y las clases asociadas
  async eliminarAsignatura(asignaturaId: string) {
    try {
      await this.AsignaturaService.eliminarAsignatura(asignaturaId);
      await this.AsignaturaService.eliminarClasesPorAsignaturaId(asignaturaId);
      this.loadAsignaturas();
      console.log('Asignatura y clases eliminadas con éxito');
    } catch (error) {
      console.error('Error al eliminar la asignatura y clases:', error);
    }
  }
}
