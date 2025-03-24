import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDetailNghiaComponent } from './movie-detail-nghia.component';

describe('MovieDetailNghiaComponent', () => {
  let component: MovieDetailNghiaComponent;
  let fixture: ComponentFixture<MovieDetailNghiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailNghiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieDetailNghiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
