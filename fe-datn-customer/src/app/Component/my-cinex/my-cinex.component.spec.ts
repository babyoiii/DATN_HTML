import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCinexComponent } from './my-cinex.component';

describe('MyCinexComponent', () => {
  let component: MyCinexComponent;
  let fixture: ComponentFixture<MyCinexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCinexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCinexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
