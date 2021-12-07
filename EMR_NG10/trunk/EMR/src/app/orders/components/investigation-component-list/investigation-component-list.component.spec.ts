import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationComponentListComponent } from './investigation-component-list.component';

describe('InvestigationComponentListComponent', () => {
  let component: InvestigationComponentListComponent;
  let fixture: ComponentFixture<InvestigationComponentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestigationComponentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestigationComponentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
