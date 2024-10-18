import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IForm, IFormControl, Supplier } from '../../interface/supplier.interface';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrudServiceService } from '../../services/crud-service.service';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { NatureType } from '../../enum/naturetype.enum';

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
export class DynamicTableComponent<T> {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();
  dynamicForm!: IForm;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private crudService: CrudServiceService,
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
        this.dynamicForm.formControls.forEach(control => {
          rowData[control.label] = item[control.name];
        });
        return rowData;
      });
  
      this.dataSource.data = transformedItems;
      console.log('transformedItems', transformedItems);
    }
  }
  

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  createDatadorModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.dynamicForm, data: false }
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.addItem(result);
        this.getData();
        this.snackBar.open('Fornecedor adicionado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['custom-snackbar', 'success-snackbar'],
        });
        this.getData();
      }
    });
  }

  

  editDataModal(index: number): void {
    const supplier = this.dataSource.data[index];
    console.log('supplier', supplier);
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.dynamicForm, data: supplier }
    });

    dialogRef.afterClosed().subscribe((supplier: IForm) => {
      if (supplier) {
        this.crudService.updateItem(index, supplier);
        this.getData();
        this.snackBar.open('Fornecedor atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['custom-snackbar', 'info-snackbar'],
        });
      }
    });
  }

  deleteData(element: IFormControl, index: number ): void {
    const confirmDialog = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: element.name }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.crudService.removeItem(index);
        this.getData();
        this.snackBar.open('Fornecedor excluído com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['custom-snackbar', 'error-snackbar'],
        });
      }
    })
  }

  
}
