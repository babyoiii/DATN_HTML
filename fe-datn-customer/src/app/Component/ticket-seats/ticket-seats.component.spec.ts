import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSeatsComponent } from './ticket-seats.component';

describe('TicketSeatsComponent', () => {
  let component: TicketSeatsComponent;
  let fixture: ComponentFixture<TicketSeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSeatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
