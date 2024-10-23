import { Injectable, signal, WritableSignal } from '@angular/core';
import { IForm } from '../interface/dynamic-form.interface';
import { FormServiceService } from './form-service.service'; // Importar o FormServiceService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CrudServiceService {
  // Sinal que armazena o nome da entidade atual enviado pelo componente em que está
  private entity: WritableSignal<string> = signal(''); 

  // Sinal que armazena os itens (formulários) da entidade atual, inicializados a partir do localStorage
  private items: WritableSignal<IForm[]> = signal(this.loadItemsFromLocalStorage());

  constructor(private formService: FormServiceService) {}

  // Método que carrega os itens do localStorage com base na entidade atual
  private loadItemsFromLocalStorage(): IForm[] {
    const data = localStorage.getItem(this.entity());
    return data ? JSON.parse(data) : [];
  }

  // Método que salva os itens no localStorage com base na entidade atual
  private saveItemsToLocalStorage(): void {
    localStorage.setItem(this.entity(), JSON.stringify(this.items()));
  }

  // Define o tipo de entidade atual e carrega os itens correspondentes do localStorage
  setEntityType(entity: string): void {
    this.entity.set(entity);// Atualiza a entidade
    this.items.set(this.loadItemsFromLocalStorage()); // Carregar os itens da nova entidade
  }

  // Adiciona um novo item à lista de formulários e salva no localStorage
  addItem(item: IForm): void {
    this.items.update((current) => {
      const updatedItems = [...current, item];
      return updatedItems;
    });

    this.saveItemsToLocalStorage();
  }

  // Remove um item da lista de formulários pelo índice e salva no localStorage
  removeItem(index: number): void {
    this.items.update((current) => {
      const updatedItems = current.filter((_, i) => i !== index); // Remove o item pelo índice
      return updatedItems;
    });
    this.saveItemsToLocalStorage();
  }

  // Atualiza um item específico na lista de formulários pelo índice e salva no localStorage
  updateItem(index: number, item: IForm): void {
    this.items.update((current) => {
      const updatedItems = current.map((s, i) => (i === index ? item : s));
      return updatedItems;
    });

    this.saveItemsToLocalStorage();
  }

  // Retorna os itens (formulários) armazenados no sinal `items`
  getItems() {
    return this.items;
  }

  // Busca um formulário da entidade atual usando o FormServiceService
  fetchForm(): Observable<IForm> {
    return this.formService.getForm(this.entity());
  }
}
