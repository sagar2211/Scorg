import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrWelcomeComponent } from './emr-welcome.component';

describe('EmrWelcomeComponent', () => {
  let component: EmrWelcomeComponent;
  let fixture: ComponentFixture<EmrWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrWelcomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
