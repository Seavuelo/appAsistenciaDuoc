import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignaturasprofePage } from './asignaturasprofe.page';

describe('AsignaturasprofePage', () => {
  let component: AsignaturasprofePage;
  let fixture: ComponentFixture<AsignaturasprofePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignaturasprofePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
