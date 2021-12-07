import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QmsQueueSettingsComponent } from './qms-queue-settings.component';

describe('QmsQueueSettingsComponent', () => {
  let component: QmsQueueSettingsComponent;
  let fixture: ComponentFixture<QmsQueueSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QmsQueueSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmsQueueSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
