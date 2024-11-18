import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EscogerasignaturasprofePage } from './escogerasignaturasprofe.page';

const routes: Routes = [
  {
    path: '',
    component: EscogerasignaturasprofePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EscogerasignaturasprofePageRoutingModule {}
