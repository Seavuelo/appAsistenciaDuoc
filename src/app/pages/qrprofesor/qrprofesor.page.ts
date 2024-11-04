import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc, collection, getDocs } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import  QRCode  from 'qrcode';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qrprofesor',
  templateUrl: './qrprofesor.page.html',
  styleUrls: ['./qrprofesor.page.scss'],
})
export class QrprofesorPage implements OnInit {
  asignaturaId!: string;
  profesorId!: string;
  codigoQR!: string;
  qrCodeDataUrl!: string;

  constructor(private route: ActivatedRoute, private firestore: Firestore, private authService: AuthService, private navCtrl: NavController,private alertController: AlertController, private router: Router) {}

  ngOnInit() {
    this.asignaturaId = this.route.snapshot.paramMap.get('asignatura_id') || '';
    this.profesorId = this.authService.getCurrentUserUid() || ''; // Obtén el UID del profesor
    this.generarCodigoQR();
  }
  async presentAlertGoBack() {
    const alert = await this.alertController.create({
      header: '¿Está seguro?',
      message: 'Al momento de salir, el QR se eliminará para siempre y los alumnos no podrán confirmar su asistencia.',
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
            this.goBack();
          },
        },
      ],
    });

    await alert.present();
  }

  goBack() {
    this.navCtrl.back(); // Cambia esto a la ruta a la que quieras regresar
  }


  async generarCodigoQR() {
    const codigoUnico = this.generarCodigoAleatorio();
    const fechaHora = new Date();

    // Buscar el documento de la asignatura que contiene el asignatura_id
    const asignaturasRef = collection(this.firestore, 'asignatura');
    const querySnapshot = await getDocs(asignaturasRef);
    let asignaturaNombre = '';

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data['asignatura_id'] === this.asignaturaId) {
        asignaturaNombre = data['nombre']; // Cambia 'nombre' por el campo que tengas para el nombre de la asignatura
      }
    });

    if (!asignaturaNombre) {
      console.error('No se encontró el documento de la asignatura con ID:', this.asignaturaId);
      return; // Detener si no se encuentra la asignatura
    }

    const claseRef = doc(this.firestore, `clase/${codigoUnico}`);

    await setDoc(claseRef, {
      asignatura: asignaturaNombre,
      asignatura_id: this.asignaturaId,
      asistentes: [],
      'fecha-hora': fechaHora,
      profesor_id: this.profesorId,
      codigo: codigoUnico
    });

    this.codigoQR = codigoUnico; // Guarda el código para mostrar en el QR
    this.generarQRCode(this.codigoQR);
  }

  generarCodigoAleatorio(): string {
    const codigo = Math.floor(10000 + Math.random() * 90000).toString();
    return codigo;
  }

  async generarQRCode(data: string) {
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(data);
    } catch (err) {
      console.error(err);
    }
    
  }
}
