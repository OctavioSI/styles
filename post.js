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
  downloadDocument,
  compareDocuments,
  runDMN,
  validateForm
}
var services = {
  Actions: {
    fetchSchemaService,
    fetchDocumentDetailsService,
    renderDocumentService,
    downloadDocumentService,
    compareDocumentsService,
    runDMNService
  }
}

const APIM_URL = 'https://actions.looplex.com/api/code/'
const RJSF_SCHEMA_ENDPOINT = 'AD16A7D0-CFFE-11EE-B340-F535C9AF96AD';
const COSMOSDB_ENDPOINT = '5082CEE0-57AE-11EE-B671-8F0CE0BE21ED';
const CODEFLOW_ENDPOINT = '2BB47D4E-1DF8-4B4F-9A55-D0C68CE70411';
const RENDER_ENDPOINT = '29C64FC0-2828-11EF-BA19-6DEDEC828F31';
const S3_ENDPOINT = '2C21C26A-1E62-4D3E-940B-2973688BD120';
const ASPOSE_ENDPOINT = '5B178600-2E7E-11EF-83D7-891BE967B89F';

// --[ helpers ]---------------------------------------------------------------


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
  ajv.addFormat('date', function(dateTimeString) {
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
  try{
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
    // console.log('config', config)
    const res = await axios(config);
    return res.data.output;
  }catch(e){
    throw new Error('Error fetching form: '+e.message)
  }
};

async function fetchDocumentDetailsService(inputs) {
  const { tenant, id } = inputs;
  try{
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
  }catch(e){
    throw new Error('Error fetching form: '+e.message)
  }
};

async function renderDocumentService(inputs) {
  const { datacontent } = inputs;
  try {
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
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error fetching form: ' + e.message)
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
    throw new Error('Error fetching form: ' + e.message)
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
    const res = await axios(config);
    return res.data.output;
  } catch (e) {
    throw new Error('Error comparing document: ' + e.message + '  *****  ' + e.response.data)
  }
};

async function runDMNService(inputs) {
  const { tenant, id, variables } = inputs;
  try{
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
  }catch(e){
    throw new Error('Error fetching form: '+e.message)
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