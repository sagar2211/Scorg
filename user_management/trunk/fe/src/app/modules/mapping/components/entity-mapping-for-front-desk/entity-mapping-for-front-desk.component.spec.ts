import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityMappingForFrontDeskComponent } from './entity-mapping-for-front-desk.component';

describe('EntityMappingForFrontDeskComponent', () => {
  let component: EntityMappingForFrontDeskComponent;
  let fixture: ComponentFixture<EntityMappingForFrontDeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityMappingForFrontDeskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityMappingForFrontDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
