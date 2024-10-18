import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IForm, IFormControl } from '../../interface/supplier.interface';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrudServiceService } from '../../services/crud-service.service';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

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
        
        // Itera sobre os controles do formulário
        this.dynamicForm.formControls.forEach(control => {
          // Verifica se o control.name é 'active' ou 'acceptPix'
          if (control.name === 'active' || control.name === 'acceptPix') {
            // Altera o valor para 'sim' ou 'não' para exibição na tabela
            rowData[control.label] = item[control.name] ? 'sim' : 'não';
          } else {
            // Caso contrário, mantém o valor original
            rowData[control.label] = item[control.name];
          }
        });
        
        // Preserva os dados originais para edição
        rowData['originalData'] = item;
        
        return rowData;
      });
  
      // Atualiza a tabela com os dados transformados
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
    const supplierRow = this.dataSource.data[index];
    const originalSupplier = supplierRow.originalData; // Pegando os dados originais
  
    console.log('supplier', supplierRow);
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: { form: this.dynamicForm, data: originalSupplier } // Passa os dados originais
    });
  
    dialogRef.afterClosed().subscribe((updatedSupplier: IForm) => {
      if (updatedSupplier) {
        this.crudService.updateItem(index, updatedSupplier);
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
