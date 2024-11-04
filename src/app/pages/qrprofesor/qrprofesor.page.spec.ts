import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrprofesorPage } from './qrprofesor.page';

describe('QrprofesorPage', () => {
  let component: QrprofesorPage;
  let fixture: ComponentFixture<QrprofesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QrprofesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
