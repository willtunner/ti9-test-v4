import { Injectable, signal } from '@angular/core';
import { IForm } from '../interface/supplier.interface';

@Injectable({
  providedIn: 'root', // Isso faz com que o serviço esteja disponível em toda a aplicação
})
export class FormServiceService {
  // Usamos um Signal para armazenar e notificar alterações no estado
  private suppliers = signal<IForm[]>(this.loadSuppliersFromLocalStorage());

  constructor() {}

  // Carrega os dados do LocalStorage
  private loadSuppliersFromLocalStorage(): IForm[] {
    const data = localStorage.getItem('suppliers');
    return data ? JSON.parse(data) : [];
  }

  // Salva os dados no LocalStorage
  private saveSuppliersToLocalStorage(): void {
    localStorage.setItem('suppliers', JSON.stringify(this.suppliers()));
  }

  // Adiciona um novo fornecedor
  addSupplier(supplier: IForm): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = [...current, supplier];
      this.saveSuppliersToLocalStorage();
      return updatedSuppliers;
    });
  }

  // Remove um fornecedor pelo índice
  removeSupplier(index: number): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = current.filter((_, i) => i !== index);
      this.saveSuppliersToLocalStorage();
      return updatedSuppliers;
    });
  }

  // Atualiza um fornecedor
  updateSupplier(index: number, supplier: IForm): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = current.map((s, i) => (i === index ? supplier : s));
      this.saveSuppliersToLocalStorage();
      return updatedSuppliers;
    });
  }

  // Getter para os fornecedores
  getSuppliers() {
    return this.suppliers;
  }
}
