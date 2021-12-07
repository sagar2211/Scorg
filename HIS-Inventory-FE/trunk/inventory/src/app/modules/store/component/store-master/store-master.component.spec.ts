import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreMasterComponent } from './store-master.component';

describe('StoreMasterComponent', () => {
  let component: StoreMasterComponent;
  let fixture: ComponentFixture<StoreMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
