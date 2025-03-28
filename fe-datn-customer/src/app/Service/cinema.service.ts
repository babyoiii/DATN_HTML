import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CinemaRes {
    cinemasId: string;
    name: string;
    address: string;
    phoneNumber: string;
    totalRooms: number;
    status: number;
    createdDate: Date;
}

export interface CommonPagination<T> {
    data: T;
    message: string;
    responseCode: number;
    totalRecord: number;
}

@Injectable({
    providedIn: 'root'
})
export class CinemaService {
    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getListCinemas(currentPage: number = 1, recordPerPage: number = 100): Observable<CommonPagination<CinemaRes[]>> {
        return this.http.get<CommonPagination<CinemaRes[]>>(
            `${this.apiUrl}/Cinemas/GetListCinemas?currentPage=${currentPage}&recordPerPage=${recordPerPage}`
        );
    }

    getCinemaById(id: string): Observable<CommonPagination<CinemaRes>> {
        return this.http.get<CommonPagination<CinemaRes>>(
            `${this.apiUrl}/Cinemas/GetCinemaById?IdCinemasReq=${id}`
        );
    }
}