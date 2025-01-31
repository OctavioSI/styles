
/*******************************************************************
* Carousel Padrão Flows
* 
* STATUS: Em teste
* 
* CHANGELOG
*
* v. 2.0
*   - Modularização:  Alterado o código do Formulario para modularização do Carousel, com cada parte do código
*                     criada como componente no repositório wf_reactcomponents
*   - onSubmitAction: Removido o parametro de input onSubmitAction. Agora as ações são
*                     controladas diretamente no botão da interface, não sendo necessário customizar
*
*
* v. 1.2
*   - send2Code:      Alteração no onSubmitActions para possibilitar que um code seja sempre
*                     enviado desde que exista um codeDestination no payload. Se você desejar
*                     apenas chamar o code sem criar nova versão ou novo documento, vc deve definir 
*                     no onSubmitAction como "justRender". Removemos assim a opção "send2Code" no
*                     onSubmitAction
*
* v. 1.1
*   - Page:           Reorganização do documento e comentários adicionais para 
*                     facilitar a leitura e entendimento
*   - Login:          Autenticação utilizando o sistema de login do LawOffice. 
*                     O acesso ao formulário é gerenciado pelo registro existente 
*                     no CosmosDB (trabalho em progresso)
*   - formLayout:     Agora é possível selecionar no registro do CosmosDB quais as 
*                     telas estão disponíveis para esta visualização. 
*   - saveAsNewDoc:   Agora o payload recebe um parâmetro onSubmitAction, que pode ser 
*                     utilizado para criar um novo documento (por exemplo, quando usamos
*                     um WorkRequest que é uma nova solicitação e não tem versões 
*                     anteriores) ou para criar uma nova versão de um documento existente
*   - send2Code:      Agora o payload recebe um parâmetro onSubmitAction, que pode ser 
*                     utilizado para disparar um outro Code. Para isso, você deve passar
*                     no payload também um parâmetro codeDestination com o ID do code que
*                     será chamado
*   - preloaded:      Agora é possível pré-carregar cards remotos logo na inicialização
*                     do formulário
*
* v. 1.0
*   - Carousel:       Formulário pode ser usado com cards, sendo possível 
*                     passar os cards no arquivo rjsf na pasta ou montar
*                     os cards no cosmosDB (container Workflows > rjsf-schema).
*                     No cosmosDB agora é possível também passar apenas 1 card
*                     ou o array cards[]
*   - Layout:         Este formulário agora tem o Layout atualizado em linha
*                     com o design definido para o Cases. O formulário é 
*                     renderizado do lado esquerdo e o painel com propriedades
*                     e outras funções fica do lado direito.
*   - Aspose:         Na guia de versões anteriores é possível fazer a 
*                     comparação do documento renderizado autualmente com 
*                     versões salvas anteriormente. Usamos o Aspose para isso
*   - Versões:        Versões anteriores são salvas no cosmosDB, com o formData
*                     utilizado. É possível baixar o documento da versão e
*                     realizar comparação com a versão renderizada atualmente.
*   - Modal:          Foi implementado modal para ações específicas -- você
*                     usar o modal como popup para alertas ou como popup de 
*                     interação, que recebe um RJSF próprio.
*   - Anexos:         Anexos enviados no formulário usando o Filepond são
*                     salvos em pastas definitivas e com o link disponibilizado
*                     na guia de Anexos do painel lateral
*
* BUG FIXES
*
*   - Proxima/Anterior: Arrumado problema de botão habilitado quando não há outra página
*                       antes ou depois.
*
* KNOWN ISSUES
*
*   - Aspose não funciona sempre para a comparação. Por vezes, 
*     a depender do documento que está sendo comparado, recebemos um
*     erro 400 na chamada. 
* 
********************************************************************/

