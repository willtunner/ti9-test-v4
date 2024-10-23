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
    this.loadSupplierForm(); // Ao inicializar o componente, carrega o formulário
  }

  loadSupplierForm(): void {
    this.crudService.fetchForm().subscribe((data: IForm) => { // Busca a estrutura do formulário
      this.dynamicForm = data; // Armazena o formulário recebido
      this.displayedColumns = this.createDisplayedColumns(data.formControls); // Cria as colunas da tabela baseadas nos controles do formulário
      this.getData(); // Carrega os dados para a tabela
    });
  }

  // Mapeia os labels dos controles do formulário para definir os nomes das colunas
  createDisplayedColumns(formControls: IFormControl[]): string[] {
    const columnNames = formControls.map(control => control.label);
    return columnNames;
  }

  getData() {
    const items = this.crudService.getItems()(); // Obtém os itens da base de dados

    if (items && items.length > 0) {
      // Transforma os itens recebidos para serem exibidos na tabela
      const transformedItems = items.map((item: any) => {
        const rowData: any = {};


        if (this.dynamicForm?.formControls) {
        this.dynamicForm.formControls.forEach(control => {
          // Transforma valores booleanos em "sim" ou "não" para campos específicos
          if (control.name === 'active' || control.name === 'acceptPix') {
            rowData[control.label] = item[control.name] ? 'sim' : 'não';
          } else {
            rowData[control.label] = item[control.name];
          }
        });

        rowData['originalData'] = item; // Armazena o item original

        return rowData;
      }});

      this.dataSource.data = transformedItems;
    } else {
      this.dataSource.data = items;
    }
  }

  // Aplica o filtro à tabela
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  // Abre um diálogo/modal para criação de novos dados
  createDataModal(): void {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: {form: this.dynamicForm, data: false } // Passa o formulário dinâmico para o modal e como é criação o data vai false
    });

    dialogRef.afterClosed().subscribe((result: IForm) => {
      if (result) {
        this.crudService.addItem(result); // Adiciona o novo item
        this.getData(); // Atualiza os dados exibidos
        this.notificationService.customNotification(NotificationType.SUCCESS, 'Operação realizada com sucesso!');
      }
    });
  }

  editDataModal(index: number): void {
    const supplierRow = this.dataSource.data[index];  // Obtém os dados da linha da tabela a ser editada
    const originalSupplier = supplierRow.originalData; // Pegando os dados originais

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '600px',
      height: '600px',
      data: { form: this.dynamicForm, data: originalSupplier } // Passa os dados originais para edição
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
        this.crudService.removeItem(index); // Remove o item se confirmado
        this.getData(); // Recarrega os dados da tabela
        this.notificationService.customNotification(NotificationType.SUCCESS, 'Excluido com sucesso!');
      }
    })
  }


}
