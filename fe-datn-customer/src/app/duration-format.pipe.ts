import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  standalone: true 
})
export class DurationFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return 'N/A';
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}
