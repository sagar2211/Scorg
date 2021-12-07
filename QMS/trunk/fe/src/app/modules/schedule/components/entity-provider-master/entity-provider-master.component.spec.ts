import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityProviderMasterComponent } from './entity-provider-master.component';

describe('EntityProviderMasterComponent', () => {
  let component: EntityProviderMasterComponent;
  let fixture: ComponentFixture<EntityProviderMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityProviderMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityProviderMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
