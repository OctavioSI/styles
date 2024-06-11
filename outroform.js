(function () {
  const initialform = {
    id: 'work-request-basic',
    tenant: 'looplex.com.br'
  };
  // const APIM_URL = 'https://apim.looplex.com/actions/v1/code/'; //Erro de CORS
  const APIM_URL = 'https://actions.looplex.com/api/code/'
  const APIM_SUBSCRIPTIONKEY = props.embeddedData.APIM_SUBSCRIPTIONKEY ? props.embeddedData.APIM_SUBSCRIPTIONKEY : 'a39992a7583c47a789812241c93a10e0'; // TODO: Trocar para usar só o payload
  const RJSF_SCHEMA_ENDPOINT = 'AD16A7D0-CFFE-11EE-B340-F535C9AF96AD';

  const payloadFormData = props.embeddedData.rjsf?.formData == undefined ? {} : props.embeddedData.rjsf.formData
  const state = props.embeddedData.rjsf?.formData?.state == undefined ? { message: "iniciarFluxo", domain: "looplex.com.br" } : { message: props.embeddedData.rjsf.formData.state.message, domain: props.embeddedData.rjsf.formData.state.domain, executionId: props.embeddedData.rjsf.formData.state.executionId }
  const [tmpVisor, setTmpVisor] = useState('')
  const [tmpVisor2, setTmpVisor2] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [activeCard, setActiveCard] = useState(0);
  const myCarouselRef = useRef(null);
  const activeCardRef = useRef(null);

  // Funcao que verifica se o objeto é vazio
  const isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0
  }
  // Funcao para aguardar
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const [schemaObject, setSchemaObject] = useState({ "cardId": "", "formData": {} });

  // Essa função é utilizada para definir os cards que deverão ser exibidos
  const setSchema = (initialcards = [], cardId = '', formData = {}) => {
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

  const [cards, setCards] = useState(setSchema()) // Ja inicio a variável CARDS utilizando setSchema()
  const [submitted, setSubmitted] = useState('')

  useEffect(() => { // Rodando apenas uma vez no início do form
    const fetchInitialForm = async () => {
      let headers = {
        'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTIONKEY
      }
      let data = {
        "command": "read",
        "partitionKey": initialform.tenant,
        "schema_id": initialform.id
      };
      let config = {
        method: 'post',
        url: `${APIM_URL}${RJSF_SCHEMA_ENDPOINT}`,
        headers,
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

  useEffect(() => { // Será chamado quando a variavel "schemaObject" mudar
    // setTmpVisor('TmpVisor: '+JSON.stringify(cards))
    let newSchema = setSchema(cards, schemaObject.cardId, schemaObject.formData);
    // setTmpVisor2('TmpVisor2: ' + JSON.stringify(newSchema))
    setCards(newSchema)
  }, [schemaObject])

  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    // Depois que eu mudei a minha view para o card atual, 
    // já posso checar se tenho ao menos possível DMNs futuras
  }, [activeCardRef.current]);

  function defineSchemaObject(cardId, formData) {
    // setTmpVisor(JSON.stringify(cards))
    setSchemaObject(
      {
        "cardId": cardId,
        "formData": formData
      }
    )
  }

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

  async function loadRemoteSchema(id, cardId, formData, scope = '', card_conditions = {}) {
    const fetchRemoteSchema = async () => {
      let headers = {
        'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTIONKEY
      }
      let data = {
        "command": "read",
        "partitionKey": initialform.tenant,
        "schema_id": id
      };
      let config = {
        method: 'post',
        url: `${APIM_URL}${RJSF_SCHEMA_ENDPOINT}`,
        headers,
        data
      }
      const res = await axios(config);

      if (res.data && res.data.output) {
        // setTmpVisor(JSON.stringify(formData))
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

  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    setIsReady2Submit(false);
    setIsLoading(false);
    let load_card = cards.filter(cd => cd.cardId === cardId)[0];
    let dmnStructure = load_card['dmnStructure'];
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

    // setTmpVisor(JSON.stringify(cards))
    // return;

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
      // setTmpVisor(JSON.stringify(cards))
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
    defineSchemaObject(cardId, formData)
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
    let dmnStructure = load_card['dmnStructure'];

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

  async function handleSubmit(event) {
    event.preventDefault()
    event.stopPropagation()
    let merged = {}
    for (let i = 0; i < cards.length; i++) {
      let tcard = cards[i];
      if (tcard.scope && tcard.scope !== '') {
        merged[tcard.scope] = { ...tcard.formData }
      } else {
        merged = { ...merged, ...tcard.formData }
      }
    }

    setSubmitted('Submitted: ' + JSON.stringify(merged))

    return;
    const res = await axios({
      method: "post",
      url: `/api/code/${props.codeId}`,
      data: { ...merged, state }
    })
    // TODO: Alterar tela de sucesso para uma mensagem dentro do layout do form
    router.push(
      'https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/code/templates/standard/success.html'
    )
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

    let config = {
      url: 'https://actions.looplex.com/api/code/2BB47D4E-1DF8-4B4F-9A55-D0C68CE70411',
      method: 'post',
      data: {
        "command": "runDMN",
        "dmnId": id,
        "tenant": tenant,
        "variables": dmnVariables
      }
    }

    let res;
    await axios(config)
      .then((response) => {
        res = response.data.output.output
      })
      .catch((error) => { })
    return res

  }

  //helpers
  function formatCardConditions(card_conditions, scope) {
    if (!scope || scope == '') return card_conditions

    let objResults = {};
    for (const [key, value] of Object.entries(card_conditions)) {
      objResults[scope + "." + key] = value
    }
    return objResults
  }


  return (
    <div>
      <Head>
        <title>{props.embeddedData.formTitle ? props.embeddedData.formTitle : 'Formulário Looplex'}</title>
        <link
          href='https://bootswatch.com/5/lumen/bootstrap.min.css'
          rel='stylesheet'
          type='text/css'
        />
        <link rel="icon" type="image/x-icon" href="https://www.looplex.com.br/img/favicon.ico"></link>
        <link rel="stylesheet" type='text/css' href='https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/ant.css' />
        <link rel='stylesheet' type='text/css' href='https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/daisy.css' />
        <link
          rel='stylesheet'
          href='https://looplex-workflows.s3.sa-east-1.amazonaws.com/email-templates/rjsf-cases.css'
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@500&display=swap" rel="stylesheet" />
        <link rel='stylesheet' href="https://looplex-workflows.s3.sa-east-1.amazonaws.com/templates/css/looplex.css" />
        <script src='https://code.jquery.com/jquery-3.6.3.slim.min.js'></script>
        <script src='https://cdn.tailwindcss.com?plugins=typography'></script>
        <script>{`tailwind.config = {prefix: 'd-' }`}</script>
      </Head>
      <div className='container-form'>
        <div className={props.embeddedData.previewUrl ? 'card-doc' : 'card'}>
          {props.embeddedData.previewUrl ? (
            <aside>
              <iframe
                id='preview'
                name='preview'
                width='100%'
                height='100%'
                frameBorder='0'
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  props.embeddedData.previewUrl
                )}`}
              ></iframe>
            </aside>
          ) : (
            <aside >
              <div style={{
                backgroundImage: `url("https://looplex-workflows.s3.sa-east-1.amazonaws.com/MicrosoftTeams-image%20%283%29.png")`, width: '100%', height: '100%', backgroundRepeat: 'no-repeat', backgroundPosition: '50% 50%', backgroundSize: 'cover'
              }}></div>
            </aside>
          )}
          <main>
            {tmpVisor}
            {tmpVisor2}
            {submitted}
            <form method='POST' action='/' onSubmit={handleSubmit}>
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
                          <Form {...card} onChange={(event, id) => handleChangeEvent(card.cardId, event.formData, id)} />
                        </div>
                        <div className="d-mt-5 d-flex d-w-full d-space-x-4">
                          {
                            (index - 1) >= 0 &&
                            <button className="btn btn-primary d-flex-1" onClick={(e) => { e.preventDefault(); handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveLeft') }}>{(card.formData?.language === 'en_us') ? 'Previous' : 'Anterior'}</button>
                          }
                          {
                            (index + 1) < cards.length ? (
                              <button type="button" className="btn btn-primary d-flex-1" onClick={(e) => { e.preventDefault(); handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveRight') }}>{(card.formData?.language === 'en_us') ? 'Next' : 'Próxima'}</button>
                            ) : (
                                <button type="button" className={isReady2Submit ? "btn btn-success d-flex-1" : "btn btn-primary d-flex-1"} onClick={(e) => { e.preventDefault(); isReady2Submit ? handleSubmit(e) : handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveRight') }}>{isLoading ? ((card.formData?.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isReady2Submit ? ((card.formData?.language === 'en_us') ? 'Submit' : 'Enviar') : ((card.formData?.language === 'en_us') ? 'Next' : 'Próxima'))}</button>
                            )
                          }
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
            {props.embeddedData.cardFooterImage ? (
              <center>
                <img {...props.embeddedData.cardFooterImage} />
              </center>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
})()
