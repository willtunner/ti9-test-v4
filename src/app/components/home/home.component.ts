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
  supplierForm!: IForm;
  suppliers$ = new MatTableDataSource<IForm>([]);
  displayedColumns: string[] = [
    'id', 'name', 'nature', 'address', 'uf', 'active', 'acceptPix', 'pixType', 'keyPix', 'obs'
  ];

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private crudService: CrudServiceService,
    private formService: FormServiceService
  ) {

  }

  ngOnInit(): void {
    this.crudService.setEntityType('supplier');
    this.loadSupplierForm();
  }

  loadSupplierForm(): void {
    this.crudService.fetchForm().subscribe((data: IForm) => {
      this.supplierForm = data;
      this.getData();
    });
  }

  getData() {
    this.suppliers$.data = this.crudService.getItems()();
  }


  openFornecedorModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.supplierForm, data: false }
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.addItem(result);
        this.getData();
        this.snackBar.open('Fornecedor adicionado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.getData();
      }
    });
  }

  editSupplier(index: number): void {
    const supplier = this.suppliers$.data[index];
    console.log('supplier', supplier);
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.supplierForm, data: supplier }
    });

    dialogRef.afterClosed().subscribe((supplier: IForm) => {
      if (supplier) {
        this.crudService.updateItem(index, supplier);
        this.getData();
        this.snackBar.open('Fornecedor atualizado com sucesso!', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  deleteSupplier(event: { element: IFormControl, index: number }): void {
    const confirmDialog = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: event.element.name }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.crudService.removeItem(event.index);
        this.getData();
        this.snackBar.open('Fornecedor excluído com sucesso!', 'Fechar', {
          duration: 3000,
        });
      }
    })
  }

}
