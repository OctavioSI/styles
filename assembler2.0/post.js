/**
 * Carousel UI Form
 * 
 * Página de requests do Carousel UI
 * 
 * 
 */

// --[ globals ]---------------------------------------------------------------
var defaultCommand = 'fetchSchema';
var actions = {
  fetchSchema,
  fetchDocumentDetails,
  renderDocument,
  saveNewVersion,
  send2Code,
  downloadDocument,
  compareDocuments,
  runDMN,
  validateForm,
  loginCases
}
var services = {
  Actions: {
    fetchSchemaService,
    fetchDocumentDetailsService,
    renderDocumentService,
    saveNewVersionService,
    send2CodeService,
    downloadDocumentService,
    compareDocumentsService,
    runDMNService,
    loginCasesService
  }
}

const APIM_URL = 'https://actions.looplex.com/api/code/'
const RJSF_SCHEMA_ENDPOINT = 'AD16A7D0-CFFE-11EE-B340-F535C9AF96AD';
const COSMOSDB_ENDPOINT = '5082CEE0-57AE-11EE-B671-8F0CE0BE21ED';
const CODEFLOW_ENDPOINT = '2BB47D4E-1DF8-4B4F-9A55-D0C68CE70411';
const RENDER_ENDPOINT = '29C64FC0-2828-11EF-BA19-6DEDEC828F31';
const S3_ENDPOINT = '2C21C26A-1E62-4D3E-940B-2973688BD120';
const ASPOSE_ENDPOINT = '5B178600-2E7E-11EF-83D7-891BE967B89F';
const CASES_ENDPOINT = "https://apim.looplex.com/cases/api";

const REGIONS = {
  'looplex-ged': 'us-east-1',
  'looplex-workflows': 'sa-east-1'
}

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

// Recebe o formData, identifica arquivos do Filepond e os transfere
// para o caminho permanente (path)
async function treatFilepondFiles(formData, base_path, path = '') {
  let retorno = [];
  for (const property in formData) {
    if (typeof formData[property] === 'object' && !Array.isArray(formData[property]) && formData[property] !== null) { // checando se é um objeto
      let uploaded = await treatFilepondFiles(formData[property], base_path, path + '/' + property)
      if (typeof uploaded === 'object' && !Array.isArray(uploaded) && uploaded !== null) {
        retorno.push(uploaded)
      }
    } else if (Array.isArray(formData[property])) { // Temos uma Array
      for (let i = 0; i < formData[property].length; i++) {
        let objectarr = {}
        objectarr[i] = formData[property][i]
        let uploaded = await treatFilepondFiles(objectarr, base_path, path + '/' + property + '/' + i)
        if (typeof uploaded === 'object' && !Array.isArray(uploaded) && uploaded !== null) {
          retorno.push(uploaded)
        }
      }
    } else { // Não é um objeto nem uma array
      if ((typeof formData[property] === 'string' || formData[property] instanceof String) && (formData[property].substring(0, 5) === 'Temp/')) {
        // Temos aqui um caminho do Filepond
        let filename = formData[property].split('/').pop();
        let uploaded = await uploadFilepondFile(formData[property], base_path + '/' + (path && path !== '' ? path + '/' : '') + filename);
        if (path && path !== '') { // Estou na recursão
          return uploaded;
        } else { // Estou na prop raiz
          retorno.push(uploaded)
        }
      }
    }
  }
  return retorno;
}

