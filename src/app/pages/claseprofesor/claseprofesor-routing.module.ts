import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaseprofesorPage } from './claseprofesor.page';

const routes: Routes = [
  {
    path: ':asignatura_id',
    component: ClaseprofesorPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaseprofesorPageRoutingModule {}
