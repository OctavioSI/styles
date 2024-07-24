/*******************************************************************
* Carousel Padrão Flows
* 
* STATUS: Em desenvolvimento -- não usar
* 
* CHANGELOG
*
* v. 1.1
*   - Page:         Reorganização do documento e comentários adicionais para 
*                   facilitar a leitura e entendimento
*   - Login:        Autenticação utilizando o sistema de login do LawOffice. 
*                   O acesso ao formulário é gerenciado pelo registro existente 
*                   no CosmosDB (trabalho em progresso)
*   - formLayout:   Agora é possível selecionar no registro do CosmosDB quais as 
*                   telas estão disponíveis para esta visualização. 
*   - saveAsNewDoc: Agora o payload recebe um parâmetro onSubmitAction, que pode ser 
*                   utilizado para criar um novo documento (por exemplo, quando usamos
*                   um WorkRequest que é uma nova solicitação e não tem versões 
*                   anteriores) ou para criar uma nova versão de um documento existente
*   - send2Code:    Agora o payload recebe um parâmetro onSubmitAction, que pode ser 
*                   utilizado para disparar um outro Code. Para isso, você deve passar
*                   no payload também um parâmetro codeDestination com o ID do code que
*                   será chamado
*
* v. 1.0
*   - Carousel:     Formulário pode ser usado com cards, sendo possível 
*                   passar os cards no arquivo rjsf na pasta ou montar
*                   os cards no cosmosDB (container Workflows > rjsf-schema).
*                   No cosmosDB agora é possível também passar apenas 1 card
*                   ou o array cards[]
*   - Layout:       Este formulário agora tem o Layout atualizado em linha
*                   com o design definido para o Cases. O formulário é 
*                   renderizado do lado esquerdo e o painel com propriedades
*                   e outras funções fica do lado direito.
*   - Aspose:       Na guia de versões anteriores é possível fazer a 
*                   comparação do documento renderizado autualmente com 
*                   versões salvas anteriormente. Usamos o Aspose para isso
*   - Versões:      Versões anteriores são salvas no cosmosDB, com o formData
*                   utilizado. É possível baixar o documento da versão e
*                   realizar comparação com a versão renderizada atualmente.
*   - Modal:        Foi implementado modal para ações específicas -- você
*                   usar o modal como popup para alertas ou como popup de 
*                   interação, que recebe um RJSF próprio.
*   - Anexos:       Anexos enviados no formulário usando o Filepond são
*                   salvos em pastas definitivas e com o link disponibilizado
*                   na guia de Anexos do painel lateral
*
* BUG FIXES
*
*   - Arrumado problema com dados de formData anteriores sumindo
*   - Ajustado problema com troca de cards
*   - Ajustado problema com carregamento de form quando não tem document
*
* KNOWN ISSUES
*
*   - Aspose não funciona sempre para a comparação. Por vezes, 
*     a depender do documento que está sendo comparado, recebemos um
*     erro 400 na chamada. 
* 
********************************************************************/
(function () {

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
          "initialformId": "newuid-first", // schema inicial que está no Workflows/rjsf-schemas
          "initialformTenant": "looplex.com.br", // tenando do schema inicial
          "initialformDocument": "teste001", // documento com configurações básicas e onde será salvo o doc, em Workflows/assembler
          "codeDestination": "", // ID do Code de destino, caso a opção onSubmitAction seja send2Code
          "onSubmitAction": 'saveAsNewVersion', // O que fazer quando clicar em Submit? Ver Opções Abaixo: ***
          "template": "", // template do documento que será renderizado -- obrigatório se não houver um document (se eu usar o saveAsNewDocument por exemplo)
          "formTitle": "Assembler 3.0: Contrato de Fornecimento", // Título do formulário
          "base_filename": 'file.docx', // base do documento que será renderizado
          "formTitle": "Form Looplex", // Título do formulario
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


   *
   ********************************************************************/

  const initialform = {
    id: props.embeddedData.initialformId,
    tenant: props.embeddedData.initialformTenant ? props.embeddedData.initialformTenant : 'looplex.com.br',
    document: props.embeddedData.initialformDocument ? props.embeddedData.initialformDocument : '',
    onSubmitAction: props.embeddedData.onSubmitAction ? props.embeddedData.onSubmitAction : 'saveAsNewVersion',
    codeDestination: props.embeddedData.codeDestination ? props.embeddedData.codeDestination : '',
    base_filename: props.embeddedData.base_filename ? props.embeddedData.base_filename : 'file.docx',
    formTitle: props.embeddedData.formTitle ? props.embeddedData.formTitle : "Form Looplex",
    template: props.embeddedData.template,
    author: props.embeddedData.author ? props.embeddedData.author : 'Looplex',
    language: props.embeddedData.language ? props.embeddedData.language : 'pt_br'
  };
  const payloadFormData = props.embeddedData.rjsf?.formData == undefined ? {} : props.embeddedData.rjsf.formData
  const [panelView, setPanelView] = useState('summary')
  const [cards, setCards] = useState([])
  const [allLoadedCards, setAllLoadedCards] = useState([])
  const [modal, setModal] = useState({
    title: "Título",
    description: "Descrição do Modal"
  })
  const [alert, setAlert] = useState({
    title: "Título",
    description: "Descrição do Alerta"
  })
  const [pageLayout, setPageLayout] = useState({
    main: true,
    aside: false,
    aside_summary: false,
    aside_preview: false,
    aside_attachments: false,
    aside_versions: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [isModalLogin, setIsModalLogin] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [isModalReady2Submit, setIsModalReady2Submit] = useState(false)
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(true)
  const [loginRequired, setLoginRequired] = useState(false)
  const [activeCard, setActiveCard] = useState(0);
  const myCarouselRef = useRef(null);
  const activeCardRef = useRef(null);
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

  /*******************************************
   * Hooks
   *******************************************/
  // Rodando apenas uma vez no início do form
  useEffect(() => {
    if (!initialform.id) {
      setSchema()
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
        setIsLoading(false)
        setAllLoadedCards(initialSchema) // criando um local que tem todas as cards, exibidas ou não        
        if (!initialform.document || initialform.document == '') { // Nao tenho o document, então posso já carregar o form sem esperar os detalhes do document
          let newcards = setSchema(initialSchema, initialSchema[0].cardId, {})
          setCards(newcards) // definindo o deck de cards que são exibidos
        }
        // Comentadas o carregamento de cards pq estava com conflito ao abrir os documentDetails
        // console.log('output', res.data.output)
        if (res.data.output.loginRequired) { // Para acessar esse form é necessário um login antes
          setLoginRequired(true)
          loginModal()
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
      setIsLoading(true)
      fetchInitialForm()
        .then(res => {
          countAttempts = maxAttempts;
          console.log('Form loaded successfully')
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

    if (!initialform.document || initialform.document == '') {
      setInitialDocumentDetails()
      console.log('No initial document defined')
      return
    } else {
      for (let countAttemptsDoc = 0; countAttemptsDoc < maxAttempts; countAttemptsDoc++) {
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
    }

  }, []);

  // Quando carregar os documentdetails, usamos esse hook para atualizar os cards
  useEffect(() => {
    if (documentDetails && documentDetails.hasOwnProperty('versions') && documentDetails.versions.length > 0) {
      let newcards = setSchema(loadPriorFormData(documentDetails));
      setCards(newcards)
    }
  }, [documentDetailsVersionsLoaded])

  // Efeito aplicado quando alterar o card atual
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [activeCard]);

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
      setIsLoading(true);
      fetchRemoteSchema()
        .then(res => {
          countAttempts = maxAttempts;
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

  function handleCancelDialog(event) {
    event.preventDefault()
    console.log('closing')
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
    if(!initialform.codeDestination || initialform.codeDestination === '') return
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
      throw new Error('Falha ao enviar para o Code '+initialform.codeDestination+' **** ' + JSON.stringify(e.response.data))
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
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao realizar o login **** ' + JSON.stringify(e.response.data))
    }
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
        setIsModalLogin(true)
        let username = inputs.formData?.user;
        let password = inputs.formData?.pwd;
        let domain = inputs.formData?.domain;
        let login = await loginCases(username, password, domain);
        console.log('login', login)
        setIsModalLogin(false)
        // modalRef.current.close()
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

  // Montagem da tabela de versões
  function AttachmentsPanel(props) {
    function tableBuilder(attachment) {
      let attachmenttable =
        <div className="attachment-table">
          <table class="table table-sm table-bordered">
            <tbody>
              <tr class="table-subtitle">
                <td class="table-subtitle col-xs-4" colspan="1">{attachment.title}</td>
                <td class="table-subtitle col-xs-8" colspan="2">
                  <a href={attachment.link} download target="_blank">
                    <button type="button" className={"btn btn-link"}>{initialform.language === 'en_us' ? 'Download' : 'Baixar'}</button>
                  </a>
                </td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle col-xs-4">{initialform.language === 'en_us' ? 'Description' : 'Descrição'}</td>
                <td colspan="2" style={{ wordBreak: "break-all" }} className="table-highlight col-xs-8">{attachment.description}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle col-xs-4">{initialform.language === 'en_us' ? 'Date' : 'Data'}</td>
                <td colspan="2" className="table-highlight col-xs-8">{formatUTCDate(attachment.date)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      return attachmenttable;
    }

    let attachments = props.docdetails.attachments
    let sections = []

    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        sections.push(tableBuilder(attachments[i]))
      }
    } else {
      sections.push(
        <>{initialform.language === 'en_us' ? 'No attachments available' : 'Sem anexos disponíveis'}</>
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
        <link rel="stylesheet" type='text/css' href='https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/ant.css' />
        <link rel='stylesheet' type='text/css' href='https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/daisy.css' />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css" />
        <link
          rel='stylesheet'
          href='https://octaviosi.github.io/styles/css/carousel-looplex.v1.1.css'
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

      <dialog id="optionsmodal" className="d-modal" ref={modalRef} onCancel={handleCancelDialog} >
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={modal.title} description={modal.description} content={modal.content} rjsf={modal.rjsf} action={modal.action} hasCloseButton={modal.hasCloseButton} icon={modal.icon} />
        </div>
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
        <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" />
      </div>
      <div className='container-form'>
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
                              <div className="d-w-full">
                                <Form {...card} onChange={(event, id) => handleChangeEvent(card.cardId, event.formData, id)} extraErrors={extraErrors} liveValidate />
                              </div>
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
                        <div className="mt-auto d-flex align-items-end d-space-x-4">
                          {(documentRendered && documentRendered.hasOwnProperty('documentUrl')) && (
                            <a href={documentRendered.documentUrl} download>
                              <button type="button" className={"btn btn-outline-secondary"} >Baixar</button>
                            </a>
                          )}
                          <button type="button" className={`btn btn-outline-primary ${(!isReady2Submit || isRendering || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, true) }}>{(isRendering || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((initialform.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((initialform.language === 'en_us') ? 'Rendering...' : 'Renderizando...') : ((initialform.language === 'en_us') ? 'Render' : 'Renderizar'))}</button>
                          <button type="button" className={`btn btn-primary ${(!isReady2Submit || isSubmitting || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, false) }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((initialform.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((initialform.language === 'en_us') ? 'Submitting...' : 'Enviando...') : ((initialform.language === 'en_us') ? 'Submit' : 'Enviar'))}</button>
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
                    {pageLayout.aside_summary && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'summary' && 'active'}`} onClick={(e) => { e.preventDefault(); setPanelView('summary') }}>{(initialform.language === 'en_us') ? 'Summary' : 'Sumário'}</button>)}
                    {pageLayout.aside_preview && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'preview' && 'active'} ${(previewDocURL == '') && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('preview') }}>{(initialform.language === 'en_us') ? 'Preview' : 'Prévia'}</button>)}
                    {pageLayout.aside_attachments && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'attachments' && 'active'} ${(isLoadingDocumentDetails) && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('attachments') }}>{(isLoadingDocumentDetails) && (<span class="spinner-border right-margin-5px"></span>)} {(initialform.language === 'en_us') ? 'Attachments' : 'Anexos'}</button>)}
                    {pageLayout.aside_versions && (<button className={`btn btn-secondary left-margin-2px ${panelView == 'versions' && 'active'} ${(isLoadingDocumentDetails) && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('versions') }}>{(isLoadingDocumentDetails) && (<span class="spinner-border right-margin-5px"></span>)} {(initialform.language === 'en_us') ? 'Previous versions' : 'Versões anteriores'}</button>)}
                  </div>
                  <div className="card-summary">
                    {
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
                    }{
                      (panelView == 'preview') &&
                      (isPreviewLoaded ? (
                        previewDocURL ? (
                          <div className="previewWrapper">
                            <iframe
                              id='preview'
                              name='preview'
                              width='100%'
                              height='100%'
                              frameBorder='0'
                              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDocURL)}`}
                            ></iframe>
                            <button className="btn btn-reload-preview btn-outline-secondary" onClick={(e) => { e.preventDefault(); generatePreview() }}>
                              <span class="glyphicon glyphicon-repeat right-margin-5px"></span>Atualizar Prévia
                            </button>
                          </div>
                        ) :
                          (
                            <div className="d-flex align-items-center preview-warning d-p-4"><span class="spinner-border right-margin-5px"></span>Prévia não disponível</div>
                          )
                      ) :
                        (
                          <div className="d-flex align-items-center preview-warning d-p-4"><span class="spinner-border right-margin-5px"></span>Gerando prévia...</div>
                        )
                      )
                    }{
                      (panelView == 'attachments') &&
                      (
                        <>
                          <AttachmentsPanel docdetails={documentDetails} />
                        </>
                      )
                    }{
                      (panelView == 'versions') &&
                      (
                        <>
                          <PreviousVersions docdetails={documentDetails} docrendered={documentRendered} />
                        </>
                      )
                    }
                  </div>
                </aside>
              )}
          </div>
        </form>
      </div>
    </div>
  )

})() // Temos que fechar a function aqui pois usamos funções do parent dentro dos componentes child
