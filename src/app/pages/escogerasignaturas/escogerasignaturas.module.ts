import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EscogerasignaturasPageRoutingModule } from './escogerasignaturas-routing.module';

import { EscogerasignaturasPage } from './escogerasignaturas.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EscogerasignaturasPageRoutingModule,
    ComponentsModule
],
  declarations: [EscogerasignaturasPage]
})
export class EscogerasignaturasPageModule {}
