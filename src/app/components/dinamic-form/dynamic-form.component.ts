import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IForm, IFormControl, IValidator } from '../../interface/supplier.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit {

  form: IForm;
  fb = inject(FormBuilder);
  dynamicFormGroup: FormGroup = this.fb.group({}, {updateOn: 'submit'});

  constructor(
    public dialogRef: MatDialogRef<DynamicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = data;
  }


  ngOnInit(): void {
    console.log('form dinamico', this.form);
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
        formGroup[control.name] = [control.value || '', controlValidators]
      });

      this.dynamicFormGroup = this.fb.group(formGroup);
    }


console.log('acceptPix',this.isPixAccepted());
  }

  onsubmit() {
console.log(this.dynamicFormGroup.value);

  }

  onCancel() {
    this.dynamicFormGroup.reset();
  }

  isPixAccepted(): boolean {
    return this.dynamicFormGroup.get('acceptPix')?.value;
  }

  closeDialog(): void {

    this.dialogRef.close({ name: 'Novo Nome', email: 'novo-email@example.com' });
  }

  // getInvalidControls(): { [key: string]: any } {
  //   const invalidControls: { [key: string]: any } = {};
  //   Object.keys(this.dynamicFormGroup.controls).forEach(key => {
  //     const control = this.dynamicFormGroup.get(key);
  //     if (control && control.invalid) {
  //       invalidControls[key] = control.errors;
  //     }
  //   });
  //   return invalidControls;
  // }

  getValidationErros(control: IFormControl): string {
    const myFormControl = this.dynamicFormGroup.get(control.name);
    let errorMessage = '';
    control.validators.forEach((val) => {
      if(myFormControl?.hasError(val.validatorName as string)) {
        errorMessage = val.message as string;
      }
    });
    return errorMessage;
  }

}


