import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimkiemrapComponent } from './timkiemrap.component';

describe('TimkiemrapComponent', () => {
  let component: TimkiemrapComponent;
  let fixture: ComponentFixture<TimkiemrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimkiemrapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimkiemrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
