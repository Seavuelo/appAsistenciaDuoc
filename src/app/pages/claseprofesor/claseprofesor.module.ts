import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaseprofesorPageRoutingModule } from './claseprofesor-routing.module';

import { ClaseprofesorPage } from './claseprofesor.page';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClaseprofesorPageRoutingModule,
    ComponentsModule
],
  declarations: [ClaseprofesorPage]
})
export class ClaseprofesorPageModule {}
