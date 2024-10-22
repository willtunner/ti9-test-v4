import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IForm, IFormControl } from '../../interface/dynamic-form.interface';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { CrudServiceService } from '../../services/crud-service.service';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { SendNotificationService } from '../../services/send-notification.service';
import { NotificationType } from '../../enum/notificationType.enum';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.css'
})
export class DynamicTableComponent {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  dynamicForm!: IForm;

  constructor(
    public dialog: MatDialog,
    private crudService: CrudServiceService,
    private notificationService: SendNotificationService
  ) {}

  ngOnInit(): void {
    this.loadSupplierForm();
  }

  loadSupplierForm(): void {
    this.crudService.fetchForm().subscribe((data: IForm) => {
      this.dynamicForm = data;
      this.displayedColumns = this.createDisplayedColumns(data.formControls);
      this.getData();
    });
  }

  createDisplayedColumns(formControls: IFormControl[]): string[] {
    const columnNames = formControls.map(control => control.label);
    return columnNames;
  }

  getData() {
    const items = this.crudService.getItems()();

    if (items && items.length > 0) {
      const transformedItems = items.map((item: any) => {
        const rowData: any = {};


        if (this.dynamicForm?.formControls) {
        this.dynamicForm.formControls.forEach(control => {
          if (control.name === 'active' || control.name === 'acceptPix') {
            rowData[control.label] = item[control.name] ? 'sim' : 'não';
          } else {
            rowData[control.label] = item[control.name];
          }
        });

        rowData['originalData'] = item;

        return rowData;
      }});

      this.dataSource.data = transformedItems;
    } else {
      this.dataSource.data = items;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  createDataModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.dynamicForm, data: false }
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.addItem(result);
        this.getData();
        this.notificationService.customNotification(NotificationType.SUCCESS, 'Operação realizada com sucesso!');
        this.getData();
      }
    });
  }

  editDataModal(index: number): void {
    const supplierRow = this.dataSource.data[index];
    const originalSupplier = supplierRow.originalData; // Pegando os dados originais

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: { form: this.dynamicForm, data: originalSupplier } // Passa os dados originais
    });

    dialogRef.afterClosed().subscribe((updatedSupplier: IForm) => {
      if (updatedSupplier) {
        this.crudService.updateItem(index, updatedSupplier);
        this.getData();
        this.notificationService.customNotification(NotificationType.UPDATE, 'Os dados foram atualizados com sucesso.');
      }
    });
  }


  deleteData(element: any, index: number ): void {
    const confirmDialog = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: element.Nome }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.crudService.removeItem(index);
        this.getData();
        this.notificationService.customNotification(NotificationType.SUCCESS, 'Excluido com sucesso!');
      }
    })
  }


}
