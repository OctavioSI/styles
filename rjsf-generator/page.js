function App() {
  let pageLayout = {
    main: true,
    aside: true,
    aside_preview: true,
    aside_schema: true
  }
  let initialform = {
    language: 'pt-br'
  }
  let builderSchema = [
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
  const [previewSchema, setPreviewSchema] = useState([]); // mockado
  function definePreviewSchema(newschema) {
    setPreviewSchema(() => newschema)
  }

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
                  <RJSFBuilder schemacards={builderSchema} definePreviewSchema={definePreviewSchema} />
                </main>
              )}

            {pageLayout.aside &&
              (
                <aside className="card-aside-wrapper">
                  <AsidePanel pageLayout={pageLayout} language={initialform.language} codeId={props.codeId} previewSchema={previewSchema} />
                </aside>
              )}
          </div>
        </form>
      </div>
    </div>
  )
}

/** Renderização do aplicativo */
(function () {
  return <App />
})()

/******************************************************
 * Componentes
 * 
 * Abaixo temos os componentes que formam esta página
 ******************************************************/

function PageHeader() {
  return <Head>
    <title>No-Code RJSF Builder</title>
    <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
    <link rel='stylesheet' type='text/css' href='https://bootswatch.com/5/lumen/bootstrap.min.css' />
    <link rel="stylesheet" type='text/css' href='https://looplex-workflows.s3.us-east-1.amazonaws.com/css-form-padrao/ant.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/css-form-padrao/daisy.css' />
    <link rel="stylesheet" type='text/css' href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
    { /** Estilos dos Componentes Utilizados -- INÍCIO */}
    <link rel='stylesheet' type='text/css' href='https://octaviosi.github.io/styles/css/rjsf-generator.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/RJSFBuilder/RJSFBuilder.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/CarouselView/CarouselView.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/JSONStructureView/JSONStructureView.css' />
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
function LooplexHeader() {
  return (
    <div className="looplex-header">
      <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" /><span>No-code RJSF Builder</span>
    </div>
  )
}
function AsidePanel({ pageLayout, language, previewSchema }) {
  const [panelView, setPanelView] = useState('schema')
  function updatePanelView(option) {
    setPanelView(() => option)
  }
  function AsideNavigation({ pageLayout, language, panelView, updatePanelView }) {
    return (
      <div className="card-navigation">
        {(pageLayout.aside_preview) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'preview' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('preview') }}>{(language === 'en_us') ? 'Preview Form' : 'Prévia do Form'}</button>)}
        {(pageLayout.aside_schema) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'schema' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('schema') }}>{(language === 'en_us') ? 'RJSF Schema' : 'RJSF Schema'}</button>)}
      </div>
    )
  }
  function AsideView({ panelView, previewSchema }) {
    return (
      <div className="card-aside-view">
        {(panelView == 'preview') && (<div className="preview-form"><CarouselView schemacards={previewSchema} language="pt-br" codeId={props.codeId} /></div>)}
        {(panelView == 'schema') && (<JSONStructureView json={previewSchema} />)}
      </div>
    )
  }
  return (
    <>
      <AsideNavigation pageLayout={pageLayout} language={language} panelView={panelView} updatePanelView={updatePanelView} />
      <AsideView previewSchema={previewSchema} panelView={panelView} />
    </>
  )
}

/**
 * RJSFBuilder - Parte principal deste programa. Consiste em um formulario que cria toda a 
 * estrutura de um RJSF de forma no-code, usando apenas formulário e definições pré-programadas
 * 
 * folha de estilos: https://looplex.github.io/wf_reactcomponents/form/RJSFBuilder/RJSFBuilder.css
 */
