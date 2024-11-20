import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AsignaturaService } from 'src/app/services/asignatura.service';

@Component({
  selector: 'app-crearasignaturaprofe',
  templateUrl: './crearasignaturaprofe.page.html',
  styleUrls: ['./crearasignaturaprofe.page.scss'],
})
export class CrearasignaturaprofePage implements OnInit {
  nombre: string = '';
  horario: string = '';
  aula: string = '';

  constructor(
    private asignaturaService: AsignaturaService,
    private navCtrl: NavController
  ) {}
  ngOnInit() {}


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