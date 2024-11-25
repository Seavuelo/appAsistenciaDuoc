import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  asignaturas: any[] = []; 
  private backButtonSubscription: any;


  constructor(private Platform:Platform, private Router:Router, private asignaturaService: AsignaturaService, private authService: AuthService) {}

  ngOnInit() {
    this.backButtonSubscription = this.Platform.backButton.subscribeWithPriority(10, async () => {
      await this.Router.navigate(['/inicio']);
    });
  }

  ngOnDestroy() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
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
