import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitMasterListComponent } from './kit-master-list.component';

describe('KitMasterListComponent', () => {
  let component: KitMasterListComponent;
  let fixture: ComponentFixture<KitMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KitMasterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KitMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
