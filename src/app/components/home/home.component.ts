import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { MatIconModule } from '@angular/material/icon';
import { supplierFormConfig } from '../../screens/supplierForm';
import { IForm } from '../../interface/supplier.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  supplierForm = supplierFormConfig as IForm;

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar) { }

  openFornecedorModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      data: { supplierDataForm: this.supplierForm }
    });

    dialogRef.afterClosed().subscribe((result: any) => {

    });
  }

}
