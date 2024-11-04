import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrprofesorPageRoutingModule } from './qrprofesor-routing.module';

import { QrprofesorPage } from './qrprofesor.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrprofesorPageRoutingModule,
    ComponentsModule
],
  declarations: [QrprofesorPage]
})
export class QrprofesorPageModule {}
