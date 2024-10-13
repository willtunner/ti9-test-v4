export const supplierFormConfig = {
  "formTitle": "Cadastro de fornecedor",
  "saveBtnTitle": "Salvar",
  "deleteBtnTitle": "Deletar",
  "updateBtnTitle": "Atualizar",
  "formControls": [
    {
      "name": "id",
      "label": "Código",
      "value": "",
      "type": "text",
      "class": "",
      "validators": [
        {
          "validatorName": "required",
          "required": true,
          "message": "Campo Obrigatório!"
        },
        {
          "validatorName": "minlength",
          "minLength": 6,
          "message": "Precisa ter no minimo 6 caracteres!"
        }
      ]
    },
    {
      "name": "name",
      "label": "Nome",
      "placeholder": "Digite seu Usuário!",
      "value": "",
      "type": "text",
      "class": "",
      "validators": [
        {
          "validatorName": "required",
          "required": true,
          "message": "Campo Obrigatório!"
        }
      ]
    },
    {
      "name": "nature",
      "label": "Natureza",
      "options": [
        {
          "id": "1",
          "value": "Pessoa fisica"
        },
        {
          "id": "2",
          "value": "Pessoa Jurídica"
        }
      ],
      "type": "select",
      "class": "",
      "validators": [
        {
          "validatorName": "required",
          "required": true,
          "message": "Campo Obrigatório!"
        }
      ]
    },
    {
      "name": "address",
      "label": "Endereço",
      "placeholder": "Endereço...",
      "value": "",
      "type": "text",
      "class": "",
      "validators": [
        {
          "validatorName": "required",
          "required": true,
          "message": "Campo Obrigatório!"
        }
      ]
    },
    {
      "name": "uf",
      "label": "Estado",
      "options": [
        {
          "id": "1",
          "value": "SP"
        },
        {
          "id": "2",
          "value": "PA"
        }
      ],
      "type": "select",
      "class": "",
      "validators": {}
    },
    {
      "name": "active",
      "label": "Ativo",
      "value": "true",
      "type": "toggle",
      "class": "",
      "validators": {}
    },
    {
      "name": "acceptPix",
      "label": "Aceita Pix",
      "value": "false",
      "type": "checkbox",
      "class": "",
      "validators": {}
    },
    {
      "name": "pixType",
      "label": "Tipo da Chave Pix",
      "options": [
        {
          "id": "1",
          "value": "CPF/CNPJ"
        },
        {
          "id": "2",
          "value": "E-mail"
        },
        {
          "id": "3",
          "value": "Celular"
        },
        {
          "id": "4",
          "value": "Chave Aleatória"
        }
      ],
      "type": "select",
      "class": "",
      "validators": {}
    },
    {
      "name": "keyPix",
      "label": "Chave Pix",
      "placeholder": "Digite sua chave pix CPF/CNPJ",
      "value": "",
      "type": "text",
      "class": "",
      "validators": [
        {
          "validatorName": "required",
          "required": true,
          "message": "Campo Obrigatório!"
        },
        {
          "validatorName": "minlength",
          "minLength": 11,
          "message": "Precisa ter no minimo 11 caracteres!"
        },
        {
          "validatorName": "maxlength",
          "maxLength": 14,
          "message": "14 caracteres permitido no maximo!"
        }
      ]
    },
    {
      "name": "obs",
      "label": "Observação",
      "value": "",
      "type": "textarea",
      "class": "",
      "validators": {}
    }
  ]
}