function App() {
  /********************************************************************
   * # Configurações
   * 
   * Este Carousel foi projetado para ser o único endpoint necessário
   * para a utilização de formulários na Looplex.
   * 
   * Para tanto, você deverá informar os seguintes parâmetros no 
   * payload JSON, codificado no seguinte endereço:
   * 
   * https://evolved-functions.vercel.app/api/jwt/sign
   * 
    O payload JSON tem o seguinte formato:

    {
      "payload": {
          "language": "pt-br", // idioma do formulário (en_us ou pt_br)
          "codeDestination": {
            "id": "E4CDFEE0-AB30-11EF-9A54-F19C6F0C4082", // ID do Code de destino, caso um code seja chamado após o envio do form
            "command": "testeAction" // comando que será chamado no code. O formData também é enviado no payload.
          },
          "initialFormId": "octavio-novoUI-v2.0", // schema inicial que está no Workflows/rjsf-schemas
          "initialFormTenant": "looplex.com.br", // tenant to schema inicial
          "initialDocumentId": "teste001-v2.0", // documento com configurações básicas e onde será salvo o doc, em Workflows/assembler
          "initialDocumentTenant": "looplex.com.br" // tenant to documento inicial
      },
      "privateKey": "A_PRIVATE_KEY_VAI_AQUI" // Private key para gerar o payload
    }

   * Após gerar acima, passamos no formulário como parâmetro payload, dessa forma:

    https://actions.looplex.com/code/1B2D0301-03BA-48D2-99BB-900C9503CCA0?payload=eyJhbGciOiJSUzI1NiIsIn....[restante do payload gerado aqui]

   * 

    ## formLayout

    No registro do cosmosDB que contém o schema indicado no initialformId acima, é possível incluir
    uma propriedade formLayout, que indica quais as seções que estarão disponíveis ou não
    ao carregar o formulário nesta página. O formato é o seguinte:

    "formLayout": {
        "main": true,
        "aside": true,
        "aside_summary": true,
        "aside_docpreview": true,
        "aside_attachments": true,
        "aside_previousversions": true
    }


    ## preloaded:

    No registro do cosmosDB que contém o schema indicado no initialformId acima, é possível incluir
    uma propriedade preloaded_cards, que indica quais os cards deverão ser pré-carregados
    no início do formulário nesta página. O formato é o seguinte:

    "preloaded_cards": [
        {
            "cardID": "terceiro",
            "scope": "",
            "card_conditions": ""
        }
    ]

    ## login

    No registro do cosmosDB que contém o schema, podemos ainda habilitar o login para esta página.
    Para isso, colocamos o parâmetro loginRequired (true ou false) e o parâmetro loginAccess, que define qual
    usuário terá acesso ao formulário, dentro de um domain. Se todos os usuários daquele domain tiverem acesso, 
    podemos usar o valor 'all' para liberar a todos daquele grupo. O formato é o seguinte:

    "loginRequired": false,
    "loginAccess": {
        "FLOWABLE": [
            "all"
        ]
    }
    

   *
   ********************************************************************/

  let initialform = {
    language: props.embeddedData.language ? props.embeddedData.language : 'pt_br',
    codeDestination: props.embeddedData.codeDestination ? props.embeddedData.codeDestination : { "id": "", "command": ""},
    initialFormId: props.embeddedData.initialFormId ? props.embeddedData.initialFormId : '',
    initialFormTenant: props.embeddedData.initialFormTenant ? props.embeddedData.initialFormTenant : 'looplex.com.br',
    initialDocumentId: props.embeddedData.initialDocumentId ? props.embeddedData.initialDocumentId : '',
    initialDocumentTenant: props.embeddedData.initialDocumentTenant ? props.embeddedData.initialDocumentTenant : 'looplex.com.br'
  }
  let cards = props.rjsf.hasOwnProperty('cards') ? props.rjsf.cards : []
  const [docDetails, setDocDetails] = useState({
    "id": "",
    "partitionKey": "looplex.com.br",
    "versions": [],
    "currentVersion": 1,
    "author": "Looplex",
    "description": "",
    "created_at": "2024-06-13T10:00:00",
    "updated_at": "2024-09-19T20:30:12",
    "title": "",
    "base_filename": "document.docx",
    "template": "https://looplex-workflows.s3.sa-east-1.amazonaws.com/webinar/testes/template-teste.docx"
  })
  const [previewSchema, setPreviewSchema] = useState([]);
  const [previewURL, setPreviewURL] = useState('https://looplex-workflows.s3.sa-east-1.amazonaws.com/templates/docs/proposta_ajustada_ietsugu.docx');
  const [documentRendered, setDocumentRendered] = useState({});
  const [activeCard, setActiveCard] = useState(0);
  const [pageLayout, setPageLayout] = useState({
    main: true,
    aside: true,
    aside_summary: true,
    aside_docpreview: true,
    aside_previousversions: true,
    aside_attachments: true
  })
  function defineDocDetails(dd) {
    setDocDetails(() => dd)
  }
  function definePreview(newurl) {
    setPreviewURL(() => newurl)
  }
  function defineDocRendered(doc) {
    setDocumentRendered(() => doc)
  }
  function definePreviewSchema(sch) {
    setPreviewSchema(() => sch)
  }
  function defineActiveCard(ac){
    setActiveCard(() => ac)
  }
  function definePageLayout(pl){
    setPageLayout(() => pl)
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
                  <CarouselForm language={(initialform.language ? initialform.language : "pt-br")} initialform={initialform} codeId={props.codeId} schemacards={cards} defineDocDetails={defineDocDetails} definePreviewSchema={definePreviewSchema} defineActiveCard={defineActiveCard} definePageLayout={definePageLayout} hasActionPanel={true}/>
                  <ActionPanel language={(initialform.language ? initialform.language : "pt-br")} formId={initialform.formId} codeId={props.codeId} codeDestination={initialform.codeDestination} previewSchema={previewSchema} documentDetails={docDetails} definePreview={definePreview}  defineDocRendered={defineDocRendered} defineDocDetails={defineDocDetails}/>
                </main>
              )}

            {pageLayout.aside &&
              (
                <aside className="card-aside-wrapper">
                  <AsidePanel pageLayout={pageLayout} language={initialform.language} documentDetails={docDetails} codeId={props.codeId} previewSchema={previewSchema} activeCard={activeCard} initialform={initialform} previewURL={previewURL} documentRendered={documentRendered} definePreview={definePreview} defineDocRendered={defineDocRendered}  />
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
    <link rel='stylesheet' type='text/css' href='https://looplex.github.io/wf_reactcomponents/src/components/ActionPanel/ActionPanel.css' />
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
function CarouselForm({ schemacards, language = 'pt-br', codeId, initialform = {}, defineDocDetails, definePreviewSchema, defineActiveCard, definePageLayout, hasActionPanel = false }) {
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
  useEffect(() => { // Roda uma vez no início
    async function fetchRemote(remoteList) {
      for (let i = 0; i < remoteList.length; i++) {
        let item = remoteList[i]
        switch (item.type) {
          case 'docdetails':
            console.log(`Loading Remote Document Details (${item.id})...`)
            await loadDocumentDetails(item.id, item.tenant)
            break;
          default://schema
            console.log(`Loading Remote Schema (${item.id})...`)
            await loadRemoteSchema(item.id, item.tenant, item.card_conditions)
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
    definePreviewSchema(cards)
  }, [cards])
  useEffect(() => {
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
          let tmpCards = allLoadedCards.current ? allLoadedCards.current : [];
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
            if(res.data.output.hasOwnProperty('formLayout') && !isObjectEmpty(res.data.output.formLayout)){
              definePageLayout(res.data.output.formLayout);
            }
            if(res.data.output.hasOwnProperty('preloaded_cards') && res.data.output.preloaded_cards.length > 0){
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
    return await fetchRemoteSchema(id, tenant, card_conditions, 3, 5000)
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
            documentDetails.current = res.data.output
            defineDocDetails(documentDetails.current)
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
  function loadPriorFormData(){
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
  async function submitOpenModal(action){
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
  function dismissModal(){
    modalRef.current.close()
  }
  /** Funções do Componente - FIM*/

  /** Subcomponentes */
  function Modal({ title = "", icon = "", description = "", content = "", rjsf = {}, action = "", language = "pt-br", hasCloseButton = false}){
    function handleChangeEvent(formData){
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
              </>
        )}
    </div>
  </>
  return carousel
}
function AsidePanel({ pageLayout, language, codeId, documentDetails, previewSchema, activeCard, initialform, previewURL, documentRendered, definePreview, defineDocRendered }) {
  const [panelView, setPanelView] = useState('summary')

  function updatePanelView(option) {
    setPanelView(() => option)
  }
  function AsideNavigation({ pageLayout, language, panelView, updatePanelView }) {
    return (
      <div className="card-navigation">
        {(pageLayout.aside_summary) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'summary' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('summary') }}>{(language === 'en_us') ? 'Summary' : 'Sumário'}</button>)}        
        {(pageLayout.aside_docpreview) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'docpreview' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('docpreview') }}>{(language === 'en_us') ? 'Preview' : 'Prévia'}</button>)}
        {(pageLayout.aside_attachments) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'attachments' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('attachments') }}>{(language === 'en_us') ? 'Attachments' : 'Anexos'}</button>)}
        {(pageLayout.aside_previousversions) && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'previousversions' && 'active'}`} onClick={(e) => { e.preventDefault(); updatePanelView('previousversions') }}>{(language === 'en_us') ? 'Previous Versions' : 'Versões Anteriores'}</button>)}
      </div>
    )
  }
  function AsideView({ panelView, language, documentDetails, attachments, previewSchema, activeCard, initialform, previewURL, definePreview, documentRendered }) {
    return (
      <div className="card-aside-view">
        {(panelView == 'summary') && (<SummaryView documentDetails={documentDetails} cards={previewSchema} activeCard={activeCard} initialform={initialform} />)}
        {(panelView == 'docpreview') && (<DocumentPreview url={previewURL} previewSchema={previewSchema} codeId={codeId} initialform={initialform} documentDetails={documentDetails} documentRendered={documentRendered} language={language} definePreview={definePreview} defineDocRendered={defineDocRendered}/>)}
        {(panelView == 'previousversions') && (<PreviousVersionsView codeId={codeId} documentDetails={documentDetails} documentRendered={documentRendered} language={language} />)}
        {(panelView == 'attachments') && (<AttachmentsView attachments={attachments} language={language}/>)}
      </div>
    )
  }

  let currentVersion = documentDetails.versions.filter(v => v.version === documentDetails.currentVersion);
  let attachments = []
  if(currentVersion && currentVersion.length > 0){
    attachments = currentVersion[0].hasOwnProperty('attachments') ? currentVersion[0].attachments : []
  }

  return (
    <>
      <AsideNavigation pageLayout={pageLayout} language={language} panelView={panelView} updatePanelView={updatePanelView} />
      <AsideView previewSchema={previewSchema} language={language} panelView={panelView} documentDetails={documentDetails} activeCard={activeCard} initialform={initialform} previewURL={previewURL} definePreview={definePreview} documentRendered={documentRendered} attachments={attachments}/>
    </>
  )
}
function ActionPanel({ language, formId, documentDetails, previewSchema, codeId, codeDestination, definePreview, defineDocRendered, defineDocDetails }){
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
    function translateError(err){
      let errstr, translatederr, errstr2, translatederr2;
      // Abaixo definimos cada uma das hipóteses de erro seguindo o mesmo formato
      errstr = "must have required property"
      translatederr = "deve conter o campo obrigatório"
      if(err.includes(errstr)) return err.replace(errstr, translatederr)

      errstr = "must NOT have fewer than"
      translatederr = "deve ter no mínimo"
      errstr2 = "characters"
      translatederr2 = "caracteres"
      if(err.includes(errstr)) return err.replace(errstr, translatederr).replace(errstr2, translatederr2)

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
  function initializeFormData(schema, initializefields = false){
    let fd = {}
    for (const card in schema) { // cada card
      fd[card] = {}
      let eachcard = schema[card]
      for (const section in eachcard.properties) {
        fd[card][section] = {}
        if(initializefields){
          let eachsection = eachcard.properties[section]
          for (const field in eachsection.properties) {
            let eachfield = eachsection.properties[field]
            switch(eachfield.type){
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
  function mergeSchema(schema){
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
    let datacontent = {
      command: "renderDocument",
      datasource: mergedFormData,
      templateDocument: documentDetails.template,
      documentName: new Date().getTime() + '_' + documentDetails.base_filename,
      tenant: documentDetails.partitionKey
    };
    let data = {
      command: "renderDocument",
      datacontent
    };
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        updatePreview(res.data.output.documentUrl);
        updateDocRendered(res.data.output);
        setIsSubmitting(false);
        return res.data.output;
      }
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
        if(!docdetails.hasOwnProperty('versions') || docdetails.versions.length === 0){
          docdetails.versions = []  
        }
        docdetails.versions.push(res.data.output.newversion)
        docdetails.currentVersion = newversion;
        docdetails.description = modalFormData.current.description;
        docdetails.created_at = docdetails.created_at ? docdetails.created_at : res.data.output.newversion.date;
        docdetails.updated_at = res.data.output.newversion.date;
        if(newdoc){
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
  async function handleSubmit(event, action) {
    event.preventDefault()
    event.stopPropagation()
    console.log('Submitting...')
    if(action === 'justrender'){
      // Independente de qualquer escolha, vamos renderizar o documento
      let render = await renderDocument();
      console.log('render', render)
      return;
    }
    let validated = await validateForm()
    console.log('validated', validated)
    if (Array.isArray(validated)) { // Se eu tenho uma array, houve erros
      let errors = treatAJVErrors(validated)
      let content = "Os seguintes erros foram encontrados no processamento do formulário enviado:<br /><br/><ul class='errorlist'>" + errors + "</ul>";
      alertModal("Erros no Formulário", "", "Verifique as informações encaminhadas", content)
    } else {
      // Independente de qualquer escolha, vamos renderizar o documento
      let render = await renderDocument();
      console.log('render', render)
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
  async function submitOpenModal(action){
    // Exibe o modal para formato de salvar nova versão
    let modal = {}

    switch (action) {
      case 'saveAsNewDocument':
        modal = {
          title: "Salvar como novo documento",
          description: "Criando um novo documento a partir da estrutura atual. Preencha abaixo os dados solicitados.",
          rjsf: {
            "schema": {
              "type": "object",
              "required": [
                "title",
                "description"
              ],
              "properties": {
                "title": {
                  "type": "string",
                  "title": "Título"
                },
                "description": {
                  "type": "string",
                  "title": "Descrição"
                }
              }
            },
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              },
              "title": {
                "ui:placeholder": "Forneça um título o novo documento",
              },
              "description": {
                "ui:widget": "textarea",
                "ui:placeholder": "Forneça uma breve descrição para o novo documento",
                "ui:options": {
                  "rows": 5
                }
              }
            }
          },
          action: "createNewDocument"
        }
        break;
      case 'saveAsNewVersion':
        modal = {
          title: "Nova versão",
          description: "Criando uma nova versão do documento atual. Preencha abaixo os dados solicitados.",
          rjsf: {
            "schema": {
              "type": "object",
              "properties": {
                "description": {
                  "type": "string",
                  "title": "Descrição"
                }
              }
            },
            "uiSchema": {
              "ui:submitButtonOptions": {
                "norender": true
              },
              "description": {
                "ui:widget": "textarea",
                "ui:placeholder": "Forneça uma breve descrição para esta versão do documento",
                "ui:options": {
                  "rows": 5
                }
              }
            }
          },
          action: "createNewDocumentVersion"
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
    let newversion = {};
    switch(action){
      case 'createNewDocumentVersion':
        newversion = await saveNewVersion()
        console.log('newversion', newversion)
        dismissModal()
        alertModal("Nova Versão Salva", "", "Uma nova versão do documento (v."+newversion.currentVersion+") foi salva no sistema com sucesso!", "")
        updateDocDetails(newversion)
        break;
      case 'createNewDocument':
        newversion = await saveNewVersion(true)
        dismissModal()
        // TODO: Temos que atualizar os dados do documento atual para o novo documento criado
        alertModal("Novo Documento Salvo", "", "O documento atual foi criado no sistema como um novo arquivo!", "")
        updateDocDetails(newversion)
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
  function dismissModal(){
    modalRef.current.close();
  }
  /** Subcomponentes */
  function Modal({ title = "", icon = "", description = "", content = "", rjsf = {}, action = "", language = "pt-br", hasCloseButton = false}){
    function handleChangeEvent(formData){
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
                <button type="button" className={`btn btn-primary ${(isLoading || isSubmittingModal) && 'disabled'}`} onClick={(e) => runAction(e, action)}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmittingModal ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Save' : 'Salvar'))}</button>
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
        {/* <div className="mt-auto d-flex align-items-start d-space-x-4">
          <button type="button" className={`btn btn-primary ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'justrender')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Rendering...' : 'Renderizando...') : ((language === 'en_us') ? 'Render' : 'Renderizar'))}</button>
        </div> */}
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-primary ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'saveAsNewDocument')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Save As...' : 'Salvar Como...'))}</button>
          <button type="button" className={`btn btn-primary ${(isLoading || isSubmitting) && 'disabled'}`} onClick={(e) => handleSubmit(e, 'saveAsNewVersion')}>{isLoading && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((language === 'en_us') ? 'Saving...' : 'Salvando...') : ((language === 'en_us') ? 'Save' : 'Salvar'))}</button>
        </div>
      </div>
    </div>
  </>
  return panel
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
function DocumentPreview({ language, url, previewSchema, codeId, initialform, documentDetails, definePreview, defineDocRendered }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updatePreview(prev) {
    definePreview(prev)
  }
  function updateDocRendered(prev) {
    defineDocRendered(prev)
  }
  /** Funcoes do Componente */
  function initializeFormData(schema, initializefields = false){
    let fd = {}
    for (const card in schema) { // cada card
      fd[card] = {}
      let eachcard = schema[card]
      for (const section in eachcard.properties) {
        fd[card][section] = {}
        if(initializefields){
          let eachsection = eachcard.properties[section]
          for (const field in eachsection.properties) {
            let eachfield = eachsection.properties[field]
            switch(eachfield.type){
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
  async function renderDocument() {
    setIsSubmitting(true);
    let mergedSchema = {};
    let mergedSchemaDefs = {};
    let mergedFormData = {};
    for (let i = 0; i < previewSchema.length; i++) {
      let tcard = previewSchema[i];
      mergedSchema[tcard.cardId] = { 
        type: 'object',
        properties: { ...tcard.schema.properties }
      }
      mergedSchemaDefs = { ...mergedSchemaDefs, ...tcard.schema.definitions }
    }
    mergedFormData = initializeFormData(mergedSchema, true)
    for (let i = 0; i < previewSchema.length; i++) {
      let tcard = previewSchema[i];
      mergedFormData[tcard.cardId] = { ...mergedFormData[tcard.cardId], ...tcard.formData } // populando formData
    }
    let datacontent = {
      command: "renderDocument",
      datasource: mergedFormData,
      templateDocument: documentDetails.template,
      documentName: new Date().getTime() + '_' + documentDetails.base_filename,
      tenant: initialform.tenant
    };
    let data = {
      command: "renderDocument",
      datacontent
    };
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        updatePreview(res.data.output.documentUrl);
        updateDocRendered(res.data.output);
        setIsSubmitting(false);
        return res.data.output;
      }
    } catch (e) {
      setIsSubmitting(false);
      throw new Error('Falha ao gerar o Render')
    }
  }
  async function handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    console.log('Updating...')
    let render = await renderDocument();
    console.log('render', render)
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
                        <button type="button" className={`btn btn-reload-preview btn-outline-secondary ${isSubmitting && 'disabled'}`} onClick={(e) => handleSubmit(e)}><span class="glyphicon glyphicon-repeat right-margin-5px"></span>{(isSubmitting ? ((language === 'en_us') ? 'Updating...' : 'Atualizando...') : ((language === 'en_us') ? 'Update Preview' : 'Atualizar Prévia'))}</button>
                      </div>                      
                    ) : (
                      <div className="d-flex align-items-start preview-warning d-p-4">Prévia indisponível</div>
                    )
                  }
                  </>
  return docpreview
}
function AttachmentsView({ attachments, language = 'pt_br' }) {
  /** Component Helpers - INÍCIO */
  function formatUTCDate(utcdate) {
    // Formata uma data em UTC para a visualização correta e na timezone local
    let d = new Date(utcdate)
    let utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toUTCString();
    return ("0" + (new Date(utc).getDate())).slice(-2) + "/" + ("0" + (new Date(utc).getMonth() + 1)).slice(-2) + "/" + new Date(utc).getFullYear() + " " + ("0" + (new Date(utc).getHours())).slice(-2) + ":" + ("0" + (new Date(utc).getMinutes())).slice(-2) + ":" + ("0" + (new Date(utc).getSeconds())).slice(-2)
  }
  
  /** Component Helpers - FIM */

  // Componente de Tabela deste componente
  function tableBuilder(currentAttachment) {
    const [attachment, setAttachment] = useState(currentAttachment)
    const [isLoading, setIsLoading] = useState(false);

    async function generateDownloadLink(attachment) {
      if(!attachment || !attachment.hasOwnProperty('document') || !attachment.document.hasOwnProperty('path')) return
      let data = {
        command: "downloadDocument",
        path: attachment.document.path
      };
      let config = {
        method: 'post',
        url: `/api/code/${props.codeId}`,
        data
      }
      try {
        setIsLoading(true)
        const res = await axios(config);
        if (res.data && res.data.output) {
          setAttachment(prev => {
            prev.link = res.data.output
            setIsLoading(false)
            return prev
          })
        }
      } catch (e) {
        setIsLoading(false)
        throw new Error('Falha ao baixar o arquivo')
      }
    }

    let attachmenttable =
      <div className="attachment-table">
        <table class="table table-sm table-bordered">
          <tbody>
            <tr class="table-subtitle">
              <td class="table-subtitle col-xs-4" colspan="1">{attachment.title}</td>
              <td class="table-subtitle col-xs-8" colspan="2">
                {
                  (attachment.hasOwnProperty('link') && attachment.link !== '')  ?
                    (
                      <a href={attachment.link} download target="_blank">
                        <button type="button" className={"btn btn-link"}>{language === 'en_us' ? 'Download' : 'Baixar'}</button>
                      </a>
                    ):
                    (
                      <button type="button" className={"btn btn-link"} onClick={(e) => generateDownloadLink(attachment)}>{isLoading && (<><span className="d-loading d-loading-spinner d-loading-md"></span> Aguarde...</>)}{!isLoading && ((language === 'en_us') ? 'Get link' : 'Obter link')}</button>
                    )
                }
              </td>
            </tr>
            <tr className="table-default">
              <td colspan="1" className="table-subtitle col-xs-4">{language === 'en_us' ? 'Description' : 'Descrição'}</td>
              <td colspan="2" style={{ wordBreak: "break-all" }} className="table-highlight col-xs-8">{attachment.description}</td>
            </tr>
            <tr className="table-default">
              <td colspan="1" className="table-subtitle col-xs-4">{language === 'en_us' ? 'Date' : 'Data'}</td>
              <td colspan="2" className="table-highlight col-xs-8">{formatUTCDate(attachment.date)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    return attachmenttable;
  }
  let sections = []

  if (attachments && attachments.length > 0) {
    for (let i = 0; i < attachments.length; i++) {
      sections.push(tableBuilder(attachments[i]))
    }
  } else {
    sections.push(
      <>{language === 'en_us' ? 'No attachments available' : 'Sem anexos disponíveis'}</>
    )
  }
  return (
    <div className="wfcomponent attachments">
      {sections}
    </div>
  )
}
function PreviousVersionsView({ documentDetails, documentRendered, codeId, language = 'pt_br' }) {
  /** Component Helpers - INÍCIO */
  function formatUTCDate(utcdate) {
    // Formata uma data em UTC para a visualização correta e na timezone local
    let d = new Date(utcdate)
    let utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toUTCString();
    return ("0" + (new Date(utc).getDate())).slice(-2) + "/" + ("0" + (new Date(utc).getMonth() + 1)).slice(-2) + "/" + new Date(utc).getFullYear() + " " + ("0" + (new Date(utc).getHours())).slice(-2) + ":" + ("0" + (new Date(utc).getMinutes())).slice(-2) + ":" + ("0" + (new Date(utc).getSeconds())).slice(-2)
  }
  // Roda a comparação da versão atual com uma versão anterior
  // compareDocuments -- precisa do endpoint no post.js
  async function compareVersions(baseversion, renderedVersion) {
    // setTmpVisor(JSON.stringify(renderedVersion))
    let data = {
      command: "compareDocuments",
      original: baseversion.document.path,
      final: renderedVersion.resPresigned.docpath
    };
    let config = {
      method: 'post',
      url: `/api/code/${codeId}`,
      data
    }
    console.log(`config`, config)
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao comparar versões **** ' + JSON.stringify(e.response.data))
    }
    return;
  }
  /** Component Helpers - FIM */

  // Componente de Tabela deste componente
  function TableBuilder(currentVersion, docrendered, versionidx) {
    const [version, setVersion] = useState(currentVersion)
    const [isLoading, setIsLoading] = useState(false);

    const [isComparing, setIsComparing] = useState(false)
    const [isComparingError, setIsComparingError] = useState(false)
    const [comparisonLink, setComparisonLink] = useState(false)

    async function triggerCompareVersions(version, docrendered, versionidx) {
      setIsComparing(true);
      setIsComparingError(false);
      console.log(`version`, version)
      console.log(`docrendered`, docrendered)
      console.log(`versionidx`, versionidx)
      try {
        let comparisondoc = await compareVersions(version, docrendered);
        setIsComparing(false);
        setIsComparingError(false);
        setComparisonLink(() => comparisondoc)
        return true;
      } catch (e) {
        setIsComparing(false);
        setIsComparingError(true);
        setComparisonLink('')
        return;
      }
    }

    async function generateDownloadLink(version) {
      if(!version || !version.hasOwnProperty('document') || !version.document.hasOwnProperty('path')) return
      let data = {
        command: "downloadDocument",
        path: version.document.path
      };
      let config = {
        method: 'post',
        url: `/api/code/${props.codeId}`,
        data
      }
      try {
        setIsLoading(true)
        const res = await axios(config);
        if (res.data && res.data.output) {
          setVersion(prev => {
            prev.link = res.data.output
            setIsLoading(false)
            return prev
          })
        }
      } catch (e) {
        setIsLoading(false)
        throw new Error('Falha ao baixar o arquivo')
      }
    }

    let versiontable =
      <div className="version-table">
        <table class="table table-sm table-bordered">
          <tbody>
            <tr class="table-subtitle">
              <td class="table-subtitle" colspan="1">{language === 'en_us' ? 'Version' : 'Versão'} {version.version}</td>
              <td class="table-subtitle" colspan="2">{language === 'en_us' ? 'Date:' : 'Data:'} {formatUTCDate(version.date)}</td>
            </tr>
            <tr className="table-default">
              <td colspan="1" className="table-subtitle">{language === 'en_us' ? 'Author' : 'Autor'}</td>
              <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.author}</td>
            </tr>
            <tr className="table-default">
              <td colspan="1" className="table-subtitle">{language === 'en_us' ? 'Description' : 'Descrição'}</td>
              <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.description}</td>
            </tr>
            <tr className="table-default">
              <td colspan="1" className="table-subtitle col-xs-4">{language === 'en_us' ? 'Actions' : 'Ações'}</td>
              <td className="table-subtitle col-xs-8" colspan="2">
                {
                  (version.hasOwnProperty('link') && version.link !== '')  ?
                    (
                      <a href={version.link} download target="_blank">
                        <button type="button" className={"btn btn-link"}>{language === 'en_us' ? 'Download' : 'Baixar'}</button>
                      </a>
                    ):
                    (
                      <button type="button" className={"btn btn-link"} onClick={(e) => generateDownloadLink(version)}>{isLoading && (<><span className="d-loading d-loading-spinner d-loading-md"></span> Aguarde...</>)}{!isLoading && ((language === 'en_us') ? 'Get link' : 'Obter link')}</button>
                    )
                }
                {(docrendered && docrendered.hasOwnProperty('documentUrl')) && (
                  <button type="button" className={`btn btn-outline-secondary right-margin-5px ${(isComparing ? 'disabled' : '')}`} onClick={async (e) => { e.preventDefault(); triggerCompareVersions(version, docrendered, versionidx); }} >{isComparingError && (<span class="glyphicon glyphicon-exclamation-sign right-margin-5px" title="Falha na comparação"></span>)} {isComparing && (<span class="spinner-border right-margin-5px"></span>)} {(isComparing ? ((language === 'en_us') ? 'Comparing...' : 'Comparando...') : ((language === 'en_us') ? 'Compare' : 'Comparar'))}</button>
                )}
                {(comparisonLink && comparisonLink !== '') && (
                  <a href={comparisonLink} download target="_blank">
                    <button type="button" className={"btn btn-outline-secondary"}>{language === 'en_us' ? 'Check Comparison' : 'Ver Comparação'}</button>
                  </a>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    return versiontable;
  }
  let versions = documentDetails.versions
  let sections = []
  if (versions && versions.length > 0) {
    for (let i = 0; i < versions.length; i++) {
      sections.push(TableBuilder(versions[i], documentRendered, i))
    }
  } else {
    sections.push(
      <>{language === 'en_us' ? 'No previous versions.' : 'Sem versões anteriores.'}</>
    )
  }
  return (
    <div className="wfcomponent previous-versions">
      {sections}
    </div>
  )
}
