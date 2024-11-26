/*
Help me with a javascript code. 

I want to create a function called validateBasePath that receives 2 parameters: an object containing a base path (parameter basepath) and an array of Ids (parameter propsArray).
The basepath object can have multiple properties and can also have a "subfields" property of type array.
The propsArray parameter is an array containing ids of child subfields objects, which may or not exist in the basepath object, in a sequential hierarchy. 
The function should validate whether the basepath contain such subfields child objects in order and, if it does not find them, it should initialize the object so as to provide a
valid output object in this order. The last element would not have the subfields property.

For example, let's suppose that the input and execution are as follows:

let basepath = {}
let propsArray = ['A', 'B', 'C']
let retorno = validateBasePath(basepath, propsArray)

Then our expected output should be:

retorno = {
  'id': 'A',
  'subfields': [
    {
      'id': 'B',
      'subfields': [
        'id':'C'
      ]
    }
  ]
}

Now, let's see other example. If our input and execution are as follows:

Example input:

let basepath = {
  id:'XXX',
  'BLOBLO': {
    "nome": "EITA",
    "BBBB": {
      "teste": 1
    }
  },
   subfields:  [
                {
                  id: 'AAAA',
                  name: 'Nome completo',
                  subfields: [
                    {
                      id: 'BBBB',
                      name: 'SOBREMONE'
                    }
                  ]
                }
              ]
}
let propsArray = ['AAAA', 'BBBB', 'CCCC', 'DDDD']
let retorno = validateBasePath(basepath, propsArray)

Our expected output output should be:

retorno = {
	"id": "XXX",
	"BLOBLO": { "nome": "EITA", "BBBB": { "teste": 1 } },
	"subfields": [
		{
			"id": "AAAA",
			"name": "Nome completo",
			"subfields": [
				{
					"id": "BBBB",
					"name": "SOBREMONE",
					"subfields": [
						{ 
              "id": "CCCC",
              "subfields": [ 
                {
                  "id": "DDDD"
                }
              ]
            }
					]
				}
			]
		}
	]
}



*/

function validateBasePathSubfields(basepath, propsArray) {
  // Recursive function to process and initialize subfields
  function processSubfields(obj, ids, index) {
      if (index >= ids.length) return;
      // Check if the current level has a subfields array
      if (!obj.subfields) obj.subfields = [];
      // Look for a subfield with the current id
      let existingSubfield = obj.subfields.find(sub => sub.id === ids[index]);
      if (!existingSubfield) {
          // If it doesn't exist, create a new subfield object
          existingSubfield = { id: ids[index] };
          obj.subfields.push(existingSubfield);
      }
      // Recursively process the next level
      processSubfields(existingSubfield, ids, index + 1);
  }
  // Ensure the basepath has the initial id
  if (!basepath.id) basepath.id = propsArray[0];
  // Start processing from the first subfield
  processSubfields(basepath, propsArray, 0);
  return basepath;
}



let basepath = {
  id:'XXX',
  'BLOBLO': {
    "nome": "EITA",
    "BBBB": {
      "teste": 1
    }
  },
   subfields:  [
                {
                  id: 'AAAA',
                  name: 'Nome completo',
                  subfields: [
                    {
                      id: 'BBBB',
                      name: 'SOBREMONE'
                    }
                  ]
                }
              ]
}
let retorno2 = validateBasePathSubfields(basepath, ['AAAA', 'BBBB', 'CCCC', 'DDDD'])
console.log('retorno2', JSON.stringify(retorno2, null, 2))
// console.log('retorno2', retorno2)
// base = {
//   "TESTE": {}
// }
// console.log(base)
