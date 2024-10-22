import { Component } from '@angular/core';
import { DynamicTableComponent } from '../../components/dynamic-table/dynamic-table.component';
import { CrudServiceService } from '../../services/crud-service.service';
import { EntityType } from '../../enum/entityType.enum';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DynamicTableComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    private crudService: CrudServiceService,
  ) {}

  ngOnInit(): void {
    this.crudService.setEntityType(EntityType.SUPPLIER);
  }


}
