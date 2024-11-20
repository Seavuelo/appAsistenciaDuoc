import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaseService } from 'src/app/services/clase.service';

@Component({
  selector: 'app-detallesclaseprofe',
  templateUrl: './detallesclaseprofe.page.html',
  styleUrls: ['./detallesclaseprofe.page.scss'],
})
export class DetallesclaseprofePage implements OnInit {
  clase: any = {}; 
  asistentesDetalles: any[] = []; 
  profesorDetalles: any = {}; 

  constructor(
    private route: ActivatedRoute,
    private claseService: ClaseService,
    private authService: AuthService
  ) {}

  //Obteniendo los detalles de la clase segun su codigo unico
  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.clase = await this.claseService.obtenerClasePorCodigo(codigo);
      if (this.clase?.asistentes && this.clase.asistentes.length > 0) {
        for (const uid of this.clase.asistentes) {
          const usuario = await this.authService.getUserInfo(uid);
          if (usuario) {
            this.asistentesDetalles.push(usuario);
          }
        }
      }
      if (this.clase.profesor_id) {
        this.profesorDetalles = await this.authService.getUserInfo(this.clase.profesor_id);
      }
    }
  }
}
