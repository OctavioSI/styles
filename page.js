/**
 *  Elementos do Sumário
 */
function Description(props) {
  let description = props.description
  return (
    <div >
      <a class="btn btn-summary" data-toggle="collapse" href="#overview" role="button" aria-expanded="false" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}>Informações Gerais</a>
      <div class="collapse show" id="overview">
        <table class="table table-hover table-sm table-bordered">

          <tbody>
            <tr>
              <td className="table-highlight">
                Número da Alteração
              </td>
              <td>
                {description.version}
              </td>
            </tr>
            <tr>
              <td className="table-highlight">
                Último Revisor
              </td>
              <td>
                {description.priorReviewer}
              </td>
            </tr>
            <tr>
              <td className="table-highlight">
                Data Última Revisão
              </td>
              <td>
                {description.dateReview}
              </td>
            </tr>
            <tr>
              <td className="table-highlight">
                Comentários última atualização
              </td>
              <td>
                {description.comments}
              </td>
            </tr>
          </tbody>
        </table>
      </div >
    </div >
  )
}
function Row(props) {
  let title = props.title
  let priorValue = props.priorValue
  let currentValue = props.currentValue

  let row =
    <tr class={priorValue == currentValue ? "table-default" : "table-primary"}>
      <td style={{ wordBreak: "break-all", minWidth: "100px" }}  className="table-highlight">{title}</td>
      <td style={{ wordBreak: "break-all", minWidth: "200px" }}>{priorValue}</td>
      <td style={{ wordBreak: "break-all", minWidth: "200px" }}>{currentValue}</td>
    </tr>

  return row
}

function TableRow(props) {
  let rows = props.rows
  let table =
    <tr class="table-default">
      <td colspan="3">
        <table class="table table-hover table-sm table-bordered">
          <thead class="thead-light">
            <tr className="table-highlight">
              <th scope="col">Item</th>
              <th scope="col">Prior</th>
              <th scope="col">Current</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </td>
    </tr>

  return table

}
function Section(props) {

  let table = props.table
  let title = props.title
  let id = props.id
  let section = <div style={{
    width: "100%", height: "100%", backgroundColor: "white"
  }} >
    <a class="btn btn-summary" data-toggle="collapse" href={`#${id}`} role="button" aria-expanded="true" aria-controls="card1" style={{ margin: '0px 0px 5px 0px' }}>{title}</a>
    <div class="collapse show" id={id}>
      <table class="table table-hover table-sm table-bordered">
        <thead class="thead-light">
          <tr  className="table-highlight">
            <th scope="col">Item</th>
            <th scope="col">Prior</th>
            <th scope="col">Current</th>
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
function Resumo(props) {
  function tableBuilder(schema, previewFormData = {}, currentFormData = {}) {
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
        let row = <TableRow rows={tableBuilder(formItem, previewFormData[key] ? previewFormData[key] : {}, currentFormData[key] ? currentFormData[key] : {})} />

        items.push(row)
      }
      if (type == 'array') {

      }
    }
    return items
  }
  let cards = props.cards
  let sections = []
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i]
    let title = card.schema?.title ? card.schema?.title : card.cardId
    let cardSchema = card.schema
    let cardPriorFormData = card.priorFormData ? card.priorFormData : {}
    let cardCurrentFormData = card.formData ? card.formData : {}
    let table = tableBuilder(cardSchema, cardPriorFormData, cardCurrentFormData)
    sections.push(<Section table={table} title={title} id={card.cardId} />)
  }
  return (
    <div>
      {sections}
    </div>
  )
}

/**
* Início do Código Principal
*/

