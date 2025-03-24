import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Parse the date string (format: "dd/MM/yyyy HH:mm:ss")
    const parts = value.split(' ');
    if (parts.length !== 2) return value;

    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length !== 3 || timeParts.length !== 3) return value;
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed in JS
    const year = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = parseInt(timeParts[2], 10);
    
    const commentDate = new Date(year, month, day, hour, minute, second);
    const now = new Date();
    
    // Check if valid date
    if (isNaN(commentDate.getTime())) return value;
    
    // Calculate the difference in days
    const diffTime = now.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Format according to requirements
    if (diffDays === 0) {
      if (now.getDate() === commentDate.getDate()) {
        // Today
        return 'Hôm nay';
      } else {
        // Yesterday
        return 'Hôm qua';
      }
    } else if (diffDays < 10) {
      // 1-10 days ago
      return `${diffDays} ngày trước`;
    } else if (diffDays < 35) {
      // 1-5 weeks ago
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else {
      // More than 5 weeks, display the full date
      return `${day}/${month + 1}/${year}`;
    }
  }
}