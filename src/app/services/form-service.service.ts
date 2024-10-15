import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IForm } from '../interface/supplier.interface';

@Injectable({
  providedIn: 'root'
})
export class FormServiceService {

  private apiUrl = 'http://localhost:3000'; 
  constructor(private http: HttpClient) {}

  getSupplierForm(): Observable<IForm> {
    return this.http.get<IForm>(`${this.apiUrl}/supplier` );
  }

  getProductForm(): Observable<IForm> {
    return this.http.get<IForm>(`${this.apiUrl}/product` );
  }
}