(function () {
  const payloadFormData = props.embeddedData.rjsf?.formData == undefined ? {} : props.embeddedData.rjsf.formData
  const state = props.embeddedData.rjsf?.formData?.state == undefined ? { message: "iniciarFluxo", domain: "looplex.com.br" } : { message: props.embeddedData.rjsf.formData.state.message, domain: props.embeddedData.rjsf.formData.state.domain, executionId: props.embeddedData.rjsf.formData.state.executionId }
  let previewFormData = props.embeddedData?.formData ? props.embeddedData?.formData : {}
  const [formData, setFormData] = useState(previewFormData)
  const [previewDoc, setPreviewDoc] = useState('summary')

  const isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0
  }

  const setSchema = (initialcards = [], cardId = '', formData = {}) => {

    function defineCards() {
      let tmpcards = props.rjsf.cards;
      if (initialcards && initialcards.length > 0) {
        tmpcards = initialcards;
      }

      return tmpcards
    }

    function addFormDataToCard() {
      tmpcards.forEach(cd => {
        if (cd.cardId === cardId) {
          cd.formData = formData
        }
      })
    }

    function mergeFormData() {
      let mergedFormData = {}
      for (let i = 0; i < tmpcards.length; i++) {
        let tcard = tmpcards[i];
        if (tcard.scope && tcard.scope !== '') {
          mergedFormData[tcard.scope] = { ...tcard.formData }
        } else {
          mergedFormData = { ...mergedFormData, ...tcard.formData }
        }
      }

      return mergedFormData
    }

    function defineCardsToShow() {
      let cards2Show = [];
      tmpcards.forEach(cd => {

        if (!cd.hasOwnProperty('card_conditions') || (cd.hasOwnProperty('card_conditions') && isObjectEmpty(cd.card_conditions))) cards2Show.push(cd);
        if (cd.hasOwnProperty('card_conditions') && !isObjectEmpty(cd.card_conditions)) {
          let includeInDeck = true;
          let formatted_card_conditions = assembleJSONObjectStructure(cd.card_conditions)
          for (const card_condition in formatted_card_conditions) {
            let searchObj = {};
            searchObj[card_condition] = formatted_card_conditions[card_condition];
            let exists = isValueInObject(searchObj, mergedFormData);

            if (!exists) { includeInDeck = false; }
          }
          if (includeInDeck) cards2Show.push(cd)
        }
      })

      return cards2Show

    }

    let tmpcards = defineCards()
    addFormDataToCard()
    let mergedFormData = mergeFormData()

    return defineCardsToShow()

  }

  function createSchemaObject(cardId, formData) {

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

  async function handleClickEvent(cardId, formData, cardTargetIdx) {
    setIsReady2Submit(false);
    setIsLoading(false);

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
      ;
    const res = await axios({
      method: "post",
      url: `/api/code/${props.codeId}`,
      data: { ...merged, state }
    })
    // TODO: Alterar tela de sucesso para uma mensagem dentro do layout do form
    //router.push(
    //'https://looplex-ged.s3.us-east-1.amazonaws.com/looplex.com.br/shared/code/templates/standard/success.html'
    //)
  }


  const [schemaObject, setSchemaObject] = useState({ "cardId": "", "formData": {} });
  const [cards, setCards] = useState(props.rjsf.cards)
  const [submitted, setSubmitted] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isReady2Submit, setIsReady2Submit] = useState(false)
  const [activeCard, setActiveCard] = useState(0);
  const myCarouselRef = useRef(null);
  const activeCardRef = useRef(null);


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

      <div className="looplex-header">
        <img src="https://dev.looplex.com/_next/image?url=%2Flogo-white.png&w=32&q=75" />
      </div>
      <div className='container-form'>
        <div className='card'>
            <main>
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
                        <div className="d-mt-5 d-flex d-w-full d-space-x-4 d-text-right">
                          {
                            (index - 1) >= 0 &&
                            <button className="btn btn-outline-secondary" onClick={(e) => { e.preventDefault(); handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveLeft') }}>{(card.formData?.language === 'en_us') ? '<   Previous' : '<   Anterior'}</button>
                          }
                          <span>...</span>
                          {
                            (index + 1) < cards.length ? (
                              <button type="button" className="btn btn-outline-secondary" onClick={(e) => { e.preventDefault(); handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveRight') }}>{(card.formData?.language === 'en_us') ? 'Next   >' : 'Próxima    >'}</button>
                            ) : (
                              <button type="button" className={isReady2Submit ? "btn btn-outline-success" : "btn btn-outline-secondary"} onClick={(e) => { e.preventDefault(); isReady2Submit ? handleSubmit(e) : handleClickEvent(card.cardId, Object.assign({}, payloadFormData, card.formData), 'moveRight') }}>{isLoading ? ((card.formData?.language === 'en_us') ? 'Loading...' : 'Carregando...') : (isReady2Submit ? ((card.formData?.language === 'en_us') ? 'Submit' : 'Enviar') : ((card.formData?.language === 'en_us') ? 'Next   >' : 'Próxima   >'))}</button>
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
          <aside>
            <div className="card-navigation">
              <button className={ previewDoc == 'summary' ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => { setPreviewDoc('summary') }}>{(props.embeddedData.language === 'en_us') ? 'Summary' : 'Sumário'}</button>
              <button className={ previewDoc == 'preview' ? "btn btn-secondary active" : "btn btn-secondary left-margin-2px"} onClick={() => { setPreviewDoc('preview') }}>{(props.embeddedData.language === 'en_us') ? 'Preview' : 'Prévia'}</button>
              <button className={ previewDoc == 'attachments' ? "btn btn-secondary active" : "btn btn-secondary left-margin-2px"} onClick={() => { setPreviewDoc('attachments') }}>{(props.embeddedData.language === 'en_us') ? 'Attachments' : 'Anexos'}</button>
              <button className={ previewDoc == 'versions' ? "btn btn-secondary active" : "btn btn-secondary left-margin-2px"} onClick={() => { setPreviewDoc('versions') }}>{(props.embeddedData.language === 'en_us') ? 'Previous versions' : 'Versões anteriores'}</button>
            </div>
            <div className="card-summary">
              {
                (previewDoc == 'summary') &&
                (
                  <>
                    <Description description={{
                      "version": 2,
                      "priorReviewer": "Erick Kitada",
                      "dateReview": "03/05/2024",
                      "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
                    }} />
                    <Resumo cards={cards} />
                  </>
                )
              }{
                (previewDoc == 'preview') &&
                (
                  <div className="previewWrapper">
                    <iframe
                      id='preview'
                      name='preview'
                      width='100%'
                      height='100%'
                      frameBorder='0'
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        "https://looplex-ged.s3.us-east-1.amazonaws.com/Anbima/anuncio_de_inicio.docx"
                      )}`}
                    ></iframe>
                    <button className="btn btn-reload-preview btn-outline-secondary">
                      Atualizar preview
                    </button>
                  </div>
                )
              }{
                (previewDoc == 'attachments') &&
                (
                  <>
                    Anexos
                  </>
                )
              }{
                (previewDoc == 'versions') &&
                (
                  <>
                    Versões Anteriores
                  </>
                )
              }
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
})()
