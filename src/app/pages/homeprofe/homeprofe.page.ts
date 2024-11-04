import { Component, OnInit } from '@angular/core';
import { Itemlist } from 'src/app/interfaces/itemlist';
import { NavController, PopoverController } from '@ionic/angular';
import { PerfilPopoverPage } from '../perfil-popover/perfil-popover.page'; // Importa el componente

@Component({
  selector: 'app-homeprofe',
  templateUrl: './homeprofe.page.html',
  styleUrls: ['./homeprofe.page.scss'],
})
export class HomeprofePage implements OnInit {
  constructor(private navCtrl: NavController, private popoverController: PopoverController) { }

  ngOnInit() {}

  goBack() {
    this.navCtrl.back(); 
  }

  async openPopover(event: Event) {
    const popover = await this.popoverController.create({
      component: PerfilPopoverPage,
      event: event, // Necesario para posicionar el popover
      translucent: true
    });
    await popover.present();
  }

  vinculos: Itemlist[] = [
    {
      ruta: '/asignaturasprofe',
      titulo: 'Asignaturas',
      icono: 'bulb-outline'
    },
    {
      ruta: '/asistenciaprofe',
      titulo: 'Clases',
      icono: 'folder-open-outline'
    }
  ];
}