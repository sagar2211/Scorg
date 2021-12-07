import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalMappingListComponent } from './vital-mapping-list.component';

describe('VitalMappingListComponent', () => {
  let component: VitalMappingListComponent;
  let fixture: ComponentFixture<VitalMappingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VitalMappingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalMappingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
