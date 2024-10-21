import { Injectable, signal, WritableSignal } from '@angular/core';
import { IForm } from '../interface/dynamic-form.interface';
import { FormServiceService } from './form-service.service'; // Importar o FormServiceService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CrudServiceService {
  private entity: WritableSignal<string> = signal(''); // Para armazenar a entidade atual
  private items: WritableSignal<IForm[]> = signal(this.loadItemsFromLocalStorage());

  constructor(private formService: FormServiceService) {}

  private loadItemsFromLocalStorage(): IForm[] {
    const data = localStorage.getItem(this.entity());
    return data ? JSON.parse(data) : [];
  }

  private saveItemsToLocalStorage(): void {
    localStorage.setItem(this.entity(), JSON.stringify(this.items()));
  }

  setEntityType(entity: string): void {
    this.entity.set(entity);
    this.items.set(this.loadItemsFromLocalStorage()); // Carregar os itens da nova entidade
  }

  addItem(item: IForm): void {
    this.items.update((current) => {
      const updatedItems = [...current, item];
      return updatedItems;
    });

    this.saveItemsToLocalStorage();
  }

  removeItem(index: number): void {
    this.items.update((current) => {
      const updatedItems = current.filter((_, i) => i !== index);
      return updatedItems;
    });

    this.saveItemsToLocalStorage();
  }

  updateItem(index: number, item: IForm): void {
    this.items.update((current) => {
      const updatedItems = current.map((s, i) => (i === index ? item : s));
      return updatedItems;
    });

    this.saveItemsToLocalStorage();
  }

  getItems() {
    return this.items;
  }

  fetchForm(): Observable<IForm> {
    return this.formService.getForm(this.entity());
  }
}
