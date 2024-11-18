import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearasignaturaprofePageRoutingModule } from './crearasignaturaprofe-routing.module';

import { CrearasignaturaprofePage } from './crearasignaturaprofe.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearasignaturaprofePageRoutingModule,
    ComponentsModule
],
  declarations: [CrearasignaturaprofePage]
})
export class CrearasignaturaprofePageModule {}
