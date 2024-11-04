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
  clase: any = {}; // Inicializamos como un objeto vacío
  asistentesDetalles: any[] = []; // Lista de asistentes con detalles
  profesorDetalles: any; // Detalles del profesor

  constructor(
    private route: ActivatedRoute,
    private claseService: ClaseService,
    private AuthService: AuthService
  ) {}

  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      // Obtén los detalles de la clase
      this.clase = await this.claseService.obtenerClasePorCodigo(codigo);

      // Verificamos si la clase tiene asistentes antes de intentar cargar sus detalles
      if (this.clase.asistentes && this.clase.asistentes.length > 0) {
        // Obtén los detalles de cada asistente
        for (const uid of this.clase.asistentes) {
          const usuario = await this.AuthService.getUserInfo(uid);
          this.asistentesDetalles.push(usuario);
        }
        if (this.clase.profesor_id) {
          this.profesorDetalles = await this.AuthService.getUserInfo(this.clase.profesor_id);
      }
    }
  }
}
}
