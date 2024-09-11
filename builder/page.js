/*******************************************************************
* NO-CODE RJSF BUILDER
* 
* STATUS: Em desenvolvimento
*
* VERSÃO BASE: 1.1 (Form padrão)
* 
* CHANGELOG
*
*
* BUG FIXES
*
*
* KNOWN ISSUES
*
* 
********************************************************************/
(function () {

  /********************************************************************
   * # Configurações
   * 
   * Esta Carousel foi projetado para ser o único endpoint necessário
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
          "initialformId": "newuid-first", // schema inicial que está no Workflows/rjsf-schemas
          "initialformTenant": "looplex.com.br", // tenando do schema inicial
          "initialformDocument": "teste001", // documento com configurações básicas e onde será salvo o doc, em Workflows/assembler
          "codeDestination": "", // ID do Code de destino, caso a opção onSubmitAction seja send2Code
          "onSubmitAction": 'saveAsNewVersion', // O que fazer quando clicar em Submit? Ver Opções Abaixo: ***
          "template": "", // template do documento que será renderizado -- obrigatório se não houver um document (se eu usar o saveAsNewDocument por exemplo)
          "formTitle": "Assembler 3.0: Contrato de Fornecimento", // Título do formulário
          "base_filename": 'file.docx', // base do documento que será renderizado
          "author": props.embeddedData.author ? props.embeddedData.author : 'Looplex',
          "language": "pt_br" // idioma do formulário (en_us ou pt_br)
      },
      "privateKey": "A_PRIVATE_KEY_VAI_AQUI" // Private key para gerar o payload
    }

    NOTAS:
    *** onSubmitAction: 
      - 'saveAsNewVersion': Abre um modal para definir número da versão, título e descrição
      - 'saveAsNewDocument': Cria um novo registro de documento no Workflows/assembler
      - 'send2Code': Pega o formData e envia tudo em um payload para um code determinado
      - 'justRender': Apenas renderiza o documento na página com base nas respostas do formulário

   * Após gerar acima, passamos no formulário como parâmetro payload, dessa forma:

    https://actions.looplex.com/code/AC5701D0-2433-11EF-BDC7-77DDAE33E94A?payload=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbml0aWFsZm9ybUlkIjoibmV3dWlkLWZpcnN0IiwiaW5pdGlhbGZvcm1UZW5hbnQiOiJsb29wbGV4LmNvbS5iciIsImluaXRpYWxmb3JtRG9jdW1lbnQiOiJ0ZXN0ZTAwMSIsImZvcm1UaXRsZSI6IkFzc2VtYmxlciAzLjA6IENvbnRyYXRvIGRlIEZvcm5lY2ltZW50byIsImxhbmd1YWdlIjoicHRfYnIiLCJpYXQiOjE3MjAwNDU4NjV9.dTOLln85VWfRyRe1Me5KhO8p4UBP-9IBKse83CygPhnay_0x9gqoM-du_Mg0SFMgsWOZUzj9TsLbtnTWF5XaKDnOOwJeQLExXjlI3x73uLYKzlw-slFNAFrLjxjFOpj7MCug_fq8bw-E_wzpUKxftbdFH_NNBXB504aC089BP67MiCtuqsvHoT0kUDUotghQ9-uulPd8K0UDCgHPdd1CJYXpkNyv12HKZsLLQ7xZApLJ7jweRMF3fR2P_q-kA4TYsLddKEkoQpp3RWKfmMpcpASPAGGTLCz4mt2ebEWmPE55sVNGSamkkxBpoaGvGsreyFcBH10UHPv3He8ZXj2m1a9_3BgLKhky7wdl9WklI2Ckvvi211DvB38ZCa6X6rIUbScvNViiZXIp-F3elQZme_t0ynSsQDOGZa4o-3Pq7xPbR1wZTkLCkdMzU1UAEpT2fZ_3FcDn3xFIUfkAIUr8h-6zQe2orDCOU_kdIeA61QlQ_h99nD1ss9xUZshTkmvEqCm0Oth7_wZ6_Uwe8-qHLxzwdlYaMlyn7jJNvUmjYlHaVJTYIbBsZwrtYoex0rU2Ve3gt_NuWJl1V8LKWYgSfC6-PAnRDIH7hGRT5UgHkdjAH0PcmuHMRJl3drnWoPV6K5-_EOPjLZoS444ZcOSx_yCS2hObvX2_kfBt1gkgXVI

   * 

    ## formLayout

    No registro do cosmosDB que contém o schema indicado no initialformId acima, é possível incluir
    uma propriedade formLayout, que indica quais as seções que estarão disponíveis ou não
    ao carregar o formulário nesta página. O formato é o seguinte:

    "formLayout": {
        "main": true,
        "aside": true,
        "aside_summary": true,
        "aside_preview": false,
        "aside_attachments": false,
        "aside_versions": true
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

   *
   ********************************************************************/

  const initialform = {
    id: props.embeddedData.initialformId,
    tenant: props.embeddedData.initialformTenant ? props.embeddedData.initialformTenant : 'looplex.com.br',
    document: props.embeddedData.initialformDocument ? props.embeddedData.initialformDocument : '',
    onSubmitAction: props.embeddedData.onSubmitAction ? props.embeddedData.onSubmitAction : 'saveAsNewVersion',
    codeDestination: props.embeddedData.codeDestination ? props.embeddedData.codeDestination : '',
    base_filename: props.embeddedData.base_filename ? props.embeddedData.base_filename : 'file.docx',
    formTitle: props.embeddedData.formTitle ? props.embeddedData.formTitle : "No-code RJSF Builder",
    template: props.embeddedData.template,
    author: props.embeddedData.author ? props.embeddedData.author : 'Looplex',
    language: props.embeddedData.language ? props.embeddedData.language : 'pt_br'
  };
  const payloadFormData = props.embeddedData.rjsf?.formData == undefined ? {} : props.embeddedData.rjsf.formData
  const [panelView, setPanelView] = useState('preview')
  const [cards, setCards] = useState([])
  const [noCodeCards, setNoCodeCards] = useState([
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
  ])
  const [allLoadedCards, setAllLoadedCards] = useState([])
  const [preloadCards, setPreloadCards] = useState([])
  const [modal, setModal] = useState({
    title: "Título",
    description: "Descrição do Modal"
  })
  const [alert, setAlert] = useState({
    title: "Título",
    description: "Descrição do Alerta"
  })
  const [loginUser, setLoginUser] = useState({
    user: "",
    domain: ""
  })
  const [pageLayout, setPageLayout] = useState({
    main: true,
    aside: true,
    aside_summary: true,
    aside_preview: true,
    aside_schema: true,
    aside_versions: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [noCodeIsLoading, setNoCodeIsLoading] = useState(false)
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [isModalLogin, setIsModalLogin] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [isModalReady2Submit, setIsModalReady2Submit] = useState(false)
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(true)
  const [loginRequired, setLoginRequired] = useState(false)
  const [loginAccessRules, setLoginAccessRules] = useState({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeCard, setActiveCard] = useState(0);
  const [noCodeActiveCard, setNoCodeActiveCard] = useState(0);
  const myCarouselRef = useRef(null);
  const noCodeCarouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const noCodeActiveCardRef = useRef(null);
  const modalRef = useRef(null);
  const alertRef = useRef(null);

  const [previewDocURL, setPreviewDocURL] = useState("")
  const [documentDetails, setDocumentDetails] = useState({});
  const [documentDetailsVersionsLoaded, setDocumentDetailsVersionsLoaded] = useState(false);
  const [documentRendered, setDocumentRendered] = useState({});

  const [extraErrors, setExtraErrors] = useState({});
  const [tmpVisor, setTmpVisor] = useState('')
  const [tmpVisor2, setTmpVisor2] = useState('')
  const [submitted, setSubmitted] = useState('')

  // Esse useRef serve para evitar que o useEffect seja chamado 
  // multiplas vezes durante a renderização.
  //
  /** Por exemplo, se tivermos:
      const isLoadingInitialForm = useRef(false); 
   
   * Então no useEffect podemos checar por:
      if (isMounted.current) {
          console.log('mounted'); // Chamado após cada chamada do useEffect
      } else {
          console.log('mounting'); // Chamado apenas uma vez, enquanto ainda não foi chamado
          isMounted.current = true;
      }
  */
  const isLoadingInitialForm = useRef(false);
  const isLoadingInitialDocument = useRef(false);
  const isLoadingRemoteSchema = useRef(false);

  /*******************************************
   * Helper Functions
   *******************************************/

  // Funcao que verifica se o objeto é vazio
  const isObjectEmpty = (objectName) => {
    return JSON.stringify(objectName) === '{}'
  };

  // Funcao para aguardar
  const sleep = ms => new Promise(r => setTimeout(r, ms));
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
  // Cria um presigned URL de um arquivo no S3 da Looplex
  async function downloadFile(path) {
    let data = {
      command: "downloadDocument",
      path: path
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        // setTmpVisor(JSON.stringify(res.data.output))
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao baixar o arquivo')
    }
  }
  // Formata uma data em UTC para a visualização correta e na timezone local
  function formatUTCDate(utcdate) {
    let d = new Date(utcdate)
    let utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toUTCString();
    return ("0" + (new Date(utc).getDate())).slice(-2) + "/" + ("0" + (new Date(utc).getMonth() + 1)).slice(-2) + "/" + new Date(utc).getFullYear() + " " + ("0" + (new Date(utc).getHours())).slice(-2) + ":" + ("0" + (new Date(utc).getMinutes())).slice(-2) + ":" + ("0" + (new Date(utc).getSeconds())).slice(-2)
  }

  // Cria um ID aleatório com o numero de caracteres informado
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
      function(match) {
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

  /*******************************************
   * Hooks
   *******************************************/
  // Rodando apenas uma vez no início do form
  useEffect(() => {
    if (!initialform.id) {
      let originalcards = setSchema()
      setCards(originalcards)
      return
    };
    const maxAttempts = 3; // maximo de retries nas requests

    const fetchInitialForm = async () => {
      let data = {
        command: "fetchSchema",
        tenant: initialform.tenant,
        id: initialform.id
      };
      let config = {
        method: 'post',
        url: `/api/code/${props.codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        let initialSchema = [];
        let iSchema = {};
        let preloaded_cards = res.data.output.preloaded_cards ? res.data.output.preloaded_cards : [];
        if (res.data.output.hasOwnProperty('cards') && Array.isArray(res.data.output.cards)) { // É um array, não um objeto
          let tmpcards = res.data.output.cards;
          let tmpcard = {};
          for (let i = 0; i < tmpcards.length; i++) {
            iSchema = tmpcards[i];
            tmpcard = {
              cardId: iSchema.cardId,
              partitionKey: iSchema.partitionKey,
              card_conditions: iSchema.card_conditions,
              dmnStructure: iSchema.dmnStructure,
              schema: iSchema.schema,
              uiSchema: iSchema.uiSchema,
              formData: {},
              tagName: 'div'
            }
            initialSchema.push(tmpcard)
          }
        } else { // Tenho só o objeto de um card
          iSchema = res.data.output;
          initialSchema = [{
            cardId: iSchema.id,
            partitionKey: iSchema.partitionKey,
            card_conditions: iSchema.card_conditions,
            dmnStructure: iSchema.dmnStructure,
            schema: iSchema.schema,
            uiSchema: iSchema.uiSchema,
            formData: {},
            tagName: 'div'
          }];
        }
        // setTmpVisor(JSON.stringify(res.data.output))
        if (res.data.output.hasOwnProperty('formLayout') && !isObjectEmpty(res.data.output.formLayout)) {
          // console.log('res.data.output.formLayout', res.data.output.formLayout)
          setPageLayout(res.data.output.formLayout)
        }

        setAllLoadedCards(initialSchema) // criando um local que tem todas as cards, exibidas ou não        
        if (!initialform.document || initialform.document == '') { // Nao tenho o document, então posso já carregar o form sem esperar os detalhes do document
          let newcards = setSchema(initialSchema, initialSchema[0].cardId, {})
          setCards(newcards) // definindo o deck de cards que são exibidos
        }
        setIsLoading(false)
        console.log('trigger Preloaded_cards')
        setPreloadCards(preloaded_cards)
        // Comentadas o carregamento de cards pq estava com conflito ao abrir os documentDetails
        // console.log('output', res.data.output)
        if (res.data.output.loginRequired) { // Para acessar esse form é necessário um login antes
          setLoginRequired(true)
          loginModal()
          if (res.data.output.loginAccess && !isObjectEmpty(res.data.output.loginAccess)) {
            setLoginAccessRules(res.data.output.loginAccess)
          }
        }
        return true;
      }
    }

    const fetchDocumentDetails = async () => {
      let data = {
        command: "fetchDocumentDetails",
        tenant: initialform.tenant,
        id: initialform.document
      };
      let config = {
        method: 'post',
        url: `/api/code/${props.codeId}`,
        data
      }
      setIsLoadingDocumentDetails(true);
      const res = await axios(config);

      if (res.data && res.data.output) {
        let documentdetails = res.data.output;
        // Criando o link de download dos anexos
        for (let i = 0; i < documentdetails.attachments.length; i++) {
          documentdetails.attachments[i].link = await downloadFile(documentdetails.attachments[i].document.path);
        }
        // Criando o link de download das versões anteriores
        for (let i = 0; i < documentdetails.versions.length; i++) {
          documentdetails.versions[i].link = await downloadFile(documentdetails.versions[i].document.path);
        }
        setDocumentDetails(documentdetails);
        setDocumentDetailsVersionsLoaded(true);
        setIsLoadingDocumentDetails(false);
        return true;
      }
    }

    // função chamada quando não existe um registro de documentDetails ainda
    const setInitialDocumentDetails = () => {
      let documentdetails = {
        versions: [],
        attachments: [],
        author: initialform.author,
        currentVersion: "1.0.0",
        description: "",
        created_at: "",
        updated_at: "",
        title: "",
        base_filename: initialform.base_filename,
        template: initialform.template
      }
      setDocumentDetails(documentdetails);
      setIsLoadingDocumentDetails(false);
    }

    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      if (isLoadingInitialForm.current) {
        console.log('mounted');
      } else {
        console.log('mounting');
        isLoadingInitialForm.current = true;
        setIsLoading(true)
        fetchInitialForm()
          .then(res => {
            countAttempts = maxAttempts;
            console.log('Form loaded successfully. Attempt: ' + countAttempts)
            setIsLoading(false);
          })
          .catch(err => { // Se houver erro em carregar o formulario inicial, vamos tentar de novo
            setIsLoading(false);
            if (countAttempts >= maxAttempts) {
              setTmpVisor('Erro ao carregar o formulário inicial: ' + err.message)
            }
            sleep(500);
          });
      }
      if (countAttempts == maxAttempts) break;
    }

    if (!initialform.document || initialform.document == '') {
      setInitialDocumentDetails()
      console.log('No initial document defined')
      return
    } else {
      for (let countAttemptsDoc = 0; countAttemptsDoc < maxAttempts; countAttemptsDoc++) {
        if (isLoadingInitialDocument.current) {
          console.log('mounted');
        } else {
          console.log('mounting');
          isLoadingInitialDocument.current = true;
          setIsLoadingDocumentDetails(true)
          fetchDocumentDetails()
            .then(res => {
              countAttemptsDoc = maxAttempts;
              setIsLoadingDocumentDetails(false);
            })
            .catch(err => { // Se houver erro em carregar versoes anteriores, vamos tentar novamente
              setIsLoadingDocumentDetails(false);
              if (countAttemptsDoc >= maxAttempts) {
                setTmpVisor('Erro ao carregar as versões anteriores: ' + err.message)
              }
              sleep(500);
            });
        }
        if (countAttemptsDoc == maxAttempts) break;
      }
    }

  }, []);

  // Quando carregar os documentdetails, usamos esse hook para atualizar os cards
  useEffect(() => {
    if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
      let newcards = setSchema(loadPriorFormData(documentDetails));
      setCards(newcards)
    }
  }, [documentDetailsVersionsLoaded])

  // Vamos carregar também quaisquer cards que estejam marcados na propriedade preloaded_cards (ou seja, cards que devem ser carregados sem aguardar a DMN)
  useEffect(() => {
    if (preloadCards && preloadCards.length > 0) { // Tenho preloaded cards
      for (let j = 0; j < preloadCards.length; j++) { // Vamos pré-carregar cada card desse array se ele já não existir
        let current_ID = preloadCards[j].cardID;
        let scope = preloadCards[j].scope;
        let card_conditions = (preloadCards[j].card_conditions && preloadCards[j].card_conditions !== '') ? JSON.parse(preloadCards[j].card_conditions) : {};
        let card_loaded = allLoadedCards.filter(cd => cd.cardId === current_ID);
        if (!card_loaded || card_loaded.length === 0) {
          loadRemoteSchema(current_ID, cards[0].cardId, cards[0].formData, scope, card_conditions).then(res => {
            console.log('loadRemoteSchema', cards)
            isLoadingRemoteSchema.current = false;
          })
        }
      }
    }
  }, [preloadCards])

  // Efeito aplicado quando alterar o card atual
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [activeCard]);

  useEffect(() => {
    console.log('CHANGED!')
    noCodeActiveCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [noCodeActiveCard]);

  /*******************************************
   * Funções de manipulação de Cards e Card Deck
   *******************************************/
  // Essa função é utilizada para definir os cards que deverão ser exibidos
  function setSchema(initialcards = [], cardId = '', formData = {}) {
    let tmpcards = props.rjsf.cards; // Carregando cards do RJSF
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
  async function loadRemoteSchema(id, cardId, formData, scope = '', card_conditions = {}) {
    const fetchRemoteSchema = async () => {
      let data = {
        command: "fetchSchema",
        tenant: initialform.tenant,
        id: id
      };
      let config = {
        method: 'post',
        url: `/api/code/${props.codeId}`,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) {
        let newCard = {};
        let iSchema = {};
        let preloaded_cards = res.data.output.preloaded_cards ? res.data.output.preloaded_cards : [];
        // let tmpCards = cards;
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
        setAllLoadedCards(tmpCards) // criando um local que tem todas as cards, exibidas ou não        
        let newcards;
        // setTmpVisor(newcards)
        if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
          newcards = setSchema(loadPriorFormData(documentDetails, true), cardId, formData);
        } else {
          newcards = setSchema(tmpCards, cardId, formData)
        }
        setCards(newcards)
      }
      setIsLoading(false)
    }
    let maxAttempts = 3;
    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      if (isLoadingRemoteSchema.current) {
        console.log('mounted');
      } else {
        console.log('mounting');
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

  /*******************************************
   * Ações do Formulário
   *******************************************/
  // Chamado sempre que o botão de próxima ou anterior for clicado
  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    setIsReady2Submit(false);
    // setIsLoading(false);
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    let canRunDMN = true;
    let dmnVariables = {};

    if (dmnStructure && !isObjectEmpty(dmnStructure)) {
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
          setIsReady2Submit(true);
        } else {
          setIsReady2Submit(true);
          setIsLoading(false)

        }
      }
    } else {
      setIsReady2Submit(true);
    }

    let nextState;
    if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
      let tmpNextState = loadPriorFormData(documentDetails, true);
      nextState = setSchema(tmpNextState, cardId, formData);
      // console.log('nextState', nextState)
    } else {
      nextState = setSchema(allLoadedCards, cardId, formData)
    }
    setCards(nextState)
    // console.log('cards.length',cards.length)
    if (cards.length > 1) {
      // console.log('cards', cards)      
      //setTmpVisor(JSON.stringify(cards))
      // console.log('activeCard ANTES',activeCard)
      let moveLeft = Math.max(0, activeCard - 1);
      let moveRight = Math.min(cards.length - 1, activeCard + 1);
      // console.log('cardTargetIdx',cardTargetIdx)
      // console.log('moveLeft',moveLeft)
      // console.log('moveRight',moveRight)

      setActiveCard(cardTargetIdx === 'moveLeft' ? moveLeft : moveRight)
      // console.log('activeCard DEPOIS',activeCard)
      // console.log('activeCardRef', activeCardRef)
    }
  }

  // Chamado sempre que o botão de próxima ou anterior for clicado
  async function handleClickEventNoCard(cardId, formData, cardTargetIdx) {
    console.log('cardId', cardId)
    console.log('formData', formData)
    console.log('cardTargetIdx', cardTargetIdx)
    
    let load_card = noCodeCards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    let canRunDMN = true;
    let dmnVariables = {};

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
        setNoCodeIsLoading(true)
        let arrayIDs = await runDMN(formData, dmnStructure, load_card['partitionKey'])
        if (arrayIDs && arrayIDs.length > 0 && arrayIDs[0].cardID) {
          let current_ID = arrayIDs[0].cardID
          let scope = arrayIDs[0].scope
          let card_conditions = (arrayIDs[0].card_conditions && arrayIDs[0].card_conditions !== '') ? JSON.parse(arrayIDs[0].card_conditions) : {};

          let card_loaded = noCodeCards.filter(cd => cd.cardId === current_ID);
          if (!card_loaded || card_loaded.length === 0) {
            await loadRemoteSchema(current_ID, cardId, formData, scope, card_conditions)
            isLoadingRemoteSchema.current = false;
          }
          setNoCodeIsLoading(false)
        } else {
          setNoCodeIsLoading(false)

        }
      }
    }

    let nextState = setSchema(noCodeCards, cardId, formData)
    setNoCodeCards(nextState)
    console.log('noCodeCards', noCodeCards)
    if (noCodeCards.length > 1) {
      let moveLeft = Math.max(0, noCodeActiveCard - 1);
      let moveRight = Math.min(noCodeCards.length - 1, noCodeActiveCard + 1);
      setNoCodeActiveCard(cardTargetIdx === 'moveLeft' ? moveLeft : moveRight)
      console.log('noCodeActiveCard',noCodeActiveCard)
    }
  }

  // Chamado sempre que o formulário for alterado
  async function handleChangeEvent(cardId, formData, fieldId) {
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
    setCards(nextState)
    // Vamos também verificar se o nosso botão tem que ser renderizado novamente
    let load_card = nextState.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};

    if (!isObjectEmpty(dmnStructure)) {
      // setTmpVisor(JSON.stringify(dmnStructure.map))
      for (let dmnInput in dmnStructure.map) {
        if (dmnStructure.map[dmnInput] === field) {
          // Se o campo que eu alterei tem impacto no carregamento das DMNs, 
          // temos que fazer uma nova verificação para o carregamento dela
          setIsReady2Submit(false)
        }
      }
    }
  }
  // Chamado sempre que o formulário for enviado
  async function handleSubmit(event, justrender) {
    event.preventDefault()
    event.stopPropagation()
    let validated = await validateForm()
    // setTmpVisor(JSON.stringify(validated))
    if (Array.isArray(validated)) { // Se eu tenho uma array, houve erros
      let errors = treatAJVErrors(validated)
      let content = "Os seguintes erros foram encontrados no processamento do formulário enviado:<br /><br/><ul class='errorlist'>" + errors + "</ul>";
      alertModal("Erros no Formulário", "", "Verifique as informações encaminhadas", content)
    } else {
      if (justrender) {
        setIsRendering(true)
        let render = await renderDocument();
        setPreviewDocURL(render.documentUrl);
        setDocumentRendered(render);
        setIsRendering(false);
      } else {
        switch (initialform.onSubmitAction) {
          case 'saveAsNewDocument':
            setIsSubmitting(true)
            await saveNewVersion(makeid(5), "Versão Inicial");
            setIsSubmitting(false)
            alertModal("Obrigado!", "glyphicon-ok", "O formulário foi enviado com sucesso.", "")
            break;
          case 'send2Code':
            setIsSubmitting(true)
            await send2Code();
            setIsSubmitting(false)
            alertModal("Obrigado!", "glyphicon-ok", "", "O formulário foi enviado com sucesso.")
            break;
          case 'justRender':
            setIsRendering(true)
            let render = await renderDocument();
            setPreviewDocURL(render.documentUrl);
            setDocumentRendered(render);
            setIsRendering(false);
            break;
          default:
            submitNewVersion()
            break;
        }
      }
    }
    return;
  }

  function handleCancelDialog(event, cancancel = false) {
    event.preventDefault();
    console.log('closed', event)
    if (!cancancel) {
      return false
    }
  }

  /*******************************************
   * Funções de apoio
   * 
   * Abaixo temos que funções que cumprem ações
   * específicas do formulário
   *******************************************/

  // executa uma DMN
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
        url: `/api/code/${props.codeId}`,
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

  // renderiza um documento
  async function renderDocument() {
    let merged = {}
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if (tcard.scope && tcard.scope !== '') {
        merged[tcard.scope] = { ...tcard.formData }
      } else {
        merged = { ...merged, ...tcard.formData }
      }
    }

    let datacontent = {
      command: "renderDocument",
      datasource: merged,
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
      url: `/api/code/${props.codeId}`,
      data
    }
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        // setTmpVisor(JSON.stringify(res.data.output))
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao gerar o Render')
    }
  }

  // executa a chamada que faz o salvamento de uma nova versão
  async function saveNewVersion(version, description) {
    let merged = {}
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if (tcard.scope && tcard.scope !== '') {
        merged[tcard.scope] = { ...tcard.formData }
      } else {
        merged = { ...merged, ...tcard.formData }
      }
    }

    let datacontent = {
      command: "renderDocument",
      datasource: merged,
      templateDocument: documentDetails.template,
      documentName: new Date().getTime() + '_' + documentDetails.base_filename,
      tenant: initialform.tenant
    };
    let data = {
      command: "saveNewVersion",
      title: documentDetails.title,
      version,
      description,
      id: initialform.document ? initialform.document : '',
      tenant: initialform.tenant ? initialform.tenant : 'looplex.com.br',
      author: initialform.author,
      savenew: (initialform.onSubmitAction === 'saveAsNewDocument'),
      datacontent
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
        // Vamos atualizar o documentDetails relevante
        let docdetails = documentDetails;
        docdetails.versions.push(res.data.output.newversion)
        docdetails.attachments = docdetails.attachments.concat(res.data.output.newattachments)
        docdetails.currentVersion = version;
        docdetails.description = description;
        docdetails.created_at = docdetails.created_at ? docdetails.created_at : res.data.output.newversion.date;
        docdetails.updated_at = res.data.output.newversion.date;
        setDocumentDetails(docdetails)
        setDocumentRendered(res.data.output.docrendered)
        setPreviewDocURL(res.data.output.docrendered.documentUrl);
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao salvar nova versão **** ' + JSON.stringify(e.response.data))
    }
  }

  // executa a chamada que faz o salvamento de uma nova versão
  async function send2Code() {
    if (!initialform.codeDestination || initialform.codeDestination === '') return
    let merged = {}
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if (tcard.scope && tcard.scope !== '') {
        merged[tcard.scope] = { ...tcard.formData }
      } else {
        merged = { ...merged, ...tcard.formData }
      }
    }

    let data = {
      command: "send2Code",
      codeId: initialform.codeDestination,
      formId: initialform.id,
      documentId: initialform.document ? initialform.document : '',
      tenant: initialform.tenant ? initialform.tenant : 'looplex.com.br',
      formData: merged
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
      throw new Error('Falha ao enviar para o Code ' + initialform.codeDestination + ' **** ' + JSON.stringify(e.response.data))
    }
  }

  // Roda a comparação da versão atual com uma versão anterior
  async function compareVersions(baseversion, renderedVersion) {
    // setTmpVisor(JSON.stringify(renderedVersion))
    let data = {
      command: "compareDocuments",
      original: baseversion.document.path,
      final: renderedVersion.resPresigned.data.info.docpath
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    // setTmpVisor2(JSON.stringify(config))
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

  // Gera o preview do documento, renderizando o formulário atual (chamado quando se clica no botão "atualiza prévia")
  async function generatePreview() {
    setIsPreviewLoaded(false);
    let preview = await renderDocument();
    if (preview) {
      setPreviewDocURL(preview.documentUrl);
    } else {
      setPreviewDocURL('');
    }
    setIsPreviewLoaded(true);
    return;
  }

  // Formata os erros recebidos na validação para exibição na tela
  function treatAJVErrors(errors = []) {
    let errorsmsg = "";
    if (errors && errors.length > 0) {
      for (let i = 0; i < errors.length; i++) {
        errorsmsg += "<li><strong>" + errors[i].instancePath + ":</strong> " + errors[i].message + "</li>"
      }
    }
    return errorsmsg
  }

  // Verifica a validade do formulário em relação ao schema fornecido  
  async function validateForm() {
    let mergedFormData = {}
    let mergedSchema = {};
    let mergedSchemaDefs = {};
    let requiredFields = [];
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if (tcard.schema.hasOwnProperty('required')) {
        requiredFields.concat(tcard.schema.required)
      }
      mergedFormData = { ...mergedFormData, ...tcard.formData }
      mergedSchema = { ...mergedSchema, ...tcard.schema.properties }
      mergedSchemaDefs = { ...mergedSchemaDefs, ...tcard.schema.definitions }
    }
    let data = {
      command: "validateForm",
      formData: mergedFormData,
      schema: {
        type: "object",
        properties: { ...mergedSchema },
        definitions: { ...mergedSchemaDefs },
        required: requiredFields
      }
    };
    let config = {
      method: 'post',
      url: `/api/code/${props.codeId}`,
      data
    }
    // setTmpVisor2(JSON.stringify(config))
    try {
      const res = await axios(config);
      if (res.data && res.data.output) {
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao validar o formulário')
    }
  }

  // Exibe o modal em formato de alerta
  function alertModal(title, icon, message, content) {
    let alert = {
      icon: icon,
      title: title,
      description: message,
      content: content,
      hasCloseButton: false
    };
    setAlert(alert)
    alertRef.current.showModal()
  }

  // Exibe o modal para formato de salvar nova versão
  function submitNewVersion() {
    let modal = {
      title: "Nova versão",
      description: "Deseja criar uma nova versão deste documento?",
      rjsf: {
        "schema": {
          "type": "object",
          "required": [
            "version",
            "description"
          ],
          "properties": {
            "version": {
              "type": "string",
              "title": "Versão"
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
            "ui:placeholder": "Forneça uma breve descrição para esta versão do documento",
            "ui:options": {
              "rows": 5
            }
          }
        }
      },
      action: "createNewDocumentVersion"
    }
    setModal(modal);
    modalRef.current.showModal();
  }

  // Exibe o modal para formato de salvar nova versão
  function loginModal() {
    let modal = {
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
            "norender": false,
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
    setModal(modal);
    modalRef.current.showModal();
  }

  // Exibe o modal para formato de salvar nova versão
  function createNewDefinitionModal() {
    let modal = {
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
    setModal(modal);
    modalRef.current.showModal();
  }

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
    setAllLoadedCards(tmpCards);
    setCards(setSchema(tmpCards))
    alertModal("Novo Card", "", "Um novo card foi adicionado ao deck!", "")
  }

  async function addNewSection2Card(card) {
    let tmpCards = cards;
    let newCardSection = {
      "id": makeid(5),
      "name": "Seção",
      "description": "Seção do Formulário",
      "rows": []
    };
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    /**
     * TODO -- ainda não conclusivo, mas o deck de preview apenas funciona o carousel se eu tiver a linha abaixo e 
     * é ativado quando houver mais de uma seção (adicionar apenas a primeira seção ainda não libera o carousel)
     */

    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      findCard[0].cardSections.push(newCardSection); // Essa linha faz com que o carousel direito funcione (? :/) -- Qual o motivo?
      tmpCards[findCardIdx] = findCard[0];
      setAllLoadedCards(tmpCards);
      setCards(setSchema(tmpCards))
    }
  }

  async function removeCardSection(card, section) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      tmpCards[findCardIdx].cardSections = findCard[0].cardSections.filter(cd => cd.id !== section.id)
      setAllLoadedCards(tmpCards);
      let newCards = setSchema(tmpCards)
      setCards(newCards)
    }
  }

  async function addNewRow2Section(card, section) {
    let tmpCards = cards;
    let newSectionRow = {
      "id": makeid(5),
      "name": "Linha do Formulário",
      "description": "Linha do Formulário",
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
          setAllLoadedCards(tmpCards);
          let newCards = setSchema(tmpCards)
          setCards(newCards)
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
          setAllLoadedCards(tmpCards);
          let newCards = setSchema(tmpCards)
          setCards(newCards)
        }
      }
    }
  }

  async function addNewDefinition2Section(card, section) {
    let tmpCards = cards;
    let newSectionDef = {
      "id": makeid(5),
      "name": "Definição na Seção do Formulário",
      "description": "Uma definição de seção",
      "type": "definition"
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
          findSection[0].rows.push(newSectionDef)
          tmpCards[findCardIdx].cardSections[findSectionIdx] = findSection[0];
          setAllLoadedCards(tmpCards);
          let newCards = setSchema(tmpCards)
          setCards(newCards)
        }
      }
    }
  }

  async function createNewDefinition(card, section) {
    createNewDefinitionModal()
  }

  async function addNewField2Row(card, section, row) {
    let tmpCards = cards;
    let newFieldElement = {
      "id": makeid(5),
      "name": "Campo do Formulário",
      "description": "Campo do Formulário",
      "columns": 12,
      "type": "string"
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
              setAllLoadedCards(tmpCards);
              let newCards = setSchema(tmpCards)
              setCards(newCards)
            }
          }
        }
      }
    }
  }

  async function removeSectionRowField(card, section, row, field) {
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
              setAllLoadedCards(tmpCards);
              let newCards = setSchema(tmpCards)
              setCards(newCards)
            }
          }
        }
      }
    }
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
      setAllLoadedCards(tmpCards);
      let newCards = setSchema(tmpCards)
      setCards(newCards)
    }
  }

  async function removeCardCondition(card, condition) {
    let tmpCards = cards;
    let findCard = tmpCards.filter(cd => cd.cardId === card.cardId);
    let findCardIdx;
    if (findCard && findCard.length > 0) {
      findCardIdx = tmpCards.indexOf(findCard[0]);
      tmpCards[findCardIdx].cardConditionsRules = findCard[0].cardConditionsRules.filter(cd => cd.id !== condition.id)
      setAllLoadedCards(tmpCards);
      let newCards = setSchema(tmpCards)
      setCards(newCards)
    }
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
        setLoginUser(
          {
            user: username,
            domain: domain
          }
        )
        return res.data.output;
      }
    } catch (e) {
      let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
      alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content)
      throw new Error('Falha ao realizar o login **** ' + JSON.stringify(e.response.data))
    }
  }

  function checkCanLogin(username, domain) {
    if (isObjectEmpty(loginAccessRules)) return true;
    // Temos regras a observar
    if (!loginAccessRules.hasOwnProperty(domain)) return false; // Não tem o domain necessario
    return loginAccessRules[domain].includes(username) || loginAccessRules[domain].includes('all') // se eu tenho 'all', então todo user desse domain pode usar
  }

  // Roda ações definidas no Modal
  async function runAction(action, inputs) {
    let render;
    switch (action) {
      case 'createNewDocumentVersion':
        setIsModalSubmitting(true)
        let version = inputs.formData?.version;
        let description = inputs.formData?.description;
        render = await saveNewVersion(version, description);
        setIsModalSubmitting(false)
        modalRef.current.close()
        break;
      case 'loginCases':
        setIsModalLogin(true) // TODO: vincular esse state ao processamento do botão enviar
        let username = inputs.formData?.user;
        let password = inputs.formData?.pwd;
        let domain = inputs.formData?.domain;
        // primeiro vamos checar se esse usuario pode se logar no domain fornecido
        let canLogin = await checkCanLogin(username, domain);
        if (!canLogin) {
          let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
          alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content)
          modalRef.current.close()
        } else {
          let login = await loginCases(username, password, domain);
          console.log('login', login)
          if (login && login.hasOwnProperty('Profile') && login['Profile'] != '' && login['Profile'] != "Login_Failed") { // Login bem sucedido
            setIsAuthenticated(true)
            alertModal("Login efetuado", "", "Login efetuado com sucesso", "")
          } else {
            let content = "Não foi possível realizar a sua autenticação:<br /><br/><div class='errormsg'>Usuário, senha ou escritório incorreto ou ainda sem acesso a este formulário</div>";
            alertModal("Erro na Autenticação", "", "Verifique as credenciais encaminhadas", content)
            modalRef.current.close()
          }
          setIsModalLogin(false)
          modalRef.current.close()
        }
        break;
      default:
        return;
    }
  }

  /*******************************************************************
   * Elementos do Painel direito
   * 
   * As funções a seguir definem elementos que são utilizados no painel
   * direito, que contém o sumário, versões, anexos, etc. 
   * A ideia é componentizar cada um dos elementos que são 
   * repetidos durante a implementação
   *******************************************************************/

  // Descrição do documento que está sendo construído. No painel de 
  // sumário ele aparece como "Informações Gerais"
  function Description(props) {
    let description = props.description
    return (
      <div >
        <a class="btn btn-summary" data-toggle="collapse" href="#overview" role="button" aria-expanded="false" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}><span className="glyphicon glyphicon-triangle-right right-margin-5px"></span>Informações Gerais</a>
        <div class="collapse" id="overview">
          <table class="table table-hover table-sm table-bordered">

            <tbody>
              <tr>
                <td className="table-highlight">
                  Versão atual
                </td>
                <td>
                  {description.version}
                </td>
              </tr>
              <tr>
                <td className="table-highlight">
                  Autor
                </td>
                <td>
                  {description.author}
                </td>
              </tr>
              <tr>
                <td className="table-highlight">
                  Data de criação
                </td>
                <td>
                  {(description.created_at && description.created_at !== '') ? (formatUTCDate(description.created_at)) : ''}
                </td>
              </tr>
              <tr>
                <td className="table-highlight">
                  Última Atualização
                </td>
                <td>
                  {(description.updated_at && description.updated_at !== '') ? (formatUTCDate(description.updated_at)) : ''}
                </td>
              </tr>
              <tr>
                <td className="table-highlight">
                  Descrição
                </td>
                <td>
                  {description.description}
                </td>
              </tr>
            </tbody>
          </table>
        </div >
      </div >
    )
  }

  // Cada uma das linhas com o conteúdo que estamos populando.
  // Ele indica que há um valor original e o destaca com o valor atual
  // que é trazido no formulario
  function Row(props) {
    let title = props.title
    let priorValue = props.priorValue
    let currentValue = props.currentValue

    let row =
      <tr className={priorValue == currentValue ? "table-default" : "table-primary"}>
        <td style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight col-xs-4" colspan="1">{title}</td>
        <td style={{ wordBreak: "break-all", minWidth: "200px" }} className="col-xs-4" colspan="1">{priorValue}</td>
        <td style={{ wordBreak: "break-all", minWidth: "200px" }} className="col-xs-4" colspan="1">{currentValue}</td>
      </tr>

    return row
  }

  // Quando em nosso RJSF temos uma subseção, colocaremos o elemento 
  // a seguir para indicar que as linhas seguintes dizem respeito 
  // a essa subseção usando um subtítulo
  function TableRow(props) {
    let rows = props.rows
    let subtitle = props.subtitle
    let sublevel = props.sublevel
    let table =
      <>
        <tr class="table-subtitle">
          <td class="table-subtitle" colspan="3">{Array(sublevel).fill(<span className="right-margin-5px">•</span>)}{subtitle}</td>
        </tr>
        {rows}
      </>
    return table
  }

  // Cada uma das seções do sumário
  function Section(props) {
    let table = props.table
    let title = props.title
    let id = props.id
    let isCurrentCard = props.isCurrentCard
    let section = <div style={{
      width: "100%", height: "100%", backgroundColor: "white"
    }} >
      <a class="btn btn-summary" data-toggle="collapse" href={`#${id}`} role="button" aria-expanded="true" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}><span className="glyphicon glyphicon-triangle-right right-margin-5px"></span>{title}</a>
      <div className={isCurrentCard ? "collapse show" : "collapse"} id={id}>
        <table class="table table-hover table-sm table-bordered">
          <thead class="thead-light">
            <tr className="table-title">
              <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Field' : 'Campo'}</th>
              <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Original' : 'Original'}</th>
              <th className="table-title col-xs-4" scope="col">{initialform.language === 'en_us' ? 'Modified' : 'Alterado'}</th>
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

  // Montagem do sumário efetiva
  function Summary(props) {
    function tableBuilder(schema, previewFormData = {}, currentFormData = {}, sublevel = 0) {
      let items = []
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
      return items
    }
    let cards = props.cards
    let activeCard = props.activeCard
    let sections = []
    let currentCard = cards[activeCard];
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      let title = card.schema?.title ? card.schema?.title : card.cardId
      let cardSchema = card.schema
      let cardPriorFormData = card.priorFormData ? card.priorFormData : {}
      let cardCurrentFormData = card.formData ? card.formData : {}
      let table = tableBuilder(cardSchema, cardPriorFormData, cardCurrentFormData)
      sections.push(<Section table={table} title={title} id={card.cardId} isCurrentCard={currentCard === card} />)
    }
    return (
      <div>
        {sections}
      </div>
    )
  }

  // Montagem da tabela de versões
  function PreviousVersions(props) {
    function tableBuilder(version, docrendered, versionidx) {
      const [isComparing, setIsComparing] = useState(false)
      const [isComparingError, setIsComparingError] = useState(false)
      const [comparisonLink, setComparisonLink] = useState(false)
      async function triggerCompareVersions(version, docrendered, versionidx) {
        // console.log('docrendered', docrendered)
        // console.log('version', version)
        setIsComparing(true);
        setIsComparingError(false);
        try {
          let comparisondoc = await compareVersions(version, docrendered);
          setIsComparing(false);
          setIsComparingError(false);
          setComparisonLink(comparisondoc)
          return true;
        } catch (e) {
          setIsComparing(false);
          setIsComparingError(true);
          setComparisonLink('')
          return;
        }
      }

      let versiontable =
        <div className="version-table">
          <table class="table table-sm table-bordered">
            <tbody>
              <tr class="table-subtitle">
                <td class="table-subtitle" colspan="1">{initialform.language === 'en_us' ? 'Version' : 'Versão'} {version.version}</td>
                <td class="table-subtitle" colspan="2">{initialform.language === 'en_us' ? 'Date:' : 'Data:'} {formatUTCDate(version.date)}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">{initialform.language === 'en_us' ? 'Author' : 'Autor'}</td>
                <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.author}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">{initialform.language === 'en_us' ? 'Description' : 'Descrição'}</td>
                <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.description}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle col-xs-4">{initialform.language === 'en_us' ? 'Actions' : 'Ações'}</td>
                <td className="table-subtitle col-xs-8" colspan="2">
                  <a href={version.link} download target="_blank">
                    <button type="button" className={"btn btn-outline-secondary"}>{initialform.language === 'en_us' ? 'Download' : 'Baixar'}</button>
                  </a>
                  {(docrendered && docrendered.hasOwnProperty('documentUrl')) && (
                    <button type="button" className={`btn btn-outline-secondary right-margin-5px ${(isComparing ? 'disabled' : '')}`} onClick={async (e) => { e.preventDefault(); triggerCompareVersions(version, docrendered, versionidx); }} >{isComparingError && (<span class="glyphicon glyphicon-exclamation-sign right-margin-5px" title="Falha na comparação"></span>)} {isComparing && (<span class="spinner-border right-margin-5px"></span>)} {(isComparing ? ((initialform.language === 'en_us') ? 'Comparing...' : 'Comparando...') : ((initialform.language === 'en_us') ? 'Compare' : 'Comparar'))}</button>
                  )}
                  {(comparisonLink && comparisonLink !== '') && (
                    <a href={comparisonLink} download target="_blank">
                      <button type="button" className={"btn btn-outline-secondary"}>{initialform.language === 'en_us' ? 'Check Comparison' : 'Ver Comparação'}</button>
                    </a>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      return versiontable;
    }

    let versions = props.docdetails.versions
    let docrendered = props.docrendered
    let sections = []
    if (versions && versions.length > 0) {
      for (let i = 0; i < versions.length; i++) {
        sections.push(tableBuilder(versions[i], docrendered, i))
      }
    } else {
      sections.push(
        <>{initialform.language === 'en_us' ? 'No previous versions.' : 'Sem versões anteriores.'}</>
      )
    }
    return (
      <>
        {sections}
      </>
    )
  }

  // Modal
  function Modal(props) {
    let title = props.title ? props.title : ""
    let icon = props.icon ? props.icon : ""
    let description = props.description ? props.description : ""
    let content = props.content ? props.content : ""
    let rjsf = props.rjsf ? props.rjsf : {}
    let action = props.action ? props.action : ""
    let hasCloseButton = props.hasCloseButton ? props.hasCloseButton : false

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
            <Form {...rjsf} onSubmit={(event) => runAction(action, event)} liveValidate id="modalForm" />
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
              <button className="d-btn">{initialform.language === 'en_us' ? 'Cancel' : 'Cancelar'}</button>
            </form>
          </div>
        )}
      </>
    return modal
  }

  function CardInfo(props) {
    let card = props.card
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
            }
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
      }
    }

    let conditions = card.cardConditionsRules;
    let cardcontent = <div className="section-content-wrapper">
      <Form {...cardSchema} liveValidate />
      <div className="section-content-rows-wrapper">
        {
          (conditions.length > 0) &&
          conditions.map(condition => (
            <div className="section-content-row">
              <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeCardCondition(card, condition); }}><span className="glyphicon glyphicon-trash"></span></button>
              <CardConditions condition={condition}></CardConditions>
            </div>
          ))
        }
      </div>
      <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
        <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
        <div className="mt-auto d-flex align-items-end d-space-x-4">
          <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); addNewCondition2Card(card); }}>Nova Condição</button>
        </div>
      </div>
    </div>

    return cardcontent
  }

  function CardConditions(props) {
    let condition = props.condition
    let conditionSchema = {
      "schema": {
        "title": "Condição de Card",
        "description": "Para que este card apareça, todas as condições devem ser verdadeiras",
        "type": "object",
        "properties": {
          "condition": {
            "title": "Condição",
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
            }
          }
        }
      },
      "uiSchema": {
        "ui:submitButtonOptions": {
          "norender": true
        },
        "condition": {
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
    }

    let conditioncontent = <Form {...conditionSchema} liveValidate />
    return conditioncontent
  }

  function SectionContent(props) {
    let card = props.card
    let section = props.section
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

    let sectioncontent = <Form {...sectionSchema} liveValidate />

    if (section.hasOwnProperty('rows') && section.rows.length > 0) {
      let rows = section.rows;
      sectioncontent = <div className="section-content-wrapper">
        <Form {...sectionSchema} liveValidate />
        <div className="section-content-rows-wrapper">
          {
            rows.map(row => (
              <div className="section-content-row">
                <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeSectionRow(card, section, row); }}><span className="glyphicon glyphicon-trash"></span></button>
                <SectionRow card={card} section={section} row={row}></SectionRow>
              </div>
            ))
          }
        </div>
      </div>
    }

    return sectioncontent
  }

  function SectionRow(props) {
    let card = props.card
    let section = props.section
    let row = props.row
    let fields = row.fields ? row.fields : []
    let rowcontent;

    if (row.type == 'definition') {
      rowcontent = <div>
        <div className="section-content-row-title">{row.name}</div>
        <div className="section-content-row-field">
          <SectionDefinition row={row}></SectionDefinition>
        </div>
      </div>
    } else { // Nova linha
      rowcontent = <div>
        <div className="section-content-row-title">{row.name}</div>
        {
          fields.map(field => (
            <div className="section-content-row-field">
              <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeSectionRowField(card, section, row, field); }}><span className="glyphicon glyphicon-trash"></span></button>
              <SectionRowField field={field}></SectionRowField>
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

  function SectionDefinition(props) {
    let row = props.row
    let loadedDefs = [
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
      }
    ];
    let definitionSchema = {
      "schema": {
        "title": "Definição",
        "description": "Você deve escolher uma definição do banco de dados no campo abaixo, que fará parte do seu formulário",
        "type": "object",
        "properties": {
          "definition": {
            "title": "Escolha da Definição",
            "type": "string",
            "anyOf": loadedDefs
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
              "definition": {
                "classNames": "col-md-12"
              }
            }
          ]
        }
      }
    }

    let defcontent = <Form {...definitionSchema} liveValidate />
    return defcontent
  }

  function SectionRowField(props) {
    let field = props.field
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
                    "title": "Form inteiro (12/12)"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "6"
                    ],
                    "title": "Metade do Form (6/12)"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "4"
                    ],
                    "title": "Um terço do Form (4/12)"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "3"
                    ],
                    "title": "Um quarto do Form (3/12)"
                  },
                  {
                    "type": "string",
                    "enum": [
                      "2"
                    ],
                    "title": "Um sexto do Form (2/12)"
                  },
                ]
              },
              "type": {
                "type": "string",
                "title": "Tipo do Campo",
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
                  }
                ]
              },
              "defaultvalue": {
                "type": "string",
                "title": "Valor Padrão"
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
              "type": {
                "classNames": "col-md-6"
              },
              "defaultvalue": {
                "classNames": "col-md-6"
              }
            }
          ],
          "colsize": {
            'ui:help': 'A soma das larguras dos campos deve sempre ser 12 por linha'
          }
        }
      }
    }

    let fieldcontent = <Form {...fieldSchema} liveValidate />
    return fieldcontent
  }

  function FormCard(props) {
    let card = props.card
    let formcard;

    if (card.hasOwnProperty('cardType') && card.cardType === 'formCard') {
      let sections = card.hasOwnProperty('cardSections') && card.cardSections.length > 0 ? card.cardSections : []
      formcard = <div className="section-card">
        <div className="section-card-title">
          Card {card.cardId}
        </div>
        <div className="section-card-content">
          <CardInfo card={card}></CardInfo>
        </div>
        {
          sections.map(section => (
            <div className="section-card-content">
              <button type="button" className={`btn btn-danger remove-icon`} onClick={(e) => { e.preventDefault(); removeCardSection(card, section); }}><span className="glyphicon glyphicon-trash"></span></button>
              <SectionContent card={card} section={section}></SectionContent>
              <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                <div className="mt-auto d-flex align-items-end d-space-x-4">
                  <button type="button" className={`btn btn-info`} onClick={(e) => { e.preventDefault(); createNewDefinition(card, section); }}>Criar Definição</button>
                </div>
                <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
                <div className="mt-auto d-flex align-items-end d-space-x-4">
                  <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewDefinition2Section(card, section); }}>Adicionar Definição</button>
                  <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewRow2Section(card, section); }}>Adicionar Linha</button>
                </div>
              </div>
            </div>
          ))
        }
        <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); addNewSection2Card(card); }}>Adicionar Seção</button>
      </div>
    } else {
      formcard = <Form {...card} onChange={(event, id) => handleChangeEvent(card.cardId, event.formData, id)} extraErrors={extraErrors} liveValidate />
    }

    return formcard
  }

  function JSONStructureView(props){
    let json = props.json
    let jsonview = <div className="preview-json">
        <pre
        dangerouslySetInnerHTML={{
          __html: syntaxHighlight(JSON.stringify(json, undefined, 4))
        }}
      />
    </div>
    return jsonview
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
      <Head>
        <title>{initialform.formTitle}</title>
        <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
        <link
          href='https://bootswatch.com/5/lumen/bootstrap.min.css'
          rel='stylesheet'
          type='text/css'
        />
        <link rel="stylesheet" type='text/css' href='https://looplex-workflows.s3.us-east-1.amazonaws.com/css-form-padrao/ant.css' />
        <link rel='stylesheet' type='text/css' href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/css-form-padrao/daisy.css' />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
        <link
          rel='stylesheet'
          href='https://octaviosi.github.io/styles/css/carousel-looplex.v1.1.css'
        />
        <link
          rel='stylesheet'
          href='https://octaviosi.github.io/styles/css/builder.css'
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />


        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
        <script src='https://code.jquery.com/jquery-3.6.3.slim.min.js'></script>
        <script src='https://cdn.tailwindcss.com?plugins=typography'></script>
        <script>{`tailwind.config = {prefix: 'd-' }`}</script>
      </Head>

      <dialog id="optionsmodal" className="d-modal" ref={modalRef} onCancel={(e) => { handleCancelDialog(e, modal.canCancel) }}>
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={modal.title} description={modal.description} content={modal.content} rjsf={modal.rjsf} action={modal.action} hasCloseButton={modal.hasCloseButton} icon={modal.icon} />
        </div>
        {
          (modal.canCancel) &&
          <form method="dialog" className="d-modal-backdrop">
            <button>close</button>
          </form>
        }
      </dialog>

      <dialog id="optionsmodal" className="d-modal" ref={alertRef} >
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={alert.title} description={alert.description} content={alert.content} rjsf={alert.rjsf} action={alert.action} hasCloseButton={alert.hasCloseButton} icon={alert.icon} />
        </div>
        <form method="dialog" className="d-modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="looplex-header">
        <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" /><span>No-code RJSF Builder</span>
      </div>
      <div className='container-form'>
        {(!isAuthenticated && loginRequired) ?
          (
            <div className={`card card-main`}>
              <main>
                <section className="navigation d-flex align-items-center flex-column">
                  <div className="mt-auto d-flex align-items-center flex-column login-spacer">
                    <h1 className="login-spacer">Login necessário</h1>
                    <p>Esta página tem acesso restrito.</p>
                    <p>Clique no botão abaixo para realizar o login.</p>
                  </div>
                  <div className="mt-auto d-flex align-items-center">
                    <button type="button" className={`btn btn-primary`} onClick={(e) => { e.preventDefault(); modalRef.current.showModal(); }}>Login</button>
                  </div>
                </section>
              </main>
            </div>
          ) : (
            <form method='POST' action='/' onSubmit={handleSubmit}>
              <div className={`card ${(pageLayout.main && pageLayout.aside) ? 'card-main-aside' : (pageLayout.main ? 'card-main' : 'card-aside')}`}>
                {pageLayout.main &&
                  (
                    <main style={{ width: (pageLayout.aside ? '98%' : '100%') }}>
                      <section class="deckofcards">
                        {tmpVisor}
                        {tmpVisor2}
                        {submitted}
                        <div ref={myCarouselRef} className='d-carousel d-w-full'>
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
                              <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(initialform.language === 'en_us') ? 'Previous' : 'Anterior'}</button>
                              <span class="glyphicon glyphicon-option-horizontal"></span>
                              <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveRight') }}>{(initialform.language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
                            </div>
                            <div className="mt-auto d-flex d-space-x-4 flex-row  d-w-full">
                              <div className="mt-auto d-flex align-items-start d-space-x-4">
                                <button type="button" className={`btn btn-secondary`} onClick={(e) => { e.preventDefault(); addNewCard2Deck(); }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((initialform.language === 'en_us') ? 'Loading...' : 'Carregando...') : ((initialform.language === 'en_us') ? 'New Card' : 'Novo Card')}</button>
                              </div>
                              <div className="mt-auto d-flex d-space-x-4 d-grow"></div>
                              <div className="mt-auto d-flex align-items-end d-space-x-4">
                                <button type="button" className={`btn btn-primary ${(!isReady2Submit || isSubmitting || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, false) }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((initialform.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((initialform.language === 'en_us') ? 'Submitting...' : 'Enviando...') : ((initialform.language === 'en_us') ? 'Submit' : 'Enviar'))}</button>
                              </div>
                            </div>
                          </>
                        )}
                      </section>
                    </main>
                  )}

                {pageLayout.aside &&
                  (
                    <aside>
                      <div className="card-navigation">
                        {pageLayout.aside_preview && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'preview' && 'active'}`} onClick={(e) => { e.preventDefault(); setPanelView('preview') }}>{(initialform.language === 'en_us') ? 'Preview Form' : 'Prévia do Form'}</button>)}
                        {pageLayout.aside_schema && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'schema' && 'active'}`} onClick={(e) => { e.preventDefault(); setPanelView('schema') }}>{(initialform.language === 'en_us') ? 'RJSF Schema' : 'RJSF Schema'}</button>)}
                        {pageLayout.aside_versions && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'versions' && 'active'} ${(isLoadingDocumentDetails) && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('versions') }}>{(isLoadingDocumentDetails) && (<span class="spinner-border right-margin-5px"></span>)} {(initialform.language === 'en_us') ? 'Previous versions' : 'Versões anteriores'}</button>)}
                        {pageLayout.aside_summary && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'summary' && 'active'}`} onClick={(e) => { e.preventDefault(); setPanelView('summary') }}>{(initialform.language === 'en_us') ? 'Summary' : 'Sumário'}</button>)}
                      </div>
                      <div className="card-summary">
                        {
                          (panelView == 'schema') &&
                          (
                            <JSONStructureView json={noCodeCards}></JSONStructureView>
                          )
                        }{
                          (panelView == 'preview') &&
                          (
                            <>
                            <div className="preview-form">
                            <section class="deckofcards">
                                <div ref={noCodeCarouselRef} className='d-carousel d-w-full'>
                                  {
                                    (noCodeCards.length === 0) ?
                                      <span>Prévia indisponível</span>
                                      : ''
                                  }
                                  {noCodeCards.map((card, index) => {
                                    const active = index === noCodeActiveCard;
                                    return (
                                      <div id={`nocodecard_${index}`} key={`nocodecard_${index}`} className='d-carousel-item d-w-full' ref={active ? noCodeActiveCardRef : null}>
                                        <div className="d-w-full">
                                           <Form {...card} liveValidate />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                            </section>
                            <section className="navigation d-flex align-items-end flex-column">
                            <div className="d-flex d-space-x-4 align-items-center">
                              <button className={`btn btn-outline-secondary btn-navigation ${((noCodeActiveCard - 1) < 0 || noCodeIsLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEventNoCard(noCodeCards[noCodeActiveCard].cardId, Object.assign({}, payloadFormData, noCodeCards[noCodeActiveCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(initialform.language === 'en_us') ? 'Previous' : 'Anterior'}</button>
                              <span class="glyphicon glyphicon-option-horizontal"></span>
                              <button type="button" className={`btn btn-outline-secondary btn-navigation ${((noCodeActiveCard + 1) >= noCodeCards.length || noCodeIsLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEventNoCard(noCodeCards[noCodeActiveCard].cardId, Object.assign({}, payloadFormData, noCodeCards[noCodeActiveCard].formData), 'moveRight') }}>{(initialform.language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
                            </div>
                            </section>
                            </div>
                            </>
                          )
                        }{
                          (panelView == 'versions') &&
                          (
                            <>
                              <PreviousVersions docdetails={documentDetails} docrendered={documentRendered} />
                            </>
                          )
                        }{
                          (panelView == 'summary') &&
                          (
                            (documentDetails && documentDetails.currentVersion) ?
                              (
                                <>
                                  <Description description={{
                                    "version": documentDetails.currentVersion,
                                    "author": documentDetails.author,
                                    "created_at": documentDetails.created_at,
                                    "updated_at": documentDetails.updated_at,
                                    "description": documentDetails.description
                                  }} />
                                  <Summary cards={cards} activeCard={activeCard} />
                                </>
                              )
                              :
                              (
                                <span><span className="d-loading d-loading-spinner d-loading-md"></span> Carregando...</span>
                              )
                          )
                        }
                      </div>
                    </aside>
                  )}
              </div>
            </form>
          )}
      </div>
    </div>
  )

})() // Temos que fechar a function aqui pois usamos funções do parent dentro dos componentes child
