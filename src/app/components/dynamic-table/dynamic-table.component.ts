import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

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
  @Output() delete = new EventEmitter<number>();

  // Trigger edit action
  editElement(index: number): void {
    this.edit.emit(index);
  }

  // Trigger delete action
  deleteElement(index: number): void {
    this.delete.emit(index);
  }
}
