import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsignaturasprofePageRoutingModule } from './asignaturasprofe-routing.module';

import { AsignaturasprofePage } from './asignaturasprofe.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignaturasprofePageRoutingModule,
    ComponentsModule
],
  declarations: [AsignaturasprofePage]
})
export class AsignaturasprofePageModule {}
