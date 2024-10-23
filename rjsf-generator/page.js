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
                  <AsidePanel pageLayout={pageLayout} language={initialform.language} previewSchema={previewSchema} />
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
        {(panelView == 'preview') && (<div className="preview-form"><Carousel schemacards={previewSchema} /></div>)}
        {(panelView == 'schema' ) && (<JSONStructureView json={previewSchema} />)}
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
function RJSFBuilder({ cards }) {
  return <>RJSFBuilder</>
}
/**
 * Carousel - Pré-visualização do formulario montado
 * 
 * folha de estilos: https://looplex.github.io/wf_reactcomponents/form/Carousel/Carousel.css
 */
function Carousel({ schemacards }) {
  const [activeCard, setActiveCard] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const carouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const isLoadingRemoteSchema = useRef(false);
  const [cards, setCards] = useState(schemacards)
  const [allLoadedCards, setAllLoadedCards] = useState([])
  const [preloadCards, setPreloadCards] = useState([])
  let language = 'pt-br';
  let payloadFormData = {};
  let tenant = '';
  let codeId = '';

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
  async function handleChangeEvent(cardId, formData, fieldId) {
    let documentDetails = {};
    // Quando altero qualquer campo do meu form, eu quero
    // atualizar o formData do card correspondente
    let field = fieldId.replace('root_', '').replaceAll('_', '.');
    let nextState;
    if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
      let tmpNextState = loadPriorFormData(documentDetails, true);
      nextState = setSchema(tmpNextState, cardId, formData);
    } else {
      nextState = setSchema(allLoadedCards, cardId, formData)
    }
    setCards(() => nextState)
    // Vamos também verificar se o nosso botão tem que ser renderizado novamente
    let load_card = nextState.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    if (!isObjectEmpty(dmnStructure)) {
      // setTmpVisor(JSON.stringify(dmnStructure.map))
      for (let dmnInput in dmnStructure.map) {
        if (dmnStructure.map[dmnInput] === field) {
          // Se o campo que eu alterei tem impacto no carregamento das DMNs, 
          // temos que fazer uma nova verificação para o carregamento dela
          // setIsReady2Submit(false)
        }
      }
    }
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
                  <Form {...card} onChange={(event, id) => handleChangeEvent(card.cardId, event.formData, id)} liveValidate />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="navigation d-flex align-items-end flex-column">
        <div className="d-flex d-space-x-4 align-items-center">
          <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(language === 'en_us') ? 'Previous' : 'Anterior'}</button>
          <span class="glyphicon glyphicon-option-horizontal"></span>
          <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveRight') }}>{(language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
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
    return json.replace(
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
  }
  /** Component Helpers - FIM */

  let jsonview = <div className="wfcomponent json-structure-view">
    <pre
      dangerouslySetInnerHTML={{
        __html: syntaxHighlight(JSON.stringify(json, undefined, 4))
      }}
    />
  </div>
  return jsonview
}
