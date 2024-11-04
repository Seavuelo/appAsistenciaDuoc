import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'asistencia',
    loadChildren: () => import('./pages/asistencia/asistencia.module').then( m => m.AsistenciaPageModule)
  },
  
  
  {
    path: 'homeprofe',
    loadChildren: () => import('./pages/homeprofe/homeprofe.module').then( m => m.HomeprofePageModule)
  },
  {
    path: 'asistenciaprofe',
    loadChildren: () => import('./pages/asistenciaprofe/asistenciaprofe.module').then( m => m.AsistenciaprofePageModule)
  },
  {
    path: 'registrar-asistencia',
    loadChildren: () => import('./pages/registrar-asistencia/registrar-asistencia.module').then( m => m.RegistrarAsistenciaPageModule)
  },
  {
    path: 'perfil-popover',
    loadChildren: () => import('./pages/perfil-popover/perfil-popover.module').then( m => m.PerfilPopoverPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  

  {
    path: 'asignaturasprofe',
    loadChildren: () => import('./pages/asignaturasprofe/asignaturasprofe.module').then( m => m.AsignaturasprofePageModule)
  },
  {
    path: 'qrprofesor',
    loadChildren: () => import('./pages/qrprofesor/qrprofesor.module').then( m => m.QrprofesorPageModule)
  },
  {
    path: 'claseprofesor',
    loadChildren: () => import('./pages/claseprofesor/claseprofesor.module').then( m => m.ClaseprofesorPageModule)
  },  {
    path: 'detallesclaseprofe',
    loadChildren: () => import('./pages/detallesclaseprofe/detallesclaseprofe.module').then( m => m.DetallesclaseprofePageModule)
  },


  

  

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
