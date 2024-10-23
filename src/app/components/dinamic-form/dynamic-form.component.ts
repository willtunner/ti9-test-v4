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
  form: IForm; // Armazena o objeto de formulário que será utilizado no template
  dynamicFormGroup: FormGroup; // FormGroup dinâmico que conterá os controles do formulário
  keyPixError: string | null = null; // Variável para armazenar erros relacionados à chave Pix
  activeDebugger = false; // Variável auxiliar de depuração

  constructor(
    private fb: FormBuilder, 
    public dialogRef: MatDialogRef<DynamicFormComponent>, // Referência ao diálogo, permitindo fechamento e controle de estado
    @Inject(MAT_DIALOG_DATA) public data: any // Injeta os dados passados para o diálogo
  ) {

    // Verifica o tipo de chave Pix e ajusta o valor se for CPF ou CNPJ
    if (data.data.pixType === 'CPF' || data.data.pixType === 'CNPJ' ) data.data.pixType = PixType.CPF_CNPJ;

    this.form = data.form; // Atribui o formulário dos dados injetados à propriedade form
    this.dynamicFormGroup = this.fb.group({}, { updateOn: 'submit' }); // Cria um FormGroup vazio com atualização no 'submit'
  }

  ngOnInit(): void {
    this.initializeForm(); // Inicializa o formulário e define listeners para mudanças no formulário
    this.listenToNatureChanges(); // Observa mudanças na natureza (pessoa física/jurídica)
    this.listenToPixTypeChanges(); // Observa mudanças no tipo de chave Pix
  }

  listenToNatureChanges(): void {
    // Obtém o controle da natureza (tipo de fornecedor) e reseta a chave Pix sempre que mudar
    const natureControl = this.dynamicFormGroup.get('nature');
    natureControl?.valueChanges.subscribe(() => {
      this.dynamicFormGroup.get('keyPix')?.setValue(null);
      this.applyPixTypeValidators(); // Aplica os validadores baseados na natureza e tipo de chave Pix
    });
  }

  initializeForm(): void {
    // Inicializa o formulário com base nos dados injetados
    if (this.data) {
      const formGroupConfig = this.createFormGroupConfig(); // Cria a configuração para o FormGroup
      this.dynamicFormGroup = this.fb.group(formGroupConfig); // Atribui a configuração ao FormGroup
      this.listenToAcceptPixChanges(); // Observa mudanças no campo 'acceptPix'
    }
  }

  createFormGroupConfig(): { [key: string]: any } {
    // Cria a configuração do FormGroup com base nos controles e validadores
    const formGroupConfig: { [key: string]: any } = {};

    // Itera sobre os controles do formulário
    this.form.formControls.forEach((control: IFormControl) => {
      const controlValidators = this.createValidators(control.validators); // Cria os validadores
      let controlValue = (this.data.data[control.name] ?? control.value) || ''; // Define o valor inicial

      if (control.name === 'acceptPix') {
        controlValue = controlValue === 'true' || controlValue === true ? true : false; // Verifica e ajusta o valor de acceptPix
      }

      formGroupConfig[control.name] = [controlValue, controlValidators]; // Atribui o valor e validadores ao FormGroup
    });

    return formGroupConfig; // Retorna a configuração do FormGroup
  }

  createValidators(validators: IValidator[]): any[] {
    // Cria validadores com base nas regras especificadas no json
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

    // Atualiza a validação do campo chave Pix com base no valor de 'acceptPix'
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
     // Atualiza os validadores da chave Pix quando o tipo de chave mudar
    this.applyPixTypeValidators();
  }

  applyPixTypeValidators(): void {
    
     // Aplica os validadores apropriados à chave Pix com base no tipo de chave e natureza
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


  // Função que retorna a mensagem de erro de validação para um controle de formulário
  getValidationErrors(control: IFormControl): string {
    const myFormControl = this.dynamicFormGroup.get(control.name);
    // Se o controle for 'keyPix' e houver um erro específico de keyPix, retorna esse erro
    if (control.name === 'keyPix' && this.keyPixError) return this.keyPixError; 

    // Se o controle estiver inválido e já tiver sido tocado, retorna a mensagem de erro correspondente
    if (myFormControl?.invalid && myFormControl?.touched) {
      return control.validators?.find(v => myFormControl.hasError(v.validatorName as string))?.message || '';
    }

    return '';
  }

  onsubmit(): void {
     // Marca todos os campos do formulário como "tocados" para que as validações sejam exibidas
    this.dynamicFormGroup.markAllAsTouched();

    if (this.dynamicFormGroup.valid) {
      const formValue = this.dynamicFormGroup.value;
      const acceptPix = formValue.acceptPix;
      const pixType = formValue.pixType;
      const nature = formValue.nature;

      // Se o pagamento com Pix for marcado no front
      if (acceptPix) {
        if (pixType === PixType.CPF_CNPJ) {
          if (nature === NatureType.Pessoa_fisica) {
            formValue.pixType = "CPF"; 
          } else if (nature === NatureType.Pessoa_Jurídica) {
            formValue.pixType = "CNPJ"; 
          }
        }
        // Se pixType não for CPF ou CNPJ, manter o valor original
      } else {
         // Se o pagamento com Pix não for aceito, limpa os campos 'pixType' e 'keyPix'
        formValue.pixType = "";
        formValue.keyPix = "";
      }
      // Fecha o diálogo passando os valores do formulário
      this.dialogRef.close(formValue);
    }
  }

  // Função chamada ao cancelar a ação, reseta o formulário
  onCancel(): void {
    this.dynamicFormGroup.reset();
  }

  // Função que retorna o placeholder (texto de instrução) para o campo de chave Pix, baseado no tipo de Pix e na natureza
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

  // Função que retorna a máscara de entrada apropriada para o campo chave Pix
  getPixMask(): string | null {
    const pixType = this.dynamicFormGroup.get('pixType')?.value;
    const nature = this.dynamicFormGroup.get('nature')?.value;

    switch (pixType) {
      case PixType.Celular: return '(00) 00000-0000';
      case PixType.CPF_CNPJ: return nature === NatureType.Pessoa_fisica ? '000.000.000-00' : '00.000.000/0000-00';
      default: return null;
    }
  }

  // Função que retorna uma lista de controles de formulário inválidos com seus erros
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

  // Função que escuta mudanças no tipo de Pix e redefine a chave Pix quando o tipo muda
  listenToPixTypeChanges(): void {
    const pixTypeControl = this.dynamicFormGroup.get('pixType');
    pixTypeControl?.valueChanges.subscribe(() => {
      // Redefine o valor do campo keyPix para vazio sempre que o pixType mudar
      this.dynamicFormGroup.get('keyPix')?.setValue('');
    });
  }

}