async function easyDocsRender(inputs) {
  const { templateDocument, datasource } = inputs;
  // action
  const config = {
    method: "POST",
    url: "https://apim.looplex.com/looplex365/easydocs-render",
    headers: {
      "Ocp-Apim-Subscription-Key": secrets.APIM_SUBSCRIPTIONKEY,
      "Content-Type": "application/json",
    },
    data: {
      template: templateDocument,
      datasource: datasource,
    },
  };
  try {
    const response = await axios(config);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (e) {
    throw new Error(e);
  }
}
function treatPathHelper(path) {
  let treated_path = path;
  let lastIndex = (path).lastIndexOf('/');
  let before = (path).slice(0, lastIndex);
  let after = (path).slice(lastIndex + 1);
  before = before.replace(/%/g, '%25');
  return treated_path = before + '/' + after;
}
async function uploadFileService(inputs) {
  const { subscription_key, path, path_has_escaped_chars, upload_file } = inputs
  let treated_path = path_has_escaped_chars ? treatPathHelper(path) : path;
  let url = `https://apim.looplex.com/actions/v1/presigned-url?cmd=PUT&path=${treated_path}&expiresIn=604800`;
  let config = {
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscription_key
    }
  };
  let presigned = await axios(config);
  // console.log('presigned', presigned)
  if (presigned && presigned.data) {
    let presignedURL = presigned.data.message;
    // Agora com o presigned, vamos fazer um PUT efetivamente
    let buf = Buffer.from(upload_file, 'base64');
    let config = {
      method: "PUT",
      url: presignedURL,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buf.length
      },
      data: buf
    };
    let upload = '';
    try {
      const response = await axios(config);
      upload = response.status;
    } catch (e) {
      throw new Error('Error uploading document to presignedURL: ' + e.message + ' *** ' + JSON.stringify(e.response.data))
    }
    if (upload == '200') {
      // Vamos gerar um novo presigned, mas para leitura
      url = `https://apim.looplex.com/actions/v1/presigned-url?cmd=GET&path=${treated_path}&expiresIn=86400`;
      config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': subscription_key
        }
      };
      presigned = await axios(config);
      if (presigned && presigned.data) {
        return {
          "presigned": presigned.data.message,
          "docpath": treated_path
        }
      }
    }
  }
}

