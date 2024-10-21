import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSublevelMenuComponent } from './app-sublevel-menu.component';

describe('AppSublevelMenuComponent', () => {
  let component: AppSublevelMenuComponent;
  let fixture: ComponentFixture<AppSublevelMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSublevelMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppSublevelMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
