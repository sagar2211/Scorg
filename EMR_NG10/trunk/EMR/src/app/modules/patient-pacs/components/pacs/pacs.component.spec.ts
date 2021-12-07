import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacsComponent } from './pacs.component';

describe('PacsComponent', () => {
  let component: PacsComponent;
  let fixture: ComponentFixture<PacsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
