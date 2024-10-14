import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IForm, IFormControl, IValidator } from '../../interface/supplier.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideNgxMask } from 'ngx-mask';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    NgxMaskDirective
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
  providers: [provideNgxMask()]
})
export class DynamicFormComponent implements OnInit {

  form: IForm;
  fb = inject(FormBuilder);
  dynamicFormGroup: FormGroup = this.fb.group({}, { updateOn: 'submit' });
  keyPixError: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<DynamicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = data;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.onPixToggleChange();
    this.dynamicFormGroup.get('pixType')?.valueChanges.subscribe(value => this.onPixTypeChange(value));
  }

  initializeForm() {
    if (this.form?.formControls) {
      let formGroup: any = {};
      this.form.formControls.forEach((control: IFormControl) => {
        let controlValidators: any = [];

        if (control.validators && Array.isArray(control.validators)) {
          control.validators.forEach((val: IValidator) => {
            if (val.validatorName === 'required') controlValidators.push(Validators.required);
            if (val.validatorName === 'email') controlValidators.push(Validators.email);
            if (val.validatorName === 'minlength') controlValidators.push(Validators.minLength(val.minLength as number));
            if (val.validatorName === 'maxlength') controlValidators.push(Validators.maxLength(val.maxLength as number));
            if (val.validatorName === 'pattern') controlValidators.push(Validators.pattern(val.pattern as string));
          });
        }

        const controlValue = control.name === 'acceptPix' ? (control.value === 'true') : control.value;
        formGroup[control.name] = [controlValue || '', controlValidators];
      });

      this.dynamicFormGroup = this.fb.group(formGroup);

      // Atualiza a validação do campo keyPix baseado na seleção do checkbox
      this.dynamicFormGroup.get('acceptPix')?.valueChanges.subscribe(acceptPix => {
        this.updateKeyPixValidation(acceptPix);
      });
    }
  }

  updateKeyPixValidation(acceptPix: boolean) {
    const keyPixControl = this.dynamicFormGroup.get('keyPix');

    if (keyPixControl) {
      if (acceptPix) {
        keyPixControl.setValidators([Validators.required]);
      } else {
        keyPixControl.clearValidators();
      }
      keyPixControl.updateValueAndValidity();
    }
  }

  onsubmit() {
    if (this.dynamicFormGroup.valid) {
      this.dialogRef.close(this.dynamicFormGroup.value);
    }
  }

  onCancel() {
    this.dynamicFormGroup.reset();
  }

  isPixAccepted(): boolean {
    return this.dynamicFormGroup.get('acceptPix')?.value;
  }

  onPixTypeChange(event: MatSelectChange) {
    const selectedPixType = event.value;

    // Reset error
    this.keyPixError = null;

    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (selectedPixType) {
      case 'CPF/CNPJ':
        if (nature === 'Pessoa fisica') {
          // Validação para CPF
          this.dynamicFormGroup.get('keyPix')?.clearValidators();
          this.dynamicFormGroup.get('keyPix')?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // Padrão CPF
          ]);
        } else {
          // Validação para CNPJ
          this.dynamicFormGroup.get('keyPix')?.clearValidators();
          this.dynamicFormGroup.get('keyPix')?.setValidators([
            Validators.required,
            Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/) // Padrão CNPJ
          ]);
        }
        break;

      case 'Email':
        // Validação para e-mail
        this.dynamicFormGroup.get('keyPix')?.clearValidators();
        this.dynamicFormGroup.get('keyPix')?.setValidators([
          Validators.required,
          Validators.email
        ]);
        this.keyPixError = 'Por favor, insira um e-mail válido.';
        break;

      case 'Celular':
        // Validação para celular (10 ou 11 dígitos)
        this.dynamicFormGroup.get('keyPix')?.clearValidators();
        this.dynamicFormGroup.get('keyPix')?.setValidators([
          Validators.required,
          Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/) // Padrão celular
        ]);
        this.keyPixError = 'Por favor, insira um celular válido.';
        break;

      case 'Chave Aleatória':
        // Sem validação específica
        this.dynamicFormGroup.get('keyPix')?.clearValidators();
        break;

      default:
        this.keyPixError = 'Selecione um tipo válido de chave Pix.';
        break;
    }

    // Atualiza as validações
    this.dynamicFormGroup.get('keyPix')?.updateValueAndValidity();
  }

  getPixPlaceholder(): string {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;

    switch (pixType) {
      case 'Celular':
        return 'Digite seu celular';
      case 'Email':
        return 'Digite seu e-mail';
      case 'CPF/CNPJ':
        return this.dynamicFormGroup.get('nature')?.value === 'Pessoa fisica' ? 'Digite seu CPF' : 'Digite seu CNPJ';
      default:
        return 'Chave Aleatória';
    }
  }

  getPixMask(): string | null {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;

    switch (pixType) {
      case 'Celular':
        return '(00) 00000-0000'; // Máscara de celular
      case 'CPF/CNPJ':
        return this.dynamicFormGroup.get('nature')?.value === 'Pessoa fisica' ? '000.000.000-00' : '00.000.000/0000-00';
      default:
        return null; // Sem máscara para outros tipos
    }
  }

  onPixToggleChange() {
    const acceptPix = this.dynamicFormGroup.get('acceptPix')?.value;
    if (acceptPix) {
      this.dynamicFormGroup.get('pixType')?.setValidators([Validators.required]);
    } else {
      this.dynamicFormGroup.get('pixType')?.clearValidators();
    }
    this.dynamicFormGroup.get('pixType')?.updateValueAndValidity();
  }

  closeDialog(): void {
    if (this.dynamicFormGroup.valid) {
      this.dialogRef.close(this.dynamicFormGroup.value);
    }
  }

  getValidationErros(control: IFormControl): string {
    const myFormControl = this.dynamicFormGroup.get(control.name);
    let errorMessage = '';
    const validatorsArray = Array.isArray(control.validators) ? control.validators : [control.validators];

    validatorsArray.forEach((val) => {
      if (myFormControl?.hasError(val.validatorName as string)) {
        errorMessage = val.message as string;
      }
    });

    return errorMessage;
  }

  getInvalidControls(): { [key: string]: any } {
    const invalidControls: { [key: string]: any } = {};
    Object.keys(this.dynamicFormGroup.controls).forEach(key => {
      const control = this.dynamicFormGroup.get(key);
      if (control && control.invalid) {
        invalidControls[key] = control.errors;
      }
    });
    return invalidControls;
  }
}
