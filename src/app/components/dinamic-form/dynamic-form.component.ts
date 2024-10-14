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
        formGroup[control.name] = [controlValue || '', controlValidators]
      });

      this.dynamicFormGroup = this.fb.group(formGroup);

    }
  }



  onsubmit() {
    this.dialogRef.close(this.dynamicFormGroup.value);
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

    switch (selectedPixType) {
      case 'CPF/CNPJ':
        if(this.dynamicFormGroup.get('nature')?.value === 'Pessoa fisica'){
        this.dynamicFormGroup.get('keyPix')?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);

        }else{
          this.dynamicFormGroup.get('keyPix')?.setValidators([Validators.required, Validators.pattern(/^\d{14}$/)]);
        }
        break;

      case 'Email':
        this.dynamicFormGroup.get('keyPix')?.setValidators([Validators.required, Validators.email]);
        this.keyPixError = 'Por favor, insira um e-mail válido.';
        break;

      case 'Celular':
        this.dynamicFormGroup.get('keyPix')?.setValidators([Validators.required, Validators.pattern(/^\d{10,11}$/)]);
        this.keyPixError = 'Telefone precisa ter 10 ou 11 dígitos.';
        break;

      case 'Chave Aleatória':
        this.dynamicFormGroup.get('keyPix')?.setValidators([Validators.required]);
        this.keyPixError = 'Por favor, insira uma chave aleatória válida.';
        break;

      default:
        this.keyPixError = 'Selecione um tipo válido de chave Pix.';
        break;
    }

    this.dynamicFormGroup.get('keyPix')?.updateValueAndValidity();
  }

  onPixToggleChange() {
    const acceptPix = this.dynamicFormGroup.get('nature')?.value;
  }

  closeDialog(): void {

    this.dialogRef.close(this.dynamicFormGroup.value);
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


