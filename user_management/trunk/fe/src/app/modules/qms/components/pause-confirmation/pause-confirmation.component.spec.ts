import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseConfirmationComponent } from './pause-confirmation.component';

describe('PauseConfirmationComponent', () => {
  let component: PauseConfirmationComponent;
  let fixture: ComponentFixture<PauseConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
