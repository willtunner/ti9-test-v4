import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { MatIconModule } from '@angular/material/icon';
import { supplierFormConfig } from '../../screens/supplierForm';
import { IForm } from '../../interface/supplier.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { CrudServiceService } from '../../services/crud-service.service';
import { FormServiceService } from '../../services/form-service.service';

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
    // this.suppliers$.data = this.crudService.getSuppliers()();
  }

  ngOnInit(): void {
    this.loadSupplierForm(); // Carregar o formulário no OnInit
  }

  loadSupplierForm(): void {
    this.formService.getSupplierForm().subscribe((data: IForm) => {
      console.log('Data: ',data);
      this.supplierForm = data; // Atribuir o formulário retornado
      // Atualizar a tabela de fornecedores
      this.suppliers$.data = [data]; // Aqui você pode modificar caso tenha mais dados
    });
  }


  openFornecedorModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: this.supplierForm
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.addSupplier(result);
        this.suppliers$.data = this.crudService.getSuppliers()();
        this.snackBar.open('Fornecedor adicionado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.suppliers$.data = this.crudService.getSuppliers()();
      }
    });
  }

  editSupplier(index: number): void {
    const supplier = this.suppliers$.data[index];
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '800px',
      data: supplier
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.updateSupplier(index, result);
        this.suppliers$.data = this.crudService.getSuppliers()();
        this.snackBar.open('Fornecedor atualizado com sucesso!', 'Fechar', {
          duration: 3000,
        });
      }
    });
}

  deleteSupplier(index: number): void {
    this.crudService.removeSupplier(index);
    this.suppliers$.data = this.crudService.getSuppliers()();
    this.snackBar.open('Fornecedor excluído com sucesso!', 'Fechar', {
      duration: 3000,
    });
  }

}
