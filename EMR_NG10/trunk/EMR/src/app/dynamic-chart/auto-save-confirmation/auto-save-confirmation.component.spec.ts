import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSaveConfirmationComponent } from './auto-save-confirmation.component';

describe('AutoSaveConfirmationComponent', () => {
  let component: AutoSaveConfirmationComponent;
  let fixture: ComponentFixture<AutoSaveConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoSaveConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoSaveConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
