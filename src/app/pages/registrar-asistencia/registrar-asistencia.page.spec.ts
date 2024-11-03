import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarAsistenciaPage } from './registrar-asistencia.page';
import { IonicModule } from '@ionic/angular';

describe('RegistrarAsistenciaPage', () => {
  let component: RegistrarAsistenciaPage;
  let fixture: ComponentFixture<RegistrarAsistenciaPage>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarAsistenciaPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarAsistenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
