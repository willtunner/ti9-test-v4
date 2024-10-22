import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IForm, IFormControl, IValidator } from '../../interface/dynamic-form.interface';
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
import { PixType } from '../../enum/pixtype.enum';
import { NatureType } from '../../enum/naturetype.enum';

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
  activeDebugger = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DynamicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (data.data.pixType === 'CPF' || data.data.pixType === 'CNPJ' ) data.data.pixType = PixType.CPF_CNPJ;
    this.form = data.form;
    this.dynamicFormGroup = this.fb.group({}, { updateOn: 'submit' });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.listenToNatureChanges();
    this.listenToPixTypeChanges();
  }

  listenToNatureChanges(): void {
    const natureControl = this.dynamicFormGroup.get('nature');
    natureControl?.valueChanges.subscribe(() => {
      this.dynamicFormGroup.get('keyPix')?.setValue(null);
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
    this.applyPixTypeValidators();
  }

  applyPixTypeValidators(): void {
    const keyPixControl = this.dynamicFormGroup.get('keyPix');
    const pixTypeControl = this.dynamicFormGroup.get('pixType');
    const natureControl = this.dynamicFormGroup.get('nature');
    const acceptPix = this.dynamicFormGroup.get('acceptPix')?.value;

    if (!keyPixControl || !pixTypeControl || !natureControl) return;

    // Limpa os validadores existentes
    keyPixControl.clearValidators();

    if (acceptPix) {
      const pixType = pixTypeControl.value;
      const nature = natureControl.value;

      // Sempre que acceptPix for true, keyPix é required
      keyPixControl.setValidators([Validators.required]);

      switch (pixType) {
        case PixType.CPF_CNPJ:
          if (!nature) {
            this.keyPixError = 'Por favor, selecione a natureza do fornecedor.';
          } else if (nature === NatureType.Pessoa_fisica) {
            keyPixControl.setValidators([
              Validators.required,
              Validators.minLength(11),
              Validators.maxLength(11)
            ]);
            this.keyPixError = 'CPF deve ter 11 dígitos.';
          } else {
            keyPixControl.setValidators([
              Validators.required,
              Validators.minLength(14),
              Validators.maxLength(14)
            ]);
            this.keyPixError = 'CNPJ deve ter 14 dígitos.';
          }
          break;

        case PixType.Email:
          keyPixControl.setValidators([
            Validators.required,
            Validators.email
          ]);
          this.keyPixError = 'Por favor, insira um e-mail válido.';
          break;

        case PixType.Celular:
          keyPixControl.setValidators([
            Validators.required,
            Validators.minLength(11)
          ]);
          this.keyPixError = 'Por favor, insira um número de celular válido.';
          break;

        case PixType.ChaveAleatoria:
          keyPixControl.setValidators([
            Validators.required,
            Validators.minLength(32)
          ]);
          this.keyPixError = 'Chave Aleatória deve ter pelo menos 32 caracteres.';
          break;

        default:
          this.keyPixError = nature
            ? 'Por favor, selecione o tipo da chave.'
            : 'Por favor, selecione a natureza do fornecedor.';
          break;
      }
    } else {
      // Se acceptPix for false, limpa as validações
      keyPixControl.clearValidators();
    }

    // Atualiza a validação
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
      const formValue = this.dynamicFormGroup.value;
      const acceptPix = formValue.acceptPix;
      const pixType = formValue.pixType;
      const nature = formValue.nature;

      if (acceptPix) {
        if (pixType === PixType.CPF_CNPJ) {
          if (nature === NatureType.Pessoa_fisica) {
            formValue.pixType = "CPF";  // Se natureza for Pessoa Física, pixType será CPF
          } else if (nature === NatureType.Pessoa_Jurídica) {
            formValue.pixType = "CNPJ"; // Se natureza for Pessoa Jurídica, pixType será CNPJ
          }
        }
        // Se pixType não for CPF ou CNPJ, manter o valor original
      } else {
        formValue.pixType = "";
        formValue.keyPix = "";
      }

      this.dialogRef.close(formValue);
      console.log('formValue: ', formValue);
    }
  }

  onCancel(): void {
    this.dynamicFormGroup.reset();
  }

  getPixPlaceholder(): string {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;
    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (pixType) {
      case PixType.Celular: return 'Digite seu celular';
      case PixType.Email: return 'Digite seu e-mail';
      case PixType.CPF_CNPJ: return nature === NatureType.Pessoa_fisica ? 'Digite seu CPF' : 'Digite seu CNPJ';
      default: return PixType.ChaveAleatoria;
    }
  }

  getPixMask(): string | null {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;
    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (pixType) {
      case PixType.Celular: return '(00) 00000-0000';
      case PixType.CPF_CNPJ: return nature === NatureType.Pessoa_fisica ? '000.000.000-00' : '00.000.000/0000-00';
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

  onPriceChange(value: string): void {
    // Remove todos os caracteres não numéricos, exceto a vírgula para o formato monetário
    const numericValue = value.replace(/[^0-9,.]/g, '');
    console.log(numericValue);

    // Tenta converter o valor para um número
    const parsedValue = parseFloat(numericValue.replace(',', '.'));

    // Verifica se o valor foi corretamente convertido para um número
    if (!isNaN(parsedValue)) {
      // Converte para valor monetário e atualiza o formulário
      const formattedValue = this.formatCurrency(parsedValue / 100); // Divide por 100 para obter o valor em reais
      this.dynamicFormGroup.get('price')?.setValue(formattedValue, { emitEvent: false });
    } else {
      // Se o valor não for válido, você pode querer resetar o campo ou lidar de outra forma
      this.dynamicFormGroup.get('price')?.setValue('', { emitEvent: false });
    }
  }

  formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  listenToPixTypeChanges(): void {
    const pixTypeControl = this.dynamicFormGroup.get('pixType');
    pixTypeControl?.valueChanges.subscribe(() => {
      // Redefine o valor do campo keyPix para vazio sempre que o pixType mudar
      this.dynamicFormGroup.get('keyPix')?.setValue('');
    });
  }

}
