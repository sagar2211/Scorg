import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationTemplateHomeComponent } from './communication-template-home.component';

describe('CommunicationTemplateHomeComponent', () => {
  let component: CommunicationTemplateHomeComponent;
  let fixture: ComponentFixture<CommunicationTemplateHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationTemplateHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationTemplateHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
