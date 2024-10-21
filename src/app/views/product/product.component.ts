import { Component } from '@angular/core';
import { CrudServiceService } from '../../services/crud-service.service';
import { DynamicTableComponent } from '../../components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    DynamicTableComponent
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {

  constructor(
    private crudService: CrudServiceService,
  ) {

  }

  ngOnInit(): void {
    this.crudService.setEntityType('product');
  }

}
