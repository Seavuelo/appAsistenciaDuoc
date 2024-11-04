import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsignaturasprofePage } from './asignaturasprofe.page';

const routes: Routes = [
  {
    path: '',
    component: AsignaturasprofePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsignaturasprofePageRoutingModule {}
