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
  runDMN
}
var services = {
  Actions: {
    fetchSchemaService,
    runDMNService
  }
}

const APIM_URL = 'https://actions.looplex.com/api/code/'
const RJSF_SCHEMA_ENDPOINT = 'AD16A7D0-CFFE-11EE-B340-F535C9AF96AD';
const CODEFLOW_ENDPOINT = '2BB47D4E-1DF8-4B4F-9A55-D0C68CE70411';

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
