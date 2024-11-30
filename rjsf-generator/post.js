/*******************************************************************
* NO CODE RJSF BUILDER - ACTIONS
* 
* STATUS: Em desenvolvimento
*
*/

// --[ globals ]---------------------------------------------------------------
var defaultCommand = 'saveTemplate';
var actions = {
  saveTemplate,
  generateForm,
  fetchSchema,
  validateForm
}
var services = {
  Actions: {
    saveTemplateService,
    fetchSchemaService
  }
}

const APIM_URL = 'https://actions.looplex.com/api/code/'
const COSMOSDB_ENDPOINT = '5082CEE0-57AE-11EE-B671-8F0CE0BE21ED';

const RJSF_SCHEMA_ENDPOINT = 'AD16A7D0-CFFE-11EE-B340-F535C9AF96AD';
const CODEFLOW_ENDPOINT = '2BB47D4E-1DF8-4B4F-9A55-D0C68CE70411';
const RENDER_ENDPOINT = '29C64FC0-2828-11EF-BA19-6DEDEC828F31';
const S3_ENDPOINT = '2C21C26A-1E62-4D3E-940B-2973688BD120';
const ASPOSE_ENDPOINT = '5B178600-2E7E-11EF-83D7-891BE967B89F';
const CASES_ENDPOINT = "https://apim.looplex.com/cases/api";

const REGIONS = {
  'looplex-ged': 'us-east-1',
  'looplex-workflows': 'sa-east-1'
}
const LOOPLEX_FORM_VERSION = "1.2"

