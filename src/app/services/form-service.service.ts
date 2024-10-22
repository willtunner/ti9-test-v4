import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IForm } from '../interface/dynamic-form.interface';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enum/notificationType.enum';

@Injectable({
  providedIn: 'root',
})
export class FormServiceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private notificationService: SendNotificationService) {}

  getForm(entity: string): Observable<IForm> {
    return this.http.get<IForm>(`${this.apiUrl}/${entity}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        this.notificationService.customNotification(NotificationType.ERROR, `Verifique a conexão com o servidor: ${error.message}`);
        return throwError(() => new Error('Falha ao carregar dados do formulário'));
      })
    );
  }

  getSideNavBar(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/navbarData`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        this.notificationService.customNotification(NotificationType.ERROR, `Verifique a conexão com o servidor: ${error.message}`);
        return throwError(() => new Error('Falha ao carregar dados da barra lateral.'));
      })
    );
  }
}
