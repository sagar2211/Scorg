import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFaqTemplateComponent } from './add-faq-template.component';

describe('AddFaqTemplateComponent', () => {
  let component: AddFaqTemplateComponent;
  let fixture: ComponentFixture<AddFaqTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFaqTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFaqTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
