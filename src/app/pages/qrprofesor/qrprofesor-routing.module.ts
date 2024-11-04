import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrprofesorPage } from './qrprofesor.page';

const routes: Routes = [
  {
    path: ':asignatura_id', // Esta línea es clave
    component: QrprofesorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrprofesorPageRoutingModule {}