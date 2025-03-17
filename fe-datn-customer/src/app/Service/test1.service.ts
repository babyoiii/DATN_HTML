import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// interface
export interface ThoiGianChieu {
  Gio: string;
  IDThoiGianChieu: string;
}

export interface Phim {
  IDPhim: string;
  TenPhim: string;
  LinkAnhPhim: string;
  ThoiLuongPhim: string;
  ThoiGianChieu: ThoiGianChieu[];
}

@Injectable({
  providedIn: 'root'
})
export class Test1Service {
  // Dữ liệu 
  private danhSachPhim: Phim[] = [
    {
      IDPhim: 'novocaine-76346',
      TenPhim: 'Novocaine',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1734015008/amc-cdn/production/2/movies/76300/76346/PosterDynamic/168440.jpg',
      ThoiLuongPhim: '1 HR 50 MIN',
      ThoiGianChieu: [
        { Gio: '5:00pm', IDThoiGianChieu: '130134777' },
        { Gio: '9:00pm', IDThoiGianChieu: '130134758' }
      ]
    },
    {
      IDPhim: 'mickey-17-72112',
      TenPhim: 'Mickey 17',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1737562704/amc-cdn/production/2/movies/72100/72112/PosterDynamic/169243.jpg',
      ThoiLuongPhim: '2 HR 17 MIN',
      ThoiGianChieu: [
        { Gio: '4:25pm', IDThoiGianChieu: '129810475' },
        { Gio: '9:30pm', IDThoiGianChieu: '130625207' },
        { Gio: '10:30pm', IDThoiGianChieu: '129810486' }
      ]
    },
    {
      IDPhim: 'captain-america-brave-new-world-67472',
      TenPhim: 'Captain America: Brave New World',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1734114336/amc-cdn/production/2/movies/67500/67472/PosterDynamic/168453.jpg',
      ThoiLuongPhim: '1 HR 58 MIN',
      ThoiGianChieu: [
        { Gio: '3:45pm', IDThoiGianChieu: '130625184' },
        { Gio: '10:15pm', IDThoiGianChieu: '130625251' }
      ]
    },
    {
      IDPhim: 'opus-79092',
      TenPhim: 'Opus',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1739461580/amc-cdn/production/2/movies/79100/79092/PosterDynamic/169735.jpg',
      ThoiLuongPhim: '1 HR 43 MIN',
      ThoiGianChieu: [
        { Gio: '4:45pm', IDThoiGianChieu: '129963715' },
        { Gio: '6:30pm', IDThoiGianChieu: '130729461' },
        { Gio: '10:00pm', IDThoiGianChieu: '129963717' }
      ]
    },
    {
      IDPhim: 'paddington-in-peru-75158',
      TenPhim: 'Paddington in Peru',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1733512440/amc-cdn/production/2/movies/75200/75158/PosterDynamic/168362.jpg',
      ThoiLuongPhim: '1 HR 46 MIN',
      ThoiGianChieu: [
        { Gio: '4:00pm', IDThoiGianChieu: '130625189' }
      ]
    },
    {
      IDPhim: 'the-monkey-77403',
      TenPhim: 'The Monkey',
      LinkAnhPhim: 'https://amc-theatres-res.cloudinary.com/image/upload/c_thumb,w_90,h_90,g_face/r_max/f_auto/q_auto/v1738358168/amc-cdn/production/2/movies/77400/77403/PosterDynamic/169494.jpg',
      ThoiLuongPhim: '1 HR 38 MIN',
      ThoiGianChieu: [
        { Gio: '4:00pm', IDThoiGianChieu: '130625206' },
        { Gio: '10:15pm', IDThoiGianChieu: '130625191' }
      ]
    }
  ];

  constructor() { }

  //  lấy danh sách phim
  getDanhSachPhim(): Observable<Phim[]> {
    return of(this.danhSachPhim);
  }

  //  lấy phim theo ID
  getPhimById(id: string): Observable<Phim | undefined> {
    const phim = this.danhSachPhim.find(p => p.IDPhim === id);
    return of(phim);
  }

  // Thêm phim mới
  themPhim(phim: Phim): Observable<Phim> {
    this.danhSachPhim.push(phim);
    return of(phim);
  }
}
