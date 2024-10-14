import { Injectable, signal } from '@angular/core';
import { IForm } from '../interface/supplier.interface';

@Injectable({
  providedIn: 'root',
})
export class CrudServiceService {
  private suppliers = signal<IForm[]>(this.loadSuppliersFromLocalStorage());

  constructor() {}

  private loadSuppliersFromLocalStorage(): IForm[] {
    const data = localStorage.getItem('suppliers');
    return data ? JSON.parse(data) : [];
  }

  private saveSuppliersToLocalStorage(): void {
    localStorage.setItem('suppliers', JSON.stringify(this.suppliers()));
  }

  addSupplier(supplier: IForm): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = [...current, supplier];
      return updatedSuppliers;
    });

    this.saveSuppliersToLocalStorage();
  }

  removeSupplier(index: number): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = current.filter((_, i) => i !== index);
      return updatedSuppliers;
    });

    this.saveSuppliersToLocalStorage();
  }

  updateSupplier(index: number, supplier: IForm): void {
    this.suppliers.update((current) => {
      const updatedSuppliers = current.map((s, i) => (i === index ? supplier : s));
      return updatedSuppliers;
    });

    this.saveSuppliersToLocalStorage();
  }

  getSuppliers() {
    return this.suppliers;
  }
}
