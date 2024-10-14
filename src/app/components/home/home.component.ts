import { Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicFormComponent } from '../dinamic-form/dynamic-form.component';
import { MatIconModule } from '@angular/material/icon';
import { supplierFormConfig } from '../../screens/supplierForm';
import { IForm } from '../../interface/supplier.interface';
import { FormServiceService } from '../../services/form-service.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatIconModule,
    MatTableModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  supplierForm = supplierFormConfig as IForm;
  suppliers$ = new MatTableDataSource<IForm>([]);

  constructor(public dialog: MatDialog, private snackBar: MatSnackBar, private formService: FormServiceService) {
    this.suppliers$.data = this.formService.getSuppliers()();
  }


  openFornecedorModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '800px',
      data: this.supplierForm
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.formService.addSupplier(result);
        this.snackBar.open('Fornecedor adicionado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.suppliers$.data = this.formService.getSuppliers()();
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
        this.formService.updateSupplier(index, result);
        this.suppliers$.data = this.formService.getSuppliers()();
        this.snackBar.open('Fornecedor atualizado com sucesso!', 'Fechar', {
          duration: 3000,
        });
      }
    });
}

  deleteSupplier(index: number): void {
    this.formService.removeSupplier(index);
    this.suppliers$.data = this.formService.getSuppliers()();
    this.snackBar.open('Fornecedor excluído com sucesso!', 'Fechar', {
      duration: 3000,
    });
  }

}
