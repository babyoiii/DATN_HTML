import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedMoreTimeComponent } from './need-more-time.component';

describe('NeedMoreTimeComponent', () => {
  let component: NeedMoreTimeComponent;
  let fixture: ComponentFixture<NeedMoreTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeedMoreTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeedMoreTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
