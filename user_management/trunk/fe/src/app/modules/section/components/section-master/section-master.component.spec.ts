import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionMasterComponent } from './section-master.component';

describe('SectionMasterComponent', () => {
  let component: SectionMasterComponent;
  let fixture: ComponentFixture<SectionMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
