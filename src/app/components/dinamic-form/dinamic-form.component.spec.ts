import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicFormComponent } from './dinamic-form.component';

describe('DinamicFormComponent', () => {
  let component: DinamicFormComponent;
  let fixture: ComponentFixture<DinamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DinamicFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DinamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
