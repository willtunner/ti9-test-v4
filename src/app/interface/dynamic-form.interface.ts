export interface IForm {
  formTitle: string
  titlePage: string
  saveBtnTitle: string
  deleteBtnTitle: string
  updateBtnTitle: string
  formControls: IFormControl[]
}

export interface IFormControl {
  name: string
  label: string
  value: string
  type: string
  class?: string
  validators: IValidator[]
  placeholder?: string
  options?: IOptions[]
}

export interface IOptions {
  id: string
  value: string
}

export interface IValidator {
  validatorName?: string
  message?: string
  required?: boolean
  pattern?: string | undefined
  minLength?: number
  maxLength?: number
  email?: string
}

