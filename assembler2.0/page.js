
function App() {
  let pageLayout = {
    main: true,
    aside: true,
    aside_summary: true,
    aside_docpreview: true,
    aside_previousversions: false,
    aside_attachments: false
  }
  let initialform = {
    language: 'pt-br'
  }
  let cards = [
    {
      "cardId": "outorgante",
      "card_conditions": {},
      "schema": {
        "title": "Outorgante",
        "type": "object",
        "description": "",
        "definitions": {},
        "properties": {
          "qualificacao": {
            "title": "Qualificação",
            "type": "object",
            "description": "",
            "properties": {
              "nome": {
                "type": "string",
                "title": "Nome",
                "description": "",
                "default": ""
              },
              "endereco": {
                "type": "string",
                "title": "Endereço",
                "description": "",
                "default": ""
              },
              "numero": {
                "type": "number",
                "title": "nº",
                "description": "",
                "default": 0
              },
              "bairro": {
                "type": "string",
                "title": "Bairro",
                "description": "",
                "default": ""
              },
              "cidade": {
                "type": "string",
                "title": "Cidade",
                "description": "",
                "default": ""
              },
              "uf": {
                "type": "string",
                "title": "UF",
                "description": "",
                "default": "",
                "anyOf": [
                  {
                    "type": "string",
                    "enum": [
                      ""
                    ],
                    "title": "-- Selecione --"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "SP"
                    ],
                    "title": "São Paulo"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "RJ"
                    ],
                    "title": "Rio de Janeiro"
                  }
                ]
              },
              "cep": {
                "type": "string",
                "title": "CEP",
                "description": "",
                "default": ""
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "qualificacao": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "nome": {
                "classNames": "col-md-12"
              },
              "endereco": {
                "classNames": "col-md-9"
              },
              "numero": {
                "classNames": "col-md-3"
              },
              "bairro": {
                "classNames": "col-md-4"
              },
              "cidade": {
                "classNames": "col-md-4"
              },
              "uf": {
                "classNames": "col-md-2"
              },
              "cep": {
                "classNames": "col-md-2"
              }
            }
          ],
          "cep": {
            "ui:widget": "masked",
            "ui:options": {
              "mask": "99.999-999",
              "type": "code"
            }
          },
          "ui:field": "autofill",
          "ui:autofill": {
            "requestConfig": {
              "method": "POST",
              "url": "/api/code/7C1E4940-A12B-11EF-AA4C-AD8F75759CDD",
              "data": {
                "cep": "{{{cep}}}"
              }
            },
            "responseMap": {
              "output.street": "endereco",
              "output.neighborhood": "bairro",
              "output.city": "cidade",
              "output.state": "uf"
            },
            "trigger": "cep"
          }
        }
      },
      "formData": {},
      "priorFormData": {},
      "tagName": "div"
    },
    {
      "cardId": "outorgado",
      "card_conditions": {},
      "dmnStructure": {
        "id": "dmn-octavio-novoUI-v2.0",
        "tenant": "looplex.com.br",
        "map": {
          "document": "qualificacao.nome"
        }
      },
      "schema": {
        "type": "object",
        "title": "Outorgado",
        "description": "",
        "definitions": {},
        "properties": {
          "qualificacao": {
            "type": "object",
            "title": "Qualificação",
            "description": "",
            "properties": {
              "nome": {
                "type": "string",
                "title": "Nome",
                "description": "",
                "default": ""
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "qualificacao": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "nome": {
                "classNames": "col-md-12"
              }
            }
          ]
        }
      },
      "formData": {},
      "priorFormData": {},
      "tagName": "div"
    },
    {
      "cardId": "poderes",
      "card_conditions": {
        "outorgado.qualificacao.nome": "Erick"
      },
      "schema": {
        "type": "object",
        "title": "Poderes",
        "description": "",
        "definitions": {},
        "properties": {
          "lista_poderes": {
            "type": "object",
            "title": "Lista de Poderes",
            "description": "",
            "properties": {
              "poderes": {
                "type": "array",
                "title": "Poderes",
                "description": "",
                "default": "",
                "items": {
                  "type": "object",
                  "title": "",
                  "properties": {
                    "poder": {
                      "type": "string",
                      "title": "Poder",
                      "description": "",
                      "default": ""
                    }
                  }
                }
              }
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "lista_poderes": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "poderes": {
                "classNames": "col-md-12"
              }
            }
          ],
          "poderes": {
            "items": {
              "poder": {
                "ui:widget": "textarea"
              },
              "ui:ObjectFieldTemplate": "layout",
              "ui:layout": [
                {
                  "poder": {
                    "classNames": "col-md-12"
                  }
                }
              ]
            }
          }
        }
      },
      "formData": {},
      "priorFormData": {},
      "tagName": "div"
    }
  ]
  const [formData, setFormData] = useState({})
  const [docDetails, setDocDetails] = useState({
    "id": "teste001",
    "partitionKey": "looplex.com.br",
    "versions": [
      {
        "version": "1.0.0",
        "author": "Octavio Ietsugu",
        "date": "2024-07-02T21:23:05",
        "description": "Versão Inicial",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1719955377211_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Octavio Ietsugu",
            "cnpj": "01.002.122/0001-16"
          },
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "2.0.0",
        "author": "Looplex",
        "date": "2024-07-04T19:25:59",
        "description": "Testando FilePond",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1720121149486_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Octavio Ietsugu",
            "cnpj": "01.002.122/0001-16"
          },
          "anexo": "Temp/7_nUDCL_-hl9e12F53Ac_/Screenshot from 2024-07-04 14-48-48.png",
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "3.0.0",
        "author": "Looplex",
        "date": "2024-07-04T19:34:04",
        "description": "Teste novo AAA",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1720121634126_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Octavio Ietsugu",
            "cnpj": "01.002.122/0001-16"
          },
          "anexo": "Temp/NP_ItCMX4P54QsHl4aCXy/Screenshot from 2024-07-04 14-48-48.png",
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "2.1.1",
        "author": "Looplex",
        "date": "2024-07-04T19:36:51",
        "description": "Agora com documento",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1720121795051_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Octavio Ietsugu",
            "cnpj": "01.002.122/0001-16"
          },
          "anexo": "Temp/RDVvE6OtisA2RF1C8P0vI/1720047459663_fornecimentoprodutos.docx",
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "2.2.2",
        "author": "Looplex",
        "date": "2024-07-04T20:38:27",
        "description": "Teste com anexo",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1720125494762_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Erick Kitada",
            "cnpj": "01.002.122/0001-16"
          },
          "anexo": "Temp/ke-Fie48-THvGVEF5l4ID/Collaço Gallotti & Petry (1).pdf",
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "3.3.3",
        "author": "Looplex",
        "date": "2024-07-04T20:39:53",
        "description": "Testando filepond",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1720125583593_fornecimentoprodutos.docx"
        },
        "formData": {
          "strContratada": {
            "nome": "Erick Kitada",
            "cnpj": "01.002.122/0001-16"
          },
          "anexo": "Temp/EsWvkhix6tSZHUKIW6PAw/comparison_1720125042161.docx",
          "strContrato": {
            "prazoAvisoVolume": 5,
            "inicioVigencia": "01/12/2024",
            "fimVigencia": "31/12/2024",
            "prazoPagamento": 7,
            "dataExp": "02 de julho de 2024"
          }
        }
      },
      {
        "version": "OMcwP",
        "author": "Looplex",
        "date": "2024-07-22T22:35:50",
        "description": "Versão Inicial",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1721687742775_fornecimentoprodutos.docx"
        },
        "formData": {
          "selecionado": "primeiro",
          "primeiro_selecionado": "Octavio OK"
        }
      },
      {
        "version": "2",
        "author": "Looplex",
        "date": "2024-09-19T20:30:12",
        "description": "ok ok ok",
        "document": {
          "path": "looplex.com.br/shared/workflows/teste/uploadedDocuments/looplex.com.br/1726777805573_fornecimentoprodutos.docx"
        },
        "formData": {
          "requester": {
            "emailAddress": "kitada.erick@gmail.com",
            "name": "Erick Takahama Kitada"
          },
          "caseReference": {
            "caseId": "123"
          },
          "deliverable": {
            "productDeliverable": "Gerar Solicitação de Proposta ou Solicitação de Cotação (RFP/RFQ)"
          }
        }
      }
    ],
    "attachments": [
      {
        "title": "Relatório Interno",
        "description": "Relatório de uso interno",
        "date": "2024-06-13T10:00:00",
        "document": {
          "path": "looplex.com.br/daiani/porretinho.png",
          "filename": "acordo_sigilo",
          "type": "docx"
        }
      },
      {
        "title": "Screenshot from 2024-07-04 14-48-48",
        "description": "Screenshot from 2024-07-04 14-48-48",
        "date": "2024-07-04T19:25:59",
        "document": {
          "path": "looplex.com.br/Screenshot from 2024-07-04 14-48-48.png",
          "filename": "Screenshot from 2024-07-04 14-48-48",
          "type": "png"
        }
      },
      {
        "title": "Screenshot from 2024-07-04 14-48-48",
        "description": "Screenshot from 2024-07-04 14-48-48",
        "date": "2024-07-04T19:34:04",
        "document": {
          "path": "looplex.com.br/Screenshot from 2024-07-04 14-48-48.png",
          "filename": "Screenshot from 2024-07-04 14-48-48",
          "type": "png"
        }
      },
      {
        "title": "1720047459663_fornecimentoprodutos",
        "description": "1720047459663_fornecimentoprodutos",
        "date": "2024-07-04T19:36:51",
        "document": {
          "path": "looplex.com.br/1720047459663_fornecimentoprodutos.docx",
          "filename": "1720047459663_fornecimentoprodutos",
          "type": "docx"
        }
      },
      {
        "title": "comparison_1720125042161",
        "description": "comparison_1720125042161",
        "date": "2024-07-04T20:39:53",
        "document": {
          "path": "looplex.com.br/comparison_1720125042161.docx",
          "filename": "comparison_1720125042161",
          "type": "docx"
        }
      }
    ],
    "currentVersion": "2",
    "author": "Octavio Ietsugu",
    "description": "Contrato de Fornecimento de Produtos",
    "created_at": "2024-06-13T10:00:00",
    "updated_at": "2024-09-19T20:30:12",
    "title": "Contrato de Fornecimento de Produtos",
    "base_filename": "fornecimentoprodutos.docx",
    "template": "https://looplex-workflows.s3.sa-east-1.amazonaws.com/webinar/testes/Plastipak-template.docx",
    "_rid": "wpJvAJ+K6eUBAAAAAAAAAA==",
    "_self": "dbs/wpJvAA==/colls/wpJvAJ+K6eU=/docs/wpJvAJ+K6eUBAAAAAAAAAA==/",
    "_etag": "\"0200c002-0000-0200-0000-66ec89d50000\"",
    "_attachments": "attachments/",
    "_ts": 1726777813
  })
  const [previewSchema, setPreviewSchema] = useState([]);
  const [previewURL, setPreviewURL] = useState('https://looplex-workflows.s3.sa-east-1.amazonaws.com/templates/docs/proposta_ajustada_ietsugu.docx');
  const [documentRendered, setDocumentRendered] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  
  function defineFormData(fd) {
    setFormData(() => fd)
  }
  function defineDocDetails(dd) {
    setDocDetails(() => dd)
  }
  function definePreview(newurl) {
    setPreviewURL(() => newurl)
  }
  function definePreviewSchema(sch) {
    setPreviewSchema(() => sch)
  }
  function defineActiveCard(ac){
    setActiveCard(() => ac)
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
                  <CarouselForm schemacards={cards} language={(initialform.language ? initialform.language : "pt-br")} codeId={props.codeId} initialform={initialform} defineFormData={defineFormData} defineDocDetails={defineDocDetails} definePreviewSchema={definePreviewSchema} defineActiveCard={defineActiveCard} />
                </main>
              )}

            {pageLayout.aside &&
              (
                <aside className="card-aside-wrapper">
                  <AsidePanel pageLayout={pageLayout} language={initialform.language} documentDetails={docDetails} previewSchema={previewSchema} activeCard={activeCard} initialform={initialform} previewURL={previewURL} definePreview={definePreview} documentRendered={documentRendered} />
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
function PageHeader({title = 'Looplex Form'}) {
  return <Head>
    <title>{title}</title>
    <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
    <link rel='stylesheet' type='text/css' href='https://bootswatch.com/5/lumen/bootstrap.min.css' />
    <link rel="stylesheet" type='text/css' href='https://looplex-workflows.s3.us-east-1.amazonaws.com/css-form-padrao/ant.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/css-form-padrao/daisy.css' />
    <link rel="stylesheet" type='text/css' href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
    { /** Estilos dos Componentes Utilizados -- INÍCIO */}
    <link rel='stylesheet' type='text/css' href='https://octaviosi.github.io/styles/assembler2.0/default-form.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/CarouselForm/CarouselForm.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/SummaryView/SummaryView.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/DocumentPreview/DocumentPreview.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/PreviousVersionsView/PreviousVersionsView.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/AttachmentsView/AttachmentsView.css' />
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
function LooplexHeader({title = 'Looplex Form'}) {
  return (
    <div className="looplex-header">
      <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" /><span>{title}</span>
    </div>
  )
}
function CarouselForm({ schemacards, language = 'pt-br', codeId, initialform = {}, defineFormData, defineDocDetails, definePreviewSchema, defineActiveCard }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([])
  const [preloadedCards, setPreloadedCards] = useState([])
  const allLoadedCards = useRef(schemacards)
  const carouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);
  const isLoadingRemoteSchema = useRef(false);
  const isLoadingDocumentDetails = useRef(false);
  const cardsFormData = useRef({});
  const lastTouchedField = useRef('');
  const documentDetails = useRef({});

  /** Hooks - INÍCIO */
  useEffect(() => { // Roda uma vez no início
    async function fetchRemote(remoteList) {
      for (let i = 0; i < remoteList.length; i++) {
        let item = remoteList[i]
        switch (item.type) {
          case 'docdetails':
            console.log(`Loading Remote Document Details (${item.id})...`)
            await loadDocumentDetails(item.id, item.tenant, true)
            break;
          default://schema
            console.log(`Loading Remote Schema (${item.id})...`)
            await loadRemoteSchema(item.id, item.tenant)
            break;
        }
      }
    }
    let remoteList = [];
    if (initialform.hasOwnProperty('initialFormId') && initialform.initialFormId !== '') {
      remoteList.push({
        type: 'schema',
        id: initialform.initialFormId,
        tenant: (initialform.initialFormTenant ? initialform.initialFormTenant : 'looplex.com.br')
      })
    } else {
      setCards(setSchema(schemacards))
    }
    if (initialform.hasOwnProperty('initialDocumentId') && initialform.initialDocumentId) {
      remoteList.push({
        type: 'docdetails',
        id: initialform.initialDocumentId,
        tenant: (initialform.initialDocumentTenant ? initialform.initialDocumentTenant : 'looplex.com.br')
      })
    }
    fetchRemote(remoteList)
  }, [])
  useEffect(() => {
    console.log('cards changed!')
    defineFormData(cardsFormData.current)
    definePreviewSchema(cards)
  }, [cards])
  useEffect(() => {
    console.log('Preloading cards...', preloadedCards)
    async function fetchRemote(remoteList) {
      for (let i = 0; i < remoteList.length; i++) {
        let item = remoteList[i]
        await loadRemoteSchema(item.id, item.tenant)
      }
    }
    /**
     * A estrutura do preloaded_cards que existe em um schema é a seguinte:
    // "preloaded_cards": [
    //   {
    //       "id": "terceiro",
    //       "tenant": "looplex.com.br",
    //       "card_conditions": {"outorgado.qualificacao.nome":"erick.kitada"}
    //   }
    // ]
    */
    if(preloadedCards && preloadedCards.length > 0) fetchRemote(preloadedCards)
  }, [preloadedCards])
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    defineActiveCard(activeCard)
  }, [activeCard]);
  /** Hooks - FIM */

  /** Component Helpers - INICIO */
  function isObjectEmpty(objectName) {
    return JSON.stringify(objectName) === '{}'
  }
  function assembleJSONObjectStructure(source) {
    // Monta a estrutura do objeto JSON
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
  async function runDMN(formData, dmnStructure) {
    /** executa uma DMN -- precisa do endpoint no post.js    
     * formData é a variável com o objeto de respostas atuais do formulário
     * dmnStructure é o atributo dmn do card (contém dmnID e map)
     * 
     * O formato da estrutura no schema é o seguinte: 
     * 
        "dmnStructure": {
          "id": "teste-dmn", // ID da DMN
          "tenant": "looplex.com.br", // tenant da DMN
          "map": {
              "document": "requester.name" // property ("document" no caso) é a variable da DMN. O valor ("requester.name") é o campo que será lido no formData atual
          }
        }
     */
    let { id, tenant, map } = dmnStructure
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
        tenant,
        id,
        variables: dmnVariables
      };
      let config = {
        method: 'post',
        url: `/api/code/${codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        /**
         * O retorno da DMN configurada para funcionar com os Forms traz as seguintes propriedades:
         * cardID (schema que a DMN entendeu que deve ser carregada)
         * card_conditions (condicoes para que este card carregado seja exibido)
         * 
         * As card_conditions devem ser definidas aqui pois podem ser variaveis e que não
         * dependam do input do schema que foi carregado. Por exemplo, imagine que a minha DMN carregue
         * um schema basic-NDA, e que eu queira que, no contexto deste form, esse schema seja exibido
         * se a minha variavel do form presente (nao do basic-NDA) for igual a "ietsugu". Esse valor não
         * está definido no schema basic-NDA, que pode ser um schema mais abstrato e não vinculado 
         * necessariamente ao basic-NDA. Nesse caso, em nossa DMN, vamos também passar um card_conditions
         * que estipulem essa definição e, ao carregarmos o schema remoto, aplicamos essas card_conditions.
         * 
         */
        return res.data.output.output;
      }
    } catch (e) {
      throw new Error(`Erro ao executar DMN: ${e.message}`)
    }
  }
  async function checkDMN(cardId, field) {
    // Vamos analisar antes todos os cards e ver se há alguma DMN vinculada a este field
    let shouldCheck = false;
    let mapVar = field.substring(field.indexOf('.') + 1);
    console.log('mapVar', mapVar)
    for (let i = 0; i < allLoadedCards.current.length; i++) {
      let currentCard = allLoadedCards.current[i];
      if (currentCard.hasOwnProperty('dmnStructure') && !isObjectEmpty(currentCard.dmnStructure) && currentCard.dmnStructure.hasOwnProperty('map') && !isObjectEmpty(currentCard.dmnStructure.map)) {
        for (const [key, mapVal] of Object.entries(currentCard.dmnStructure.map)) {
          console.log('mapVal', mapVal)
          if (mapVal === mapVar) shouldCheck = true
        }
      }
    }
    if (!shouldCheck) return
    console.log('Checando pela existência de DMN no card...')
    // Esta função verifica se o card tem uma regra de DMN
    let load_card = allLoadedCards.current.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    if (!dmnStructure || isObjectEmpty(dmnStructure)) return
    // Temos uma DMN na estrutura do Card (carregamento de cards progressivo)
    let canRunDMN = true;
    let dmnVariables = {};
    for (let dmnInput in dmnStructure.map) {
      dmnVariables[dmnInput] = dmnStructure.map[dmnInput].split('.').reduce(
        (preview, current) => preview[current],
        cardsFormData.current[cardId]
      )
    }
    for (let [dmnInput2, localVar] of Object.entries(dmnStructure.map)) {
      if (dmnVariables[dmnInput2] === undefined) {
        canRunDMN = false;
      }
    }
    if (!canRunDMN) return
    setIsLoading(true)
    let arrayIDs = await runDMN(cardsFormData.current[cardId], dmnStructure)
    if (arrayIDs && arrayIDs.length > 0 && arrayIDs[0].cardID) {
      let current_ID = arrayIDs[0].cardID
      let current_tenant = arrayIDs[0].tenant ? arrayIDs[0].tenant : 'looplex.com.br'
      let card_conditions = (arrayIDs[0].card_conditions && arrayIDs[0].card_conditions !== '') ? JSON.parse(arrayIDs[0].card_conditions) : {};
      let card_loaded = allLoadedCards.current.filter(cd => cd.cardId === current_ID);
      if (!card_loaded || card_loaded.length === 0) {
        console.log(`Carregando Schema remoto: ${current_ID}`)
        await loadRemoteSchema(current_ID, current_tenant, card_conditions)
      }
      return true
    }
    setIsLoading(false)
    return
  }
  function setSchema(tmpcards = []) {
    // Essa função é utilizada para redefinir o deck, mostrando apenas os cards que tiveram a sua condição atendida
    let cards2Show = [];
    tmpcards.forEach(cd => {
      // Para cada card que estamos habilitando, vamos popular o formData respectivo
      cd.formData = cardsFormData.current.hasOwnProperty(cd.cardId) ? cardsFormData.current[cd.cardId] : {}
      if (!cd.hasOwnProperty('card_conditions') || cd.card_conditions == undefined || cd.card_conditions == 'undefined' || (cd.hasOwnProperty('card_conditions') && isObjectEmpty(cd.card_conditions))) {
        cards2Show.push(cd); // Se eu nao tiver "card_conditions" ou se as "card_conditions" forem vazias, vamos mostrar o card
      } else {
        // Se temos "card_conditions", vamos verificar se todas estão em nosso parâmetro fornecido e se o valor é compatível
        if (cd.hasOwnProperty('card_conditions') && !isObjectEmpty(cd.card_conditions)) {
          let includeInDeck = true;
          let formatted_card_conditions = assembleJSONObjectStructure(cd.card_conditions)
          for (const card_condition in formatted_card_conditions) {
            let searchObj = {};
            searchObj[card_condition] = formatted_card_conditions[card_condition];
            let exists = isValueInObject(searchObj, cardsFormData.current);
            if (!exists) { includeInDeck = false; }// Entao nao incluimos no deck
          }
          if (includeInDeck) cards2Show.push(cd)
        }
      }
    })
    // Ao final, retornamos o array com cards que atendem as conditions
    return cards2Show;
  }
  async function loadRemoteSchema(id, tenant = 'looplex.com.br', card_conditions = {}) {
    // Carrega um schema remoto, que está armazenado no cosmosDB
    // Precisa do endpoint fetchSchema no post.js
    // Pode acontecer de eu ter card_conditions para que o schema carregado seja
    // exibido, e isso ocorre porque às vezes queremos exibir o card apenas se uma
    // outra variavel do form tiver um valor específico.
    // Como isso não será necessariamente definido dentro do card remoto, precisamos
    // "enxertar" essa condicao agora, após carregar o card remoto
    async function fetchRemoteSchema(id, tenant, card_conditions, retries = 0, delay = 5000) {
      if (!isLoadingRemoteSchema.current) {
        isLoadingRemoteSchema.current = true;
        try {
          setIsLoading(true)
          let tmpCards = allLoadedCards.current;
          let config = {
            method: 'post',
            url: `/api/code/${codeId}`,
            data: {
              command: "fetchSchema",
              tenant: tenant,
              id: id
            }
          }
          const res = await axios(config);
          if (res.data && res.data.output) {
            console.log('Data loaded...', res.data.output)
            let newCard = {};
            let iSchema = {};
            if (res.data.output.hasOwnProperty('cards') && Array.isArray(res.data.output.cards)) { // É um array, não um objeto
              let tmpcardsarray = res.data.output.cards;
              for (let i = 0; i < tmpcardsarray.length; i++) {
                iSchema = tmpcardsarray[i];
                newCard = {
                  cardId: iSchema.cardId,
                  partitionKey: iSchema.partitionKey,
                  card_conditions: { ...iSchema.card_conditions, ...card_conditions },
                  dmnStructure: iSchema.dmnStructure,
                  schema: iSchema.schema,
                  uiSchema: iSchema.uiSchema ? iSchema.uiSchema : {},
                  formData: iSchema.formData ? iSchema.formData : {},
                  tagName: 'div'
                }
                tmpCards.push(newCard);
              }
            } else { // Tenho só o objeto de um card (é o rjsf puro, sem estrutura de cards)
              iSchema = res.data.output;
              newCard = {
                cardId: iSchema.id,
                partitionKey: iSchema.partitionKey,
                card_conditions: { ...iSchema.card_conditions, ...card_conditions },
                dmnStructure: iSchema.dmnStructure,
                schema: iSchema.schema,
                uiSchema: iSchema.uiSchema ? iSchema.uiSchema : {},
                formData: iSchema.formData ? iSchema.formData : {},
                tagName: 'div'
              };
              tmpCards.push(newCard);
            }
            allLoadedCards.current = tmpCards // atualizando o allLoadedCards com essas inclusões
            setCards(() => setSchema(loadPriorFormData(true)))
            console.log('allLoadedCards', allLoadedCards.current)
            let preloaded_cards = res.data.output.preloaded_cards ? res.data.output.preloaded_cards : [];
            setPreloadedCards(preloaded_cards)
            setIsLoading(false)
            isLoadingRemoteSchema.current = false;
            return true
          }
        } catch (e) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return await fetchRemoteSchema(id, tenant, card_conditions, retries - 1, delay * 2)
          } else {
            setIsLoading(false)
            isLoadingRemoteSchema.current = false;
            throw new Error(`All retries failed on fetchRemoteSchema: ${e.message}`);
          }
        }
      }
    }
    return await fetchRemoteSchema(id, tenant, card_conditions, 3, 5000)
  }
  async function loadDocumentDetails(id, tenant = 'looplex.com.br', firstload = false) {
    async function fetchDocumentDetails(retries = 0, delay = 5000) {
      if (!isLoadingDocumentDetails.current) {
        isLoadingDocumentDetails.current = true;
        try {
          setIsLoading(true)
          let config = {
            method: 'post',
            url: `/api/code/${props.codeId}`,
            data: {
              command: "fetchDocumentDetails",
              tenant,
              id
            }
          }
          const res = await axios(config);
          if (res.data && res.data.output) {
            documentDetails.current = res.data.output
            defineDocDetails(documentDetails.current)
            setIsLoading(false)
            isLoadingDocumentDetails.current = false;
            setCards(() => setSchema(loadPriorFormData(!firstload))) // se for um firstload, vamos popular o form com dados da ultima versao
            return true
          }
        } catch (e) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return await fetchDocumentDetails(retries - 1, delay * 2)
          } else {
            setIsLoading(false)
            isLoadingDocumentDetails.current = false;
            throw new Error(`All retries failed on fetchDocumentDetails: ${e.message}`);
          }
        }
        setIsLoading(false)
      }
    }
    return await fetchDocumentDetails(3, 5000)
  }
  function loadPriorFormData(keepFormData = false) {
    // Busca o formData que será exibido como valor anterior    
    let priorDataCards = allLoadedCards.current;
    if (documentDetails.current && documentDetails.current.hasOwnProperty('versions') && documentDetails.current.versions.length > 0) {
      let formDataComplete = {};
      let currentVersion = documentDetails.current.versions.filter(v => v.version == documentDetails.current.currentVersion);
      if (currentVersion && currentVersion.length > 0) {
        formDataComplete = currentVersion[0].formData;
      }
      priorDataCards = allLoadedCards.current.map((card) => {
        // Para cada schema no card, vou montar o objeto de prior correspondente
        let priorData = {}
        if (card.hasOwnProperty('schema') && card.schema.hasOwnProperty('properties')) {
          for (const property in card.schema.properties) {
            if (formDataComplete.hasOwnProperty(card.cardId) && formDataComplete[card.cardId].hasOwnProperty(property)) priorData[property] = formDataComplete[card.cardId][property];
          }
        }
        let loadedFormData = priorData
        if (keepFormData) {
          let loadedcard = cards.filter(cd => cd.cardId === card.cardId);
          if (loadedcard && loadedcard.length > 0)
            loadedFormData = loadedcard[0].formData
        }
        cardsFormData.current[card.cardId] = loadedFormData
        return {
          ...card,
          priorFormData: priorData,
          formData: loadedFormData
        }
      })
    }
    return priorDataCards
  }
  async function handleClickEvent(cardId, cardTargetIdx) {
    // Chamado sempre que o botão de próxima ou anterior for clicado
    setCards(setSchema(allLoadedCards.current))
    if (cards.length > 1) {
      let moveLeft = Math.max(0, activeCard - 1);
      let moveRight = Math.min(cards.length - 1, activeCard + 1);
      setActiveCard(() => (cardTargetIdx === 'moveLeft' ? moveLeft : moveRight))
    }
  }
  // Chamado sempre que o formulário for alterado
  async function handleChangeEvent(cardId, formData, id) {
    if (!cardsFormData.current.hasOwnProperty(cardId)) cardsFormData.current[cardId] = {}
    cardsFormData.current[cardId] = formData;
    lastTouchedField.current = cardId + '.' + (id.replace('root_', '').replaceAll('_', '.'))
  }
  async function handleBlurEvent(cardId) {
    let cd = cards.filter(c => c.cardId === cardId)[0]
    if (JSON.stringify(cd.formData) === JSON.stringify(cardsFormData.current[cardId])) return // Se nao mudei meu form, nao faço nada
    let ck = await checkDMN(cardId, lastTouchedField.current)
    setCards(setSchema(allLoadedCards.current))
  }
  /** Funções do Componente - FIM*/

  let carousel = <>
    <div className="wfcomponent carousel">
      <section class="deckofcards">
        <div ref={carouselRef} className='d-carousel d-w-full'>
          {
            (cards.length === 0) ?
              <span><span className="d-loading d-loading-spinner d-loading-md"></span> Carregando formulário, aguarde...</span>
              : ''
          }
          {cards.map((card, index) => {
            const active = index === activeCard;
            return (
              <div id={`card_${index}`} key={`card_${index}`} className='d-carousel-item d-w-full' ref={active ? activeCardRef : null}>
                <div className="d-w-full">
                  <Form {...card} onChange={({ formData }, id) => handleChangeEvent(card.cardId, formData, id)} onBlur={() => handleBlurEvent(card.cardId)} liveValidate />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="navigation d-flex align-items-end flex-column">
        <div className="d-flex d-space-x-4 align-items-center">
          <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} disabled={((activeCard - 1) < 0 || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{isLoading && (<><span className="d-loading d-loading-spinner d-loading-md"></span> Aguarde...</>)}{!isLoading && ((language === 'en_us') ? 'Previous' : 'Anterior')}</button>
          <span class="glyphicon glyphicon-option-horizontal"></span>
          <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} disabled={((activeCard + 1) >= cards.length || isLoading)} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, 'moveRight') }}>{isLoading && (<><span className="d-loading d-loading-spinner d-loading-md"></span> Aguarde...</>)}{!isLoading && ((language === 'en_us') ? 'Next' : 'Próxima')} <span class="glyphicon glyphicon-chevron-right"></span></button>
        </div>
      </section>
    </div>
  </>
  return carousel
}
function AsidePanel({ pageLayout, language, documentDetails, previewSchema, activeCard, initialform, previewURL, definePreview, documentRendered }) {
  const [panelView, setPanelView] = useState('summary')
  function updatePanelView(option) {
    setPanelView(() => option)
  }
  function AsideNavigation({ pageLayout, language, panelView, updatePanelView }) {
    return (
      <div className="card-navigation">
        {(pageLayout.aside_summary) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'summary' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('summary') }}>{(language === 'en_us') ? 'Summary' : 'Sumário'}</button>)}        
        {(pageLayout.aside_docpreview) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docpreview' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docpreview') }}>{(language === 'en_us') ? 'Preview' : 'Prévia'}</button>)}
        {(pageLayout.aside_previousversions) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'previousversions' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('previousversions') }}>{(language === 'en_us') ? 'Previous Versions' : 'Versões Anteriores'}</button>)}
        {(pageLayout.aside_attachments) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'attachments' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('attachments') }}>{(language === 'en_us') ? 'Attachments' : 'Anexos'}</button>)}
      </div>
    )
  }
  function AsideView({ panelView, language, documentDetails, previewSchema, activeCard, initialform, previewURL, definePreview, documentRendered }) {
    return (
      <div className="card-aside-view">
        {(panelView == 'summary') && (<SummaryView documentDetails={documentDetails} cards={previewSchema} activeCard={activeCard} initialform={initialform} />)}
        {(panelView == 'docpreview') && (<DocumentPreview url={previewURL} definePreview={definePreview}/>)}
        {/*{(panelView == 'previousversions') && (<PreviousVersionsView documentDetails={documentDetails} documentRendered={documentRendered} language={language} />)}
        {(panelView == 'attachments') && (<AttachmentsView attachments={documentDetails.attachments} language={language}/>)} */}
      </div>
    )
  }
  return (
    <>
      <AsideNavigation pageLayout={pageLayout} language={language} panelView={panelView} updatePanelView={updatePanelView} />
      <AsideView previewSchema={previewSchema} language={language} panelView={panelView} documentDetails={documentDetails} activeCard={activeCard} initialform={initialform} previewURL={previewURL} definePreview={definePreview} documentRendered={documentRendered} />
    </>
  )
}
function SummaryView({documentDetails, cards, activeCard, initialform}) {
  /** Component Helpers - INÍCIO */
  function formatUTCDate(utcdate) {
    // Formata uma data em UTC para a visualização correta e na timezone local
    let d = new Date(utcdate)
    let utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toUTCString();
    return ("0" + (new Date(utc).getDate())).slice(-2) + "/" + ("0" + (new Date(utc).getMonth() + 1)).slice(-2) + "/" + new Date(utc).getFullYear() + " " + ("0" + (new Date(utc).getHours())).slice(-2) + ":" + ("0" + (new Date(utc).getMinutes())).slice(-2) + ":" + ("0" + (new Date(utc).getSeconds())).slice(-2)
  }
  /** Component Helpers - FIM */

  /** Subcomponentes - INÍCIO */
  function Description({ description }) {
    // Descrição do documento que está sendo construído. No painel de 
    // sumário ele aparece como "Informações Gerais"      
    return (
      <div >
        <a class="btn btn-summary" data-toggle="collapse" href="#overview" role="button" aria-expanded="false" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}><span className="glyphicon glyphicon-triangle-right right-margin-5px"></span>Informações Gerais</a>
        <div class="collapse" id="overview">
          <table class="table table-hover table-sm table-bordered">
            <tbody>
              <tr>
                <td className="table-highlight col-xs-4" colspan="1">
                  Versão atual
                </td>
                <td className="col-xs-8" colspan="2">
                  {description.version}
                </td>
              </tr>
              <tr>
                <td className="table-highlight col-xs-4" colspan="1">
                  Autor
                </td>
                <td className="col-xs-8" colspan="2">
                  {description.author}
                </td>
              </tr>
              <tr>
                <td className="table-highlight col-xs-4" colspan="1">
                  Data de criação
                </td>
                <td className="col-xs-8" colspan="2">
                  {(description.created_at && description.created_at !== '') ? (formatUTCDate(description.created_at)) : ''}
                </td>
              </tr>
              <tr>
                <td className="table-highlight col-xs-4" colspan="1">
                  Última Atualização
                </td>
                <td className="col-xs-8" colspan="2">
                  {(description.updated_at && description.updated_at !== '') ? (formatUTCDate(description.updated_at)) : ''}
                </td>
              </tr>
              <tr>
                <td className="table-highlight col-xs-4" colspan="1">
                  Descrição
                </td>
                <td className="col-xs-8" colspan="2">
                  {description.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div >
      </div >
    )
  }
  function Summary({ cards, activeCard, initialform }) {
    function tableBuilder(schema, previewFormData = {}, currentFormData = {}, sublevel = 0) {
      let items = []
      // Quando em nosso RJSF temos uma subseção, colocaremos o elemento 
      // a seguir para indicar que as linhas seguintes dizem respeito 
      // a essa subseção usando um subtítulo
      function TableRow({ rows, subtitle, sublevel }) {
        let table =
          <>
            <tr className={"table-subtitle"}>
              <td className={"table-subtitle"} colspan="3">{Array(sublevel).fill(<span className="right-margin-5px">•</span>)}{subtitle}</td>
            </tr>
            {rows}
          </>
        return table
      }
      // Cada uma das linhas com o conteúdo que estamos populando.
      // Ele indica que há um valor original e o destaca com o valor atual
      // que é trazido no formulario
      function Row({ title, priorValue, currentValue }) {
        let row =
          <tr className={priorValue == currentValue ? "table-default" : "table-changed"}>
            <td style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight col-xs-4" colspan="1">{title}</td>
            <td style={{ wordBreak: "break-all", minWidth: "200px" }} className="col-xs-4" colspan="1">{priorValue}</td>
            <td style={{ wordBreak: "break-all", minWidth: "200px" }} className="col-xs-4" colspan="1">{currentValue}</td>
          </tr>
        return row
      }
      if (schema.hasOwnProperty('properties') && schema.properties && Object.keys(schema.properties).length > 0) {
        // Se o sublevel for zero, essa primeira camada de properties será o das seções do formulario
        if(sublevel === 0){
          for (let i = 0; i < Object.keys(schema.properties).length; i++) { // Para cada secao
            let key = Object.keys(schema.properties)[i]
            let formItem = schema.properties[key]
            if(formItem.hasOwnProperty('properties') && Object.keys(formItem.properties).length > 0){
              for (let j = 0; j < Object.keys(formItem.properties).length; j++) { // Para cada item da secao
                let keyInside = Object.keys(formItem.properties)[j]
                let formItemInside = formItem.properties[keyInside]
                let typeInside = formItemInside.type
                if (typeInside == 'object') {
                  let row = <TableRow rows={tableBuilder(formItemInside, previewFormData[key] && previewFormData[key][keyInside] ? previewFormData[key][keyInside] : {}, currentFormData[key] && currentFormData[key][keyInside] ? currentFormData[key][keyInside] : {}, sublevel + 1)} subtitle={formItemInside.title} sublevel={sublevel + 1} />
                  items.push(row)
                }else{
                  let row = <Row title={formItemInside.title ? formItemInside.title : ""} priorValue={previewFormData[key] && previewFormData[key][keyInside] ? previewFormData[key][keyInside] : ""} currentValue={currentFormData[key] && currentFormData[key][keyInside] ? currentFormData[key][keyInside] : ""} />                  
                  items.push(row)
                }
              }
            }
          }
        }else{
          for (let i = 0; i < Object.keys(schema.properties).length; i++) {
            let key = Object.keys(schema.properties)[i]
            let formItem = schema.properties[key]
            let type = formItem.type
            if (type == 'string') {
              let row = <Row title={formItem.title ? formItem.title : ""} priorValue={previewFormData[key] ? previewFormData[key] : ""} currentValue={currentFormData[key] ? currentFormData[key] : ""} />
              items.push(row)
            }
            if (type == 'object') {
              let row = <TableRow rows={tableBuilder(formItem, previewFormData[key] ? previewFormData[key] : {}, currentFormData[key] ? currentFormData[key] : {}, sublevel + 1)} subtitle={formItem.title} sublevel={sublevel + 1} />
              items.push(row)
            }
          }
        }
      }
      return items
    } // tableBuilder
    // Cada uma das seções do sumário
    function Section({ table, title, id, isCurrentCard, initialform }) {
      let section = <div style={{
        width: "100%", height: "100%", backgroundColor: "white"
      }} >
        <a class="btn btn-summary" data-toggle="collapse" href={`#${id}`} role="button" aria-expanded="true" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}><span className={(isCurrentCard ? "glyphicon glyphicon-hand-right right-margin-5px" : "glyphicon glyphicon-triangle-right right-margin-5px")}></span>{title}</a>
        <div className={isCurrentCard ? "collapse show" : "collapse"} id={id}>
          <table class="table table-hover table-sm table-bordered">
            <thead class="thead-light">
              <tr className="table-title">
                <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Field' : 'Campo'}</th>
                <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Prior Value' : 'Valor Anterior'}</th>
                <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Current Value' : 'Valor Atual'}</th>
              </tr>
            </thead>
            <tbody>
              {table}
            </tbody>
          </table>
        </div>
      </div >
      return section
    }
    let sections = []
    let currentCard = cards[activeCard];
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      let title = card.schema?.title ? card.schema?.title : card.cardId
      let cardSchema = card.schema
      let cardPriorFormData = card.priorFormData ? card.priorFormData : {}
      let cardCurrentFormData = card.formData ? card.formData : {}
      let table = tableBuilder(cardSchema, cardPriorFormData, cardCurrentFormData)
      sections.push(<Section table={table} title={title} id={card.cardId} isCurrentCard={currentCard === card} initialform={initialform} />)
    }
    return (
      <div>
        {sections}
      </div>
    )
  } // Summary
  /** Subcomponentes - FIM */
  let summaryview = (documentDetails && documentDetails.currentVersion) ?
    (
      <div className="wfcomponent summary-view">
        <Description description={{
          "version": documentDetails.currentVersion,
          "author": documentDetails.author,
          "created_at": documentDetails.created_at,
          "updated_at": documentDetails.updated_at,
          "description": documentDetails.description
        }} />
        <Summary cards={cards} activeCard={activeCard} initialform={initialform} />
      </div>
    )
    :
    (
      <span><span className="d-loading d-loading-spinner d-loading-md"></span> Carregando...</span>
    )
  return summaryview
}
function DocumentPreview({ url, definePreview }) {
  function updatePreview() {
    definePreview()
  }

  let docpreview = <>
                  {
                    (url && url!=='') ?
                    (
                      <div className="wfcomponent document-preview d-flex flex-row d-w-full">
                        <iframe
                          id='preview'
                          name='preview'
                          width='100%'
                          height='100%'
                          frameBorder='0'
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                        ></iframe>
                        <button className="btn btn-reload-preview btn-outline-secondary" onClick={(e) => { e.preventDefault(); updatePreview() }}>
                          <span class="glyphicon glyphicon-repeat right-margin-5px"></span>Atualizar Prévia
                        </button>
                      </div>                      
                    ) : (
                      <div className="d-flex align-items-start preview-warning d-p-4">Prévia indisponível</div>
                    )
                  }
                  </>
  return docpreview
}