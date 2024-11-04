import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesclaseprofePageRoutingModule } from './detallesclaseprofe-routing.module';

import { DetallesclaseprofePage } from './detallesclaseprofe.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesclaseprofePageRoutingModule,
    ComponentsModule
],
  declarations: [DetallesclaseprofePage]
})
export class DetallesclaseprofePageModule {}
