import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IForm, IFormControl, IValidator } from '../../interface/supplier.interface';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  providers: [provideNgxMask()],
})
export class DynamicFormComponent implements OnInit {
  form: IForm;
  dynamicFormGroup: FormGroup;
  keyPixError: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DynamicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = data.form;
    this.dynamicFormGroup = this.fb.group({}, { updateOn: 'submit' });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.listenToNatureChanges();
  }

  listenToNatureChanges(): void {
    const natureControl = this.dynamicFormGroup.get('nature');
    natureControl?.valueChanges.subscribe(() => {
      this.applyPixTypeValidators();
    });
  }

  initializeForm(): void {
    if (this.data) {
      const formGroupConfig = this.createFormGroupConfig();
      this.dynamicFormGroup = this.fb.group(formGroupConfig);
      this.listenToAcceptPixChanges();
    }
  }

  createFormGroupConfig(): { [key: string]: any } {
    const formGroupConfig: { [key: string]: any } = {};

    this.form.formControls.forEach((control: IFormControl) => {
      const controlValidators = this.createValidators(control.validators);
      let controlValue = (this.data.data[control.name] ?? control.value) || '';
      if (control.name === 'acceptPix') {
        controlValue = controlValue === 'true' || controlValue === true ? true : false;
      }
      formGroupConfig[control.name] = [controlValue, controlValidators];
    });

    return formGroupConfig;
  }

  createValidators(validators: IValidator[]): any[] {
    if (!validators) return [];
    return validators.map(val => {
      switch (val.validatorName) {
        case 'required': return Validators.required;
        case 'email': return Validators.email;
        case 'minlength': return Validators.minLength(val.minLength!);
        case 'maxlength': return Validators.maxLength(val.maxLength!);
        case 'pattern': return Validators.pattern(val.pattern!);
        default: return null;
      }
    }).filter(Boolean);
  }

  listenToAcceptPixChanges(): void {
    this.dynamicFormGroup.get('acceptPix')?.valueChanges.subscribe(acceptPix => {
      this.updateKeyPixValidation(acceptPix);
    });
  }

  updateKeyPixValidation(acceptPix: boolean): void {
    const keyPixControl = this.dynamicFormGroup.get('keyPix');
    if (!keyPixControl) return;

    if (acceptPix) {
      this.applyPixTypeValidators();
    } else {
      keyPixControl.clearValidators();
    }

    keyPixControl.updateValueAndValidity();
  }

  onPixTypeChange(event: MatSelectChange): void {
    console.log('onPixTypeChange', event)
    this.applyPixTypeValidators();
  }

  applyPixTypeValidators(): void {
    const keyPixControl = this.dynamicFormGroup.get('keyPix');
    const pixTypeControl = this.dynamicFormGroup.get('pixType');
    const natureControl = this.dynamicFormGroup.get('nature');
    const acceptPix = this.dynamicFormGroup.get('acceptPix')?.value;


    if (!keyPixControl || !pixTypeControl || !natureControl) return;
    keyPixControl.clearValidators();
    const pixType = pixTypeControl.value;
    const nature = natureControl.value;

    console.log('switch', pixType, 'nature', nature);

    if(acceptPix) {
      switch (pixType) {
        case 'CPF/CNPJ':
          if (!nature) {
            keyPixControl.clearValidators();
            keyPixControl.setValidators([Validators.required]);
            this.keyPixError = 'Por favor, Selecione natureza do fornecedor ';
          } else {
            if (nature === 'Pessoa fisica') {
              keyPixControl.clearValidators();
              keyPixControl.setValidators([Validators.required, Validators.minLength(11), Validators.maxLength(11)]);
              this.keyPixError = 'CPF deve ter 11 dígitos.';
            } else {
              keyPixControl.clearValidators();
              keyPixControl.setValidators([Validators.required, Validators.minLength(14), Validators.maxLength(14)]);
              this.keyPixError = 'CNPJ deve ter 14 dígitos.';
            }
          }
          break;
        case 'Email':
          keyPixControl.clearValidators();
          keyPixControl.setValidators([Validators.required, Validators.email]);
          this.keyPixError = 'Por favor, insira um e-mail válido.';
          break;
        case 'Celular':
          keyPixControl.clearValidators();
          keyPixControl.setValidators([Validators.required]);
          this.keyPixError = 'Por favor, insira um número de celular válido.';
          break;
        case 'Chave Aleatória':
          keyPixControl.clearValidators();
          keyPixControl.setValidators([Validators.required, Validators.minLength(32)]);
          this.keyPixError = 'Chave Aleatória deve ter pelo menos 32 caracteres.';
          break;
        case '':
          if (!nature) {
            keyPixControl.clearValidators();
            keyPixControl.setValidators([Validators.required]);
            this.keyPixError = 'Por favor, Selecione natureza do fornecedor ';
          } else {
            keyPixControl.clearValidators();
            keyPixControl.setValidators([Validators.required]);
            this.keyPixError = 'Por favor, Selecione o tipo da chave';
          }
          break;
      }
    } else {
      console.log('acceptPix false')
      keyPixControl.clearValidators();
    }

    keyPixControl.updateValueAndValidity();
  }

  getValidationErrors(control: IFormControl): string {
    const myFormControl = this.dynamicFormGroup.get(control.name);
    if (control.name === 'keyPix' && this.keyPixError) {
      return this.keyPixError;
    }
    if (myFormControl?.invalid && myFormControl?.touched) {
      return control.validators?.find(v => myFormControl.hasError(v.validatorName as string))?.message || '';
    }
    return '';
  }

  onsubmit(): void {
    this.dynamicFormGroup.markAllAsTouched();
    if (this.dynamicFormGroup.valid) {
      this.dialogRef.close(this.dynamicFormGroup.value);
    }
  }

  onCancel(): void {
    this.dynamicFormGroup.reset();
  }

  getPixPlaceholder(): string {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;
    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (pixType) {
      case 'Celular': return 'Digite seu celular';
      case 'Email': return 'Digite seu e-mail';
      case 'CPF/CNPJ': return nature === 'Pessoa fisica' ? 'Digite seu CPF' : 'Digite seu CNPJ';
      default: return 'Chave Aleatória';
    }
  }

  getPixMask(): string | null {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;
    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (pixType) {
      case 'Celular': return '(00) 00000-0000';
      case 'CPF/CNPJ': return nature === 'Pessoa fisica' ? '000.000.000-00' : '00.000.000/0000-00';
      default: return null;
    }
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
