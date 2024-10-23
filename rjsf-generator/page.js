(function () {
  let pageLayout = {
    main: true,
    aside: true,
    aside_preview: true,
    aside_schema: true
  }
  let initialform = {
    language: 'pt-br'
  }
  let rjsfbuildercards = [
    {
      "cardId": "generalinfo",
      "schema": {
        "type": "object",
        "title": "Configurações Gerais",
        "description": "Nesta seção você deve definir as configurações gerais do formulário que será criado.",
        "properties": {
          "formInfo": {
            "type": "object",
            "title": "Informações do Formulário",
            "properties": {
              "tenant": {
                "type": "string",
                "title": "Tenant",
                "default": "looplex.com.br"
              },
              "form_language": {
                "type": "string",
                "title": "Idioma",
                "enum": [
                  "Português",
                  "Inglês"
                ],
                "default": "Português"
              },
              "form_title": {
                "type": "string",
                "title": "Título do Formulário"
              },
              "form_description": {
                "type": "string",
                "title": "Descrição do Formulário"
              }
            }
          },
          "formProps": {
            "type": "object",
            "title": "Propriedades do Formulário",
            "properties": {
              "formPreset": {
                "type": "string",
                "title": "Pré-definição",
                "enum": [
                  "Assembler",
                  "Work Request"
                ],
                "default": "Assembler"
              },
              "template": {
                "type": "string",
                "title": "Docx do modelo a ser renderizado"
              },
              "showAside": {
                "type": "string",
                "title": "Exibir Painel Lateral?",
                "enum": [
                  "Sim",
                  "Não"
                ],
                "default": "Sim"
              }
            },
            "dependencies": {
              "showAside": {
                "oneOf": [
                  {
                    "properties": {
                      "showAside": {
                        "enum": [
                          "Não"
                        ]
                      }
                    }
                  },
                  {
                    "properties": {
                      "showAside": {
                        "enum": [
                          "Sim"
                        ]
                      },
                      "asidePanel": {
                        "type": "object",
                        "title": "Seções do Painel Lateral",
                        "properties": {
                          "showSummary": {
                            "type": "boolean",
                            "title": "Sumário"
                          },
                          "showPreview": {
                            "type": "boolean",
                            "title": "Pré-visualização"
                          },
                          "showAttachments": {
                            "type": "boolean",
                            "title": "Anexos"
                          },
                          "showVersions": {
                            "type": "boolean",
                            "title": "Versões Anteriores"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          },
          "formAction": {
            "type": "object",
            "title": "Ações do Formulário",
            "properties": {
              "calledAction": {
                "type": "string",
                "title": "Ação a ser executada",
                "description": "O que devemos fazer quando o usuário submeter o Formulário?",
                "enum": [
                  "Salvar como Nova Versão",
                  "Criar um Novo Documento",
                  "Apenas Renderizar o Documento"
                ]
              },
              "executeCode": {
                "type": "object",
                "title": "Executar um Code após envio",
                "properties": {
                  "targetCode": {
                    "type": "string",
                    "title": "ID do Code a ser executado",
                    "hint": "Após enviar o Formulário, vamos executar algum code? Se sim, informe o ID."
                  }
                }
              }
            },
            "dependencies": {
              "calledAction": {
                "oneOf": [
                  {
                    "properties": {
                      "calledAction": {
                        "enum": [
                          "Salvar como Nova Versão"
                        ]
                      }
                    }
                  },
                  {
                    "properties": {
                      "calledAction": {
                        "enum": [
                          "Criar um Novo Documento"
                        ]
                      }
                    }
                  },
                  {
                    "properties": {
                      "calledAction": {
                        "enum": [
                          "Apenas Renderizar o Documento"
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "formInfo": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "tenant": {
                "classNames": "col-md-6"
              },
              "form_language": {
                "classNames": "col-md-6"
              }
            },
            {
              "form_title": {
                "classNames": "col-md-12"
              }
            },
            {
              "form_description": {
                "classNames": "col-md-12"
              }
            }
          ],
          "form_description": {
            "ui:widget": "textarea"
          }
        },
        "formProps": {
          "template": {
            "ui:widget": "filepond"
          }
        }
      },
      "formData": {}
    }
  ]
  let tmpPreviewSchema = [
    {
      "cardId": "newui-primeiro",
      "card_conditions": {},
      "schema": {
        "title": "Partes",
        "type": "object",
        "properties": {
          "strContratada": {
            "required": [
              "nome",
              "cnpj"
            ],
            "title": "Contratada",
            "type": "object",
            "properties": {
              "nome": {
                "type": "string",
                "title": "Nome"
              },
              "cnpj": {
                "type": "string",
                "title": "CNPJ"
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        }
      },
      "partitionKey": "looplex.com.br",
      "formData": {
        "strContratada": {
          "nome": "Octavio Ietsugu",
          "cnpj": "01.002.122/0001-16"
        }
      },
      "priorFormData": {
        "strContratada": {
          "nome": "Octavio Ietsugu",
          "cnpj": "01.002.122/0001-16"
        }
      },
      "tagName": "div"
    },
    {
      "cardId": "newui-segundo",
      "card_conditions": {},
      "dmnStructure": {},
      "schema": {
        "title": "Contratação",
        "type": "object",
        "properties": {
          "strContrato": {
            "title": "Prazo para aviso",
            "type": "object",
            "required": [
              "prazoAvisoVolume"
            ],
            "properties": {
              "prazoAvisoVolume": {
                "type": "number",
                "title": "Prazo para aviso do volume"
              },
              "inicioVigencia": {
                "type": "string",
                "title": "Início da Vigência"
              },
              "fimVigencia": {
                "type": "string",
                "title": "Final da Vigência"
              },
              "prazoPagamento": {
                "type": "number",
                "title": "Prazo para Pagamento"
              },
              "dataExp": {
                "type": "string",
                "title": "Data de Assinatura"
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        }
      },
      "partitionKey": "looplex.com.br",
      "formData": {
        "strContrato": {
          "prazoAvisoVolume": 5,
          "inicioVigencia": "01/12/2024",
          "fimVigencia": "31/12/2024",
          "prazoPagamento": 7,
          "dataExp": "02 de julho de 2024"
        }
      },
      "priorFormData": {
        "strContrato": {
          "prazoAvisoVolume": 5,
          "inicioVigencia": "01/12/2024",
          "fimVigencia": "31/12/2024",
          "prazoPagamento": 7,
          "dataExp": "02 de julho de 2024"
        }
      },
      "tagName": "div"
    }
  ];
  const [previewSchema, setPreviewSchema] = useState(tmpPreviewSchema); // mockado
  /*******************************************************************
   * Renderização da Tela
   * 
   * Abaixo temos a renderização dos elementos na tela, com a 
   * aplicação dos elementos e funções definidos no restante do código
   * 
   *******************************************************************/
  return (
    <div id='layout'>
      <PageHeader />
      <LooplexHeader />

      <div className='container-form'>
            <form method='POST' action='/' >
              <div className={`card ${(pageLayout.main && pageLayout.aside) ? 'card-main-aside' : (pageLayout.main ? 'card-main' : 'card-aside')}`}>
                {pageLayout.main &&
                  (
                    <main className="card-main-wrapper" style={{ width: (pageLayout.aside ? '98%' : '100%') }}>
                      <RJSFBuilder cards={rjsfbuildercards} />
                    </main>
                  )}

                {pageLayout.aside &&
                  (
                    <aside className="card-aside-wrapper">
                      <AsideNavigation  pageLayout={pageLayout} language={initialform.language} />
                      <AsideView previewSchema={previewSchema} />
                    </aside>
                  )}
              </div>
            </form>
      </div>
    </div>
  )

})() // Temos que fechar a function aqui pois usamos funções do parent dentro dos componentes child

/******************************************************
 * Componentes
 * 
 * Abaixo temos os componentes que formam esta página
 ******************************************************/

function PageHeader(){
  return <Head>
    <title>No-Code RJSF Builder</title>
    <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
    <link rel='stylesheet' type='text/css' href='https://bootswatch.com/5/lumen/bootstrap.min.css' />
    <link rel="stylesheet" type='text/css' href='https://looplex-workflows.s3.us-east-1.amazonaws.com/css-form-padrao/ant.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/css-form-padrao/daisy.css' />
    <link rel="stylesheet" type='text/css' href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
    { /** Estilos dos Componentes Utilizados -- INÍCIO */}
      <link rel='stylesheet' type='text/css' href='https://octaviosi.github.io/styles/css/rjsf-generator.css' />
      <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/form/RJSFBuilder/RJSFBuilder.css' />
      <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/form/Carousel/Carousel.css' />
      <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/form/JSONStructureView/JSONStructureView.css' />
    { /** Estilos dos Componentes Utilizados -- FIM */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <script src='https://code.jquery.com/jquery-3.6.3.slim.min.js'></script>
    <script src='https://cdn.tailwindcss.com?plugins=typography'></script>
    <script>{`tailwind.config = {prefix: 'd-' }`}</script>
  </Head>
}
function LooplexHeader(){
  return (
    <div className="looplex-header">
        <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" /><span>No-code RJSF Builder</span>
    </div>
  )
}

/**
 * RJSFBuilder - Parte principal deste programa. Consiste em um formulario que cria toda a 
 * estrutura de um RJSF de forma no-code, usando apenas formulário e definições pré-programadas
 * 
 * folha de estilos: https://looplex.github.io/wf_reactcomponents/form/RJSFBuilder/RJSFBuilder.css
 */
function RJSFBuilder({cards}){
  return <>RJSFBuilder</>
}
