/*******************************************************************
* Carousel Padrão Flows
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
   * 
   * 
   * 
   *
   ********************************************************************/

  const initialform = {
    id: props.embeddedData.initialformId,
    tenant: props.embeddedData.initialformTenant ? props.embeddedData.initialformTenant : 'looplex.com.br',
    document: props.embeddedData.initialformDocument ? props.embeddedData.initialformDocument : 'teste001',
  };
  const payloadFormData = props.embeddedData.rjsf?.formData == undefined ? {} : props.embeddedData.rjsf.formData
  const state = props.embeddedData.rjsf?.formData?.state == undefined ? { message: "iniciarFluxo", domain: "looplex.com.br" } : { message: props.embeddedData.rjsf.formData.state.message, domain: props.embeddedData.rjsf.formData.state.domain, executionId: props.embeddedData.rjsf.formData.state.executionId }
  let previewFormData = props.embeddedData?.formData ? props.embeddedData?.formData : {}
  const [formData, setFormData] = useState(previewFormData)
  const [panelView, setPanelView] = useState('summary')
  const [schemaObject, setSchemaObject] = useState({ "cardId": "", "formData": {} });
  const [cards, setCards] = useState(props.rjsf.cards)
  const [modal, setModal] = useState({
    title: "Título",
    description: "Descrição do Modal"
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocumentDetails, setIsLoadingDocumentDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  // const [isComparing, setIsComparing] = useState({})
  // const [isComparingError, setIsComparingError] = useState({})
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [isModalReady2Submit, setIsModalReady2Submit] = useState(false)
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(true)
  const [activeCard, setActiveCard] = useState(0);
  const myCarouselRef = useRef(null);
  const activeCardRef = useRef(null);
  const modalRef = useRef(null);  

  const [previewDocURL, setPreviewDocURL] = useState("")
  const [documentDetails, setDocumentDetails] = useState({});
  const [documentRendered, setDocumentRendered] = useState({});

  const [extraErrors, setExtraErrors] = useState({});
  const [tmpVisor, setTmpVisor] = useState('')
  const [tmpVisor2, setTmpVisor2] = useState('')
  const [submitted, setSubmitted] = useState('')

  /*******************************************
   * Helper Functions
   *******************************************/

  // Funcao que verifica se o objeto é vazio
  function isObjectEmpty(objectName) {
    return Object.keys(objectName).length === 0
  }
  // Funcao para aguardar
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // Monta a estrutura do objeto JSON
  function assembleJSONObjectStructure(source) {
    let obj = JSON.parse(JSON.stringify(source))
    // iterate over the property names
    Object.keys(obj).forEach(function (k) {
      // slip the property value based on `.`
      var prop = k.split('.');
      // get the last value fom array
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

  function formatUTCDate(utcdate) {
    let utc = new Date(utcdate).toUTCString();
    return ("0" + (new Date(utc).getDate())).slice(-2) + "/" + ("0" + (new Date(utc).getMonth() + 1)).slice(-2) + "/" + new Date(utc).getFullYear() + " " + ("0" + (new Date(utc).getHours())).slice(-2) + ":" + ("0" + (new Date(utc).getMinutes())).slice(-2) + ":" + ("0" + (new Date(utc).getSeconds())).slice(-2)
  }

  /*******************************************
   * Hooks
   *******************************************/
  useEffect(() => { // Rodando apenas uma vez no início do form
    if (!initialform.id) {
      setSchema()
      return
    };
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
        let iSchema = res.data.output;
        let initialSchema = [{
          cardId: iSchema.id,
          card_conditions: iSchema.card_conditions,
          dmnStructure: iSchema.dmnStructure,
          schema: iSchema.schema,
          uiSchema: iSchema.uiSchema,
          formData: {},
          tagName: 'div'
        }];
        setCards(setSchema(initialSchema))
        setIsLoading(false)
        return true;
      }
    }
    let maxAttempts = 3;
    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      fetchInitialForm()
        .then(res => {
          countAttempts = maxAttempts;
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
  }, []);

  useEffect(() => { // Rodando apenas uma vez no início do form: buscar info do documento
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
        setIsLoading(false)
        setIsLoadingDocumentDetails(false);
        return true;
      }
    }
    let maxAttempts = 3;
    for (let countAttempts = 0; countAttempts < maxAttempts; countAttempts++) {
      fetchDocumentDetails()
        .then(res => {
          countAttempts = maxAttempts;
          setIsLoading(false);
        })
        .catch(err => { // Se houver erro em carregar versoes anteriores, vamos tentar novamente
          setIsLoading(false);
          if (countAttempts >= maxAttempts) {
            setTmpVisor('Erro ao carregar as versões anteriores: ' + err.message)
          }
          sleep(500);
        });
    }

  }, []);

  useEffect(() => {
    let newSchema = setSchema(cards, schemaObject.cardId, schemaObject.formData);
    setCards(newSchema)
  }, [schemaObject])

  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  }, [activeCardRef.current]);

  /*******************************************
   * Funções de manipulação de Cards e Card Deck
   *******************************************/
  // Essa função é utilizada para definir os cards que deverão ser exibidos
  function setSchema(initialcards = [], cardId = '', formData = {}) {
    // Carregando cards do RJSF
    let tmpcards = props.rjsf.cards;
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
        switch(tmpschema.properties[property].type){
          case 'string':
            if(!tmpcards[i].formData.hasOwnProperty(property)){
              tmpcards[i].formData[property] = '';
            }
            break;
          case 'number':
            if(!tmpcards[i].formData.hasOwnProperty(property)){
              tmpcards[i].formData[property] = 0;
            }
            break;
          case 'array':
            if(!tmpcards[i].formData.hasOwnProperty(property)){
              tmpcards[i].formData[property] = [];
            }
            break;
          case 'object':
            if(!tmpcards[i].formData.hasOwnProperty(property)){
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
    tmpcards.forEach(cd => {
      /**  Se eu nao tiver "card_conditions" ou se as "card_conditions" 
       * forem vazias, vamos mostrar o card
      */
      if (!cd.hasOwnProperty('card_conditions') || (cd.hasOwnProperty('card_conditions') && isObjectEmpty(cd.card_conditions))) cards2Show.push(cd);
      // Se temos "card_conditions", vamos verificar se todas estão 
      // em nosso parâmetro fornecido e se o valor é compatível
      if (cd.hasOwnProperty('card_conditions') && !isObjectEmpty(cd.card_conditions)) {
        let includeInDeck = true;
        let formatted_card_conditions = assembleJSONObjectStructure(cd.card_conditions)
        for (const card_condition in formatted_card_conditions) {
          let searchObj = {};
          searchObj[card_condition] = formatted_card_conditions[card_condition];
          let exists = isValueInObject(searchObj, mergedFormData);
          // cd.searchObj = searchObj
          // cd.mergedFormData = mergedFormData
          // cd.includeInDeck = exists
          if (!exists) { includeInDeck = false; }// Entao nao incluimos no deck
        }
        if (includeInDeck) cards2Show.push(cd)
      }
    })
    // Ao final, retornamos o array com cards que atendem as conditions
    return cards2Show;
  }

  function createSchemaObject(cardId, formData) {
    setSchemaObject(
      {
        "cardId": cardId,
        "formData": formData
      }
    )
  }

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
        let iSchema = res.data.output;
        let newCard = {
          cardId: iSchema.id,
          card_conditions: card_conditions,
          scope: (scope && scope != '') ? scope : '',
          dmnStructure: iSchema.dmnStructure,
          schema: iSchema.schema,
          uiSchema: iSchema.uiSchema,
          formData: {},
          tagName: 'div'
        };
        let tmpCards = cards;
        tmpCards.push(newCard);
        setCards(setSchema(tmpCards, cardId, formData))
      }
      setIsLoading(false)
    }
    setIsLoading(true);
    return await fetchRemoteSchema()
      .catch(err => {
        // setTmpVisor('Erro ao carregar Schema Remoto: ' + err.message)
        setIsLoading(false);
      });
  }

  /*******************************************
   * Ações do Formulário
   *******************************************/
  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    setIsReady2Submit(false);
    // setIsLoading(false);
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card.hasOwnProperty('dmnStructure') ? load_card['dmnStructure'] : {};
    let canRunDMN = true;
    let dmnVariables = {};

    if (!isObjectEmpty(dmnStructure)) {
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

    /** 
     * Aqui temos que atualizar
     * condicoes para um card ser exibido ou nao 
     * 
     * Essa função é acionada quando mudamos algum campo
     * 
    */
    if (cards.length > 1) {
      /**
       * Se eu só tiver mais que 1 card eu não posso chamar o setSchema
       * pois ele renderizaria todos os cards novamente. Neste caso, 
       * quero apenas atualizar o meu formData para o card ativo
       */
      let nextState = cards.map((card) => {
        if (card.cardId !== cardId) return card
        return {
          ...card,
          formData: formData
        }
      })
      setCards(nextState)
      //setTmpVisor(JSON.stringify(cards))
      let moveLeft = Math.max(0, activeCard - 1);
      let moveRight = Math.min(cards.length - 1, activeCard + 1);
      setActiveCard(cardTargetIdx === 'moveLeft' ? moveLeft : moveRight)
    }

    /** 
     * Abaixo passamos todos os eventos que podem ser
     * condicoes para um card ser exibido ou nao 
     * 
     * Essa função é acionada quando clicamos no botão
     * para mudar a fase do card
     * 
    */
    createSchemaObject(cardId, formData)
  }

  async function handleChangeEvent(cardId, formData, fieldId) {
    // Quando altero qualquer campo do meu form, eu quero
    // atualizar o formData do card correspondente
    let field = fieldId.replace('root_', '').replaceAll('_', '.');
    let nextState = cards.map((card) => {
      if (card.cardId !== cardId) return card
      return {
        ...card,
        formData: formData
      }
    })
    setCards(nextState)
    // Vamos também verificar se o nosso botão tem que ser renderizado novamente
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
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

  async function handleSubmit(event, justrender) {
    event.preventDefault()
    event.stopPropagation()
    let validated = await validateForm()
    // setTmpVisor(JSON.stringify(validated))
    if(Array.isArray(validated)){ // Se eu tenho uma array, houve erros
      let errors = treatAJVErrors(validated)
      let content = "Os seguintes erros foram encontrados no processamento do formulário enviado:<br /><br/><ul class='errorlist'>"+errors+"</ul>";
      alertModal("Erros no Formulário", "", "Verifique as informações encaminhadas", content)
    }else{
      if(justrender){
        setIsRendering(true)
        let render = await renderDocument();
        setPreviewDocURL(render.documentUrl);
        setDocumentRendered(render);
        setIsRendering(false);
      }else{
        submitNewVersion()
      }
    }
    return;
  }

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

  async function saveNewVersion(version, description) {
    let author = "Octavio Ietsugu"
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
      id: initialform.document ? initialform.document : crypto.randomUUID(),
      author,
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
      if (res.data && res.data.output) {
        // setTmpVisor(JSON.stringify(res.data.output))
        // Vamos atualizar o documentDetails relevante
        let docdetails = documentDetails;
        docdetails.versions.push(res.data.output.newversion)
        setDocumentDetails(docdetails)
        setDocumentRendered(res.data.output.docrendered)
        return res.data.output;
      }
    } catch (e) {
      throw new Error('Falha ao salvar nova versão **** '+JSON.stringify(e.response.data))
    }
  }

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

  function treatAJVErrors(errors = []){
    let errorsmsg = "";
    if(errors && errors.length > 0){
      for(let i = 0; i < errors.length; i++){
        errorsmsg += "<li><strong>"+errors[i].instancePath+":</strong> "+errors[i].message+"</li>"
      }
    }
    return errorsmsg
  }

  async function validateForm() {
    let mergedFormData = {}
    let mergedSchema = {};
    let requiredFields = [];
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if(tcard.schema.hasOwnProperty('required')){
        requiredFields.concat(tcard.schema.required)
      }
      mergedFormData = { ...mergedFormData, ...tcard.formData }
      mergedSchema = { ...mergedSchema, ...tcard.schema.properties }

      // TODO: Analisar melhor como tratar em casos de definição com scope
      // if (tcard.scope && tcard.scope !== '') {
      //   mergedFormData[tcard.scope] = { ...tcard.formData }
      //   mergedSchema[tcard.scope] = { ...tcard.schema.properties }
      // } else {
      //   mergedFormData = { ...mergedFormData, ...tcard.formData }
      //   mergedSchema = { ...mergedSchema, ...tcard.schema.properties }
      // }
    }
    // Para cada campo obrigatório do schema, precisamos
    // montar como required tb o campo "pai"
    // TODO

    let data = {
      command: "validateForm",
      formData: mergedFormData,
      schema: {
        type: "object",
        properties: { ...mergedSchema },
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

  const updateVersions = (versions) => {
    let docdetails = documentdetails;
    docdetails.versions = versions;
    setDocumentDetails(docdetails);
  }

  const updateTmpVisor = (tmpVisor) => {
    setTmpVisor(tmpVisor)
  }

  const alertModal = (title, icon, message, content) => {
    let modal = {
      icon: icon,
      title: title,
      description: message,
      content: content,
      hasCloseButton: false
    };
    setModal(modal)
    modalRef.current.showModal()
  }

  function submitNewVersion(){
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
        "uiSchema":{
          "ui:submitButtonOptions": {
            "norender": false,
            "submitText": "Enviar"
          },
          "description": {
            "ui:widget" : "textarea",
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

  return (
    <div id='layout'>
      <Head>
        <title>{props.embeddedData.formTitle ? props.embeddedData.formTitle : 'Formulário Negociação'}</title>
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
          href='https://octaviosi.github.io/styles/css/carousel-looplex.css'
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
      
      <dialog id="optionsmodal" className="d-modal" ref={modalRef} >
        <div className="d-modal-box w-11/12 max-w-5xl">
          <Modal title={modal.title} description={modal.description} content={modal.content} rjsf={modal.rjsf} action={modal.action} hasCloseButton={modal.hasCloseButton} icon={modal.icon} />
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
          <div className='card'>
            <main>
              <section class="deckofcards">
                {tmpVisor}
                {tmpVisor2}
                {submitted}
                <div ref={myCarouselRef} className='d-carousel d-w-full'>
                  {
                    cards.length === 0 ?
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
                <div className="d-flex d-space-x-4 align-items-center">
                  <button className={`btn btn-outline-secondary btn-navigation ${((activeCard - 1) < 0 || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveLeft') }}><span class="glyphicon glyphicon-chevron-left"></span>{(cards[activeCard].formData?.language === 'en_us') ? 'Previous' : 'Anterior'}</button>
                  <span class="glyphicon glyphicon-option-horizontal"></span>
                  <button type="button" className={`btn btn-outline-secondary btn-navigation ${((activeCard + 1) >= cards.length || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); handleClickEvent(cards[activeCard].cardId, Object.assign({}, payloadFormData, cards[activeCard].formData), 'moveRight') }}>{(cards[activeCard].formData?.language === 'en_us') ? 'Next' : 'Próxima'}<span class="glyphicon glyphicon-chevron-right"></span></button>
                </div>
                <div className="mt-auto d-flex align-items-end d-space-x-4">
                  {(documentRendered && documentRendered.hasOwnProperty('documentUrl')) && (
                    <a href={documentRendered.documentUrl} download>
                      <button type="button" className={"btn btn-outline-secondary"} >Baixar</button>
                    </a>
                  )}
                  <button type="button" className={`btn btn-outline-primary ${(!isReady2Submit || isRendering || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, true) }}>{(isRendering || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((cards[activeCard].formData?.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((cards[activeCard].formData?.language === 'en_us') ? 'Rendering...' : 'Renderizando...') : ((cards[activeCard].formData?.language === 'en_us') ? 'Render' : 'Renderizar'))}</button>
                  <button type="button" className={`btn btn-primary ${(!isReady2Submit || isSubmitting || isLoading) && 'disabled'}`} onClick={(e) => { e.preventDefault(); isReady2Submit && handleSubmit(e, false) }}>{(isSubmitting || isLoading) && (<span class="spinner-border right-margin-5px"></span>)}{isLoading ? ((cards[activeCard].formData?.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isSubmitting ? ((cards[activeCard].formData?.language === 'en_us') ? 'Submitting...' : 'Enviando...') : ((cards[activeCard].formData?.language === 'en_us') ? 'Submit' : 'Enviar'))}</button>
                </div>
              </section>
            </main>
            <aside>
              <div className="card-navigation">
                <button className={`btn btn-secondary left-margin-2px ${panelView == 'summary' && 'active'}`} onClick={(e) => { e.preventDefault(); setPanelView('summary') }}>{(props.embeddedData.language === 'en_us') ? 'Summary' : 'Sumário'}</button>
                <button className={`btn btn-secondary left-margin-2px ${panelView == 'preview' && 'active'} ${(previewDocURL == '') && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('preview') }}>{(props.embeddedData.language === 'en_us') ? 'Preview' : 'Prévia'}</button>
                <button className={`btn btn-secondary left-margin-2px ${panelView == 'attachments' && 'active'} ${(isLoadingDocumentDetails) && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('attachments') }}>{(isLoadingDocumentDetails) && (<span class="spinner-border right-margin-5px"></span>)} {(props.embeddedData.language === 'en_us') ? 'Attachments' : 'Anexos'}</button>
                <button className={`btn btn-secondary left-margin-2px ${panelView == 'versions' && 'active'} ${(isLoadingDocumentDetails) && 'disabled'}`} onClick={(e) => { e.preventDefault(); setPanelView('versions') }}>{(isLoadingDocumentDetails) && (<span class="spinner-border right-margin-5px"></span>)} {(props.embeddedData.language === 'en_us') ? 'Previous versions' : 'Versões anteriores'}</button>
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
                          <Resumo cards={cards} activeCard={activeCard} />
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
                  ):
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
          </div>
        </form>
      </div>
    </div>
  )
  
  /*******************************************************************
   * Elementos do Sumário
   * 
   * As funções a seguir definem elementos que são utilizados no painel
   * de sumário. A ideia é componentizar cada um dos elementos que são 
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
                  {formatUTCDate(description.created_at)}
                </td>
              </tr>
              <tr>
                <td className="table-highlight">
                  Última Atualização
                </td>
                <td>
                  {formatUTCDate(description.updated_at)}
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
        <td style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{title}</td>
        <td style={{ wordBreak: "break-all", minWidth: "200px" }}>{priorValue}</td>
        <td style={{ wordBreak: "break-all", minWidth: "200px" }}>{currentValue}</td>
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
              <th className="table-title" scope="col">Campo</th>
              <th className="table-title" scope="col">Original</th>
              <th className="table-title" scope="col">Alterado</th>
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
  function Resumo(props) {
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
          setIsComparing(true);
          setIsComparingError(false);
          try{
            let comparisondoc = await compareVersions(version, docrendered);
            setIsComparing(false);
            setIsComparingError(false);
            setComparisonLink(comparisondoc)
            return true;
          }catch(e){
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
                <td class="table-subtitle" colspan="1">Versão {version.version}</td>
                <td class="table-subtitle" colspan="2">Data: {formatUTCDate(version.date)}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">Autor</td>
                <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.author}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">Descrição</td>
                <td colspan="2" style={{ wordBreak: "break-all", minWidth: "100px" }} className="table-highlight">{version.description}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle col-xs-4">Ações</td>
                <td className="table-subtitle col-xs-8" colspan="2">
                    <a href={version.link} download target="_blank">
                      <button type="button" className={"btn btn-outline-secondary"}>Baixar</button>
                    </a>                  
                    {(docrendered && docrendered.hasOwnProperty('documentUrl')) && (
                      <button type="button" className={`btn btn-outline-secondary right-margin-5px ${(isComparing ? 'disabled' : '')}`} onClick={async (e) => { e.preventDefault(); triggerCompareVersions(version, docrendered, versionidx); }} >{isComparingError && (<span class="glyphicon glyphicon-exclamation-sign right-margin-5px" title="Falha na comparação"></span>)} {isComparing && (<span class="spinner-border right-margin-5px"></span>)} {(isComparing ? ((cards[activeCard].formData?.language === 'en_us') ? 'Comparing...' : 'Comparando...') : ((cards[activeCard].formData?.language === 'en_us') ? 'Compare' : 'Comparar'))}</button>
                    )}
                    {(comparisonLink && comparisonLink !== '') && (
                      <a href={comparisonLink} download target="_blank">
                        <button type="button" className={"btn btn-outline-secondary"}>Ver Comparação</button>
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
    if(versions && versions.length > 0){
      for (let i = 0; i < versions.length; i++) {
        sections.push(tableBuilder(versions[i], docrendered, i))
      }
    }else{
      sections.push(
        <>Sem versões anteriores</>
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
                <td class="table-subtitle" colspan="2">{attachment.title}</td>
                <td class="table-subtitle" colspan="1">
                  <a href={attachment.link} download target="_blank">
                    <button type="button" className={"btn btn-link"}>Baixar</button>
                  </a>
                </td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">Descrição</td>
                <td colspan="2" style={{ wordBreak: "break-all" }} className="table-highlight">{attachment.description}</td>
              </tr>
              <tr className="table-default">
                <td colspan="1" className="table-subtitle">Data</td>
                <td colspan="2" className="table-highlight">{formatUTCDate(attachment.date)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      return attachmenttable;
    }

    let attachments = props.docdetails.attachments
    let sections = []

    if(attachments && attachments.length > 0){
      for (let i = 0; i < attachments.length; i++) {
        sections.push(tableBuilder(attachments[i]))
      }
    }else{
      sections.push(
        <>Sem anexos anteriores</>
      )
    }
    return (
      <>
        {sections}
      </>
    )
  }

async function runAction(action, inputs){
  let render;
  switch(action){
    case 'createNewDocumentVersion':
      setIsModalSubmitting(true)
      let version = inputs.formData?.version;
      let description = inputs.formData?.description;
      console.log(inputs)
      render = await saveNewVersion(version, description);
      // setDocumentRendered(render)
      setIsModalSubmitting(false)
      modalRef.current.close()
      break;
    default: 
      return;
  }
}

// Modal
function Modal(props){
  let title = props.title ? props.title : ""
  let icon = props.icon ? props.icon : ""
  let description = props.description ?  props.description : ""
  let content = props.content ?  props.content : ""
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
      { hasCloseButton && (
      <div className="d-modal-action">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="d-btn">Cancelar</button>
        </form>
      </div>
      )}
    </>
  return modal
}

  /*********************************************************************
   * Funções externas
   */

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
      throw new Error('Falha ao comparar versões **** '+JSON.stringify(e.response.data))
    }

    return;
  }


})() // Temos que fechar a function aqui pois usamos funções do parent dentro dos componentes child