async function uploadS3(inputs) {
  const { documentName, tenant, base64Document } = inputs;

  const config = {
    method: "post",
    url: "https://apim.looplex.com/actions/v1/code/integracao_uploads3",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": secrets.APIM_SUBSCRIPTIONKEY,
    },
    data: {
      "command": "upload",
      "subscription_key": secrets.APIM_SUBSCRIPTIONKEY,
      "path": `looplex.com.br/shared/workflows/teste/uploadedDocuments/${tenant}/${documentName}`,
      "path_has_escaped_chars": false,
      "upload_file": base64Document
    }
  };
  try {
    const response = await axios(config);

    return {
      data: response.data,
      status: response.status,
    };
  } catch (e) {
    throw new Error(e);
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

async function fetchDocumentDetails(payload) {
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
  return await Actions.fetchDocumentDetailsService(inputs)
}

async function renderDocument(payload) {
  const schema = {
    type: 'object',
    properties: {
      datacontent: { type: 'object' }
    },
    required: [
      'datacontent'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    datacontent: payload.datacontent
  };

  // execute
  return await Actions.renderDocumentService(inputs)
}

async function saveNewVersion(payload) {
  const schema = {
    type: 'object',
    properties: {
      tenant: { type: 'string' },
      id: { type: 'string' },
      author: { type: 'string' },
      title: { type: 'string' },
      version: { type: 'string' },
      description: { type: 'string' },
      savenew: { type: 'boolean' },
      datacontent: { type: 'object' }
    },
    required: [
      'version',
      'datacontent'
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
    title: payload.title,
    version: payload.version,
    description: payload.description ? payload.description : 'Sem descrição',
    savenew: payload.savenew ? payload.savenew : false,
    datacontent: payload.datacontent
  };

  // execute
  return await Actions.saveNewVersionService(inputs)
}

async function send2Code(payload) {
  const schema = {
    type: 'object',
    properties: {
      codeId: { type: 'string' },
      formId: { type: 'string' },
      documentId: { type: 'string' },
      tenant: { type: 'string' },
      formData: { type: 'object' }
    },
    required: [
      'codeId',
      'formId',
      'formData'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    codeId: payload.codeId,
    formId: payload.formId,
    documentId: payload.documentId ? payload.documentId : '',
    tenant: payload.tenant ? payload.tenant : 'looplex.com.br',
    formData: payload.formData
  };

  // execute
  return await Actions.send2CodeService(inputs)
}

async function downloadDocument(payload) {
  const schema = {
    type: 'object',
    properties: {
      path: { type: 'string' }
    },
    required: [
      'path'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    path: payload.path
  };

  // execute
  return await Actions.downloadDocumentService(inputs)
}

async function compareDocuments(payload) {
  const schema = {
    type: 'object',
    properties: {
      original: { type: 'string' },
      final: { type: 'string' }
    },
    required: [
      'original',
      'final'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    originalDoc: payload.original,
    finalDoc: payload.final
  };

  // execute
  return await Actions.compareDocumentsService(inputs)
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

async function loginCases(payload) {
  const schema = {
    type: 'object',
    properties: {
      user: { type: 'string' },
      pwd: { type: 'string' },
      domain: { type: 'string' },
      server: { type: 'string' }
    },
    required: [
      'user',
      'pwd',
      'domain'
    ],
    additionalProperties: false
  }
  const valid = ajv.validate(schema, payload)
  if (!valid) throw new Error(JSON.stringify(ajv.errors))

  // services
  const { Actions } = services

  let inputs = {
    user: payload.user,
    pwd: payload.pwd,
    domain: payload.domain,
    server: payload.server ? payload.server : 'QA'
  };

  // execute
  return await Actions.loginCasesService(inputs)
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
      "partitionKey": tenant,
      "schema_id": id
    };
    let config = {
      method: 'post',
      url: `${APIM_URL}${RJSF_SCHEMA_ENDPOINT}`,
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

async function fetchDocumentDetailsService(inputs) {
  const { tenant, id } = inputs;
  try {
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      "command": "read",
      "config": {
        "database": "Workflows",
        "container": "assembler",
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
    // console.log('config', config)
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error fetching form: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};

async function renderDocumentService(inputs) {
  const { datacontent } = inputs;
  try {

    const documentRender = await easyDocsRender(datacontent);
    let base64document = documentRender.data.message
    let inputsS3 = {
      subscription_key: secrets.APIM_SUBSCRIPTIONKEY,
      path_has_escaped_chars: true,
      upload_file: base64document,
      path: `looplex.com.br/shared/workflows/teste/uploadedDocuments/${datacontent.tenant ? datacontent.tenant : `looplex.com.br`}/${datacontent.documentName}`
    };
    const getPresignedDocument = await uploadFileService(inputsS3);
    // console.log('getPresignedDocument', getPresignedDocument)
    const output = {
      documentUrl: getPresignedDocument.presigned,
      // resDocumentRender: documentRender,
      resPresigned: getPresignedDocument
    };
    return output;
  } catch (e) {
    throw new Error('Error rendering document: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};

async function saveNewVersionService(inputs) {
  const { title, version, description, tenant, id, author, savenew, datacontent } = inputs;
  try {
    // Primeiro renderizamos a nova versão
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let config = {
      method: 'post',
      url: `${APIM_URL}${RENDER_ENDPOINT}`,
      headers,
      data: datacontent
    }
    // console.log('config', config)
    const render = await axios(config);
    if (render.data && render.data.output) {
      // Aqui, com o documento gerado, vamos criar o registro da nova versão no Cosmos

      // Mas antes, vamos gravar quaisquer arquivos do filepond que temos no formData 
      // recebido em um caminho permanente (já que ele grava em pasta temporária)

      // Tratamento para filepond: apesar de não ser o ideal, 
      // vamos considerar que valores de string que tiverem o 
      // começo "Temp/" são arquivos salvos pelo filepond
      // Isso simplifica a lógica para identificar os arquivos 
      // que foram encaminhados
      let uploaded = await treatFilepondFiles(datacontent.datasource, 'looplex.com.br', '')
      // Vamos limpar registros vazios
      let uploadedfiles = []
      uploaded.forEach(up => {
        if (typeof up === 'object' && !Array.isArray(up) && up !== null) {
          uploadedfiles.push(up)
        }
      })
      // Aqui já fiz o upload dos arquivos que subi no form. Vamos montar o registro de anexos.
      let attachments = [];
      for (let i = 0; i < uploadedfiles.length; i++) {
        let file = uploadedfiles[i].docpath
        let filenametmp = (file.split('/').pop()).split('.')
        let extension = filenametmp.pop()
        let filename = filenametmp.join('.')
        let att = {
          "title": filename,
          "description": filename,
          "date": formatDate(new Date(), "yyyy-MM-ddThh:mm:ss"),
          "document": {
            "path": file,
            "filename": filename,
            "type": extension
          },
          "link": uploadedfiles[i].presigned
        }
        attachments.push(att)
      }


      let data = {};
      let content = {};
      let updateddate = formatDate(new Date(), "yyyy-MM-ddThh:mm:ss")
      if (!id || id == '' || savenew) {
        // Não tenho ID, então preciso gravar um novo registro na DB
        let newid = crypto.randomUUID() // gerando um novo ID
        content = {
          "versions": [
            {
              "version": version,
              "author": author,
              "date": updateddate,
              "description": description,
              "document": {
                "path": render.data.output.resPresigned.data.info.docpath
              },
              "formData": datacontent.datasource
            }
          ],
          "attachments": attachments,
          "currentVersion": version,
          "author": author,
          "description": description,
          "created_at": updateddate,
          "updated_at": updateddate,
          "title": title,
          "base_filename": "testeoctavio.docx",
          "template": datacontent.templateDocument
        };
        data = {
          "command": "write",
          "config": {
            "database": "Workflows",
            "container": "assembler",
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
          "document": {
            "path": render.data.output.resPresigned.data.info.docpath
          },
          "formData": datacontent.datasource
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
            "container": "assembler",
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
            "description": description,
            "link": render.data.output.documentUrl,
            "document": {
              "path": render.data.output.resPresigned.data.info.docpath
            }
          },
          "newattachments": attachments,
          "docrendered": render.data.output
        }
      }
      // return res.data.output;

    }
  } catch (e) {
    throw new Error('Error saving new version: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};

async function send2CodeService(inputs) {
  const { codeId, formId, documentId, tenant, formData } = inputs;
  try {
    // Primeiro renderizamos a nova versão
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      formData,
      formId,
      documentId,
      tenant
    }
    let config = {
      method: 'post',
      url: `${APIM_URL}${codeId}`,
      headers,
      data
    }
    // console.log('config', config)
    const res = await axios(config);
    if (res.data && res.data.output) {
      return res.data.output;
    }
  } catch (e) {
    throw new Error('Error sending to Code: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
  }
};

async function downloadDocumentService(inputs) {
  const { path } = inputs;
  try {
    let data = {
      command: "downloadFile",
      subscription_key: secrets.APIM_SUBSCRIPTIONKEY,
      path_has_escaped_chars: true,
      treated_path: path,
      get_type: 'url'
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
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error fetching form: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
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

async function compareDocumentsService(inputs) {
  const { originalDoc, finalDoc } = inputs;
  try {
    let headers = {
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      originalDoc,
      finalDoc
    };
    let config = {
      method: 'post',
      url: `${APIM_URL}${ASPOSE_ENDPOINT}`,
      headers,
      data
    }
    // console.log('config', config)
    /**
     * Aspose vem apresentando erro 401 em chamadas de comparação padrao.
     * TODO: Checar com Nagao se houve alguma alteração na função aspose() do code
     */
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error comparing document: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
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

async function loginCasesService(inputs) {
  const { user, pwd, domain, server } = inputs;
  try {
    let headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      'Ocp-Apim-Subscription-Key': secrets.APIM_SUBSCRIPTIONKEY
    }
    let data = {
      User: {
        user: user,
        pwd: pwd,
        domain: domain,
      }
    };
    let config = {
      method: 'post',
      url: `${CASES_ENDPOINT}/logon?env=${server}`,
      headers,
      data
    }
    // console.log('config', config)
    const res = await axios(config);
    return res.data;
  } catch (e) {
    throw new Error('Error on Cases Login: ' + e.message + '  *****  ' + JSON.stringify(e.response.data))
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
