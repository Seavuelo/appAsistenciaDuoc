import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from 'src/app/services/asignatura.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claseprofesor',
  templateUrl: './claseprofesor.page.html',
  styleUrls: ['./claseprofesor.page.scss'],
})
export class ClaseprofesorPage implements OnInit {
  asignaturaId: string = '';
  asignatura: any;
  alumnos: any[] = []; 
  profesores: any[] = []; 
  showAlumnos: boolean = false; 
  showProfesores: boolean = false; 

  constructor(private route: ActivatedRoute, private asignaturaService: AsignaturaService, private alertController: AlertController , private router: Router) {}

  ngOnInit() {
    const asignaturaIdParam = this.route.snapshot.paramMap.get('asignatura_id');
    if (asignaturaIdParam) {
      this.asignaturaId = asignaturaIdParam; 
      this.cargarAsignatura();
    } else {
      console.error('El asignatura_id no está presente en la ruta');
    }
  }
  //Cargando las asignaturas
  async cargarAsignatura() {
  this.asignatura = await this.asignaturaService.obtenerAsignaturaPorId(this.asignaturaId);


  // Cargar los nombres de los alumnos y profesores
  this.alumnos = await this.asignaturaService.obtenerAlumnosPorUids(this.asignatura.alumnos);
  this.profesores = await this.asignaturaService.obtenerProfesoresPorUids(this.asignatura.profesor_id);
  
//Alerta para crear el QR 
}
async presentAlert() {
  const alert = await this.alertController.create({
    header: '¿Está seguro?',
    message: 'Al empezar la asistencia, se está creando una nueva clase para la base de datos.',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Cancelado');
        },
      },
      {
        text: 'Sí',
        handler: () => {
          this.router.navigate(['/qrprofesor', this.asignatura.asignatura_id]);
        },
      },
    ],
  });

  await alert.present();
}
  toggleAlumnos() {
    this.showAlumnos = !this.showAlumnos;
  }

  toggleProfesores() {
    this.showProfesores = !this.showProfesores;
  }}