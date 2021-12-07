import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontDeskEntityMappingMasterListComponent } from './front-desk-entity-mapping-master-list.component';

describe('FrontDeskEntityMappingMasterListComponent', () => {
  let component: FrontDeskEntityMappingMasterListComponent;
  let fixture: ComponentFixture<FrontDeskEntityMappingMasterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrontDeskEntityMappingMasterListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontDeskEntityMappingMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
