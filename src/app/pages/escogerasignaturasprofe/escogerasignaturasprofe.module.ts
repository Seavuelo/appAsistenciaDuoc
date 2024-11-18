import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EscogerasignaturasprofePageRoutingModule } from './escogerasignaturasprofe-routing.module';

import { EscogerasignaturasprofePage } from './escogerasignaturasprofe.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EscogerasignaturasprofePageRoutingModule,
    ComponentsModule
],
  declarations: [EscogerasignaturasprofePage]
})
export class EscogerasignaturasprofePageModule {}
