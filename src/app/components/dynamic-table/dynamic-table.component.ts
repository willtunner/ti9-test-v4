import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IFormControl } from '../../interface/supplier.interface';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.css'
})
export class DynamicTableComponent<T> {
  @Input() displayedColumns: string[] = [];
  @Input() dataSource = new MatTableDataSource<T>();

  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<{ element: IFormControl, index: number }>();

  editElement(index: number): void {
    this.edit.emit(index);
  }

  deleteElement(element: IFormControl, index: number): void {
    this.delete.emit({element, index});
  }
}
