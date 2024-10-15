import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IForm } from '../interface/supplier.interface';

@Injectable({
  providedIn: 'root',
})
export class FormServiceService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  getForm(entity: string): Observable<IForm> {
    return this.http.get<IForm>(`${this.apiUrl}/${entity}`);
  }
}
