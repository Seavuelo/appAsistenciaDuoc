import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crearasignaturaprofe',
  templateUrl: './crearasignaturaprofe.page.html',
  styleUrls: ['./crearasignaturaprofe.page.scss'],
})
export class CrearasignaturaprofePage implements OnInit {
  nombre: string = '';
  horario: string = '';
  aula: string = '';
  private backButtonSubscription: any;

  constructor(
    private asignaturaService: AsignaturaService,
    private navCtrl: NavController,
    private Router:Router,
    private Platform:Platform
  ) {}
  ngOnInit() {this.backButtonSubscription = this.Platform.backButton.subscribeWithPriority(10, async () => {
    await this.Router.navigate(['/escogerasignaturasprofe']);
  });
}

ngOnDestroy() {
  if (this.backButtonSubscription) {
    this.backButtonSubscription.unsubscribe();
  }
}


  //Para Crear la Asignatura
  async crearAsignatura() {
    if (this.nombre && this.horario && this.aula) {
      const asignaturaId = this.generarIdAsignatura();
      const nuevaAsignatura = {
        asignatura_id: asignaturaId,
        nombre: this.nombre,
        horario: this.horario,
        aula: this.aula,
        alumnos: [],
        profesor_id: [],
      };

      // Crear el documento en Firestore llamando la funcion de AsignaturaService
      try {
        await this.asignaturaService.crearAsignatura(nuevaAsignatura);
        this.navCtrl.back();  
      } catch (error) {
        console.error('Error al crear la asignatura:', error);
      }
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }

  //Generando el ID unico de la asignatura.
  generarIdAsignatura(): string {
    return (Math.floor(Math.random() * 9000) + 1000).toString();
  }
}