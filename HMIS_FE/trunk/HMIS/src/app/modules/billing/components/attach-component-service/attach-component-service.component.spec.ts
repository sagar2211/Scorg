import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachComponentServiceComponent } from './attach-component-service.component';

describe('AttachComponentServiceComponent', () => {
  let component: AttachComponentServiceComponent;
  let fixture: ComponentFixture<AttachComponentServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachComponentServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachComponentServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
