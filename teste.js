(function () {

  const [card, setCard] = useState(
    {
      "schema": {
        "type": "object",
        "title": "",
        "description": "",
        "definitions": {},
        "properties": {
          "endereco": {
            "type": "object",
            "title": "Seção",
            "description": "",
            "properties": {
              "endereco_cep": {
                "type": "string",
                "title": "CEP",
                "description": "",
                "default": ""
              },
              "endereco_rua": {
                "type": "string",
                "title": "Endereço",
                "description": "",
                "default": ""
              },
              "endereco_nro": {
                "type": "string",
                "title": "nº",
                "description": "",
                "default": ""
              },
              "endereco_bairro": {
                "type": "string",
                "title": "Bairro",
                "description": "",
                "default": ""
              },
              "endereco_cidade": {
                "type": "string",
                "title": "Cidade",
                "description": "",
                "default": ""
              },
              "endereco_uf": {
                "type": "string",
                "title": "UF",
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
        "endereco": {
          "ui:ObjectFieldTemplate": "layout",
          "ui:layout": [
            {
              "endereco_cep": {
                "classNames": "col-md-12"
              }
            },
            {
              "endereco_rua": {
                "classNames": "col-md-9"
              },
              "sYE5h": {
                "classNames": "col-md-3"
              }
            },
            {
              "endereco_bairro": {
                "classNames": "col-md-4"
              },
              "endereco_cidade": {
                "classNames": "col-md-4"
              },
              "endereco_uf": {
                "classNames": "col-md-4"
              }
            }
          ],
          "endereco_cep": {
            "ui:widget": "masked",
            "ui:options": {
              "mask": "99.999-999",
              "type": "code"
            }
          },
          "ui:field": "lambda",
          "ui:lambda": {
            "datasource": {
              "teste": "001"
            },
            "requestConfig": {
              "method": "POST",
              "url": "https://actions.looplex.com/api/code/2B2F8F00-7B72-11EF-ABF3-7D53A3FB2F95",
              "data": ""
            },
            "trigger": "endereco_cep",
            "responseMap": {
              "street": "endereco_rua",
              "neighborhood": "endereco_bairro",
              "city": "endereco_cidade",
              "state": "endereco_uf"
            }
          }
        }
      },
      "formData": {},
      "tagName": "div"
    }
  )

  return <>
    <div id='layout'>
      <Head>
        <title>LAMBDA TESTING</title>
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
      <div className='container-form'>
        <form method='POST' action='/' >
          <Form {...card} liveValidate />
        </form>
      </div>
    </div>
  </>

})()
