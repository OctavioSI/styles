
function App() {
  const [initialform, setInitialform] = useState({
    language: props.embeddedData.language ? props.embeddedData.language : 'pt_br',
    codeDestination: props.embeddedData.codeDestination ? props.embeddedData.codeDestination : { "id": "", "command": "" },
    project: props.embeddedData.project ? props.embeddedData.project : 'bradesco-analise-icvm175',
    tenant: props.embeddedData.tenant ? props.embeddedData.tenant : 'looplex.com.br',
    initialFormId: props.embeddedData.initialFormId ? props.embeddedData.initialFormId : ''
  })
  // let cards = props.rjsf.hasOwnProperty('cards') ? props.rjsf.cards : []
  const cards = []
  const [listOfDocuments, setListOfDocuments] = useState([])
  const [docDetails, setDocDetails] = useState({})
  const [previewURL, setPreviewURL] = useState({
    ipa: '',
    regulamento: '',
    anexo: '',
    apendice: '',
    ta: ''
  });
  const [oldPreviewURL, setOldPreviewURL] = useState('');
  const [documentRendered, setDocumentRendered] = useState({});
  const [activeAnalysis, setActiveAnalysis] = useState('');
  const [pageLayout, setPageLayout] = useState({
    main: true,
    aside: true,
    aside_docpreview: true,
    aside_docrendered_ipa: true,
    aside_docrendered_regulamento: true,
    aside_docrendered_anexo: true,
    aside_docrendered_apendice: true,
    aside_docrendered_ta: true,
    aside_docmanager: true
  })
  function defineDocDetails(dd) {
    setDocDetails(() => dd)
    // Preciso atualizar o array via map para que o React
    // detecte que houve alterações em um dos elementos
    const nextList = listOfDocuments.map((c, i) => {
      if (c.id === dd.id) {
        return { ...dd };
      } else {
        return c;
      }
    });
    setListOfDocuments(nextList)
  }
  function definePreview(newurl) {
    setPreviewURL(() => newurl)
  }
  function defineOldPreview(newurl) {
    setOldPreviewURL(() => newurl)
  }
  function defineDocRendered(doc) {
    setDocumentRendered(() => doc)
  }
  function definePageLayout(pl) {
    setPageLayout(() => pl)
  }
  function defineListOfDocuments(pl) {
    setListOfDocuments(() => pl)
  }
  function defineActiveAnalysis(an) {
    // Esta funcao define qual documento está sendo analisado
    setActiveAnalysis(() => an)
    // Vamos recarregar os cards dessa análise
    let selectedDoc = listOfDocuments.filter(doc => doc.id === an)[0]
    setInitialform({
      initialFormId: selectedDoc.id,
      tenant: selectedDoc.partitionKey
    })
    setDocDetails(selectedDoc)
    console.log('initialform', initialform)
  }

  const isLoadingDocumentList = useRef(false);
  const [isLoadingDocList, setIsLoadingDocList] = useState(false);

  async function loadDocumentList(project, tenant = 'looplex.com.br') {
    async function fetchDocumentList(retries = 0, delay = 5000) {
      if (isLoadingDocumentList.current) {
        console.log('mounted');
      } else {
        console.log('mounting');
        isLoadingDocumentList.current = true;
        try {
          setIsLoadingDocList(true)
          let config = {
            method: 'post',
            url: `/api/code/${props.codeId}`,
            data: {
              command: "fetchDocumentList",
              tenant,
              project
            }
          }
          const res = await axios(config);
          console.log('res.data', res.data.output)
          if (res.data && res.data.output) {
            defineListOfDocuments(res.data.output)
            setActiveAnalysis(res.data.output[0].id)
            setOldPreviewURL(res.data.output[0].oldurl)
            // setPreviewURL({
            //   ipa: res.data.output[0].url.ipa,
            //   regulamento: res.data.output[0].url.regulamento,
            //   anexo: res.data.output[0].url.anexo,
            //   apendice: res.data.output[0].url.apendice,
            //   ta: res.data.output[0].url.ta
            // })
            setIsLoadingDocList(false)
            isLoadingDocumentList.current = false;
            setInitialform({ ...initialform, initialFormId: res.data.output[0].id })
            setDocDetails(res.data.output[0])
            return true
          }
        } catch (e) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return await fetchDocumentList(retries - 1, delay * 2)
          } else {
            setIsLoadingDocList(false)
            isLoadingDocumentList.current = false;
            throw new Error(`All retries failed on fetchDocumentList: ${e.message}`);
          }
        }
        setIsLoadingDocList(false)
      }
    }
    return await fetchDocumentList(3, 5000)
  }

  useEffect(() => {  // Roda uma vez no carregamento do documento
    // Vamos buscar a listagem de documentos
    console.log('Estou recarregando o manager...')
    loadDocumentList(initialform.project, initialform.tenant)
  }, [])

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
                  <MainPanel
                    language={(initialform.language ? initialform.language : "pt-br")}
                    initialform={initialform}
                    documentDetails={docDetails}
                    schemacards={cards}
                    hasActionPanel={true}

                    defineDocDetails={defineDocDetails}
                    definePageLayout={definePageLayout}
                    definePreview={definePreview}
                    defineOldPreview={defineOldPreview}
                    defineDocRendered={defineDocRendered}
                  />
                </main>
              )}

            {pageLayout.aside &&
              (
                <aside className="card-aside-wrapper">
                  <AsidePanel
                    language={initialform.language}
                    pageLayout={pageLayout}
                    activeAnalysis={activeAnalysis}
                    oldPreviewURL={oldPreviewURL}
                    previewURL={previewURL}
                    isLoadingDocList={isLoadingDocList}
                    listOfDocuments={listOfDocuments}

                    definePreview={definePreview}
                    defineOldPreview={defineOldPreview}
                    defineActiveAnalysis={defineActiveAnalysis}
                  />
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
function PageHeader({ title = 'Looplex Form' }) {
  return <Head>
    <title>{title}</title>
    <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
    <link rel='stylesheet' type='text/css' href='https://bootswatch.com/5/lumen/bootstrap.min.css' />
    <link rel="stylesheet" type='text/css' href='https://looplex-workflows.s3.us-east-1.amazonaws.com/css-form-padrao/ant.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/css-form-padrao/daisy.css' />
    <link rel="stylesheet" type='text/css' href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
    { /** Estilos dos Componentes Utilizados -- INÍCIO */}
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/CarouselForm/CarouselForm.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/DocumentPreview/DocumentPreview.css' />
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/ActionPanel/ActionPanel.css' />
    <link rel='stylesheet' type='text/css' href='https://octaviosi.github.io/styles/review1.0/default-form.css' />
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
function LooplexHeader({ title = 'Looplex Form' }) {
  return (
    <div className="looplex-header">
      <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" /><span>{title}</span>
    </div>
  )
}
function AsidePanel({
  language,
  pageLayout,
  activeAnalysis,
  oldPreviewURL,
  previewURL,
  isLoadingDocList,
  listOfDocuments,
  definePreview,
  defineOldPreview,
  defineActiveAnalysis }) {
  const [panelView, setPanelView] = useState('docmanager')
  function updatePanelView(option) {
    setPanelView(() => option)
  }
  function AsideNavigation({ pageLayout, language, panelView, updatePanelView }) {
    return (
      <div className="card-navigation">
        {(pageLayout.aside_docmanager) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docmanager' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docmanager') }}><span className='glyphicon glyphicon-inbox'></span></button>)}
        {(pageLayout.aside_docpreview) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docpreview' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docpreview') }}>{(language === 'en_us') ? 'Original' : 'Original'}</button>)}
        {(pageLayout.aside_docrendered_ipa) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docrendered' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docrendered_ipa') }}>{(language === 'en_us') ? 'IPA' : 'IPA'}</button>)}
        {(pageLayout.aside_docrendered_regulamento) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docrendered' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docrendered_regulamento') }}>{(language === 'en_us') ? 'Regulamento' : 'Regulamento'}</button>)}
        {(pageLayout.aside_docrendered_anexo) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docrendered' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docrendered_anexo') }}>{(language === 'en_us') ? 'Anexo' : 'Anexo'}</button>)}
        {(pageLayout.aside_docrendered_apendice) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docrendered' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docrendered_apendice') }}>{(language === 'en_us') ? 'Apêndice' : 'Apêndice'}</button>)}
        {(pageLayout.aside_docrendered_ta) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docrendered' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docrendered_ta') }}>{(language === 'en_us') ? 'Termo de Adesão' : 'Termo de Adesão'}</button>)}
      </div>
    )
  }
  function AsideView({ language, panelView, oldPreviewURL, previewURL, isLoadingDocList, listOfDocuments, definePreview, defineOldPreview }) {
    function DocumentPreview({ url, format = 'pdf' }) {
      let docpreview = <>
        {
          (url && url !== '') ?
            (
              <div className="wfcomponent document-preview d-flex flex-row d-w-full">
                {
                  (format === 'pdf') ?
                    (
                      <iframe
                        id='preview'
                        name='preview'
                        width='100%'
                        height='100%'
                        frameBorder='0'
                        src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`}
                      ></iframe>
                    ) : (
                      <iframe
                        id='preview'
                        name='preview'
                        width='100%'
                        height='100%'
                        frameBorder='0'
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                      ></iframe>
                    )
                }
              </div>
            ) : (
              <div className="d-flex align-items-start preview-warning d-p-4">Prévia indisponível</div>
            )
        }
      </>
      return docpreview
    }
    function DocumentManager({ language, listOfDocuments, activeAnalysis, isLoadingDocList, defineOldPreview, definePreview, defineActiveAnalysis }) {
      function updatePreview(prev) {
        definePreview(prev)
      }
      function updateOldPreview(prev) {
        defineOldPreview(prev)
      }
      function updateActiveAnalysis(prev) {
        defineActiveAnalysis(prev)
      }
      function selectDocument(event, row) {
        event.preventDefault();
        event.stopPropagation();
        updatePreview(row.url);
        updateOldPreview(row.oldurl);
        updateActiveAnalysis(row.id);
      }
      function DocumentTable({ listOfDocuments }) {
        function DocumentTableRow({ row }) {
          let frow = <>
            <div className={`docmanager-table-row mt-auto d-flex d-space-x-4 flex-row d-w-full ${(row.status === 'reviewed' ? 'doc-reviewed' : (row.status === 'removed' ? 'doc-removed' : (row.status === 'suspended' ? 'doc-suspended' : (row.status === 'manual' ? 'doc-manual' : ''))))} ${(activeAnalysis === row.id) && 'doc-active'}`}>
              <div className="docmanager-table-row-field mt-3 d-grow">
                <div><strong>{(activeAnalysis === row.id) && (<span className="glyphicon glyphicon-hand-right"></span>)} {row.name}</strong></div>
                <div>{row.description}</div>
              </div>
              <div className="docmanager-table-row-field mt-3 d-flex align-items-start d-space-x-4">
                <button type="button" className={`btn btn-link`} onClick={(e) => selectDocument(e, row)}>{(language === 'en_us') ? 'Select' : 'Selecionar'}</button>
              </div>
            </div>
          </>
          return frow
        }
        let table = <div className="docmanager-table">
          {
            listOfDocuments.map(doc => (
              <DocumentTableRow row={doc} />
            ))
          }
        </div>

        return table
      }


      let docmanager = <>
        {
          (isLoadingDocList || listOfDocuments.length <= 0) ? (
            <span><span className="d-loading d-loading-spinner d-loading-md"></span> Carregando lista de documentos, aguarde...</span>
          ) : (
            <DocumentTable listOfDocuments={listOfDocuments} />
          )
        }
      </>
      return docmanager
    }
    return (
      <div className="card-aside-view">
        {(panelView == 'docmanager') && (
          <DocumentManager
            language={language}
            listOfDocuments={listOfDocuments}
            activeAnalysis={activeAnalysis}
            isLoadingDocList={isLoadingDocList}

            defineOldPreview={defineOldPreview}
            definePreview={definePreview}
            defineActiveAnalysis={defineActiveAnalysis}
          />

        )}
        {(panelView == 'docpreview') && (<DocumentPreview url={oldPreviewURL} format="pdf" />)}
        {(panelView == 'docrendered_ipa') && (<DocumentPreview url={previewURL.instrumento_adaptacao} format="docx" />)}
        {(panelView == 'docrendered_regulamento') && (<DocumentPreview url={previewURL.regulamento} format="docx" />)}
        {(panelView == 'docrendered_anexo') && (<DocumentPreview url={previewURL.anexo} format="docx" />)}
        {(panelView == 'docrendered_apendice') && (<DocumentPreview url={previewURL.apendice} format="docx" />)}
        {(panelView == 'docrendered_ta') && (<DocumentPreview url={previewURL.termo_adesao} format="docx" />)}
      </div>
    )
  }
  return (
    <>
      <AsideNavigation
        pageLayout={pageLayout}
        language={language}
        panelView={panelView}
        updatePanelView={updatePanelView}
      />
      <AsideView
        language={language}
        panelView={panelView}
        oldPreviewURL={oldPreviewURL}
        previewURL={previewURL}
        isLoadingDocList={isLoadingDocList}
        listOfDocuments={listOfDocuments}

        definePreview={definePreview}
        defineOldPreview={defineOldPreview}
      />
    </>
  )
}
function MainPanel({ language, initialform, documentDetails, cards, defineDocDetails, definePreview, defineOldPreview, defineDocRendered, definePageLayout }) {
  const [previewSchema, setPreviewSchema] = useState([]);
  function definePreviewSchema(sch) {
    setPreviewSchema(() => sch)
  }
  return (
    <>
      <CarouselForm
        language={language}
        initialform={initialform}
        documentDetails={documentDetails}
        codeId={props.codeId}
        schemacards={cards}
        hasActionPanel={true}

        defineDocDetails={defineDocDetails}
        definePreviewSchema={definePreviewSchema}
        definePageLayout={definePageLayout}
      />
      <ActionPanel
        language={language}
        formId={initialform.formId}
        codeId={props.codeId}
        codeDestination={initialform.codeDestination}
        previewSchema={previewSchema}
        documentDetails={documentDetails}

        defineDocDetails={defineDocDetails}
        definePreview={definePreview}
        defineOldPreview={defineOldPreview}
        defineDocRendered={defineDocRendered}
      />
    </>
  )
}
function CarouselForm({ schemacards, language = 'pt-br', codeId, initialform = {}, documentDetails, defineDocDetails, definePreviewSchema, definePageLayout, hasActionPanel = false }) {
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
  const docDetails = useRef({});
  const modalRef = useRef(null);
  const modalFormData = useRef({});
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [alert, setModal] = useState({
    title: "Título",
    description: "Descrição do Alerta"
  })

  const loginUser = useRef({
    user: "",
    domain: ""
  })
  const loginAccessRules = useRef({})

  /** Hooks - INÍCIO */
  useEffect(() => {
    setCards(setSchema([]))
    async function fetchRemote(remoteList) {
      for (let i = 0; i < remoteList.length; i++) {
        let item = remoteList[i]
        console.log(`Loading Remote Schema (${item.id})...`)
        await loadRemoteSchema(item.id, item.tenant, {}, true)
      }
    }
    let remoteList = [];
    if (initialform.hasOwnProperty('initialFormId') && initialform.initialFormId !== '') {
      remoteList.push({
        type: 'schema',
        id: initialform.initialFormId,
        tenant: (initialform.tenant ? initialform.tenant : 'looplex.com.br')
      })
    } else {
      setCards(setSchema(schemacards))
    }
    fetchRemote(remoteList)
  }, [initialform])
  useEffect(() => {
    console.log('documentDetails', documentDetails);
    cardsFormData.current = {}
    docDetails.current = documentDetails
    setActiveCard(0)
  }, [documentDetails])
  useEffect(() => {
    console.log('cards changed!')
    definePreviewSchema(cards)
  }, [cards])
  /*useEffect(() => {
    console.log('Preloading cards...', preloadedCards)
    async function fetchRemote(remoteList) {
      for (let i = 0; i < remoteList.length; i++) {
        let item = remoteList[i]
        await loadRemoteSchema(item.id, item.tenant, item.card_conditions)
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
    
    if (preloadedCards && preloadedCards.length > 0) fetchRemote(preloadedCards)
  }, [preloadedCards])*/
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
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
  async function loadRemoteSchema(id, tenant = 'looplex.com.br', card_conditions = {}, reset_deck = false) {
    // Carrega um schema remoto, que está armazenado no cosmosDB
    // Precisa do endpoint fetchSchema no post.js
    // Pode acontecer de eu ter card_conditions para que o schema carregado seja
    // exibido, e isso ocorre porque às vezes queremos exibir o card apenas se uma
    // outra variavel do form tiver um valor específico.
    // Como isso não será necessariamente definido dentro do card remoto, precisamos
    // "enxertar" essa condicao agora, após carregar o card remoto
    async function fetchRemoteSchema(id, tenant, card_conditions, retries = 0, delay = 5000, reset_deck) {
      if (!isLoadingRemoteSchema.current) {
        isLoadingRemoteSchema.current = true;
        try {
          setIsLoading(true)
          let tmpCards = (reset_deck ? [] : (allLoadedCards.current ? allLoadedCards.current : []));
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
                  partitionKey: iSchema.partitionKey ? iSchema.partitionKey : 'looplex.com.br',
                  card_conditions: { ...iSchema.card_conditions, ...card_conditions },
                  dmnStructure: iSchema.dmnStructure ? iSchema.dmnStructure : [],
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
                partitionKey: iSchema.partitionKey ? iSchema.partitionKey : 'looplex.com.br',
                card_conditions: { ...iSchema.card_conditions, ...card_conditions },
                dmnStructure: iSchema.dmnStructure ? iSchema.dmnStructure : [],
                schema: iSchema.schema,
                uiSchema: iSchema.uiSchema ? iSchema.uiSchema : {},
                formData: iSchema.formData ? iSchema.formData : {},
                tagName: 'div'
              };
              tmpCards.push(newCard);
            }
            allLoadedCards.current = tmpCards // atualizando o allLoadedCards com essas inclusões
            setCards(() => setSchema(loadPriorFormData()))
            if (res.data.output.hasOwnProperty('formLayout') && !isObjectEmpty(res.data.output.formLayout)) {
              definePageLayout(res.data.output.formLayout);
            }
            if (res.data.output.hasOwnProperty('preloaded_cards') && res.data.output.preloaded_cards.length > 0) {
              let preloaded_cards = res.data.output.preloaded_cards ? res.data.output.preloaded_cards : [];
              setPreloadedCards(preloaded_cards)
            }
            setIsLoading(false)
            isLoadingRemoteSchema.current = false;
            if (res.data.output.hasOwnProperty('loginRequired') && res.data.output.loginRequred && !isObjectEmpty(res.data.output.loginAccess)) { // Para acessar esse form é necessário um login antes
              console.log('Login is required to access this form...')
              setLoginRequired(true)
              submitOpenModal('loginModal')
              loginAccessRules.current = res.data.output.loginAccess
            }
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
    return await fetchRemoteSchema(id, tenant, card_conditions, 3, 5000, reset_deck)
  }
  async function loadDocumentDetails(id, tenant = 'looplex.com.br') {
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
            docDetails.current = res.data.output
            defineDocDetails(docDetails.current)
            setIsLoading(false)
            isLoadingDocumentDetails.current = false;
            setCards(() => setSchema(loadPriorFormData()))
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
  function loadPriorFormData() {
    // Busca o formData que será exibido como valor anterior    
    let priorDataCards = allLoadedCards.current;
    console.log('docDetails', docDetails)
    if (docDetails.current && docDetails.current.hasOwnProperty('versions') && docDetails.current.versions.length > 0) {
      let formDataComplete = {};
      let currentVersion = docDetails.current.versions.filter(v => v.version == docDetails.current.currentVersion);
      if (currentVersion && currentVersion.length > 0) {
        formDataComplete = currentVersion[0].formData;
      }
      priorDataCards = allLoadedCards.current.map((card) => {
        // Para cada schema no card, vou montar o objeto de prior correspondente
        let priorData = {}
        // Primeiro, se houver o registro já no formData global, vamos usar
        if (card.hasOwnProperty('schema') && card.schema.hasOwnProperty('properties')) {
          for (const property in card.schema.properties) {
            if (cardsFormData.current.hasOwnProperty(card.cardId) && cardsFormData.current[card.cardId].hasOwnProperty(property)) priorData[property] = cardsFormData.current[card.cardId][property];
          }
        }
        // E agora vamos popular o registro com o valor que está no formData da versao atual
        if (card.hasOwnProperty('schema') && card.schema.hasOwnProperty('properties')) {
          for (const property in card.schema.properties) {
            if (formDataComplete.hasOwnProperty(card.cardId) && formDataComplete[card.cardId].hasOwnProperty(property)) priorData[property] = formDataComplete[card.cardId][property];
          }
        }
        let loadedFormData = priorData
        // essa condicao abaixo era um parametro que definia se deveria manter o formData do deck ou nao -- reavaliar se faremos ou nao
        // if (keepFormData) {
        //   let loadedcard = cards.filter(cd => cd.cardId === card.cardId);
        //   if (loadedcard && loadedcard.length > 0)
        //     loadedFormData = loadedcard[0].formData
        // }
        console.log('loadedFormData', loadedFormData)
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
  async function submitOpenModal(action) {
    // Exibe o modal para formato de salvar nova versão
    let modal = {}

    switch (action) {
      case 'loginModal':
        modal = {
          title: "Login",
          description: "É necessária a autenticação para acessar este formulário",
          rjsf: {
            "schema": {
              "type": "object",
              "required": [
                "user",
                "pwd",
                "domain"
              ],
              "properties": {
                "user": {
                  "type": "string",
                  "title": "Usuário"
                },
                "pwd": {
                  "type": "string",
                  "title": "Senha"
                },
                "domain": {
                  "type": "string",
                  "title": "Escritório"
                }
              }
            },
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true,
                "submitText": "Enviar"
              },
              "pwd": {
                "ui:widget": "password"
              }
            }
          },
          action: "loginCases",
          hasCloseButton: false
        }
        break;
      default:
        break;
    }
    setModal(modal);
    modalRef.current.showModal();
    return
  }
  // executa a chamada que faz o salvamento de uma nova versão
  async function loginCases(username, password, domain) {
    let data = {
      command: "loginCases",
      user: username,
      pwd: password,
      domain: domain
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        loginUser.current = {
          user: username,
          domain: domain
        }

        return res.data.output;
      }
    } catch (e) {
      let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
      alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content, true)
      throw new Error('Falha ao realizar o login **** ' + JSON.stringify(e.response.data))
    }
  }
  function checkCanLogin(username, domain) {
    if (isObjectEmpty(loginAccessRules.current)) return true;
    // Temos regras a observar
    if (!loginAccessRules.current.hasOwnProperty(domain)) return false; // Não tem o domain necessario
    return loginAccessRules.current[domain].includes(username) || loginAccessRules.current[domain].includes('all') // se eu tenho 'all', então todo user desse domain pode usar
  }
  function alertModal(title, icon, message, content, hasCloseButton = false) {
    // Exibe o modal em formato de alerta
    let alert = {
      icon: icon,
      title: title,
      description: message,
      content: content,
      hasCloseButton
    };
    console.log('Alerting...', alert)
    setModal(alert)
    modalRef.current.showModal()
  }
  // Roda ações definidas no Modal
  async function runAction(e, action) {
    e.preventDefault()
    e.stopPropagation()
    dismissModal()
    switch (action) {
      case 'loginCases':
        setIsSubmittingModal(true)
        let username = modalFormData.current.user;
        let password = modalFormData.current.pwd;
        let domain = modalFormData.current.domain;
        // primeiro vamos checar se esse usuario pode se logar no domain fornecido
        let canLogin = await checkCanLogin(username, domain);
        if (!canLogin) {
          let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
          alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content, true)
        } else {
          let login = await loginCases(username, password, domain);
          console.log('login', login)
          if (login && login.hasOwnProperty('Profile') && login['Profile'] != '' && login['Profile'] != "Login_Failed") { // Login bem sucedido
            setIsAuthenticated(true)
            alertModal("Login efetuado", "", "Login efetuado com sucesso", "", true)
          } else {
            let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
            alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content, true)
          }
          setIsSubmittingModal(false)
          modalRef.current.close()
        }
        break;
      default:
        return;
    }
  }
  function handleCancelDialog(event) {
    event.preventDefault();
    console.log('closed', event)
    return false
  }
  function dismissModal() {
    modalRef.current.close()
  }
  /** Funções do Componente - FIM*/

  /** Subcomponentes */
  function Modal({ title = "", icon = "", description = "", content = "", rjsf = {}, action = "", language = "pt-br", hasCloseButton = false }) {
    function handleChangeEvent(formData) {
      modalFormData.current = formData;
    }
    let modal =
      <>
        <h3 className="modal-title">
          {
            (icon && icon !== '') && (
              <span className={`glyphicon ${icon}`}></span>
            )
          }
          {title}
        </h3>
        <p className="modal-description">{description}</p>
        {rjsf && !isObjectEmpty(rjsf) ? (
          <>
            <Form {...rjsf} onChange={({ formData }, id) => handleChangeEvent(formData)} liveValidate id="modalForm" />
            <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
              <div className="mt-auto d-flex align-items-start d-space-x-4">
                <button type="button" className={`btn btn-default ${(isLoading || isSubmittingModal) && 'disabled'}`} onClick={(e) => dismissModal()}>{((language === 'en_us') ? 'Cancel' : 'Cancelar')}</button>
              </div>
              <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
              <div className="mt-auto d-flex align-items-end d-space-x-4">
                <button type="button" className={`btn btn-primary ${(isLoading || isSubmittingModal) && 'disabled'}`} onClick={(e) => runAction(e, action)}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmittingModal ? ((language === 'en_us') ? 'Submitting...' : 'Enviando...') : ((language === 'en_us') ? 'Submit' : 'Enviar'))}</button>
              </div>
            </div>
          </>
        )
          :
          (
            <div className="modal-contentbody" dangerouslySetInnerHTML={{ __html: content }}></div>
          )
        }
        {hasCloseButton && (
          <div className="d-modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="d-btn">{language === 'en_us' ? 'Close' : 'Fechar'}</button>
            </form>
          </div>
        )}
      </>
    return modal
  }
  function ReviewSection(props) {
    let card = props.card
    let cardcontent = <div className="section-content-wrapper">
      <Form {...card} onChange={({ formData }, id) => handleChangeEvent(card.cardId, formData, id)} onBlur={() => handleBlurEvent(card.cardId)} liveValidate />
    </div>
    return cardcontent
  }
  /** Subcomponentes -- FIM */

  let carousel = <>
    <div className={(hasActionPanel ? "wfcomponent carousel has-actionpanel" : "wfcomponent carousel")}>
      <dialog id="optionsmodal" className="d-modal" ref={modalRef} onCancel={handleCancelDialog}>
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={alert.title} description={alert.description} content={alert.content} rjsf={alert.rjsf} action={alert.action} hasCloseButton={alert.hasCloseButton} icon={alert.icon} />
        </div>
      </dialog>
      {(!isAuthenticated && loginRequired) ?
        (
          <section className={`deckofcards`}>
            <div className="d-flex align-items-center flex-column">
              <div className="mt-auto d-flex align-items-center flex-column login-spacer">
                <h1 className="login-spacer">Login necessário</h1>
                <p>Esta página tem acesso restrito.</p>
                <p>Clique no botão abaixo para realizar o login.</p>
              </div>
              <div className="mt-auto d-flex align-items-center">
                <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); modalRef.current.showModal(); }}>Login</button>
              </div>
            </div>
          </section>
        ) : (
          <>
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
                        <ReviewSection card={card} />
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
          </>
        )}
    </div>
  </>
  return carousel
}
function ActionPanel({ language, formId, documentDetails, previewSchema, codeId, codeDestination, definePreview, defineDocRendered, defineDocDetails }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingModal, setIsSubmittingModal] = useState(false)
  const modalRef = useRef(null)
  const modalFormData = useRef({})
  const [alert, setModal] = useState({
    title: "Título",
    description: "Descrição do Alerta"
  })
  const docRendered = useRef({})
  function updatePreview(prev) {
    definePreview(prev)
  }
  function updateDocRendered(doc) {
    docRendered.current = doc
    defineDocRendered(doc)
  }
  function updateDocDetails(doc) {
    defineDocDetails(doc)
  }
  /** Helpers */
  function treatAJVErrors(errors = []) {
    // Formata os erros recebidos na validação para exibição na tela
    function translateError(err) {
      let errstr, translatederr, errstr2, translatederr2;
      // Abaixo definimos cada uma das hipóteses de erro seguindo o mesmo formato
      errstr = "must have required property"
      translatederr = "deve conter o campo obrigatório"
      if (err.includes(errstr)) return err.replace(errstr, translatederr)

      errstr = "must NOT have fewer than"
      translatederr = "deve ter no mínimo"
      errstr2 = "characters"
      translatederr2 = "caracteres"
      if (err.includes(errstr)) return err.replace(errstr, translatederr).replace(errstr2, translatederr2)

      return ""
    }
    let errorsmsg = "";
    if (errors && errors.length > 0) {
      for (let i = 0; i < errors.length; i++) {
        let errortmp = translateError(errors[i].message)
        errorsmsg += "<li><strong>" + errors[i].instancePath + ":</strong> " + errortmp + "</li>"
      }
    }
    return errorsmsg
  }
  function isObjectEmpty(objectName) {
    return JSON.stringify(objectName) === '{}'
  }
  function initializeFormData(schema, initializefields = false) {
    let fd = {}
    for (const card in schema) { // cada card
      fd[card] = {}
      let eachcard = schema[card]
      for (const section in eachcard.properties) {
        fd[card][section] = {}
        if (initializefields) {
          let eachsection = eachcard.properties[section]
          for (const field in eachsection.properties) {
            let eachfield = eachsection.properties[field]
            switch (eachfield.type) {
              case 'number':
                fd[card][section][field] = 0;
                break;
              case 'object':
                fd[card][section][field] = {};
                break;
              case 'array':
                fd[card][section][field] = [];
                break;
              default:
                fd[card][section][field] = "";
                break;
            }
          }
        }
      }
    }
    // console.log('fd', JSON.stringify(fd))
    return fd
  }
  function mergeSchema(schema) {
    let mergedSchema = {};
    let mergedSchemaDefs = {};
    let mergedFormData = {};
    for (let i = 0; i < schema.length; i++) {
      let tcard = schema[i];
      mergedSchema[tcard.cardId] = {
        type: 'object',
        properties: { ...tcard.schema.properties }
      }
      mergedSchemaDefs = { ...mergedSchemaDefs, ...tcard.schema.definitions }
    }
    mergedFormData = initializeFormData(mergedSchema, true)
    for (let i = 0; i < schema.length; i++) {
      let tcard = schema[i];
      mergedFormData[tcard.cardId] = { ...mergedFormData[tcard.cardId], ...tcard.formData } // populando formData
    }
    return {
      mergedSchema,
      mergedSchemaDefs,
      mergedFormData
    }
  }
  /** Funções do Componente */
  async function validateForm() {
    let mergedFormData = {}
    let mergedSchema = {};
    let mergedSchemaDefs = {};
    for (let i = 0; i < previewSchema.length; i++) {
      let tcard = previewSchema[i];
      mergedSchema[tcard.cardId] = {
        type: 'object',
        properties: { ...tcard.schema.properties }
      }
      mergedSchemaDefs = { ...mergedSchemaDefs, ...tcard.schema.definitions }
    }
    mergedFormData = initializeFormData(mergedSchema, false)
    // console.log('mergedTreated', mergedFormData)
    for (let i = 0; i < previewSchema.length; i++) {
      let tcard = previewSchema[i];
      mergedFormData[tcard.cardId] = { ...mergedFormData[tcard.cardId], ...tcard.formData } // populando formData
    }
    let data = {
      command: "validateForm",
      formData: mergedFormData,
      schema: {
        type: "object",
        properties: { ...mergedSchema },
        definitions: { ...mergedSchemaDefs }
      }
    };
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    // console.log('config', JSON.stringify(config))
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao validar o formulário')
    }
    return
  }
  async function renderDocument() {
    setIsSubmitting(true);
    let { mergedFormData } = mergeSchema(previewSchema);
    let data = {
      command: "renderDocument",
      datasource: mergedFormData,
      //templateDocument: documentDetails.template,
      //documentName: new Date().getTime() + '_' + documentDetails.base_filename,
      tenant: documentDetails.partitionKey,
      processID: documentDetails.processID
    };/* 
    let data = {
      command: "renderDocument",
      datacontent
    }; */
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    console.log('config', config)
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        updatePreview(res.data.output.documentUrl); // TODO: AQUI COLOCAR CADA DOCUMENTO
        updateDocRendered(res.data.output);
        setIsSubmitting(false);
        return res.data.output;
      }
      setIsSubmitting(false);
    } catch (e) {
      setIsSubmitting(false);
      throw new Error('Falha ao gerar o Render')
    }
  }
  // executa a chamada que faz o salvamento de uma nova versão
  async function saveNewVersion(newdoc = false) {
    console.log('formData', modalFormData.current)
    let { mergedFormData } = mergeSchema(previewSchema);
    let newversion = parseInt(documentDetails.currentVersion) + 1 || 1;
    let data = {
      command: "saveNewVersion",
      title: newdoc ? modalFormData.current.title : documentDetails.title,
      version: newversion,
      description: modalFormData.current.description ? modalFormData.current.description : '',
      id: documentDetails.id ? documentDetails.id : '',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      author: documentDetails.author ? documentDetails.author : 'Looplex',
      savenew: newdoc,
      datasource: mergedFormData,
      rendered: docRendered.current,
      templateDocument: documentDetails.template,
      documentName: new Date().getTime() + '_' + documentDetails.base_filename
    };
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    // console.log('config', config)

    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        // Vamos atualizar o documentDetails relevante
        let docdetails = documentDetails;
        docdetails.id = res.data.output.id;
        docdetails.partitionKey = res.data.output.partitionKey;
        docdetails.title = (newdoc ? modalFormData.current.title : documentDetails.title);
        if (!docdetails.hasOwnProperty('versions') || docdetails.versions.length === 0) {
          docdetails.versions = []
        }
        docdetails.versions.push(res.data.output.newversion)
        docdetails.currentVersion = newversion;
        docdetails.description = modalFormData.current.description;
        docdetails.created_at = docdetails.created_at ? docdetails.created_at : res.data.output.newversion.date;
        docdetails.updated_at = res.data.output.newversion.date;
        if (newdoc) {
          // TODO: Fizemos o update do documento. Porém, se estivermos criando um novo
          // documento, teríamos que alterar o initialform tb para refletir isso.
          // Como lidar com isso? Podemos simplesmente alterar o initialform usando um useRef,
          // mas se a tela for atualizada, o payload iria recarregar o valor do documento original
        }
        return docdetails
      }
    } catch (e) {
      throw new Error('Falha ao salvar nova versão **** ' + JSON.stringify(e.response.data))
    }
  }
  async function adjustManually() {
    console.log('Adjusting Manually...')
    let { mergedFormData } = mergeSchema(previewSchema);
    mergedFormData.justificativa = modalFormData.current.justificativa ? modalFormData.current.justificativa : '';
    mergedFormData.outrajustificativa = modalFormData.current.outrajustificativa ? modalFormData.current.outrajustificativa : '';
    let data = {
      command: "adjustManually",
      id: documentDetails.id ? documentDetails.id : 'looplex.com.br',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      executionID: documentDetails.executionID ? documentDetails.executionID : '',
      formData: mergedFormData
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        if (res.data.output === 'updated') { // Vamos atualizar o docList
          documentDetails.status = 'manual';
          updateDocDetails(documentDetails)
        }
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao enviar para o Ajuste Manual **** ' + JSON.stringify(e.response.data))
    }
    return
  }
  async function changeAndContinue() {
    console.log('Change and Continue...')
    let { mergedFormData } = mergeSchema(previewSchema);
    console.log('submit', mergedFormData);
    let data = {
      command: "changeAndContinue",
      id: documentDetails.id ? documentDetails.id : 'looplex.com.br',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      executionID: documentDetails.executionID ? documentDetails.executionID : '',
      processID: documentDetails.processID ? documentDetails.processID : '',
      formData: mergedFormData
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        if (res.data.output === 'updated') { // Vamos atualizar o docList
          documentDetails.status = 'reviewed';
          updateDocDetails(documentDetails)
        }
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao enviar para o Ajuste Manual **** ' + JSON.stringify(e.response.data))
    }
    return
  }
  async function devolverLooplex() {
    console.log('devolver Looplex...')
    let { mergedFormData } = mergeSchema(previewSchema);
    mergedFormData.observacoes = modalFormData.current.observacoes ? modalFormData.current.observacoes : '';
    let data = {
      command: "devolverLooplex",
      id: documentDetails.id ? documentDetails.id : 'looplex.com.br',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      executionID: documentDetails.executionID ? documentDetails.executionID : '',
      formData: mergedFormData
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        if (res.data.output === 'updated') { // Vamos atualizar o docList
          documentDetails.status = 'suspended';
          updateDocDetails(documentDetails)
        }
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao enviar para o revisão Looplex **** ' + JSON.stringify(e.response.data))
    }
    return
  }
  async function removeFromRevision() {
    console.log('Removing from Revision...')
    let { mergedFormData } = mergeSchema(previewSchema);
    let data = {
      command: "removeFromRevision",
      id: documentDetails.id ? documentDetails.id : 'looplex.com.br',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      executionID: documentDetails.executionID ? documentDetails.executionID : '',
      formData: mergedFormData
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        if (res.data.output === 'updated') { // Vamos atualizar o docList
          documentDetails.status = 'removed';
          updateDocDetails(documentDetails)
        }
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao enviar para Remover da Revisão **** ' + JSON.stringify(e.response.data))
    }
    return
  }
  async function handleSubmit(event, action) {
    event.preventDefault()
    event.stopPropagation()
    console.log('Submitting...')
    let validated = await validateForm()
    console.log('validated', validated)
    if (Array.isArray(validated)) { // Se eu tenho uma array, houve erros
      let errors = treatAJVErrors(validated)
      let content = "Os seguintes erros foram encontrados no processamento do formulário enviado:<br /><br/><ul class='errorlist'>" + errors + "</ul>";
      alertModal("Erros no Formulário", "", "Verifique as informações encaminhadas", content)
    } else {
      // Independente de qualquer escolha, vamos renderizar o documento
      if (action === 'justRender') {
        let render = await renderDocument();
        console.log('render', render)
        return
      }
      await submitOpenModal(action)
    }
    return;
  }
  function alertModal(title, icon, message, content, hasCloseButton = false) {
    // Exibe o modal em formato de alerta
    let alert = {
      icon: icon,
      title: title,
      description: message,
      content: content,
      hasCloseButton
    };
    console.log('Alerting...', alert)
    setModal(alert)
    modalRef.current.showModal()
  }
  async function submitOpenModal(action) {
    // Exibe o modal para formato de salvar nova versão
    let modal = {}

    switch (action) {
      case 'adjustManually':
        modal = {
          title: "Ajustar manualmente?",
          description: "Ao confirmar, este documento deverá ser ajustado manualmente e será encerrado o seu fluxo de automação.",
          rjsf: {
            "schema": {
              "type": "object",
              "required": [
                "title",
                "description"
              ],
              "properties": {
                "justificativa": {
                  "type": "string",
                  "title": "Justificativa",
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
                        "remuneracao"
                      ],
                      "title": "Remuneração"
                    },
                    {
                      "type": "string",
                      "enum": [
                        "pi"
                      ],
                      "title": "Política de Investimento"
                    },
                    {
                      "type": "string",
                      "enum": [
                        "outrajustificativa"
                      ],
                      "title": "Outra Justificativa"
                    }
                  ]
                }
              },
              "allOf": [
                {
                  "if": {
                    "properties": {
                      "justificativa": {
                        "const": "outrajustificativa"
                      }
                    },
                    "required": [
                      "justificativa"
                    ]
                  },
                  "then": {
                    "properties": {
                      "outrajustificativa": {
                        "type": "string",
                        "title": "Outra justificativa",
                        "description": "",
                        "default": ""
                      }
                    }
                  }
                }
              ]
            },
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              },
              "justificativa": {
                "ui:placeholder": "Escolha uma justificativa para o ajuste manual",
              },
              "outrajustificativa": {
                "ui:widget": "textarea",
                "ui:placeholder": "Descreva a justificativa para o ajuste manual",
                "ui:options": {
                  "rows": 5
                }
              }
            }
          },
          action: "adjustManually"
        }
        break;
      case 'changeAndContinue':
        modal = {
          title: "Alterar e Seguir",
          description: "Ao confirmar, os dados modificados serão renderizados em novas versões dos documentos e o fluxo de automação será continuado.",
          rjsf: {
            "schema": {},
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              }
            }
          },
          action: "changeAndContinue"
        }
        break;
      case 'devolverLooplex':
        modal = {
          title: "Devolver à Looplex",
          description: "Ao confirmar, o regulamento será enviado para a análise da Looplex e o fluxo de automação será interrompido.",
          rjsf: {
            "schema": {
              "type": "object",
              "title": "",
              "description": "",
              "properties": {
                "observacoes": {
                  "type": "string",
                  "title": "Observações",
                  "description": "",
                  "default": ""
                }
              }
            },
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              },
              "observacoes": {
                "ui:widget": "textarea"
              }
            }
          },
          action: "devolverLooplex"
        }
        break;
      case 'removeFromRevision':
        modal = {
          title: "Remover da Revisão",
          description: "Ao confirmar, o regulamento será removida da lista de revisão e nenhuma ação adicional será feita.",
          rjsf: {
            "schema": {},
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              }
            }
          },
          action: "removeFromRevision"
        }
        break;
      default:
        break;
    }

    setModal(modal);
    modalRef.current.showModal();
    return
  }
  async function runAction(event, action) {
    event.preventDefault();
    event.stopPropagation();
    console.log('docDetails', documentDetails)
    console.log('action', action)
    setIsSubmittingModal(true)
    let adjusting = {};
    switch (action) {
      case 'adjustManually':
        adjusting = await adjustManually()
        console.log('adjusting', adjusting)
        dismissModal()
        alertModal("Documento enviado para ajuste manual", "", "O seu documento foi enviado para ajuste manual com sucesso!", "")
        // updateDocDetails(adjusting) // TODO: Ajustar a lista de docs
        break;
      case 'changeAndContinue':
        adjusting = await changeAndContinue(true)
        dismissModal()
        // TODO: Temos que atualizar os dados do documento atual para o novo documento criado
        alertModal("Documento alterado", "", "O documento foi ajustado e o fluxo de automação foi retomado com sucesso!", "")
        // updateDocDetails(adjusting) // TODO: Ajustar a lista de docs
        break;
      case 'devolverLooplex':
        adjusting = await devolverLooplex()
        dismissModal()
        // TODO: Temos que atualizar os dados do documento atual para o novo documento criado
        alertModal("Documento enviado para a Looplex", "", "O documento foi enviado para a análise da Looplex com sucesso!", "")
        // updateDocDetails(adjusting) // TODO: Ajustar a lista de docs
        break;
      case 'removeFromRevision':
        adjusting = await removeFromRevision()
        dismissModal()
        // TODO: Temos que atualizar os dados do documento atual para o novo documento criado
        alertModal("Documento removido", "", "O documento foi removido do fluxo de revisão com sucesso!", "")
        // updateDocDetails(adjusting) // TODO: Ajustar a lista de docs
        break;
    }
    // Depois de rodar a ação, vamos executar o code se houver
    if (codeDestination && !isObjectEmpty(codeDestination)) {
      let sendCode = await send2Code(codeDestination);
      console.log('sendCode', sendCode)
      // alertModal("Obrigado!", "glyphicon-ok", "", "O formulário foi enviado com sucesso.")
    }
    setIsSubmittingModal(false)
    return
  }
  // executa a chamada que faz o salvamento de uma nova versão
  async function send2Code(codeDestination) {
    if (!codeDestination || isObjectEmpty(codeDestination) || !codeDestination.hasOwnProperty('id') || codeDestination.id == '') return
    let { mergedFormData } = mergeSchema(previewSchema);

    let data = {
      command: "send2Code",
      codeId: codeDestination.id,
      codeCommand: codeDestination.command,
      formId: formId,
      documentId: documentDetails.id ? documentDetails.id : '',
      tenant: documentDetails.partitionKey ? documentDetails.partitionKey : 'looplex.com.br',
      formData: mergedFormData
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    // console.log('config', config)
    // setTmpVisor(JSON.stringify(config))
    try {
      const res = await axios(config);
      // console.log(res.data.output)
      if (res.data && res.data.output) {
        // setTmpVisor(JSON.stringify(res.data.output))
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao enviar para o Code ' + codeDestination + ' **** ' + JSON.stringify(e.response.data))
    }
  }
  function dismissModal() {
    modalRef.current.close();
  }
  /** Subcomponentes */
  function Modal({ title = "", icon = "", description = "", content = "", rjsf = {}, action = "", language = "pt-br", hasCloseButton = false }) {
    function handleChangeEvent(formData) {
      modalFormData.current = formData;
    }
    let modal =
      <>
        <h3 className="modal-title">
          {
            (icon && icon !== '') && (
              <span className={`glyphicon ${icon}`}></span>
            )
          }
          {title}
        </h3>
        <p className="modal-description">{description}</p>
        {rjsf && !isObjectEmpty(rjsf) ? (
          <>
            <Form {...rjsf} onChange={({ formData }, id) => handleChangeEvent(formData)} liveValidate id="modalForm" />
            <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
              <div className="mt-auto d-flex align-items-start d-space-x-4">
                <button type="button" className={`btn btn-default ${(isLoading || isSubmittingModal) && 'disabled'}`} onClick={(e) => dismissModal()}>{((language === 'en_us') ? 'Cancel' : 'Cancelar')}</button>
              </div>
              <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
              <div className="mt-auto d-flex align-items-end d-space-x-4">
                <button type="button" className={`btn btn-primary ${(isLoading || isSubmittingModal) && 'disabled'}`} onClick={(e) => runAction(e, action)}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmittingModal ? ((language === 'en_us') ? 'Sending...' : 'Enviando...') : ((language === 'en_us') ? 'Confirm' : 'Confirmar'))}</button>
              </div>
            </div>
          </>
        )
          :
          (
            <div className="modal-contentbody" dangerouslySetInnerHTML={{ __html: content }}></div>
          )
        }
        {hasCloseButton && (
          <div className="d-modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="d-btn">{language === 'en_us' ? 'Cancel' : 'Cancelar'}</button>
            </form>
          </div>
        )}
      </>
    return modal
  }

  let panel = <>
    <div className="wfcomponent action-panel">
      <dialog id="optionsmodal" className="d-modal" ref={modalRef} >
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={alert.title} description={alert.description} content={alert.content} rjsf={alert.rjsf} action={alert.action} hasCloseButton={alert.hasCloseButton} icon={alert.icon} language={language} />
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
        <div className="mt-auto d-flex align-items-start d-space-x-4">
          <button type="button" className={`btn btn-danger ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'removeFromRevision')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Removing...' : 'Removendo...') : ((language === 'en_us') ? 'Remove' : 'Remover'))}</button>
          <button type="button" className={`btn btn-warning ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'adjustManually')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Manual Adjust' : 'Ajuste Manual'))}</button>
          <button type="button" className={`btn btn-warning ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'devolverLooplex')}><span className='glyphicon glyphicon-share-alt'></span>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Looplex' : 'Looplex'))}</button>
        </div>
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-info ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'justRender')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Rendering...' : 'Renderizando...') : ((language === 'en_us') ? 'Render' : 'Renderizar'))}</button>
          <button type="button" className={`btn btn-primary ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'changeAndContinue')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Change/Continue' : 'Alterar/Seguir'))}</button>
        </div>
      </div>
    </div>
  </>
  return panel
}