// --[ helpers ]---------------------------------------------------------------
function formatDate(x, y) {
  var z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds(),
  };
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
    return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
  });

  return y.replace(/(y+)/g, function (v) {
    return x.getFullYear().toString().slice(-v.length);
  });
}
async function getS3Object(Bucket, Key) {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new s3.GetObjectCommand({ Bucket, Key })
    try {
      let BucketRegion = REGIONS.hasOwnProperty(Bucket) ? REGIONS[Bucket] : 'us-east-1';
      let s3config = {
        "region": BucketRegion,
        "credentials": {
          "accessKeyId": secrets.S3_ACCESSKEYID,
          "secretAccessKey": secrets.S3_SECRETACCESSKEY
        }
      }
      const client = new s3.S3Client(s3config);
      const response = await client.send(getObjectCommand)
      // Store all of data chunks returned from the response data stream 
      // into an array then use Array#join() to use the returned contents as a String
      let chunks = []
      // Handle an error while streaming the response body
      response.Body.once('error', err => reject(err))
      // Attach a 'data' listener to add the chunks of data to our array
      // Each chunk is a Buffer instance
      response.Body.on('data', chunk => chunks.push(chunk))
      // Once the stream has no more data, join the chunks into a string and return the string
      response.Body.once('end', () => resolve(Buffer.concat(chunks)))
    } catch (err) {
      // Handle the error or throw
      return reject(err)
    }
  })
}
async function getBufferFromFile(bucket = 'looplex-ged', file) {
  let buf;
  var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  let isbase64 = base64regex.test(file);
  if (isbase64) {
    buf = Buffer.from(file, 'base64');
    return buf
  } else { //url
    let res = getS3Object(bucket, file) // O Bucket looplex-ged tem restrição de acesso direto
    return res;
  }
}
async function uploadFilepondFile(file2save, path2save) {
  console.log(file2save)
  console.log(path2save)
  let document = await getBufferFromFile('looplex-ged', file2save)
  let uploading = await uploadDocumentService({ path: path2save, uploadFile: document.toString('base64') })
  return uploading
}
async function treatFilepondFile(filedata, base_path, path = '') {
  // Recebe o formData, identifica arquivos do Filepond e os transfere para o caminho permanente (path)
  let retorno = filedata;
  if ((typeof filedata === 'string' || filedata instanceof String) && (filedata.substring(0, 5) === 'Temp/')) {
    // Temos aqui um caminho do Filepond
    let filename = filedata.split('/').pop();
    retorno = await uploadFilepondFile(filedata, base_path + '/' + (path && path !== '' ? path + '/' : '') + filename);
  }
  return retorno;
}
async function getCode(displayName = '', id = '', partitionKey = 'looplex.com.br', isTesting = false, _isProcess = false) {
  let query = `SELECT c.id, c.processVars, c.tasksDefinitions, c.status FROM c WHERE c.partitionKey = @partitionKey AND c.id = @id`;
  let queryvars = [{ name: '@partitionKey', value: partitionKey }, { name: '@id', value: id }];
  if (displayName && displayName !== '') {
      query = `SELECT * FROM c WHERE c.partitionKey = @partitionKey AND c._displayName = '${displayName}'`;
      queryvars = [{ name: '@partitionKey', value: partitionKey }];
  }
  let database = isTesting || _isProcess ? 'Workflows' : 'Looplex 365';
  let container = isTesting ? 'cdci' : 'Flows';
  container = _isProcess ? 'codeflow' : container;

  let results = await cosmosdb.queryContainer(
      database,
      container,
      query, queryvars
  )
  if (results.length > 0) {
      return results[0]
  } else {
      return "Item inexistente"
  }
}
// --[ actions ]---------------------------------------------------------------
async function fetchSchema(payload) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenant: { type: 'string' }
    },
    required: [
      'id'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    tenant: payload.tenant ? payload.tenant : 'looplex.com.br',
    id: payload.id
  };

  // execute
  return await Actions.fetchSchemaService(inputs)
}
async function saveTemplate(payload) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenant: { type: 'string' },
      author: { type: 'string' },
      language: { type: 'pt_br' },
      title: { type: 'string' },
      version: { type: 'string' },
      description: { type: 'string' },
      savenew: { type: 'boolean' },
      templateDocument: { type: 'string' },
      formPreset: { type: 'string' },
      asidePanel: { type: 'object' },
      targetCode: { type: 'string' },
      calledAction: { type: 'string' },
      rjsfStructure: { type: 'array' }
    },
    required: [
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    tenant: payload.tenant ? payload.tenant : 'looplex.com.br',
    id: payload.id ? payload.id : '',
    author: payload.author ? payload.author : 'Não informado',
    language: payload.language ? payload.language : 'pt_br',
    title: payload.title ? payload.title : '',
    version: payload.version ? payload.version : '1.0',
    description: payload.description ? payload.description : 'Sem descrição',
    savenew: payload.savenew ? payload.savenew : false,
    templateDocument: payload.templateDocument ? payload.templateDocument : '',
    formPreset: payload.formPreset ? payload.formPreset : '',
    asidePanel: payload.asidePanel ? payload.asidePanel : {},
    targetCode: payload.targetCode ? payload.targetCode : '',
    calledAction: payload.calledAction ? payload.calledAction : '',
    rjsfStructure: payload.rjsfStructure ? payload.rjsfStructure : []
  };

  // execute
  return await Actions.saveTemplateService(inputs)
}
async function generateForm(payload) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenant: { type: 'string' },
      author: { type: 'string' },
      language: { type: 'pt_br' },
      title: { type: 'string' },
      version: { type: 'string' },
      description: { type: 'string' },
      templateDocument: { type: 'string' },
      formPreset: { type: 'string' },
      asidePanel: { type: 'object' },
      targetCode: { type: 'string' },
      calledAction: { type: 'string' },
      rjsfStructure: { type: 'array' }
    },
    required: [
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    tenant: payload.tenant ? payload.tenant : 'looplex.com.br',
    id: payload.id ? payload.id : '',
    author: payload.author ? payload.author : 'Não informado',
    language: payload.language ? payload.language : 'pt_br',
    title: payload.title ? payload.title : '',
    version: payload.version ? payload.version : '1.0',
    description: payload.description ? payload.description : 'Sem descrição',
    templateDocument: payload.templateDocument ? payload.templateDocument : '',
    formPreset: payload.formPreset ? payload.formPreset : '',
    asidePanel: payload.asidePanel ? payload.asidePanel : {},
    targetCode: payload.targetCode ? payload.targetCode : '',
    calledAction: payload.calledAction ? payload.calledAction : '',
    rjsfStructure: payload.rjsfStructure ? payload.rjsfStructure : []
  };

  // execute
  return await Actions.generateFormService(inputs)
}
async function runDMN(payload) {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenant: { type: 'string' },
      variables: { type: 'object' }
    },
    required: [
      'id',
      'variables'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    tenant: payload.tenant ? payload.tenant : 'looplex.com.br',
    id: payload.id,
    variables: payload.variables
  };

  // execute
  return await Actions.runDMNService(inputs)
}
async function validateForm(payload) {
  // Adicionando validacoes que nao existem por padrao no AJV puro
  ajv.addFormat('date', function (dateTimeString) {
    return !isNaN(Date.parse(dateTimeString));  // any test that returns true/false 
  });
  const schema = {
    type: 'object',
    properties: {
      schema: { type: 'object' },
      formData: { type: 'object' }
    },
    required: [
      'schema',
      'formData'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))
  // execute
  const validform = ajv.validate(payload.schema, payload.formData)
  if (!validform) return ajv.errors
  return true;
}
// --[ services ]--------------------------------------------------------------
async function fetchSchemaService(inputs) {
  const { tenant, id } = inputs;
  try {
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      "command": "read",
      "config": {
          "database": "Workflows",
          "container": "nocodebuilder",
          "partitionKey": tenant,
          "id": id
      }
    };
    let config = {
      method: 'post',
      url: `${APIM_URL}${COSMOSDB_ENDPOINT}`,
      headers,
      data
    }
    // return config
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error fetching form: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};
async function saveTemplateService(inputs) {
  const { 
    id,
    tenant,
    author,
    language,
    title, 
    version, 
    description, 
    savenew, 
    templateDocument,
    formPreset,
    asidePanel,
    targetCode,
    calledAction,
    rjsfStructure  
  } = inputs;
  try {
      let headers = {
        'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
      }
      let attachments = [];
      let template = "";
      let uploaded = {};
      if(templateDocument && templateDocument !== ''){

        uploaded = await treatFilepondFile(templateDocument, 'looplex.com.br', 'workflows') // path temporario
        // Aqui já fiz o upload do arquivo que subi no form. Vamos montar o registro de anexos.
          let file = uploaded.docpath
          let filenametmp = (file.split('/').pop()).split('.')
          let extension = filenametmp.pop()
          let filename = filenametmp.join('.')
          template = {
            "title": filename,
            "description": filename,
            "document": {
              "path": file,
              "filename": filename,
              "type": extension
            },
            "link": uploaded.presigned
          }
      }
      let data = {};
      let content = {};
      let updateddate = formatDate(new Date(), "yyyy-MM-ddThh:mm:ss")
      if (!id || id == '' || savenew) {
        // Não tenho ID, então preciso gravar um novo registro na DB
        let newid = crypto.randomUUID() // gerando um novo ID
        rjsfStructure[0].formData.formInfo.id = newid
        content = {
          "versions": [
            {
              "version": version,
              "author": author,
              "date": updateddate,
              "description": description,
              "template": template,
              "rjsfStructure": rjsfStructure
            }
          ],
          "attachments": attachments,
          "currentVersion": version,
          "author": author,
          "description": description,
          "created_at": updateddate,
          "updated_at": updateddate,
          "title": title
        };
        data = {
          "command": "write",
          "config": {
            "database": "Workflows",
            "container": "nocodebuilder",
            "partitionKey": tenant,
            "id": newid,
            "saveInRoot": true
          },
          "content": content
        };
      } else {
        // Já tenho um ID, então apenas preciso atualizar o campo correspondente
        content = {
          "version": version,
          "author": author,
          "date": updateddate,
          "description": description,
          "template": template,
          "rjsfStructure": rjsfStructure
        }
        let operations = [
          { "op": "add", "path": "/versions/-", "value": content },
          { "op": "set", "path": "/currentVersion", "value": version },
          { "op": "set", "path": "/updated_at", "value": updateddate }
        ];
        attachments.forEach(att => {
          let tmpatt = { ...att }
          delete tmpatt.link
          operations.push({ "op": "add", "path": "/attachments/-", "value": tmpatt })
        })
        data = {
          "command": "partialUpdate",
          "config": {
            "database": "Workflows",
            "container": "nocodebuilder",
            "partitionKey": tenant,
            "id": id
          },
          "operations": operations
        }
      }

      let config = {
        method: 'post',
        url: `${APIM_URL}${COSMOSDB_ENDPOINT}`,
        headers,
        data
      }
      // console.log('config', config)
      const res = await axios(config);
      if (res.data && res.data.output) {
        return {
          "newversion": {
            "version": version,
            "author": author,
            "date": updateddate,
            "description": description
          },
          "newattachments": attachments
        }
      }
  } catch (e) {
    throw new Error('Error saving new version: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};
async function generateFormService(inputs) {
  const { 
    id,
    tenant,
    author,
    language,
    title, 
    version, 
    description, 
    templateDocument,
    formPreset,
    asidePanel,
    targetCode,
    calledAction,
    rjsfStructure  
  } = inputs;
  const LOOPLEX_FORM = (await getCode('flows_formulario_padrao_v'+LOOPLEX_FORM_VERSION)).id;
  try {
      let headers = {
        'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
      }
      let attachments = [];
      let template = '';
      if(templateDocument && templateDocument !== ''){
        let uploaded = await treatFilepondFile(templateDocument, 'looplex.com.br', 'workflows')
        // Aqui já fiz o upload do arquivo que subi no form. Vamos montar o registro de anexos.
          let file = uploaded.docpath
          let filenametmp = (file.split('/').pop()).split('.')
          let extension = filenametmp.pop()
          let filename = filenametmp.join('.')
          template = {
            "title": filename,
            "description": filename,
            "document": {
              "path": file,
              "filename": filename,
              "type": extension
            },
            "link": uploaded.presigned
          }
      } // templateDocument

      // Para o funcionamento deste form, precisamos armazená-lo no container rjsf-schemas
      let schemacards = rjsfStructure.slice(1)
      let newid = crypto.randomUUID() // gerando um novo ID
      let schemaobj = {
        "preloaded_cards": [],
        "cards": schemacards,
        "formLayout":{
          "main": true,
          "aside": (asidePanel.showSummary || asidePanel.showPreview || asidePanel.showAttachments || asidePanel.showVersions), 
          "aside_summary": asidePanel.showSummary,
          "aside_preview": asidePanel.showPreview,
          "aside_attachments": asidePanel.showAttachments,
          "aside_versions": asidePanel.showVersions
        },
        "loginRequired": false,
        "loginAccess": {}
      }
      let data = {
        "command": "write",
        "config": {
          "database": "Workflows",
          "container": "rjsf-schemas",
          "partitionKey": tenant,
          "id": newid,
          "saveInRoot": true
        },
        "content": schemaobj
      };
      let config = {
        method: 'post',
        url: `${APIM_URL}${COSMOSDB_ENDPOINT}`,
        headers,
        data
      }
      const res = await axios(config);
      if (res.data && res.data.output) { // OK, gravado no cosmosDB
        // Vamos criar um document em Workflows/assembler agora se for o caso
        let newdocid = "" // gerando um novo ID
        if(calledAction !== 'createNewDocument'){ // O nosso formulario nao precisará criar um novo Doc na execução, entao devemos criar agora
          newdocid = crypto.randomUUID()
          let newdocschema = {
                                "versions": [],
                                "attachments": [],
                                "currentVersion": "1.0.0",
                                "author": "looplex",
                                "description": "",
                                "created_at": formatDate(new Date(), "yyyy-MM-ddThh:mm:ss"),
                                "updated_at": formatDate(new Date(), "yyyy-MM-ddThh:mm:ss"),
                                "title": title,
                                "base_filename": "",
                                "template": "https://looplex-ged.s3.us-east-1.amazonaws.com/"+template?.document?.path
                            }
          let docdata = {
            "command": "write",
            "config": {
              "database": "Workflows",
              "container": "assembler",
              "partitionKey": tenant,
              "id": newdocid,
              "saveInRoot": true
            },
            "content": newdocschema
          };
          let docconfig = {
            method: 'post',
            url: `${APIM_URL}${COSMOSDB_ENDPOINT}`,
            headers,
            docdata
          }
          const resdoc = await axios(docconfig);
        } // !createNewDocument
        // Vamos montar o payload necessário para a geração do formulário
        let formpayload = {
          "initialformId": newid, 
          "initialformTenant": tenant, 
          "initialformDocument": newdocid, 
          "codeDestination": targetCode ? targetCode : "",
          "onSubmitAction": calledAction ? calledAction : "",
          "template": "https://looplex-ged.s3.us-east-1.amazonaws.com/"+template?.document?.path,
          "formTitle": title,
          "base_filename": 'file.docx',
          "author": author ? author : 'Looplex',
          "language": "pt_br"
        }
        // TODO: CRIAR O PAYLOAD PARA GERAR O JWT
      }
      
      
  } catch (e) {
    throw new Error('Error saving new version: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};
async function uploadDocumentService(inputs) {
  const { path, uploadFile } = inputs;
  try {
    let data = {
      command: "uploadFile",
      subscription_key: secrets.APIM_SUBSCRIPTIONKEY,
      path_has_escaped_chars: true,
      upload_file: uploadFile,
      path: path
    }
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let config = {
      method: 'post',
      url: `${APIM_URL}${S3_ENDPOINT}`,
      headers,
      data
    }
    // console.log('config', config)
    let res = await axios(config);
    return res.data.output;
  } catch (e) {
    return 'Erro no upload do documento: ' + e.message + '  *****  ' + JSON.stringify(e.response.data)
  }
};
async function runDMNService(inputs) {
  const { tenant, id, variables } = inputs;
  try {
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      "command": "runDMN",
      "dmnId": id,
      "tenant": tenant,
      "variables": variables
    };
    let config = {
      method: 'post',
      url: `${APIM_URL}${CODEFLOW_ENDPOINT}`,
      headers,
      data
    }
    // console.log('config', config)
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error fetching form: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};
// --[ framework ]--------------------------------------------------------------
async function main(payload, actions) {
  const { command = defaultCommand, ...args } = payload
  try {
    if (!actions.hasOwnProperty(command))
      throw new Error('COMMAND_HANDLER_NOT_FOUND')
    body.output = await actions[command](args)
  } catch (error) {
    throw error
  }
}

// --[ execution ]--------------------------------------------------------------
await main(payload, actions)
