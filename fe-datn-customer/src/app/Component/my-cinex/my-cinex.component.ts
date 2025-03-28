import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-my-cinex',
  standalone: true,
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './my-cinex.component.html',
  styleUrl: './my-cinex.component.css'
})
export class MyCinexComponent {

}
