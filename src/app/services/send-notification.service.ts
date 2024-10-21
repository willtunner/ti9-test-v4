import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationType } from '../enum/notificationType.enum';

@Injectable({
  providedIn: 'root'
})
export class SendNotificationService {

  constructor(private snackBar: MatSnackBar) {}

  showNotification(type: NotificationType, duration: number = 3000): void {
    let panelClass = '';
    switch (type) {
      case NotificationType.SUCCESS:
        panelClass = 'success-snackbar';
        break;
      case NotificationType.UPDATE:
        panelClass = 'info-snackbar';
        break;
      case NotificationType.ERROR:
        panelClass = 'success-snackbar';
        break;
      default:
        panelClass = 'default-snackbar';
        break;
    }

    this.snackBar.open(type, 'Fechar', {
      duration,
      panelClass: ['custom-snackbar', panelClass],
    });
  }
}
