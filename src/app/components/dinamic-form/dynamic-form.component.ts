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
    console.log('data 1: ', this.form);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.onPixToggleChange();
    this.dynamicFormGroup.get('pixType')?.valueChanges.subscribe(value => this.onPixTypeChange(value));
  }

  initializeForm() {
    console.log('inicia o form:', this.data);

    debugger;
    if (this.data) {
      let formGroup: any = {};

      this.data.formControls.forEach((control: IFormControl) => {
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
        debugger;
        const controlValue = this.data[control.name] ?? control.value;
        if (control.name === 'acceptPix') {
          formGroup[control.name] = [controlValue === true || controlValue === 'true', controlValidators]; // Converte string "true" para booleano
        } else {
          formGroup[control.name] = [controlValue || '', controlValidators];
        }


      });

      this.dynamicFormGroup = this.fb.group(formGroup);

      debugger;
      if (!this.dynamicFormGroup.get('keyPix')) {
        this.dynamicFormGroup.addControl('keyPix', this.fb.control('', Validators.required));
      }

      if (!this.dynamicFormGroup.get('nature')) {
        this.dynamicFormGroup.addControl('nature', this.fb.control(''));
      }

      if (!this.dynamicFormGroup.get('pixType')) {
        this.dynamicFormGroup.addControl('pixType', this.fb.control(''));
      }

      this.updateKeyPixValidation(this.dynamicFormGroup.get('acceptPix')?.value)

      debugger;
      this.dynamicFormGroup.get('acceptPix')?.valueChanges.subscribe(acceptPix => {
        console.log('acceptPix', acceptPix);
        debugger;
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
      const updatedSupplier = this.dynamicFormGroup.value;
      this.dialogRef.close(updatedSupplier);
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

    this.keyPixError = null;

    const natureControl = this.dynamicFormGroup.get('nature');
    const keyPixControl = this.dynamicFormGroup.get('keyPix');

    if (!natureControl || !keyPixControl) {
      return;
    }

    const nature = natureControl.value;

    switch (selectedPixType) {
      case 'CPF/CNPJ':
        if (nature === 'Pessoa fisica') {
          // Validação para CPF
          keyPixControl.clearValidators();
          keyPixControl.setValidators([Validators.required]);
        } else {
          // Validação para CNPJ
          keyPixControl.clearValidators();
          keyPixControl.setValidators([Validators.required]);
        }
        break;

      case 'Email':
        // Validação para e-mail
        keyPixControl.clearValidators();
        keyPixControl.setValidators([Validators.required, Validators.email]);
        this.keyPixError = 'Por favor, insira um e-mail válido.';
        break;

      case 'Celular':
        keyPixControl.clearValidators();
        keyPixControl.setValidators([Validators.required]);
        this.keyPixError = 'Por favor, insira um celular válido.';
        break;

      case 'Chave Aleatória':
        keyPixControl.setValidators([Validators.required]);
        this.keyPixError = 'Por favor, insira a Chave aleatória!';
        break;

      default:
        keyPixControl.clearValidators();
        this.keyPixError = 'Selecione um tipo válido de chave Pix.';
        break;
    }

    // Atualiza as validações
    keyPixControl.updateValueAndValidity();
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
    const pixTypeControl = this.dynamicFormGroup.get('pixType');

    if (pixTypeControl) {
      if (acceptPix) {
        pixTypeControl.setValidators([Validators.required]);
      } else {
        pixTypeControl.clearValidators();
      }
      pixTypeControl.updateValueAndValidity();
    }
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

}
