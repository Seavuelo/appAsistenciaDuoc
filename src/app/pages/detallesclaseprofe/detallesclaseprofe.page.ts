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
  clase: any = {}; // Detalles de la clase
  asistentesDetalles: any[] = []; // Lista de asistentes con detalles
  profesorDetalles: any = {}; // Detalles del profesor

  constructor(
    private route: ActivatedRoute,
    private claseService: ClaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      // Obtén los detalles de la clase
      this.clase = await this.claseService.obtenerClasePorCodigo(codigo);

      // Obtén los detalles de cada asistente si existen
      if (this.clase?.asistentes && this.clase.asistentes.length > 0) {
        for (const uid of this.clase.asistentes) {
          const usuario = await this.authService.getUserInfo(uid);
          if (usuario) {
            this.asistentesDetalles.push(usuario);
          }
        }
      }

      // Obtén los detalles del profesor si el `profesor_id` está disponible
      if (this.clase.profesor_id) {
        this.profesorDetalles = await this.authService.getUserInfo(this.clase.profesor_id);
      }
    }
  }
}