function RJSFBuilder({ schemacards, language = 'pt-br', codeId = props.codeId, definePreviewSchema }) {
  /**
   * Definicoes do componente
   */
  const [activeCard, setActiveCard] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cards, setCards] = useState(schemacards)
  const [allLoadedCards, setAllLoadedCards] = useState([])
  const carouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const isLoadingRemoteSchema = useRef(false);
  const cardInfoFormData = useRef({});
  const cardConditionFormData = useRef({});
  const cardSectionFormData = useRef({});
  const cardFieldsFormData = useRef({});
  const cardDefinitionsFormData = useRef({});
  const cardAutofillFormData = useRef({});
  const cardAutofillMapFormData = useRef({});
  const cardLambdaFormData = useRef({});
  const cardLambdaMapFormData = useRef({});
  const availableDefinitions = useRef({});
  const availableAFDefinitions = useRef({});
  const availableLbDefinitions = useRef({});
  const usedDefinitions = useRef({});
  const usedAFDefinitions = useRef({});
  const usedLbDefinitions = useRef({});
  let payloadFormData = {};
  /** Hooks - INÍCIO */
  useEffect(() => {
    // Definicoes que o usuário pode acessar
    // Temos que ter um endpoint de listagem de 
    // definições disponíveis
    availableDefinitions.current = {
      "qualificacao": "Qualificação de uma parte",
      "foro": "Foro ou Comarca"
    }
    // a usedDefinitions tem os valores já baixados
    // do servidor (tem a definition completa)
    usedDefinitions.current = {
      "foro": {
        "defs": {
          "foro": {
            "type": "object",
            "properties": {
              "comarca": {
                "type": "string"
              }
            },
            "required": []
          }
        },
        "uiSchema": {}
      },
      "qualificacao": {
        "defs": {
          "qualificacao": {
            "type": "object",
            "properties": {
              "nome": {
                "type": "string"
              },
              "cpf": {
                "type": "object",
                "$ref": "#/definitions/cpf"
              },
              "nacionalidade": {
                "type": "string"
              },
              "estadoCivil": {
                "type": "string",
                "title": "Estado civil",
                "default": "Solteiro",
                "enum": [
                  "Solteiro",
                  "Casado",
                  "Separado",
                  "Divorciado",
                  "Viúvo"
                ]
              },
              "endereco": {
                "title": "O Endereço",
                "type": "object",
                "$ref": "#/definitions/endereco"
              }
            },
            "required": [
              "nome",
              "cpf",
              "nacionalidade",
              "estadoCivil",
              "endereco"
            ]
          },
          "endereco": {
            "title": "Endereço",
            "type": "object",
            "properties": {
              "cep": {
                "type": "string",
                "title": "CEP"
              },
              "cidade": {
                "type": "string",
                "title": "Cidade"
              },
              "estado": {
                "type": "string",
                "$ref": "#/definitions/uf"
              },
              "logradouro": {
                "type": "string",
                "title": "Logradouro"
              },
              "numero": {
                "type": "string",
                "title": "Número"
              },
              "complemento": {
                "type": "string",
                "title": "Complemento"
              },
              "bairro": {
                "type": "string",
                "title": "Bairro"
              }
            },
            "required": [
              "cep",
              "cidade",
              "estado",
              "logradouro",
              "numero",
              "bairro"
            ]
          },
          "cpf": {
            "type": "object",
            "properties": {
              "numero": {
                "type": "string"
              }
            },
            "required": [
              "numero"
            ]
          },
          "uf": {
            "type": "string",
            "enum": [
              "AC",
              "AL",
              "AP",
              "AM",
              "BA",
              "CE",
              "DF",
              "ES",
              "GO",
              "MA",
              "MT",
              "MS",
              "MG",
              "PB",
              "PA",
              "PE",
              "PI",
              "RJ",
              "RN",
              "RS",
              "RO",
              "RR",
              "SC",
              "SE",
              "SP",
              "TO"
            ]
          }
        },
        "uiSchema": {
          "qualificacao": {
            "endereco": {},
            "cpf": {
              "numero": {
                "ui:widget": "masked",
                "ui:options": {
                  "mask": "999.999.999-99",
                  "type": "cpf"
                }
              }
            }
          }
        }
      }
    }

    availableAFDefinitions.current = {
      "cep": "CEP",
      "cnpj": "CNPJ"
    }
    usedAFDefinitions.current = {
      "cep": {
        "url": "https://brasilapi.com.br/api/cep/v1/{{{postalCode}}}",
        "trigger": "postalCode",
        "responsemap": {
          "street": "",
          "neighborhood": "",
          "city": "",
          "state": ""
        }
      },
      "cnpj": {
        "url": "https://brasilapi.com.br/api/cnpj/v1/{{{cnpjNumber}}}",
        "trigger": "cnpjNumber",
        "responsemap": {
          "cnpj": "",
          "identificador_matriz_filial": "",
          "descricao_matriz_filial": "",
          "razao_social": "",
          "nome_fantasia": "",
          "situacao_cadastral": "",
          "descricao_situacao_cadastral": "",
          "data_situacao_cadastral": "",
          "motivo_situacao_cadastral": "",
          "nome_cidade_exterior": "",
          "codigo_natureza_juridica": "",
          "data_inicio_atividade": "",
          "cnae_fiscal": "",
          "cnae_fiscal_descricao": "",
          "descricao_tipo_de_logradouro": "",
          "logradouro": "",
          "numero": "",
          "complemento": "",
          "bairro": "",
          "cep": "",
          "uf": "",
          "codigo_municipio": "",
          "municipio": "",
          "ddd_telefone_1": "",
          "ddd_telefone_2": "",
          "ddd_fax": "",
          "qualificacao_do_responsavel": "",
          "capital_social": "",
          "porte": "",
          "descricao_porte": "",
          "opcao_pelo_simples": "",
          "data_opcao_pelo_simples": "",
          "data_exclusao_do_simples": "",
          "opcao_pelo_mei": "",
          "situacao_especial": "",
          "data_situacao_especial": ""
        }
      }
    }
    /**
     * TODO: configurar algumas Lambda padrão
     */    
    availableLbDefinitions.current = {
      "cep": "CEP",
      "cnpj": "CNPJ"
    }
    usedLbDefinitions.current = {
      "cep": {
        "url": "https://brasilapi.com.br/api/cep/v1/{{{postalCode}}}",
        "trigger": "postalCode",
        "responsemap": {
          "street": "",
          "neighborhood": "",
          "city": "",
          "state": ""
        }
      },
      "cnpj": {
        "url": "https://brasilapi.com.br/api/cep/v1/{{{postalCode}}}",
        "trigger": "postalCode",
        "responsemap": {
          "street": "",
          "neighborhood": "",
          "city": "",
          "state": ""
        }
      }
    }
  }, []);
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [activeCard]);
  useEffect(() => {
    // console.log('cards updated!')
    updatePreviewSchema()
  }, [cards])
  /** Hooks - FIM */

  /** Component Helpers - INICIO */
  // Timer
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
  // Funcao que verifica se o objeto é vazio
  function isObjectEmpty(objectName) {
    return JSON.stringify(objectName) === '{}'
  }
  // Monta a estrutura do objeto JSON
  function assembleJSONObjectStructure(source) {
    let obj = JSON.parse(JSON.stringify(source))
    // iterate over the property names
    Object.keys(obj).forEach(function (k) {
      // slip the property value based on `.`
      var prop = k.split('.');
      let is_single_prop = false;
      if (prop.length === 1) {
        is_single_prop = true;
      }
      // get the last value from array
      var last = prop.pop();
      // iterate over the remaining array value 
      // and define the object if not already defined
      prop.reduce(function (o, key) {
        // define the object if not defined and return
        return o[key] = o[key] || {};
        // set initial value as object
        // and set the property value
      }, obj)[last] = obj[k];
      // delete the original property from object
      if (!is_single_prop)
        delete obj[k];
    });
    return obj
  }
  // Checa se um valor existe no Objeto JSON
  function isValueInObject(searchObject, referenceObject) {
    function get(obj, path) {
      return path.split('.').reduce((r, e) => {
        if (!r) return r
        else return r[e] || undefined
      }, obj)
    }
    function compare(a, b, prev = "") {
      return Object.keys(a).reduce((r, e) => {
        const path = prev + (prev ? '.' + e : e);
        const value = a[e] === get(b, path);

        if (typeof a[e] === 'object') {
          r = compare(a[e], b, path)
        } else {
          r = value
        }
        return r;
      }, false)
    }
    return compare(searchObject, referenceObject);
  }
  function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  function setCorrectDefaultType(value, type) {
    switch (type) {
      case 'boolean':
        return (value === 'true' ? true : false);
      case 'integer':
        return parseInt(value);
      case 'number':
        return Number(value);
      case 'object':
        return {};
      default:
        return value;
    }
  }
  /** Component Helpers - FIM*/

  /** Funções do Componente - INÍCIO */
  // executa uma DMN -- precisa do endpoint no post.js
  async function runDMN(formData, dmnStructure, tenant) {
    // formData é a variável com o objeto de respostas atuais do formulário
    // dmnStrucutre é o atributo dmn do card (contém dmnID e map)
    let { id, map } = dmnStructure
    let dmnVariables = {};
    for (let i in map) {
      dmnVariables[i] = map[i].split('.').reduce(
        (preview, current) => preview[current],
        formData
      )
    }
    try {
      let data = {
        command: "runDMN",
        tenant: tenant,
        id: id,
        variables: dmnVariables
      };
      let config = {
        method: 'post',
        url: `/api/code/${codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        return res.data.output.output;
      }
    } catch (e) {
      throw new Error('Erro ao executar DMN')
    }
  }
  // Essa função é utilizada para definir os cards que deverão ser exibidos
  function defineSchema(initialcards = [], cardId = '', formData = {}) {
    let tmpcards = [];
    // Aqui vamos carregar cards que tenham sido carregados na memória (no lugar o arquivo rjsf)
    if (initialcards && initialcards.length > 0) {
      tmpcards = initialcards;
    }
    // Antes de atualizar a exibição, vamos atualizar o 
    // formData caso fornecido para um card
    tmpcards.forEach(cd => {
      if (cd.cardId === cardId) {
        cd.formData = formData
      }
    })
    // Aqui vamos definir uma variavel com todos os dados dos cards,
    // agrupados por scope. Se não houver scope, vamos jogar para a 
    // raiz do formData
    // Antes de montar o FormData, vamos passar pelo schema e criar as propriedades que não existirem
    for (let i = 0; i < tmpcards.length; i++) {
      let tmpschema = tmpcards[i].schema;
      for (const property in tmpschema.properties) {
        switch (tmpschema.properties[property].type) {
          case 'string':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = '';
            }
            break;
          case 'number':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = 0;
            }
            break;
          case 'array':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = [];
            }
            break;
          case 'object':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = {};
            }
            break;
        }
      }
    }

    let mergedFormData = {}
    for (let i = 0; i < tmpcards.length; i++) {
      let tcard = tmpcards[i];
      if (tcard.scope && tcard.scope !== '') {
        mergedFormData[tcard.scope] = { ...tcard.formData }
      } else {
        mergedFormData = { ...mergedFormData, ...tcard.formData }
      }
    }
    // Para cada card, vamos verificar as condicoes para exibicao
    let cards2Show = [];
    // return tmpcards
    tmpcards.forEach(cd => {
      /**  Se eu nao tiver "card_conditions" ou se as "card_conditions" 
       * forem vazias, vamos mostrar o card
      */
      if (!cd.hasOwnProperty('card_conditions') || cd.card_conditions == undefined || cd.card_conditions == 'undefined' || (cd.hasOwnProperty('card_conditions') && isObjectEmpty(cd.card_conditions))) {
        cards2Show.push(cd);
      } else {
        // Se temos "card_conditions", vamos verificar se todas estão 
        // em nosso parâmetro fornecido e se o valor é compatível
        if (cd.hasOwnProperty('card_conditions') && !isObjectEmpty(cd.card_conditions)) {
          let includeInDeck = true;
          let formatted_card_conditions = assembleJSONObjectStructure(cd.card_conditions)
          for (const card_condition in formatted_card_conditions) {
            let searchObj = {};
            searchObj[card_condition] = formatted_card_conditions[card_condition];
            let exists = isValueInObject(searchObj, mergedFormData);
            if (!exists) { includeInDeck = false; }// Entao nao incluimos no deck
          }
          if (includeInDeck) cards2Show.push(cd)
        }
      }
    })
    // Ao final, retornamos o array com cards que atendem as conditions
    return cards2Show;
  }
  // Carrega um schema remoto, que está armazenado no cosmosDB
  // Precisa do endpoint fetchSchema no post.js
  async function loadRemoteSchema(id, cardId, formData, scope = '', card_conditions = {}, tenant = 'looplex.com.br', codeId = '') {
    let documentDetails = {};
    async function fetchRemoteSchema() {
      let data = {
        command: "fetchSchema",
        tenant: tenant,
        id: id
      };
      let config = {
        method: 'post',
        url: `/api/code/${codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        let newCard = {};
        let iSchema = {};
        let tmpCards = allLoadedCards;
        if (res.data.output.hasOwnProperty('cards') && Array.isArray(res.data.output.cards)) { // É um array, não um objeto
          let tmpcardsarray = res.data.output.cards;
          for (let i = 0; i < tmpcardsarray.length; i++) {
            iSchema = tmpcardsarray[i];
            newCard = {
              cardId: iSchema.cardId,
              partitionKey: iSchema.partitionKey,
              card_conditions: iSchema.card_conditions,
              scope: iSchema.scope,
              dmnStructure: iSchema.dmnStructure,
              schema: iSchema.schema,
              uiSchema: iSchema.uiSchema,
              formData: {},
              tagName: 'div'
            }
            tmpCards.push(newCard);
          }
        } else { // Tenho só o objeto de um card
          iSchema = res.data.output;
          newCard = {
            cardId: iSchema.id,
            card_conditions: card_conditions,
            scope: (scope && scope != '') ? scope : '',
            dmnStructure: iSchema.dmnStructure,
            schema: iSchema.schema,
            uiSchema: iSchema.uiSchema,
            formData: {},
            tagName: 'div'
          };
          tmpCards.push(newCard);
        }
        setAllLoadedCards(() => tmpCards) // criando um local que tem todas as cards, exibidas ou não        
        let newCards;
        // setTmpVisor(newCards)
        if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
          newCards = defineSchema(loadPriorFormData(documentDetails, true), cardId, formData);
        } else {
          newCards = defineSchema(tmpCards, cardId, formData)
        }
        setCards(() => newCards)
      }
      setIsLoading(false)
    }
    let maxAttempts = 3;
    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      if (isLoadingRemoteSchema.current) {
        // console.log('mounted');
      } else {
        // console.log('mounting');
        isLoadingRemoteSchema.current = true;
        setIsLoading(true);
        fetchRemoteSchema()
          .then(res => {
            countAttempts = maxAttempts;
            console.log('Remote Schema loaded successfully. Attempt: ' + countAttempts)
            setIsLoading(false);
          })
          .catch(err => { // Se houver erro em carregar o formulario inicial, vamos tentar de novo
            setIsLoading(false);
            if (countAttempts >= maxAttempts) {
              setTmpVisor('Erro ao carregar o formulário remoto: ' + err.message)
            }
            sleep(500);
          });
      }
      if (countAttempts == maxAttempts) break;
    }
  }
  // Busca o formData que será exibido como valor anterior
  function loadPriorFormData(docdetails, keepFormData = false) {
    let currentVersion = docdetails.versions.filter(v => v.version == docdetails.currentVersion);
    let formDataComplete = {};
    if (currentVersion && currentVersion.length > 0) {
      formDataComplete = currentVersion[0].formData;
    }
    // console.log('formDataComplete', formDataComplete)
    let priorDataCards = allLoadedCards.map((card) => {
      // Para cada schema no card, vou montar o objeto de prior correspondente
      let priorData = {}
      if (card.hasOwnProperty('schema') && card.schema.hasOwnProperty('properties')) {
        for (const property in card.schema.properties) {
          priorData[property] = formDataComplete[property];
        }
      }
      let loadedFormData = priorData
      if (keepFormData) {
        let loadedcard = cards.filter(cd => cd.cardId === card.cardId);
        if (loadedcard && loadedcard.length > 0)
          loadedFormData = loadedcard[0].formData
      }
      return {
        ...card,
        priorFormData: priorData,
        formData: loadedFormData
      }
    })
    return priorDataCards
  }
  // Chamado sempre que o botão de próxima ou anterior for clicado
  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    let canRunDMN = true;
    let dmnVariables = {};
    // Temos uma DMN na estrutura do Card (carregamento de cards progressivo)
    if (dmnStructure && !isObjectEmpty(dmnStructure)) {
      console.log('Tem uma DMN aqui...')
      for (let dmnInput in dmnStructure.map) {
        dmnVariables[dmnInput] = dmnStructure.map[dmnInput].split('.').reduce(
          (preview, current) => preview[current],
          formData
        )
      }
      // setTmpVisor(JSON.stringify(dmnVariables))
      for (let [dmnInput2, localVar] of Object.entries(dmnStructure.map)) {
        if (dmnVariables[dmnInput2] === undefined) {
          canRunDMN = false;
        }
      }
      if (canRunDMN) {
        console.log('Can run DMN')
        setIsLoading(true)
        let arrayIDs = await runDMN(formData, dmnStructure, load_card['partitionKey'])
        if (arrayIDs && arrayIDs.length > 0 && arrayIDs[0].cardID) {
          let current_ID = arrayIDs[0].cardID
          let scope = arrayIDs[0].scope
          let card_conditions = (arrayIDs[0].card_conditions && arrayIDs[0].card_conditions !== '') ? JSON.parse(arrayIDs[0].card_conditions) : {};
          let card_loaded = cards.filter(cd => cd.cardId === current_ID);
          if (!card_loaded || card_loaded.length === 0) {
            await loadRemoteSchema(current_ID, cardId, formData, scope, card_conditions)
            isLoadingRemoteSchema.current = false;
          }
          setIsLoading(false)
        } else {
          setIsLoading(false)

        }
      }
    }
    setCards(prev => {
      let tmpCards = [...prev]
      let nextState = defineSchema(tmpCards, cardId, formData)
      return nextState
    })
    if (cards.length > 1) {
      setActiveCard((currentActive) => {
        let moveLeft = Math.max(0, currentActive - 1);
        let moveRight = Math.min(cards.length - 1, currentActive + 1);
        return (cardTargetIdx === 'moveLeft' ? moveLeft : moveRight)
      })
    }
  }
  /**
   * Alteracao na pagina inicial do formulario (configuracoes do Builder)
   */
  async function handleChangeEvent(cardId, formData, fieldId) {
    return
  }
  async function handleChangeCardInfoEvent(cardId, formData) {
    if (!cardId) return
    cardInfoFormData.current[cardId] = formData
  }
  async function handleBlurCardInfoEvent(cardId) {
    if (!cardId) return
    // Ao dar o blur, vamos atualizar o formData do card todo
    let cardFD = cards.filter(cd => cd.cardId === cardId)[0].formData;
    cardFD.card = cardInfoFormData.current[cardId].card;
    setCards(prev => {
      let tmpCards = [...prev]
      let nextState = defineSchema(tmpCards, cardId, cardFD)
      return nextState
    })
  }
  async function handleChangeCardConditionsEvent(cardId, formData, conditionId) {
    if (!cardId) return
    if (!cardConditionFormData.current.hasOwnProperty(cardId)) cardConditionFormData.current[cardId] = {}
    cardConditionFormData.current[cardId][conditionId] = {
      "id": conditionId,
      "variable": formData.conditionvar ? formData.conditionvar : '',
      "value": formData.conditionvalue ? formData.conditionvalue : ''
    }
  }
  async function handleBlurCardConditionsEvent(cardId, conditionId) {
    if (!cardId) return
    // Ao dar o blur, vamos atualizar os cardConditions
    let cardCdn = cards.filter(cd => cd.cardId === cardId)[0];
    let cardCdnIdx = cards.indexOf(cardCdn);
    if (!cardCdn.hasOwnProperty('cardConditionsRules')) {
      cardCdn.cardConditionsRules = [];
    }
    let condition = cardCdn.cardConditionsRules.filter(cc => cc.id === conditionId);
    if (condition.length > 0) {
      let conditionIdx = cardCdn.cardConditionsRules.indexOf(condition[0]);
      cardCdn.cardConditionsRules[conditionIdx] = cardConditionFormData.current[cardId][conditionId]
    } else {
      cardCdn.cardConditionsRules.push(cardConditionFormData.current[cardId][conditionId])
    }
    setCards(prev => {
      let tmpCards = [...prev]
      tmpCards[cardCdnIdx] = cardCdn
      return tmpCards
    })
  }
  async function handleChangeSectionEvent(cardId, formData, sectionId) {
    if (!cardId) return
    if (!cardSectionFormData.current.hasOwnProperty(cardId)) cardSectionFormData.current[cardId] = {}
    cardSectionFormData.current[cardId][sectionId] = {
      "id": sectionId,
      "name": formData.section?.display ? formData.section?.display : '',
      "description": formData.section?.description ? formData.section?.description : ''
    }
  }
  async function handleBlurSectionEvent(cardId, sectionId) {
    if (!cardId) return
    // Ao dar o blur, vamos atualizar as Sections
    let cardSection = cards.filter(cd => cd.cardId === cardId)[0];
    let cardSectionIdx = cards.indexOf(cardSection);
    if (!cardSection.hasOwnProperty('cardSections')) {
      cardSection.cardSections = [];
    }
    let section = cardSection.cardSections.filter(cc => cc.id === sectionId);
    let sectionIdx = 0;
    if (section.length > 0) {
      sectionIdx = cardSection.cardSections.indexOf(section[0]);
      cardSection.cardSections[sectionIdx] = { ...cardSection.cardSections[sectionIdx], ...(cardSectionFormData.current[cardId][sectionId]) }
    } else {
      sectionIdx = cardSection.cardSections.length;
      cardSection.cardSections.push(cardSectionFormData.current[cardId][sectionId])
    }
    // Adicionar ao cardSection as rows se existirem (para reconstituir o objeto)
    setCards(prev => {
      let tmpCards = [...prev]
      tmpCards[cardSectionIdx] = cardSection
      return tmpCards
    })
  }
  async function handleChangeSectionRowFieldEvent(cardId, formData, sectionId, rowId, fieldId, path) {
    if (!cardId) return
    if (!cardFieldsFormData.current.hasOwnProperty(cardId)) cardFieldsFormData.current[cardId] = {}
    if (!cardFieldsFormData.current[cardId].hasOwnProperty(sectionId)) cardFieldsFormData.current[cardId][sectionId] = {}
    if (!cardFieldsFormData.current[cardId][sectionId].hasOwnProperty(rowId)) cardFieldsFormData.current[cardId][sectionId][rowId] = {}
    /**
     * Abaixo para lógica recursiva de subcampos de campos
     */
    let pathObj = (basePath, remainingPath, field) => {
      if (remainingPath && remainingPath.length > 0) {
        if (!basePath.hasOwnProperty(remainingPath[0])) basePath[remainingPath[0]] = {}
        basePath[remainingPath[0]] = { ...basePath[remainingPath[0]], ...pathObj(basePath[remainingPath[0]], remainingPath.shift()) }
      } else { // ultimo item do path, vamos registrar o item
        basePath[field.id] = field
      }
      return basePath
    }
    let fielditem = {
      "id": fieldId,
      "name": formData.section?.display ? formData.section?.display : '',
      "description": formData.section?.description ? formData.section?.description : '',
      "colsize": formData.section?.colsize ? formData.section?.colsize : '12',
      "defaultvalue": formData.section?.defaultvalue ? formData.section?.defaultvalue : '',
      "fieldtype": formData.section?.fieldtype ? formData.section?.fieldtype : '',
      "fieldmask": formData.section?.fieldmask ? formData.section?.fieldmask : '',
      "maskvalue": formData.section?.maskvalue ? formData.section?.maskvalue : ''
    }
    if (path && path.length > 0) {
      let baseFD = cardFieldsFormData.current[cardId][sectionId][rowId];
      cardFieldsFormData.current[cardId][sectionId][rowId] = { ...pathObj(baseFD, path, fielditem) }
    } else { // Estou na raiz
      if (!cardFieldsFormData.current[cardId][sectionId][rowId].hasOwnProperty(fieldId)) cardFieldsFormData.current[cardId][sectionId][rowId][fieldId] = {}
      cardFieldsFormData.current[cardId][sectionId][rowId][fieldId] = fielditem
    }
  }
  async function handleBlurSectionRowFieldEvent(cardId, sectionId, rowId, fieldId) {
    if (!cardId) return
    // Ao dar o blur, vamos atualizar as Sections
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    let cardSectionRow = cardSection.rows.filter(cs => cs.id === rowId)[0];
    let cardSectionRowIdx = cardSection.rows.indexOf(cardSectionRow);
    let cardSectionRowFields = cardSectionRow.fields.filter(cf => cf.id === fieldId);
    let fieldIdx = 0;
    if (cardSectionRowFields.length > 0) {
      fieldIdx = cardSectionRow.fields.indexOf(cardSectionRowFields[0]);
      cardSectionRow.fields[fieldIdx] = cardFieldsFormData.current[cardId][sectionId][rowId][fieldId]
    } else {
      fieldIdx = cardSectionRowFields.fields.length;
      cardSectionRow.fields.push(cardFieldsFormData.current[cardId][sectionId][rowId][fieldId])
    }
    setCards(prev => {
      let tmpCards = [...prev]
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].rows[cardSectionRowIdx].fields = cardSectionRow.fields
      return tmpCards
    })
  }
  async function handleChangeSectionDefinitionEvent(cardId, formData, sectionId, definitionId) {
    if (!cardId) return
    if (!cardDefinitionsFormData.current.hasOwnProperty(cardId)) cardDefinitionsFormData.current[cardId] = {}
    if (!cardDefinitionsFormData.current[cardId].hasOwnProperty(sectionId)) cardDefinitionsFormData.current[cardId][sectionId] = {}
    cardDefinitionsFormData.current[cardId][sectionId][definitionId] = {
      "id": definitionId,
      "definition": formData.definition,
      "title": formData.deftitle,
      "description": formData.defdescription,
      "type": "definition"
    }
  }
  async function handleBlurSectionDefinitionEvent(cardId, sectionId, definitionId) {
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    let cardSectionDefinition = cardSection.rows.filter(cs => cs.id === definitionId);
    let definitionIdx = 0;
    if (cardSectionDefinition.length > 0) {
      definitionIdx = cardSection.rows.indexOf(cardSectionDefinition[0]);
      cardSection.rows[definitionIdx] = cardDefinitionsFormData.current[cardId][sectionId][definitionId]
    } else {
      definitionIdx = cardSection.rows.length;
      cardSection.rows.push(cardDefinitionsFormData.current[cardId][sectionId][definitionId])
    }
    setCards(prev => {
      let tmpCards = [...prev];
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].rows = cardSection.rows
      return tmpCards
    })
  }
  async function handleChangeSectionAutofillEvent(cardId, formData, sectionId) {
    if (!cardId) return
    if (!cardAutofillFormData.current.hasOwnProperty(cardId)) cardAutofillFormData.current[cardId] = {}
    if (!cardAutofillFormData.current[cardId].hasOwnProperty(sectionId)) cardAutofillFormData.current[cardId][sectionId] = {}
    // Verificar se o item que alterou é o do preset de autofill
    if (
      (!cardAutofillFormData.current[cardId][sectionId].hasOwnProperty('autofill')) || (cardAutofillFormData.current[cardId][sectionId].hasOwnProperty('autofill') && cardAutofillFormData.current[cardId][sectionId].autofill !== formData.autofill) // O autofill que esta no ref é diferente do formData, entao eu estou mudando o tipo preset
    ) {
      cardAutofillFormData.current[cardId][sectionId] = {
        ...cardAutofillFormData.current[cardId][sectionId],
        "autofill": formData.autofill,
        "url": formData.url,
        "trigger": formData.trigger,
        "changedpreset": true
      }
    } else { // Estou alterando outro campo do autofill que nao o preset
      cardAutofillFormData.current[cardId][sectionId] = {
        ...cardAutofillFormData.current[cardId][sectionId],
        "autofill": formData.autofill,
        "url": formData.url,
        "trigger": formData.trigger,
        "changedpreset": false
      }
    }
  }
  async function handleBlurSectionAutofillEvent(cardId, sectionId) {
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    cardSection.autofill = cardAutofillFormData.current[cardId][sectionId]
    // Ao mudar o tipo de autofill, vamos carregar as variaveis remotas para montar a correspondencia
    if (!cardSection.autofill?.autofill || cardSection.autofill?.autofill === '') {
      cardSection.autofill.url = '';
      cardSection.autofill.trigger = '';
      cardSection.autofill.map = [];
    } else {
      if (cardSection.autofill.changedpreset) {
        if (usedAFDefinitions.current.hasOwnProperty(cardSection.autofill?.autofill)) {
          let selectedAFOption = usedAFDefinitions.current[cardSection.autofill.autofill];
          cardSection.autofill.url = selectedAFOption.url;
          cardSection.autofill.trigger = selectedAFOption.trigger;
          let respmap = [];
          for (const [remote, local] of Object.entries(selectedAFOption.responsemap)) {
            respmap.push({
              "id": makeid(5),
              "remote": remote,
              "local": local
            })
          }
          cardSection.autofill.map = respmap;
        }
      }
    }
    setCards(prev => {
      let tmpCards = [...prev];
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].autofill = cardSection.autofill
      return tmpCards
    })
  }
  async function handleChangeSectionAutofillMapEvent(cardId, formData, sectionId, afmapId) {
    if (!cardId) return
    if (!cardAutofillMapFormData.current.hasOwnProperty(cardId)) cardAutofillMapFormData.current[cardId] = {}
    if (!cardAutofillMapFormData.current[cardId].hasOwnProperty(sectionId)) cardAutofillMapFormData.current[cardId][sectionId] = {}
    if (!cardAutofillMapFormData.current[cardId][sectionId].hasOwnProperty(afmapId)) cardAutofillMapFormData.current[cardId][sectionId][afmapId] = {}

    cardAutofillMapFormData.current[cardId][sectionId][afmapId] = {
      "id": afmapId,
      "remote": formData.autofillremote ? formData.autofillremote : '',
      "local": formData.autofilllocal ? formData.autofilllocal : ''
    }
  }
  async function handleBlurSectionAutofillMapEvent(cardId, sectionId, afmapId) {
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    if (cardSection.hasOwnProperty('autofill')) {
      let afmapIdx = 0;
      let cardSectionAFMap = cardSection.autofill.map.filter(af => af.id === afmapId);
      if (cardSectionAFMap.length > 0) {
        afmapIdx = cardSection.autofill.map.indexOf(cardSectionAFMap[0]);
        cardSection.autofill.map[afmapIdx] = cardAutofillMapFormData.current[cardId][sectionId][afmapId]
      } else {
        definitionIdx = cardSection.autofill.map.length;
        cardSection.autofill.map.push(cardAutofillMapFormData.current[cardId][sectionId][afmapId])
      }
    } else {
      cardSection.autofill = cardAutofillFormData.current[cardId][sectionId]
    }
    setCards(prev => {
      let tmpCards = [...prev];
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].autofill.map = cardSection.autofill.map
      return tmpCards
    })
  }
  async function handleChangeSectionLambdaEvent(cardId, formData, sectionId) {
    if (!cardId) return
    if (!cardLambdaFormData.current.hasOwnProperty(cardId)) cardLambdaFormData.current[cardId] = {}
    if (!cardLambdaFormData.current[cardId].hasOwnProperty(sectionId)) cardLambdaFormData.current[cardId][sectionId] = {}
    // Verificar se o item que alterou é o do preset de lambda
    if (
      (!cardLambdaFormData.current[cardId][sectionId].hasOwnProperty('lambda')) || (cardLambdaFormData.current[cardId][sectionId].hasOwnProperty('lambda') && cardLambdaFormData.current[cardId][sectionId].lambda !== formData.lambda) // O lambda que esta no ref é diferente do formData, entao eu estou mudando o tipo preset
    ) {
      cardLambdaFormData.current[cardId][sectionId] = {
        ...cardLambdaFormData.current[cardId][sectionId],
        "lambda": formData.lambda,
        "code": formData.code,
        "trigger": formData.trigger,
        "changedpreset": true
      }
    } else { // Estou alterando outro campo do autofill que nao o preset
      cardLambdaFormData.current[cardId][sectionId] = {
        ...cardLambdaFormData.current[cardId][sectionId],
        "lambda": formData.lambda,
        "code": formData.code,
        "trigger": formData.trigger,
        "changedpreset": false
      }
    }
  }
  async function handleBlurSectionLambdaEvent(cardId, sectionId) {
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    cardSection.lambda = cardLambdaFormData.current[cardId][sectionId]
    // Ao mudar o tipo de autofill, vamos carregar as variaveis remotas para montar a correspondencia
    if (!cardSection.lambda?.lambda || cardSection.lambda?.lambda === '') {
      cardSection.lambda.code = '';
      cardSection.lambda.trigger = '';
      cardSection.lambda.map = [];
    } else {
      if (cardSection.lambda.changedpreset) {
        if (usedLbDefinitions.current.hasOwnProperty(cardSection.lambda?.lambda)) {
          let selectedLbOption = usedLbDefinitions.current[cardSection.lambda.lambda];
          cardSection.lambda.code = selectedLbOption.code;
          cardSection.lambda.trigger = selectedLbOption.trigger;
          let respmap = [];
          for (const [remote, local] of Object.entries(selectedLbOption.responsemap)) {
            respmap.push({
              "id": makeid(5),
              "remote": remote,
              "local": local
            })
          }
          cardSection.lambda.map = respmap;
        }
      }
    }
    setCards(prev => {
      let tmpCards = [...prev];
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].lambda = cardSection.lambda
      return tmpCards
    })
  }
  async function handleChangeSectionLambdaMapEvent(cardId, formData, sectionId, lbmapId) {
    if (!cardId) return
    if (!cardLambdaMapFormData.current.hasOwnProperty(cardId)) cardLambdaMapFormData.current[cardId] = {}
    if (!cardLambdaMapFormData.current[cardId].hasOwnProperty(sectionId)) cardLambdaMapFormData.current[cardId][sectionId] = {}
    if (!cardLambdaMapFormData.current[cardId][sectionId].hasOwnProperty(lbmapId)) cardLambdaMapFormData.current[cardId][sectionId][lbmapId] = {}

    cardLambdaMapFormData.current[cardId][sectionId][lbmapId] = {
      "id": lbmapId,
      "remote": formData.lambdaremote ? formData.lambdaremote : '',
      "local": formData.lambdalocal ? formData.lambdalocal : ''
    }
  }
  async function handleBlurSectionLambdaMapEvent(cardId, sectionId, lbmapId) {
    let cardTmp = cards.filter(cd => cd.cardId === cardId)[0];
    let cardTmpIdx = cards.indexOf(cardTmp);
    let cardSection = cardTmp.cardSections.filter(cc => cc.id === sectionId)[0];
    let cardSectionIdx = cardTmp.cardSections.indexOf(cardSection);
    if (cardSection.hasOwnProperty('lambda')) {
      let lbmapIdx = 0;
      let cardSectionLbMap = cardSection.lambda.map.filter(af => af.id === lbmapId);
      if (cardSectionLbMap.length > 0) {
        lbmapIdx = cardSection.lambda.map.indexOf(cardSectionLbMap[0]);
        cardSection.lambda.map[lbmapIdx] = cardLambdaMapFormData.current[cardId][sectionId][lbmapId]
      } else {
        definitionIdx = cardSection.lambda.map.length;
        cardSection.lambda.map.push(cardLambdaMapFormData.current[cardId][sectionId][lbmapId])
      }
    } else {
      cardSection.lambda = cardLambdaFormData.current[cardId][sectionId]
    }
    setCards(prev => {
      let tmpCards = [...prev];
      tmpCards[cardTmpIdx].cardSections[cardSectionIdx].lambda.map = cardSection.lambda.map
      return tmpCards
    })
  }
  // Exibe o modal para formato de salvar nova definição
  function createNewDefinitionModal() {
    return
    /*
    let modaltmp = {
      title: "Nova definição",
      description: "Deseja criar uma nova definição com base nesta seção?",
      rjsf: {
        "schema": {
          "type": "object",
          "required": [
            "version",
            "description"
          ],
          "properties": {
            "id": {
              "type": "string",
              "title": "ID da definição"
            },
            "tenant": {
              "type": "string",
              "title": "Tenant"
            },
            "description": {
              "type": "string",
              "title": "Descrição"
            }
          }
        },
        "uiSchema": {
          "ui:submitButtonOptions": {
            "norender": false,
            "submitText": "Enviar"
          },
          "description": {
            "ui:widget": "textarea",
            "ui:placeholder": "Forneça uma breve descrição para esta definição",
            "ui:options": {
              "rows": 5
            }
          }
        }
      },
      action: "createNewDefinition",
      canCancel: true
    }
    setModal(() => modaltmp);
    modalRef.current.showModal();
    */
  }
  // -- Manipulação do form builder
  async function addNewCard2Deck() {
    let tmpCards = cards;
    let newCardBasicSchema = {
      "title": "Novo Card",
      "type": "object",
      "description": "Insira as seções, conteúdo e definições que serão renderizadas no card correspondente no Formulário"
    };
    let newCard = {
      cardId: makeid(3),
      card_conditions: {},
      cardConditionsRules: [],
      cardType: 'formCard',
      cardSections: [],
      scope: '',
      dmnStructure: {},
      schema: newCardBasicSchema,
      uiSchema: {
        "ui:submitButtonOptions": {
          "norender": true
        }
      },
      formData: {},
      tagName: 'div'
    };
    tmpCards.push(newCard);
    setCards(prev => {
      setAllLoadedCards(() => tmpCards);
      setActiveCard(() => prev.length - 1)
      return defineSchema(tmpCards);
    })
  }
  async function removeCard(card) {
    console.log('card', card)
    setCards(prev => {
      let remainingCards = prev.filter(cd => cd.cardId !== card.cardId);
      console.log('remainingCards', remainingCards)
      setAllLoadedCards(() => remainingCards);
      setActiveCard((currentActive) => {
        return Math.max(0, currentActive - 1);
      })
      return defineSchema(remainingCards)
    })
  }
  async function addNewCondition2Card(card) {
    let tmpCards = cards;
    let newConditionElement = {
      "id": makeid(5),
      "variable": "",
      "value": ""
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (!findCard[0].hasOwnProperty('cardConditionsRules')) {
        findCard[0].cardConditionsRules = []
      }
      findCard[0].cardConditionsRules.push(newConditionElement);
      tmpCards[findCardIdx].cardConditionsRules = findCard[0].cardConditionsRules;
      setAllLoadedCards(() => tmpCards);
      let newCards = defineSchema(tmpCards)
      setCards(() => newCards)
    }
  }
  async function removeCardCondition(card, condition) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      tmpCards[findCardIdx].cardConditionsRules = findCard[0].cardConditionsRules.filter(cd => cd.id !== condition.id)
      setAllLoadedCards(() => tmpCards);
      let newCards = defineSchema(tmpCards)
      setCards(() => newCards)
    }
  }
  async function addNewSection2Card(card) {
    let tmpCards = cards;
    let newCardSection = {
      "id": makeid(5),
      "name": "Seção",
      "description": "",
      "rows": []
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      findCard[0].cardSections.push(newCardSection);
      tmpCards[findCardIdx] = findCard[0];
      setAllLoadedCards(() => tmpCards);
      let newCards = defineSchema(tmpCards)
      setCards(() => newCards)
    }
  }
  async function removeCardSection(card, section) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      tmpCards[findCardIdx].cardSections = findCard[0].cardSections.filter(cd => cd.id !== section.id)
      setAllLoadedCards(() => tmpCards);
      let newCards = defineSchema(tmpCards)
      setCards(() => newCards)
    }
  }
  async function addNewDefinition2Section(card, section) {
    let newSectionDef = {
      "id": makeid(5),
      "definition": "",
      "type": "definition"
    };
    let findCard = cards.filter(cd => cd.cardId === card.cardId);
    if (findCard && findCard.length > 0) {
      let findCardIdx = cards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          findSection[0].rows.push(newSectionDef)
          setCards(prev => {
            prev[findCardIdx].cardSections[findSectionIdx] = findSection[0];
            setAllLoadedCards(() => prev);
            let newCards = defineSchema(prev)
            return newCards
          })
        }
      }
    }
  }
  async function createNewDefinition(card, section) {
    createNewDefinitionModal()
  }
  async function addNewRow2Section(card, section) {
    let tmpCards = cards;
    let newSectionRow = {
      "id": makeid(5),
      "name": "Linha do Formulário",
      "description": "",
      "type": "row",
      "fields": []
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          findSection[0].rows.push(newSectionRow)
          tmpCards[findCardIdx].cardSections[findSectionIdx].rows = findSection[0].rows;
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function removeSectionRow(card, section, row) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          tmpCards[findCardIdx].cardSections[findSectionIdx].rows = findSection[0].rows.filter(r => r.id !== row.id);
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function addNewField2Row(card, section, row) {
    let tmpCards = cards;
    let newFieldElement = {
      "id": makeid(5),
      "name": "Campo do Formulário",
      "description": "",
      "colsize": "12",
      "type": "string",
      "defaultvalue": ""
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          if (findSection[0].rows && findSection[0].rows.length > 0) {
            let sectionRows = findSection[0].rows;
            let findRow = sectionRows.filter(r => r.id === row.id);
            if (findRow && findRow.length > 0) {
              let findRowIdx = sectionRows.indexOf(findRow[0]);
              if (!findRow[0].hasOwnProperty('fields')) findRow[0].fields = [];
              findRow[0].fields.push(newFieldElement);
              tmpCards[findCardIdx].cardSections[findSectionIdx].rows[findRowIdx].fields = findRow[0].fields;
              setAllLoadedCards(() => tmpCards);
              let newCards = defineSchema(tmpCards)
              setCards(() => newCards)
            }
          }
        }
      }
    }
  }
  async function removeRowField(card, section, row, field) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          if (findSection[0].rows && findSection[0].rows.length > 0) {
            let sectionRows = findSection[0].rows;
            let findRow = sectionRows.filter(r => r.id === row.id);
            if (findRow && findRow.length > 0) {
              let findRowIdx = sectionRows.indexOf(findRow[0]);
              tmpCards[findCardIdx].cardSections[findSectionIdx].rows[findRowIdx].fields = findRow[0].fields.filter(fd => fd.id !== field.id);
              setAllLoadedCards(() => tmpCards);
              let newCards = defineSchema(tmpCards)
              setCards(() => newCards)
            }
          }
        }
      }
    }
  }
  async function addAutofill2Section(card, section) {
    let newSectionAutofill = {
      "id": makeid(5),
      "autofill": "",
      "type": "autofill"
    };
    let findCard = cards.filter(cd => cd.cardId === card.cardId);
    if (findCard && findCard.length > 0) {
      let findCardIdx = cards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          findSection[0].autofill = newSectionAutofill
          if (cardAutofillFormData.current && cardAutofillFormData.current.hasOwnProperty(card.cardId) && cardAutofillFormData.current[card.cardId].hasOwnProperty(section.id)) {
            cardAutofillFormData.current[card.cardId][section.id] = {}
          }
          if (cardAutofillMapFormData.current && cardAutofillMapFormData.current.hasOwnProperty(card.cardId) && cardAutofillMapFormData.current[card.cardId].hasOwnProperty(section.id)) {
            cardAutofillMapFormData.current[card.cardId][section.id] = {} // zerando mapeamento
          }
          setCards(prev => {
            prev[findCardIdx].cardSections[findSectionIdx] = findSection[0];
            setAllLoadedCards(() => prev);
            let newCards = defineSchema(prev)
            return newCards
          })
        }
      }
    }
  }
  async function removeSectionAutofill(card, section) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          delete tmpCards[findCardIdx].cardSections[findSectionIdx].autofill
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function addNewAutofillMap2Section(card, section) {
    let tmpCards = cards;
    let newAutofillMapElement = {
      "id": makeid(5),
      "autofilllocal": "",
      "autofillremote": ""
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          if (!findSection[0].hasOwnProperty('autofill')) {
            findSection[0].autofill = {}
          }
          if (!findSection[0].autofill.hasOwnProperty('map')) {
            findSection[0].autofill.map = []
          }
          findSection[0].autofill.map.push(newAutofillMapElement);
          tmpCards[findCardIdx].cardSections[findSectionIdx].autofill = findSection[0].autofill;
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function removeSectionAutofillMap(card, section, afmapId) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          setCards((prev) => {
            prev[findCardIdx].cardSections[findSectionIdx].autofill.map = findSection[0].autofill.map.filter(af => af.id !== afmapId);
            setAllLoadedCards(() => prev);
            let newCards = defineSchema(prev)
            return newCards
          })
        }
      }
    }
  }
  async function addLambda2Section(card, section) {
    let newSectionLambda = {
      "id": makeid(5),
      "lambda": "",
      "type": "lambda"
    };
    let findCard = cards.filter(cd => cd.cardId === card.cardId);
    if (findCard && findCard.length > 0) {
      let findCardIdx = cards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          findSection[0].lambda = newSectionLambda
          if (cardLambdaFormData.current && cardLambdaFormData.current.hasOwnProperty(card.cardId) && cardLambdaFormData.current[card.cardId].hasOwnProperty(section.id)) {
            cardLambdaFormData.current[card.cardId][section.id] = {}
          }
          if (cardLambdaMapFormData.current && cardLambdaMapFormData.current.hasOwnProperty(card.cardId) && cardLambdaMapFormData.current[card.cardId].hasOwnProperty(section.id)) {
            cardLambdaMapFormData.current[card.cardId][section.id] = {} // zerando mapeamento
          }
          setCards(prev => {
            prev[findCardIdx].cardSections[findSectionIdx] = findSection[0];
            setAllLoadedCards(() => prev);
            let newCards = defineSchema(prev)
            return newCards
          })
        }
      }
    }
  }
  async function removeSectionLambda(card, section) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx, findSectionIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        // Vamos encontrar a section que estou incluindo nova linha agora
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          findSectionIdx = cardSections.indexOf(findSection[0]);
          delete tmpCards[findCardIdx].cardSections[findSectionIdx].lambda
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function addNewLambdaMap2Section(card, section) {
    let tmpCards = cards;
    let newLambdaMapElement = {
      "id": makeid(5),
      "lambdalocal": "",
      "lambdaremote": ""
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          if (!findSection[0].hasOwnProperty('lambda')) {
            findSection[0].lambda = {}
          }
          if (!findSection[0].lambda.hasOwnProperty('map')) {
            findSection[0].lambda.map = []
          }
          findSection[0].lambda.map.push(newLambdaMapElement);
          tmpCards[findCardIdx].cardSections[findSectionIdx].lambda = findSection[0].lambda;
          setAllLoadedCards(() => tmpCards);
          let newCards = defineSchema(tmpCards)
          setCards(() => newCards)
        }
      }
    }
  }
  async function removeSectionLambdaMap(card, section, lbmapId) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      if (findCard[0].cardSections && findCard[0].cardSections.length > 0) {
        let cardSections = findCard[0].cardSections;
        let findSection = cardSections.filter(sec => sec.id === section.id);
        if (findSection && findSection.length > 0) {
          let findSectionIdx = cardSections.indexOf(findSection[0]);
          setCards((prev) => {
            prev[findCardIdx].cardSections[findSectionIdx].lambda.map = findSection[0].lambda.map.filter(lb => lb.id !== lbmapId);
            setAllLoadedCards(() => prev);
            let newCards = defineSchema(prev)
            return newCards
          })
        }
      }
    }
  }
  function updatePreviewSchema() {
    // Update preview Cards
    let newschema = [];
    let tmpViewCards = [...cards].slice(1)
    console.log('tmpViewCards', tmpViewCards)
    if (tmpViewCards.length === 0) definePreviewSchema(newschema)
    // console.log('cards', tmpViewCards)
    // Baixando informações de Card Conditions
    for (let i = 0; i < tmpViewCards.length; i++) {
      let cCard = tmpViewCards[i]
      let cardConditionsRules = cCard.cardConditionsRules;
      let cardDefinitions = {};
      let cardDefinitionsSchema = {};
      let cardConditions = {};
      for (let j = 0; j < cardConditionsRules.length; j++) {
        let cond = cardConditionsRules[j]
        if (cond.variable && cond.variable !== '') {
          cardConditions[cond.variable] = cond.value
        }
      }
      let cardSections = cCard.cardSections;
      let sections = {};
      let uiSchemaLayout = {};
      for (let j = 0; j < cardSections.length; j++) {
        let sct = cardSections[j]
        let sectionrows = sct.rows;
        let rowslayout = [];
        let fieldsmask = {};
        let fields = {};
        let sectionlayout = {};
        let sectionautofill = {};
        let sectionlambda = {};
        for (let k = 0; k < sectionrows.length; k++) {
          let fieldslayout = {};
          if (sectionrows[k].type === 'row') {
            let rowfields = sectionrows[k].fields;
            for (let l = 0; l < rowfields.length; l++) {
              let fielditem = rowfields[l]
              let defaultvalue = setCorrectDefaultType(fielditem.defaultvalue, fielditem.fieldtype)
              fields[fielditem.id] = {
                "type": fielditem.fieldtype ? fielditem.fieldtype : 'string',
                "title": fielditem.name ? fielditem.name : '',
                "description": fielditem.description ? fielditem.description : '',
                "default": defaultvalue
              }
              fieldslayout[fielditem.id] = {
                "classNames": `col-md-${fielditem.colsize}`
              }
              if (fielditem.fieldmask && fielditem.fieldmask !== '') {
                fieldsmask[fielditem.id] = {
                  "ui:widget": "masked",
                  "ui:options": {
                    "mask": (fielditem.fieldmask !== 'custom' ? fielditem.fieldmask : fielditem.maskvalue),
                    "type": "code"
                  }
                }
              }

            }
          } else if (sectionrows[k].type === 'definition') {
            let def = sectionrows[k].definition;
            if (!usedDefinitions.current?.hasOwnProperty(def)) {
              // Baixar nova definition do servidor
            } else {
              let currentDef = usedDefinitions.current[def];
              if (currentDef && currentDef.hasOwnProperty('defs')) {
                for (const [defin, valdefin] of Object.entries(currentDef.defs)) {
                  if (!cardDefinitions.hasOwnProperty(defin)) {
                    cardDefinitions[defin] = valdefin
                  }
                }
                if (currentDef && currentDef.hasOwnProperty('uiSchema')) {
                  for (const [defin, valdefin] of Object.entries(currentDef.uiSchema)) {
                    if (!cardDefinitionsSchema.hasOwnProperty(defin)) {
                      cardDefinitionsSchema[defin] = valdefin
                    }
                  }
                }
              }
            }
            // Aqui eu já tenho as definitions setadas e o uiSchema respectivo
            // Vamos adicionar ao form
            if (def && def !== '') {
              fields[sectionrows[k].id] = {
                "$ref": `#/definitions/${def}`,
                "title": sectionrows[k].title ? sectionrows[k].title : '',
                "description": sectionrows[k].description ? sectionrows[k].description : ''
              }
              fieldslayout[sectionrows[k].id] = {
                "classNames": `col-md-12`
              }
            }
          }
          rowslayout.push(fieldslayout)

        } // for each row
        sections[sct.id] = {
          "type": "object",
          "title": sct.name ? sct.name : '',
          "description": sct.description ? sct.description : '',
          "properties": fields
        }
        if (rowslayout && rowslayout.length > 0) {
          sectionlayout = {
            "ui:ObjectFieldTemplate": "layout",
            "ui:layout": rowslayout
          }
          uiSchemaLayout[sct.id] = { ...uiSchemaLayout[sct.id], ...sectionlayout }
        }
        if (sct.hasOwnProperty('autofill')) {
          let afconfig = sct.autofill;
          let respmap = {};
          if (afconfig.hasOwnProperty('map') && afconfig['map'].length > 0) {
            let afmap = afconfig['map'];
            for (let k = 0; k < afmap.length; k++) {
              if (afmap[k]) {
                respmap[afmap[k].remote] = afmap[k].local
              }
            }
          }
          sectionautofill = {
            "ui:field": "autofill",
            "ui:autofill": {
              "requestConfig": {
                "url": afconfig.url,
              },
              "responseMap": respmap,
              "trigger": afconfig.trigger
            }
          }
        }
        if (sct.hasOwnProperty('lambda')) {
          let lbconfig = sct.lambda;
          let respmap = {};
          if (lbconfig.hasOwnProperty('map') && lbconfig['map'].length > 0) {
            let lbmap = lbconfig['map'];
            for (let k = 0; k < lbmap.length; k++) {
              if (lbmap[k]) {
                respmap[lbmap[k].remote] = lbmap[k].local
              }
            }
          }
          /**
           * TODO: Pensar como chamar um hook padrão que consiga atualizar a pagina destino
           * TODO: Teremos que definir um padrão na pagina destino que sempre vai tratar esse payload 
           * recebido com base nas variaveis mapeadas (no respmap) 
           */
          sectionlambda = {
            "ui:field": "lambda",
            "ui:lambda": {
              "requestConfig": {
                "method": "POST",
                "url": `https://actions.looplex.com/api/code/${lbconfig.code}`,
                "data": "{{{$}}}"
              },
              "trigger": lbconfig.trigger,
              "functionBody": "context.uiSchema.pageHooks.setUpdatedFormData(context.data.formData.formData)"
            }
          }
        }

        /**
         * 
          "ui:field": "lambda",
          "ui:lambda": {
          "trigger": "createdOn",
          "requestConfig": {
              "method": "POST",
              "url": "https://actions.looplex.com/api/code/A47C84F0-459D-11EE-8802-41C5522541B5",
              "data": "{{{$}}}"
          },
          "functionBody": "context.uiSchema.pageHooks.setPreviewUrl(context.data.message);  context.uiSchema.pageHooks.setUpdatedFormData(context.data.formData.formData)"
         */
        uiSchemaLayout[sct.id] = { ...uiSchemaLayout[sct.id], ...fieldsmask, ...sectionautofill, ...sectionlambda }
      } // for section
      let newCCard = {
        "cardId": cCard.cardId,
        "card_conditions": cardConditions,
        "schema": {
          "type": "object",
          "title": cardInfoFormData.current[cCard.cardId]?.card?.display ? cardInfoFormData.current[cCard.cardId].card.display : '',
          "description": cardInfoFormData.current[cCard.cardId]?.card?.description ? cardInfoFormData.current[cCard.cardId].card.description : '',
          "definitions": cardDefinitions,
          "properties": sections
        },
        "uiSchema": {
          "ui:submitButtonOptions": {
            "norender": true
          },
          ...uiSchemaLayout,
          ...cardDefinitionsSchema
        },
        "formData": {},
        "tagName": "div"
      };
      newschema.push(newCCard);
    }
    definePreviewSchema(newschema)
  }
  /** Funções do Componente - FIM*/

  /** Subcomponentes - INÍCIO */
  function FormCard({ card }) {
    let formcard;
    if (card.hasOwnProperty('cardType') && card.cardType === 'formCard') {
      let sections = card.hasOwnProperty('cardSections') && card.cardSections.length > 0 ? card.cardSections : []
      formcard = <div className="section-card">
        <div className="section-card-title">
          Card {card.cardId}
        </div>
        <div className="section-card-content">
          <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeCard(card); }}><span className="glyphicon glyphicon-trash"></span></button>
          <CardInfo card={card}></CardInfo>
        </div>
        {
          sections.map(section => (
            <div className="section-card-content">
              <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeCardSection(card, section); }}><span className="glyphicon glyphicon-trash"></span></button>
              <SectionContent card={card} section={section}></SectionContent>
              <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
                <div className="mt-auto d-flex align-items-end d-space-x-4">
                  {/** TODO -- Definitions serao colocadas na proxima versao // <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewDefinition2Section(card, section); }}>Adicionar Definição</button>*/}
                  <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewRow2Section(card, section); }}>Adicionar Linha</button>
                </div>
              </div>
            </div>
          ))
        }
        <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewSection2Card(card); }}>Adicionar Seção</button>
      </div>
    } else {
      formcard = <Form {...card} onBlur={({ formData }, id) => handleChangeEvent(card.cardId, formData, id)} liveValidate />
    }
    return formcard
  }
  function CardInfo({ card }) {
    let cardSchema = {
      "schema": {
        "title": "Configurações do Card",
        "type": "object",
        "properties": {
          "card": {
            "title": "Informações do Card",
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "title": "ID do Card",
                "default": card.cardId ? card.cardId : ""
              },
              "display": {
                "type": "string",
                "title": "Nome de exibição do Card",
                "default": card.title ? card.title : ""
              },
              "description": {
                "type": "string",
                "title": "Descrição do Card",
                "default": card.description ? card.description : ""
              }
            },
            "required": [
              "id",
              "display"
            ]
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "card": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "id": {
                "classNames": "col-md-6"
              },
              "display": {
                "classNames": "col-md-6"
              }
            },
            {
              "description": {
                "classNames": "col-md-12"
              }
            }
          ]
        }
      },
      "formData": card.formData
    }
    let conditions = card.cardConditionsRules;
    let cardcontent = <div className="section-content-wrapper">
      <Form {...cardSchema} onChange={({ formData }, id) => handleChangeCardInfoEvent(card.cardId, formData, id)} onBlur={() => handleBlurCardInfoEvent(card.cardId)} liveValidate />
      <div className="section-content-rows-wrapper">
        {
          (conditions.length > 0) &&
          (
            <>
              <legend>Condições do Card</legend>
              <p className="mb-4">Especifique as variáveis e valores correspondentes que devem existir para que este card seja exibido. Todas as condições devem ser verdadeiras.</p>
              <div className="section-content-row">
                {
                  conditions.map((condition) => (
                    <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                      <div className="mt-auto d-flex d-space-x-4 d-grow">
                        <CardConditions condition={condition} card={card} />
                      </div>
                      <div className="mt-auto d-flex align-items-start d-space-x-4">
                        <button type="button" className={`btn btn-danger remove-icon-sameline`} onClick={(e) => { e.preventDefault(); removeCardCondition(card, condition); }}><span className="glyphicon glyphicon-trash"></span></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )
        }
      </div>
      <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addNewCondition2Card(card); }}>Inserir Condição</button>
        </div>
      </div>
    </div>
    return cardcontent
  }
  function CardConditions({ condition, card }) {
    let conditionSchema = {
      "schema": {
        "type": "object",
        "properties": {
          "conditionvar": {
            "title": "Variável",
            "type": "string",
            "default": condition.variable ? condition.variable : ""
          },
          "conditionvalue": {
            "title": "Valor",
            "type": "string",
            "default": condition.value ? condition.value : ""
          }
        },
        "required": [
          "conditionvar",
          "conditionvalue"
        ]
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "ui:ObjectFieldTemplate": "layout",
        "ui:layout": [
          {
            "conditionvar": {
              "classNames": "col-md-6"
            },
            "conditionvalue": {
              "classNames": "col-md-6"
            }
          }
        ]
      }
    }

    let conditioncontent = <Form {...conditionSchema} onChange={({ formData }, id) => handleChangeCardConditionsEvent(card.cardId, formData, condition.id)} onBlur={() => handleBlurCardConditionsEvent(card.cardId, condition.id)} liveValidate />
    return conditioncontent
  }
  function SectionContent({ card, section }) {
    let sectionSchema = {
      "schema": {
        "title": section.name ? section.name : "Nova Seção",
        "type": "object",
        "properties": {
          "section": {
            "title": "Dados da Seção",
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "title": "ID da Seção",
                "default": section.id ? section.id : ""
              },
              "display": {
                "type": "string",
                "title": "Nome de exibição da Seção",
                "default": section.name ? section.name : ""
              },
              "description": {
                "type": "string",
                "title": "Descrição da Seção",
                "default": section.description ? section.description : ""
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "section": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "id": {
                "classNames": "col-md-6"
              },
              "display": {
                "classNames": "col-md-6"
              }
            },
            {
              "description": {
                "classNames": "col-md-12"
              }
            }
          ]
        }
      }
    }
    let sectioncontent = <div className="section-content-wrapper">
      <Form {...sectionSchema} onChange={({ formData }, id) => handleChangeSectionEvent(card.cardId, formData, section.id)} onBlur={() => handleBlurSectionEvent(card.cardId, section.id)} liveValidate />
      
        <div className="mt-auto mb-4 d-flex d-space-x-4 flex-row  d-w-full">
          <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
          {(!section.hasOwnProperty('lambda')) &&          
          <div className="mt-auto d-flex align-items-end d-space-x-4">
            <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addLambda2Section(card, section); }}>Adicionar Lambda</button>
          </div>          
          }
          {(!section.hasOwnProperty('autofill')) &&          
          <div className="mt-auto d-flex align-items-end d-space-x-4">
            <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addAutofill2Section(card, section); }}>Adicionar Autofill</button>
          </div>
          }
        </div>
      {(section.hasOwnProperty('lambda')) &&
        <div className="section-content-row">
          <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeSectionLambda(card, section); }}><span className="glyphicon glyphicon-trash"></span></button>
          <SectionLambda card={card} section={section}></SectionLambda>
        </div>
      }
      {(section.hasOwnProperty('autofill')) &&
        <div className="section-content-row">
          <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeSectionAutofill(card, section); }}><span className="glyphicon glyphicon-trash"></span></button>
          <SectionAutofill card={card} section={section}></SectionAutofill>
        </div>
      }
      {(section.hasOwnProperty('rows') && section.rows.length > 0) &&
        section.rows.map(row => (
          <div className="section-content-row">
            <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeSectionRow(card, section, row); }}><span className="glyphicon glyphicon-trash"></span></button>
            <SectionRow card={card} section={section} row={row}></SectionRow>
          </div>
        ))
      }
    </div>
    return sectioncontent
  }
  function SectionRow({ card, section, row }) {
    let fields = row.fields ? row.fields : []
    let rowcontent;

    if (row.type == 'definition') {
      rowcontent = <div>
        <div className="section-content-row-title">Definição</div>
        <div className="section-content-row-field">
          <SectionDefinition card={card} section={section} row={row} definition={row}></SectionDefinition>
        </div>
      </div>
    } else { // Nova linha
      rowcontent = <div>
        <div className="section-content-row-title">{row.name}</div>
        {
          fields.map(field => (
            <div className="section-content-row-field">
              <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeRowField(card, section, row, field); }}><span className="glyphicon glyphicon-trash"></span></button>
              <SectionRowField field={field} card={card} section={section} row={row}></SectionRowField>
            </div>
          ))
        }
        <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
          <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
          <div className="mt-auto d-flex align-items-end d-space-x-4">
            <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addNewField2Row(card, section, row); }}>Novo Campo</button>
          </div>
        </div>
      </div>
    }
    return rowcontent
  }
  function SectionAutofill({ card, section }) {
    let loadedAFDefs = [{
      "type": "string",
      "enum": [
        ""
      ],
      "title": "-- Selecione --"
    }];
    for (const [af, content] of Object.entries(availableAFDefinitions.current)) {
      let afitem = {
        "type": "string",
        "enum": [
          af
        ],
        "title": content
      }
      loadedAFDefs.push(afitem)
    }
    let autofillSchema = {
      "schema": {
        "title": "Regras de Autofill",
        "description": "Aqui você deve definir regras para o autopreenchimento do formulário com base em uma chamada externa.",
        "type": "object",
        "properties": {
          "autofill": {
            "title": "Padrão de autofill",
            "description": "Há padrão de autofill pré-definido?",
            "type": "string",
            "anyOf": loadedAFDefs
          },
          "trigger": {
            "title": "Gatilho: Variável observada",
            "description": "Variável que irá disparar a função de autofill",
            "type": "string"
          },
          "url": {
            "title": "URL do serviço (GET)",
            "type": "string"
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "ui:ObjectFieldTemplate": "layout",
        "ui:layout": [
          {
            "autofill": {
              "classNames": "col-md-6"
            },
            "trigger": {
              "classNames": "col-md-6"
            }
          }, {
            "url": {
              "classNames": "col-md-12"
            }
          }
        ]
      },
      "formData": {
        autofill: section.autofill?.autofill ? section.autofill?.autofill : '',
        url: section.autofill.url ? section.autofill.url : '',
        trigger: section.autofill.trigger ? section.autofill.trigger : '',
        map: section.autofill.map ? section.autofill.map : [],
      }
    }
    let autofillmapvars = (section.autofill?.map && section.autofill?.map.length > 0) ? section.autofill?.map : [];
    let autofillcontent = <>
      <Form {...autofillSchema} onChange={({ formData }, id) => handleChangeSectionAutofillEvent(card.cardId, formData, section.id)} onBlur={() => handleBlurSectionAutofillEvent(card.cardId, section.id)} liveValidate />
      <div className="section-content-rows-wrapper">
        {
          (autofillmapvars.length > 0) &&
          (
            <>
              <legend>Correspondência de Variáveis</legend>
              <p className="mb-4">Especifique as variáveis remotas e as correspondentes variáveis locais que serão preenchidas no retorno do autofill.</p>
              <div className="section-content-row">
                {
                  autofillmapvars.map((afvar) => (
                    <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                      <div className="mt-auto d-flex d-space-x-4 d-grow">
                        <SectionAutofillMap card={card} section={section} autofillmap={afvar} />
                      </div>
                      <div className="mt-auto d-flex align-items-start d-space-x-4">
                        <button type="button" className={`btn btn-danger remove-icon-sameline`} onClick={(e) => { e.preventDefault(); removeSectionAutofillMap(card, section, afvar.id); }}><span className="glyphicon glyphicon-trash"></span></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )
        }
      </div>
      <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addNewAutofillMap2Section(card, section); }}>Inserir Correspondência</button>
        </div>
      </div>
    </>
    return autofillcontent
  }
  function SectionAutofillMap({ card, section, autofillmap }) {
    let autofillmapSchema = {
      "schema": {
        "type": "object",
        "properties": {
          "autofillremote": {
            "title": "Variável Remota",
            "type": "string",
            "default": autofillmap.remote ? autofillmap.remote : ""
          },
          "autofilllocal": {
            "title": "Variável Local",
            "type": "string",
            "default": autofillmap.local ? autofillmap.local : ""
          }
        },
        "required": [
          "autofillremote",
          "autofilllocal"
        ]
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "ui:ObjectFieldTemplate": "layout",
        "ui:layout": [
          {
            "autofillremote": {
              "classNames": "col-md-6"
            },
            "autofilllocal": {
              "classNames": "col-md-6"
            }
          }
        ]
      },
      "formData": {
        "autofilllocal": autofillmap.local,
        "autofillremote": autofillmap.remote
      }
    }
    let autofillmapcontent = <Form {...autofillmapSchema} onChange={({ formData }, id) => handleChangeSectionAutofillMapEvent(card.cardId, formData, section.id, autofillmap.id)} onBlur={() => handleBlurSectionAutofillMapEvent(card.cardId, section.id, autofillmap.id)} liveValidate />
    return autofillmapcontent
  }
  function SectionLambda({ card, section }) {
    let loadedLbDefs = [{
      "type": "string",
      "enum": [
        ""
      ],
      "title": "-- Selecione --"
    }];
    for (const [lb, content] of Object.entries(availableLbDefinitions.current)) {
      let afitem = {
        "type": "string",
        "enum": [
          lb
        ],
        "title": content
      }
      loadedLbDefs.push(afitem)
    }
    let lambdaSchema = {
      "schema": {
        "title": "Regras de Função Lambda",
        "description": "Aqui você deve definir regras para o autopreenchimento do formulário com base em uma chamada para um code com o uso de função Lambda.",
        "type": "object",
        "properties": {
          "lambda": {
            "title": "Padrão de função Lambda",
            "description": "Há padrão de função lambda pré-definido?",
            "type": "string",
            "anyOf": loadedLbDefs
          },
          "trigger": {
            "title": "Gatilho: Variável observada",
            "description": "Variável que irá disparar a função lambda",
            "type": "string"
          },
          "code": {
            "title": "Code de destino",
            "type": "string"
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "ui:ObjectFieldTemplate": "layout",
        "ui:layout": [
          {
            "lambda": {
              "classNames": "col-md-6"
            },
            "trigger": {
              "classNames": "col-md-6"
            }
          }, {
            "code": {
              "classNames": "col-md-12"
            }
          }
        ]
      },
      "formData": {
        lambda: section.lambda?.lambda ? section.lambda?.lambda : '',
        code: section.lambda.code ? section.lambda.code : '',
        trigger: section.lambda.trigger ? section.lambda.trigger : '',
        map: section.lambda.map ? section.lambda.map : [],
      }
    }
    let lambdamapvars = (section.lambda?.map && section.lambda?.map.length > 0) ? section.lambda?.map : [];
    let lambdacontent = <>
      <Form {...lambdaSchema} onChange={({ formData }, id) => handleChangeSectionLambdaEvent(card.cardId, formData, section.id)} onBlur={() => handleBlurSectionLambdaEvent(card.cardId, section.id)} liveValidate />
      <div className="section-content-rows-wrapper">
        {
          (lambdamapvars.length > 0) &&
          (
            <>
              <legend>Correspondência de Variáveis</legend>
              <p className="mb-4">Especifique as variáveis remotas e as correspondentes variáveis locais que serão preenchidas no retorno da lambda function.</p>
              <div className="section-content-row">
                {
                  lambdamapvars.map((lbvar) => (
                    <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                      <div className="mt-auto d-flex d-space-x-4 d-grow">
                        <SectionLambdaMap card={card} section={section} lambdamap={lbvar} />
                      </div>
                      <div className="mt-auto d-flex align-items-start d-space-x-4">
                        <button type="button" className={`btn btn-danger remove-icon-sameline`} onClick={(e) => { e.preventDefault(); removeSectionLambdaMap(card, section, lbvar.id); }}><span className="glyphicon glyphicon-trash"></span></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )
        }
      </div>
      <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addNewLambdaMap2Section(card, section); }}>Inserir Correspondência</button>
        </div>
      </div>
    </>
    return lambdacontent
  }
  function SectionLambdaMap({ card, section, lambdamap }) {
    let lambdamapSchema = {
      "schema": {
        "type": "object",
        "properties": {
          "lambdaremote": {
            "title": "Variável Remota",
            "type": "string",
            "default": lambdamap.remote ? lambdamap.remote : ""
          },
          "lambdalocal": {
            "title": "Variável Local",
            "type": "string",
            "default": lambdamap.local ? lambdamap.local : ""
          }
        },
        "required": [
          "lambdaremote",
          "lambdalocal"
        ]
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "ui:ObjectFieldTemplate": "layout",
        "ui:layout": [
          {
            "lambdaremote": {
              "classNames": "col-md-6"
            },
            "lambdalocal": {
              "classNames": "col-md-6"
            }
          }
        ]
      },
      "formData": {
        "lambdalocal": lambdamap.local,
        "lambdaremote": lambdamap.remote
      }
    }
    let lambdamapcontent = <Form {...lambdamapSchema} onChange={({ formData }, id) => handleChangeSectionLambdaMapEvent(card.cardId, formData, section.id, lambdamap.id)} onBlur={() => handleBlurSectionLambdaMapEvent(card.cardId, section.id, lambdamap.id)} liveValidate />
    return lambdamapcontent
  }
  function SectionDefinition({ card, section, definition }) {
    let loadedDefs = [{
      "type": "string",
      "enum": [
        ""
      ],
      "title": "-- Selecione --"
    }];
    for (const [def, content] of Object.entries(availableDefinitions.current)) {
      let defitem = {
        "type": "string",
        "enum": [
          def
        ],
        "title": content
      }
      loadedDefs.push(defitem)
    }
    let definitionSchema = {
      "schema": {
        "type": "object",
        "properties": {
          "definition": {
            "type": "object",
            "description": "Você deve escolher uma definição do banco de dados no campo abaixo, que fará parte do seu formulário",
            "properties": {
              "deftitle": {
                "type": "string",
                "title": "Título",
                "default": definition.title ? definition.title : "Título da Seção",
              },
              "defdescription": {
                "title": "Descrição",
                "type": "string",
                "default": definition.description ? definition.description : '',
              },
              "definition": {
                "title": "Escolha da Definição",
                "type": "string",
                "default": definition.definition,
                "anyOf": loadedDefs
              }
            }
          }
        },
        "uiSchema": {
          "ui:submitButtonOptions": {
            "norender": true
          },
          "definition": {
            "ui:ObjectFieldTemplate": "layout",
            "ui:layout": [
              {
                "deftitle": {
                  "classNames": "col-md-12"
                },
                "defdescription": {
                  "classNames": "col-md-12"
                },
                "definition": {
                  "classNames": "col-md-12"
                }
              }
            ]
          }
        }
      }
    }

    let defcontent = <Form {...definitionSchema} onChange={({ formData }, id) => handleChangeSectionDefinitionEvent(card.cardId, formData, section.id, definition.id)} onBlur={() => handleBlurSectionDefinitionEvent(card.cardId, section.id, definition.id)} liveValidate />
    return defcontent
  }
  function SectionRowField({ field, card, section, row, path = [] }) {
    // console.log(field)
    let fieldSchema = {
      "schema": {
        "title": field.name ? field.name : "Campo de Formulário",
        "type": "object",
        "properties": {
          "section": {
            "title": "Dados do Campo",
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "title": "ID do Campo",
                "default": field.id ? field.id : ""
              },
              "display": {
                "type": "string",
                "title": "Nome de exibição do Campo",
                "default": field.name ? field.name : ""
              },
              "description": {
                "type": "string",
                "title": "Descrição do Campo",
                "default": field.description ? field.description : ""
              },
              "colsize": {
                "type": "string",
                "title": "Tamanho do Campo (n/12)",
                "default": field.colsize ? field.colsize : "12",
                "anyOf": [
                  {
                    "type": "string",
                    "enum": [
                      "12"
                    ],
                    "title": "(12/12) Linha inteira"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "11"
                    ],
                    "title": "(11/12) Quase a linha toda"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "10"
                    ],
                    "title": "(10/12) Cinco sextos da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "9"
                    ],
                    "title": "(9/12) Três quartos da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "8"
                    ],
                    "title": "(8/12) Dois terços da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "7"
                    ],
                    "title": "(7/12) Pouco mais da metade da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "6"
                    ],
                    "title": "(6/12) Metade da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "5"
                    ],
                    "title": "(5/12) Pouco menos da metade da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "4"
                    ],
                    "title": "(4/12) Um terço da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "3"
                    ],
                    "title": "(3/12) Um quarto da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "2"
                    ],
                    "title": "(2/12) Um sexto da linha"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "1"
                    ],
                    "title": "(1/12) Um pedaço da linha"
                  }
                ]
              },
              "fieldtype": {
                "type": "string",
                "title": "Tipo do Campo",
                "default": field.fieldtype ? field.fieldtype : "string",
                "anyOf": [
                  {
                    "type": "string",
                    "enum": [
                      "string"
                    ],
                    "title": "String"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "boolean"
                    ],
                    "title": "Booleano"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "integer"
                    ],
                    "title": "Inteiro"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "number"
                    ],
                    "title": "Número"
                  }//,
                  // {
                  //   "type": "string",
                  //   "enum": [
                  //     "object"
                  //   ],
                  //   "title": "Objeto"
                  // }
                ]
              }
            },
            "dependencies": {
              "fieldtype": {
                "oneOf": [
                  {
                    "properties": {
                      "fieldtype": {
                        "enum": [
                          "boolean"
                        ]
                      },
                      "defaultvalue": {
                        "type": "string",
                        "title": "Valor Padrão",
                        "anyOf": [
                          {
                            "type": "string",
                            "enum": [
                              "true"
                            ],
                            "title": "Verdadeiro"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "false"
                            ],
                            "title": "Falso"
                          }
                        ],
                        "default": (field.defaultvalue === 'true') ? "true" : "false"
                      }
                    }
                  },
                  {
                    "properties": {
                      "fieldtype": {
                        "enum": [
                          "integer",
                          "number"
                        ]
                      },
                      "defaultvalue": {
                        "type": "string",
                        "title": "Valor Padrão",
                        "default": field.defaultvalue ? field.defaultvalue : ""
                      }
                    }
                  },
                  {
                    "properties": {
                      "fieldtype": {
                        "enum": [
                          "string"
                        ]
                      },
                      "defaultvalue": {
                        "type": "string",
                        "title": "Valor Padrão",
                        "default": field.defaultvalue ? field.defaultvalue : ""
                      },
                      "fieldmask": {
                        "type": "string",
                        "title": "Tipo de Máscara",
                        "anyOf": [
                          {
                            "type": "string",
                            "enum": [
                              ""
                            ],
                            "title": "Sem máscara"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "999.999.999-99"
                            ],
                            "title": "CPF"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "99.999.999/9999-99"
                            ],
                            "title": "CNPJ"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "(99) 9.9999-9999"
                            ],
                            "title": "Celular"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "(99) 9999-9999"
                            ],
                            "title": "Telefone"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "99.999-999"
                            ],
                            "title": "CEP"
                          },
                          {
                            "type": "string",
                            "enum": [
                              ""
                            ],
                            "title": "E-mail"
                          },
                          {
                            "type": "string",
                            "enum": [
                              "custom"
                            ],
                            "title": "Personalizada"
                          }
                        ],
                        "default": ''
                      }
                    },
                    "if": {
                      "properties": {
                        "fieldmask": {
                          "const": "custom"
                        }
                      }
                    },
                    "then": {
                      "properties": {
                        "maskvalue": {
                          "type": "string",
                          "title": "Máscara Personalizada",
                          "default": field.maskvalue ? field.maskvalue : ""
                        }
                      }
                    }
                  },
                  {
                    "properties": {
                      "fieldtype": {
                        "enum": [
                          "object"
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
        "section": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "id": {
                "classNames": "col-md-6"
              },
              "display": {
                "classNames": "col-md-6"
              }
            },
            {
              "description": {
                "classNames": "col-md-6"
              },
              "colsize": {
                "classNames": "col-md-6"
              }
            },
            {
              "fieldtype": {
                "classNames": "col-md-6"
              },
              "defaultvalue": {
                "classNames": "col-md-6"
              }
            },
            {
              "fieldmask": {
                "classNames": "col-md-6"
              },
              "maskvalue": {
                "classNames": "col-md-6"
              }
            }
          ],
          "colsize": {
            'ui:help': 'A soma das larguras dos campos deve sempre ser 12 por linha'
          }
        }
      },
      "formData": {
        section: {
          ...field,
          defaultvalue: setCorrectDefaultType(field.defaultvalue, field.fieldtype).toString(),
          display: field.name
        }
      }
    }

    /**
     * TODO: lógica para termos subfields (campos de campos object).
     * 
     * A lógica foi iniciada mas precisa ser terminada para contemplar 
     * inclusão de subcampos recursiva. No momento, para esta primeira versão,
     * não parece ser necessário (teremos apenas o nível de organização da seção).
     * Se decidirmos por usar a recursão de subcampos de campos, vamos usar a lógica
     * aqui feita.
     */
    let subfields = [];
    if (field.fieldtype === 'object' && field.hasOwnProperty('subfields') && field.subfields.length > 0) {
      subfields = field.subfields;
    }
    let newpath = [...path, field.id]
    let fieldcontent = <>
      <Form {...fieldSchema} onChange={({ formData }, id) => handleChangeSectionRowFieldEvent(card.cardId, formData, section.id, row.id, field.id, path)} onBlur={() => handleBlurSectionRowFieldEvent(card.cardId, section.id, row.id, field.id)} liveValidate />
      {
        (field.fieldtype === 'object') &&
        subfields.map(subfield => (
          <SectionRowField field={subfield} card={card} section={section} row={row} path={newpath}></SectionRowField>
        ))
      }
    </>
    // let fieldcontent = <Form {...fieldSchema} onChange={({ formData }, id) => handleChangeSectionRowFieldEvent(card.cardId, formData, section.id, row.id, field.id)} liveValidate />
    return fieldcontent
  }
  /** Subcomponentes - FIM */

  let rjsfbuilder = <>
    <div className="wfcomponent rjsfbuilder">
      <section class="deckofcards">
        <div ref={carouselRef} className='d-carousel d-w-full'>
          {
            (cards.length === 0 && (isLoading || isLoadingDocumentDetails)) ?
              <span><span className="d-loading d-loading-spinner d-loading-md"></span> Carregando...</span>
              : ''
          }
          {cards.map((card, index) => {
            const active = index === activeCard;
            return (
              <div id={`card_${index}`} key={`card_${index}`} className='d-carousel-item d-w-full' ref={active ? activeCardRef : null}>
                <div className="d-w-full">
                  <FormCard card={card}></FormCard>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="navigation d-flex align-items-end flex-column">
        {(cards.length > 0 && !isLoading && !isLoadingDocumentDetails) && (
          <>
            <div className="d-flex d-space-x-4 align-items-center">
              <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} disabled={((activeCard - 1) < 0 || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(language === 'en_us') ? 'Previous' : 'Anterior'}</button>
              <span class="glyphicon glyphicon-option-horizontal"></span>
              <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} disabled={((activeCard + 1) >= cards.length || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveRight') }}>{(language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
            </div>
            <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
              <div className="mt-auto d-flex align-items-start d-space-x-4">
                <button type="button" className={`btn btn-secondary`} onClick={(e) => { e.preventDefault(); addNewCard2Deck(); }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : ((language === 'en_us') ? 'New Card' : 'Novo Card')}</button>
              </div>
              <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
              <div className="mt-auto d-flex align-items-end d-space-x-4">
                <button type="button" className={`btn btn-primary ${(!isReady2Submit || isSubmitting || isLoading) && 'disabled'}`} disabled={(!isReady2Submit || isSubmitting || isLoading)} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, false) }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Submitting...' : 'Enviando...') : ((language === 'en_us') ? 'Submit' : 'Enviar'))}</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  </>
  return rjsfbuilder
}
/**
 * Carousel - Pré-visualização do formulario montado
 * 
 * folha de estilos: https://looplex.github.io/wf_reactcomponents/form/Carousel/Carousel.css
 */
function CarouselView({ schemacards, language = 'pt-br', codeId }) {
  const [activeCard, setActiveCard] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const carouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const isLoadingRemoteSchema = useRef(false);
  const [cards, setCards] = useState(schemacards)
  const [allLoadedCards, setAllLoadedCards] = useState([])
  const cardFormData = useRef({});
  let payloadFormData = {};

  /** Hooks - INÍCIO */
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [activeCard]);
  /** Hooks - FIM */

  /** Component Helpers - INICIO */
  // Timer
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
  // Funcao que verifica se o objeto é vazio
  function isObjectEmpty(objectName) {
    return JSON.stringify(objectName) === '{}'
  }
  // Monta a estrutura do objeto JSON
  function assembleJSONObjectStructure(source) {
    let obj = JSON.parse(JSON.stringify(source))
    // iterate over the property names
    Object.keys(obj).forEach(function (k) {
      // slip the property value based on `.`
      var prop = k.split('.');
      let is_single_prop = false;
      if (prop.length === 1) {
        is_single_prop = true;
      }
      // get the last value from array
      var last = prop.pop();
      // iterate over the remaining array value 
      // and define the object if not already defined
      prop.reduce(function (o, key) {
        // define the object if not defined and return
        return o[key] = o[key] || {};
        // set initial value as object
        // and set the property value
      }, obj)[last] = obj[k];
      // delete the original property from object
      if (!is_single_prop)
        delete obj[k];
    });
    return obj
  }
  // Checa se um valor existe no Objeto JSON
  function isValueInObject(searchObject, referenceObject) {
    function get(obj, path) {
      return path.split('.').reduce((r, e) => {
        if (!r) return r
        else return r[e] || undefined
      }, obj)
    }
    function compare(a, b, prev = "") {
      return Object.keys(a).reduce((r, e) => {
        const path = prev + (prev ? '.' + e : e);
        const value = a[e] === get(b, path);

        if (typeof a[e] === 'object') {
          r = compare(a[e], b, path)
        } else {
          r = value
        }
        return r;
      }, false)
    }
    return compare(searchObject, referenceObject);
  }
  /** Component Helpers - FIM*/

  /** Funções do Componente - INÍCIO */
  // executa uma DMN -- precisa do endpoint no post.js
  async function runDMN(formData, dmnStructure, tenant) {
    // formData é a variável com o objeto de respostas atuais do formulário
    // dmnStrucutre é o atributo dmn do card (contém dmnID e map)
    let { id, map } = dmnStructure
    let dmnVariables = {};
    for (let i in map) {
      dmnVariables[i] = map[i].split('.').reduce(
        (preview, current) => preview[current],
        formData
      )
    }
    try {
      let data = {
        command: "runDMN",
        tenant: tenant,
        id: id,
        variables: dmnVariables
      };
      let config = {
        method: 'post',
        url: `/api/code/${codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        return res.data.output.output;
      }
    } catch (e) {
      throw new Error('Erro ao executar DMN')
    }
  }
  // Essa função é utilizada para definir os cards que deverão ser exibidos
  function defineSchema(initialcards = [], cardId = '', formData = {}) {
    let tmpcards = [];
    // Aqui vamos carregar cards que tenham sido carregados na memória (no lugar o arquivo rjsf)
    if (initialcards && initialcards.length > 0) {
      tmpcards = initialcards;
    }
    // Antes de atualizar a exibição, vamos atualizar o 
    // formData caso fornecido para um card
    tmpcards.forEach(cd => {
      if (cd.cardId === cardId) {
        cd.formData = formData
      }
    })
    // Aqui vamos definir uma variavel com todos os dados dos cards,
    // agrupados por scope. Se não houver scope, vamos jogar para a 
    // raiz do formData
    // Antes de montar o FormData, vamos passar pelo schema e criar as propriedades que não existirem
    for (let i = 0; i < tmpcards.length; i++) {
      let tmpschema = tmpcards[i].schema;
      for (const property in tmpschema.properties) {
        switch (tmpschema.properties[property].type) {
          case 'string':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = '';
            }
            break;
          case 'number':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = 0;
            }
            break;
          case 'array':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = [];
            }
            break;
          case 'object':
            if (!tmpcards[i].formData.hasOwnProperty(property)) {
              tmpcards[i].formData[property] = {};
            }
            break;
        }
      }
    }

    let mergedFormData = {}
    for (let i = 0; i < tmpcards.length; i++) {
      let tcard = tmpcards[i];
      if (tcard.scope && tcard.scope !== '') {
        mergedFormData[tcard.scope] = { ...tcard.formData }
      } else {
        mergedFormData = { ...mergedFormData, ...tcard.formData }
      }
    }
    // Para cada card, vamos verificar as condicoes para exibicao
    let cards2Show = [];
    // return tmpcards
    tmpcards.forEach(cd => {
      /**  Se eu nao tiver "card_conditions" ou se as "card_conditions" 
       * forem vazias, vamos mostrar o card
      */
      if (!cd.hasOwnProperty('card_conditions') || cd.card_conditions == undefined || cd.card_conditions == 'undefined' || (cd.hasOwnProperty('card_conditions') && isObjectEmpty(cd.card_conditions))) {
        cards2Show.push(cd);
      } else {
        // Se temos "card_conditions", vamos verificar se todas estão 
        // em nosso parâmetro fornecido e se o valor é compatível
        if (cd.hasOwnProperty('card_conditions') && !isObjectEmpty(cd.card_conditions)) {
          let includeInDeck = true;
          let formatted_card_conditions = assembleJSONObjectStructure(cd.card_conditions)
          for (const card_condition in formatted_card_conditions) {
            let searchObj = {};
            searchObj[card_condition] = formatted_card_conditions[card_condition];
            let exists = isValueInObject(searchObj, mergedFormData);
            if (!exists) { includeInDeck = false; }// Entao nao incluimos no deck
          }
          if (includeInDeck) cards2Show.push(cd)
        }
      }
    })
    // Ao final, retornamos o array com cards que atendem as conditions
    return cards2Show;
  }
  // Carrega um schema remoto, que está armazenado no cosmosDB
  // Precisa do endpoint fetchSchema no post.js
  async function loadRemoteSchema(id, cardId, formData, scope = '', card_conditions = {}, tenant = 'looplex.com.br', codeId = '') {
    let documentDetails = {};
    async function fetchRemoteSchema() {
      let data = {
        command: "fetchSchema",
        tenant: tenant,
        id: id
      };
      let config = {
        method: 'post',
        url: `/api/code/${codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        let newCard = {};
        let iSchema = {};
        let tmpCards = allLoadedCards;
        if (res.data.output.hasOwnProperty('cards') && Array.isArray(res.data.output.cards)) { // É um array, não um objeto
          let tmpcardsarray = res.data.output.cards;
          for (let i = 0; i < tmpcardsarray.length; i++) {
            iSchema = tmpcardsarray[i];
            newCard = {
              cardId: iSchema.cardId,
              partitionKey: iSchema.partitionKey,
              card_conditions: iSchema.card_conditions,
              scope: iSchema.scope,
              dmnStructure: iSchema.dmnStructure,
              schema: iSchema.schema,
              uiSchema: iSchema.uiSchema,
              formData: {},
              tagName: 'div'
            }
            tmpCards.push(newCard);
          }
        } else { // Tenho só o objeto de um card
          iSchema = res.data.output;
          newCard = {
            cardId: iSchema.id,
            card_conditions: card_conditions,
            scope: (scope && scope != '') ? scope : '',
            dmnStructure: iSchema.dmnStructure,
            schema: iSchema.schema,
            uiSchema: iSchema.uiSchema,
            formData: {},
            tagName: 'div'
          };
          tmpCards.push(newCard);
        }
        setAllLoadedCards(() => tmpCards) // criando um local que tem todas as cards, exibidas ou não        
        let newcards;
        // setTmpVisor(newcards)
        if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
          newcards = defineSchema(loadPriorFormData(documentDetails, true), cardId, formData);
        } else {
          newcards = defineSchema(tmpCards, cardId, formData)
        }
        setCards(() => newcards)
      }
      setIsLoading(false)
    }
    let maxAttempts = 3;
    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      if (isLoadingRemoteSchema.current) {
        // console.log('mounted');
      } else {
        // console.log('mounting');
        isLoadingRemoteSchema.current = true;
        setIsLoading(true);
        fetchRemoteSchema()
          .then(res => {
            countAttempts = maxAttempts;
            console.log('Remote Schema loaded successfully. Attempt: ' + countAttempts)
            setIsLoading(false);
          })
          .catch(err => { // Se houver erro em carregar o formulario inicial, vamos tentar de novo
            setIsLoading(false);
            if (countAttempts >= maxAttempts) {
              setTmpVisor('Erro ao carregar o formulário remoto: ' + err.message)
            }
            sleep(500);
          });
      }
      if (countAttempts == maxAttempts) break;
    }
  }
  // Busca o formData que será exibido como valor anterior
  function loadPriorFormData(docdetails, keepFormData = false) {
    let currentVersion = docdetails.versions.filter(v => v.version == docdetails.currentVersion);
    let formDataComplete = {};
    if (currentVersion && currentVersion.length > 0) {
      formDataComplete = currentVersion[0].formData;
    }
    // console.log('formDataComplete', formDataComplete)
    let priorDataCards = allLoadedCards.map((card) => {
      // Para cada schema no card, vou montar o objeto de prior correspondente
      let priorData = {}
      if (card.hasOwnProperty('schema') && card.schema.hasOwnProperty('properties')) {
        for (const property in card.schema.properties) {
          priorData[property] = formDataComplete[property];
        }
      }
      let loadedFormData = priorData
      if (keepFormData) {
        let loadedcard = cards.filter(cd => cd.cardId === card.cardId);
        if (loadedcard && loadedcard.length > 0)
          loadedFormData = loadedcard[0].formData
      }
      return {
        ...card,
        priorFormData: priorData,
        formData: loadedFormData
      }
    })
    return priorDataCards
  }
  // Chamado sempre que o botão de próxima ou anterior for clicado
  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    let canRunDMN = true;
    let dmnVariables = {};
    // Temos uma DMN na estrutura do Card (carregamento de cards progressivo)
    if (dmnStructure && !isObjectEmpty(dmnStructure)) {
      console.log('Tem uma DMN aqui...')
      for (let dmnInput in dmnStructure.map) {
        dmnVariables[dmnInput] = dmnStructure.map[dmnInput].split('.').reduce(
          (preview, current) => preview[current],
          formData
        )
      }
      // setTmpVisor(JSON.stringify(dmnVariables))
      for (let [dmnInput2, localVar] of Object.entries(dmnStructure.map)) {
        if (dmnVariables[dmnInput2] === undefined) {
          canRunDMN = false;
        }
      }
      if (canRunDMN) {
        console.log('Can run DMN')
        setIsLoading(true)
        let arrayIDs = await runDMN(formData, dmnStructure, load_card['partitionKey'])
        if (arrayIDs && arrayIDs.length > 0 && arrayIDs[0].cardID) {
          let current_ID = arrayIDs[0].cardID
          let scope = arrayIDs[0].scope
          let card_conditions = (arrayIDs[0].card_conditions && arrayIDs[0].card_conditions !== '') ? JSON.parse(arrayIDs[0].card_conditions) : {};
          let card_loaded = cards.filter(cd => cd.cardId === current_ID);
          if (!card_loaded || card_loaded.length === 0) {
            await loadRemoteSchema(current_ID, cardId, formData, scope, card_conditions)
            isLoadingRemoteSchema.current = false;
          }
          setIsLoading(false)
        } else {
          setIsLoading(false)

        }
      }
    }

    let nextState = defineSchema(cards, cardId, formData)
    setCards(() => nextState)
    if (cards.length > 1) {
      let moveLeft = Math.max(0, activeCard - 1);
      let moveRight = Math.min(cards.length - 1, activeCard + 1);
      setActiveCard(() => (cardTargetIdx === 'moveLeft' ? moveLeft : moveRight))
    }
  }
  // Chamado sempre que o formulário for alterado
  async function handleChangeEvent(cardId, formData) {
    if (!cardId) return
    cardFormData.current[cardId] = formData
  }

  // Chamado sempre que o formulário for alterado e o campo perder o foco
  async function handleBlurEvent(cardId) {
    if (!cardId) return
    // Ao dar o blur, vamos atualizar o formData do card todo
    setCards(prev => {
      let cardFD = prev.filter(cd => cd.cardId === cardId)[0].formData;
      let newFormData = { ...cardFD, ...cardFormData.current[cardId] }
      let nextState = defineSchema(prev, cardId, newFormData)
      return nextState
    })
  }

  /** Funções do Componente - FIM*/

  let carousel = <>
    <div className="wfcomponent carousel">
      <section class="deckofcards">
        <div ref={carouselRef} className='d-carousel d-w-full'>
          {
            (cards.length === 0) ?
              <span>Prévia indisponível</span>
              : ''
          }
          {cards.map((card, index) => {
            const active = index === activeCard;
            return (
              <div id={`card_${index}`} key={`card_${index}`} className='d-carousel-item d-w-full' ref={active ? activeCardRef : null}>
                <div className="d-w-full">
                  <Form {...card} onChange={({ formData }, id) => handleChangeEvent(card.cardId, formData)} onBlur={() => handleBlurEvent(card.cardId)} liveValidate />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="navigation d-flex align-items-end flex-column">
        <div className="d-flex d-space-x-4 align-items-center">
          <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} disabled={((activeCard - 1) < 0 || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(language === 'en_us') ? 'Previous' : 'Anterior'}</button>
          <span class="glyphicon glyphicon-option-horizontal"></span>
          <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} disabled={((activeCard + 1) >= cards.length || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveRight') }}>{(language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
        </div>
      </section>
    </div>
  </>
  return carousel
}
/**
 * JSONStructureView - Pré-visualização do Schema montado
 * 
 * folha de estilos: https://looplex.github.io/wf_reactcomponents/form/JSONStructureView/JSONStructureView.css
 */
function JSONStructureView({ json }) {
  let lineNumbers = useRef([]);
  /** Component Helpers - INICIO */
  // Faz o syntax Hightlight para JSON
  function syntaxHighlight(json) {
    if (typeof json != "string") {
      json = JSON.stringify(json, null, "\t");
    }
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    let withHTML = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      }
    );
    let totalLines = withHTML.match(/\n/g) ? withHTML.match(/\n/g).length : 0;
    let currentLines = []
    for (let i = 0; i < totalLines + 1; i++) {
      currentLines.push(i + 1)
    }
    lineNumbers.current = currentLines;
    return withHTML;
  }
  /** Component Helpers - FIM */

  let jsoncontent = syntaxHighlight(JSON.stringify(json, undefined, 4))
  let jsonview = <div className="wfcomponent json-structure-view d-flex flex-row d-w-full">
    <div className="linenumbers">
      {
        lineNumbers.current.map(nmb => (
          <div className="linenumber d-flex text-right">{nmb}</div>
        ))
      }
    </div>
    <div className="jsoncontent d-flex d-grow">
      <pre
        dangerouslySetInnerHTML={{
          __html: jsoncontent
        }}
      />
    </div>
  </div>
  return jsonview
}
