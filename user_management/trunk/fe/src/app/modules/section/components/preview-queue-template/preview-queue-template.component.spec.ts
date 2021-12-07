import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewQueueTemplateComponent } from './preview-queue-template.component';

describe('PreviewTemplateComponent', () => {
  let component: PreviewQueueTemplateComponent;
  let fixture: ComponentFixture<PreviewQueueTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewQueueTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewQueueTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
