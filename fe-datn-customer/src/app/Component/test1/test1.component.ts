import { Component, OnInit } from '@angular/core';
import { Test1Service, Phim } from '../../Service/test1.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.css'],
  standalone: true, 
  imports: [CommonModule] 
})
export class Test1Component implements OnInit {
  danhSachPhim: Phim[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private test1Service: Test1Service) { }

  ngOnInit(): void {
    this.loadDanhSachPhim();
  }

  loadDanhSachPhim(): void {
    this.isLoading = true;
    this.test1Service.getDanhSachPhim().subscribe({
      next: (data) => {
        this.danhSachPhim = data;
        this.isLoading = false;
        console.log('Đã tải dữ liệu phim:', this.danhSachPhim);
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu phim. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Lỗi khi tải dữ liệu phim:', err);
      }
    });
  }
}
