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
    console.log(data);
    this.form = data.form;
    this.dynamicFormGroup = this.fb.group({}, { updateOn: 'submit' });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.listenToPixTypeChange();
  }

  initializeForm(): void {
    if (this.data) {
      const formGroupConfig = this.createFormGroupConfig();
      this.dynamicFormGroup = this.fb.group(formGroupConfig);
      // this.addMissingControls(['keyPix', 'nature', 'pixType']);
      this.listenToAcceptPixChanges();
      this.populateFormWithData();
    }
  }

  createFormGroupConfig(): { [key: string]: any } {
    const formGroupConfig: { [key: string]: any } = {};
  
    this.form.formControls.forEach((control: IFormControl) => {
      const controlValidators = this.createValidators(control.validators);
  
      // Verifica se o dado já existe no objeto `data` e preenche o valor inicial do controle.
      let controlValue = (this.data.data[control.name] ?? control.value) || ''; // Modificado para buscar o valor em `data.data`
  
      // Verifica se o controle é o 'acceptPix' para tratar o valor como booleano
      if (control.name === 'acceptPix') {
        controlValue = (controlValue === 'true' || controlValue === true) ? true : false;
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

  addMissingControls(controls: string[]): void {
    controls.forEach(control => {
      if (!this.dynamicFormGroup.get(control)) {
        this.dynamicFormGroup.addControl(control, this.fb.control(''));
      }
    });
  }

  listenToAcceptPixChanges(): void {
    this.dynamicFormGroup.get('acceptPix')?.valueChanges.subscribe(acceptPix => {
      this.updateKeyPixValidation(acceptPix);
    });
  }

  updateKeyPixValidation(acceptPix: boolean): void {
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

  onsubmit(): void {
    if (this.dynamicFormGroup.valid) {
      this.dialogRef.close(this.dynamicFormGroup.value);
    }
  }

  onCancel(): void {
    this.dynamicFormGroup.reset();
  }

  isPixAccepted(): boolean {
    return this.dynamicFormGroup.get('acceptPix')?.value;
  }

  listenToPixTypeChange(): void {
    this.dynamicFormGroup.get('pixType')?.valueChanges.subscribe(value => {
      this.onPixTypeChange(value);
    });
  }

  onPixTypeChange(event: MatSelectChange) {
    const selectedPixType = event.value; // Corrigido para acessar o valor selecionado diretamente
  
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
          keyPixControl.setValidators([Validators.required]); // Adicione a validação específica de CPF se necessário
        } else {
          // Validação para CNPJ
          keyPixControl.setValidators([Validators.required]); // Adicione a validação específica de CNPJ se necessário
        }
        break;
  
      case 'Email':
        keyPixControl.setValidators([Validators.required, Validators.email]);
        this.keyPixError = 'Por favor, insira um e-mail válido.';
        break;
  
      case 'Celular':
        keyPixControl.setValidators([Validators.required]);
        this.keyPixError = 'Por favor, insira um celular válido.';
        break;
  
      case 'Chave Aleatória':
        keyPixControl.setValidators([Validators.required]);
        keyPixControl.setValidators([Validators.minLength(32)])
        this.keyPixError = 'Por favor, insira a Chave aleatória!';
        break;
  
      default:
        this.keyPixError = 'Selecione um tipo válido de chave Pix.';
        break;
    }
  
    // Atualiza as validações
    keyPixControl.updateValueAndValidity();
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

  closeDialog(): void {
    if (this.dynamicFormGroup.valid) {
      this.dialogRef.close(this.dynamicFormGroup.value);
    }
  }

  getValidationErrors(control: IFormControl): string {
    const myFormControl = this.dynamicFormGroup.get(control.name);
    let errorMessage = '';
  
    control.validators?.forEach((val: IValidator) => {
      if (myFormControl?.hasError(val.validatorName as string)) {
        // Exibir mensagem personalizada ou mensagem padrão
        switch (val.validatorName) {
          case 'required':
            errorMessage = val.message ?? 'Este campo é obrigatório.';
            break;
          case 'minlength':
            const minLengthError = myFormControl?.getError('minlength');
            errorMessage = val.message ?? `O campo deve ter no mínimo ${minLengthError?.requiredLength} caracteres.`;
            break;
          // Adicione outros casos de validação, como maxLength, pattern, etc.
          default:
            errorMessage = val.message ?? 'Erro no campo.';
        }
      }
    });
  
    return errorMessage;
  }

  populateFormWithData(): void {
    if (this.data && this.data.data) {
      // Itera sobre as chaves do objeto `data.data` e preenche o formulário
      Object.keys(this.data.data).forEach(key => {
        const formControl = this.dynamicFormGroup.get(key);
        if (formControl) {
          formControl.setValue(this.data.data[key]);
        }
      });
    }
  }
  
  

}
