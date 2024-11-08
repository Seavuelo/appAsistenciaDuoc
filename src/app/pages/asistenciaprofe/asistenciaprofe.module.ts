import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsistenciaprofePageRoutingModule } from './asistenciaprofe-routing.module';

import { AsistenciaprofePage } from './asistenciaprofe.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsistenciaprofePageRoutingModule,
    ComponentsModule
],
  declarations: [AsistenciaprofePage]
})
export class AsistenciaprofePageModule {}
