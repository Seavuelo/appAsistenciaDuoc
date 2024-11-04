import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaseprofesorPage } from './claseprofesor.page';

describe('ClaseprofesorPage', () => {
  let component: ClaseprofesorPage;
  let fixture: ComponentFixture<ClaseprofesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaseprofesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
