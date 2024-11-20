import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc, collection, getDocs } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import  QRCode  from 'qrcode';
import { NavController, Platform } from '@ionic/angular';
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
  private backButtonSubscription: any;

  constructor(private route: ActivatedRoute, private firestore: Firestore, private authService: AuthService, private navCtrl: NavController,private alertController: AlertController, private router: Router, private Platform:Platform) {}

  ngOnInit() {
    this.asignaturaId = this.route.snapshot.paramMap.get('asignatura_id') || '';
    this.profesorId = this.authService.getCurrentUserUid() || ''; 
    this.generarCodigoQR();
    this.backButtonSubscription = this.Platform.backButton.subscribeWithPriority(10, async () => {
      await this.presentAlertGoBack();
    });
  }

  ngOnDestroy() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  //La alerta cuando el profesor intenta salir, ya sea con la flecha de retroceso o con el boton de retroceso de Android.
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
    this.navCtrl.back(); 
  }

  async generarCodigoQR() {
    const codigoUnico = this.generarCodigoAleatorio();
    const fechaHora = new Date();
    const asignaturasRef = collection(this.firestore, 'asignatura');
    const querySnapshot = await getDocs(asignaturasRef);
    let asignaturaNombre = '';
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data['asignatura_id'] === this.asignaturaId) {
        asignaturaNombre = data['nombre']; 
      }
    });
    if (!asignaturaNombre) {
      console.error('No se encontró el documento de la asignatura con ID:', this.asignaturaId);
      return; 
    }
    const claseRef = doc(this.firestore, `clase/${codigoUnico}`);


    //Crea en la base de datos una clase con todos los datos del QR
    await setDoc(claseRef, {
      asignatura: asignaturaNombre,
      asignatura_id: this.asignaturaId,
      asistentes: [],
      'fecha-hora': fechaHora,
      profesor_id: this.profesorId,
      codigo: codigoUnico
    });
    this.codigoQR = codigoUnico; 
    this.generarQRCode(this.codigoQR);
  }


  //Generar codigo unico del QR para guardarlo como Clase
  generarCodigoAleatorio(): string {
    const codigo = Math.floor(10000 + Math.random() * 90000).toString();
    return codigo;
  }


  //Genera la imagen QR
  async generarQRCode(data: string) {
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(data);
    } catch (err) {
      console.error(err);
    }
    
  }
}
