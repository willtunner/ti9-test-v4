import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { MatIconModule } from '@angular/material/icon';
import { IForm, IFormControl } from '../../interface/supplier.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CrudServiceService } from '../../services/crud-service.service';
import { FormServiceService } from '../../services/form-service.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
    MatTableModule,
    CommonModule,
    DynamicTableComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
 
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private crudService: CrudServiceService,
  ) {

  }

  ngOnInit(): void {
    this.crudService.setEntityType('supplier');
  }


}
