import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeUpComponent } from './time-up.component';

describe('TimeUpComponent', () => {
  let component: TimeUpComponent;
  let fixture: ComponentFixture<TimeUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
