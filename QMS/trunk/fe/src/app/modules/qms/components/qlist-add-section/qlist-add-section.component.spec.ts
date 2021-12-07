import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QlistAddSectionComponent } from './qlist-add-section.component';

describe('QlistAddSectionComponent', () => {
  let component: QlistAddSectionComponent;
  let fixture: ComponentFixture<QlistAddSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QlistAddSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QlistAddSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
