import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EscogerasignaturasPage } from './escogerasignaturas.page';

const routes: Routes = [
  {
    path: '',
    component: EscogerasignaturasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EscogerasignaturasPageRoutingModule {}
