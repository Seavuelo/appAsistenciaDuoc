import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallesclaseprofePage } from './detallesclaseprofe.page';

const routes: Routes = [
  {
    path: ':codigo',
    component: DetallesclaseprofePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallesclaseprofePageRoutingModule {}
