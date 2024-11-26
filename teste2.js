function stringify(obj) {
  let cache = [];
  let str = JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}

function validateBasePath(basepath, propsArray) {
  let current = basepath; // Start with the root object
  for (let i = 0; i < propsArray.length; i++) {
    const key = propsArray[i];
    if (!current.hasOwnProperty(key)) {
      current[key] = {}; // Initialize if not exists
    }
    current = current[key]; // Move to the next nested level
  }
  return current; // Return the last object created or accessed
}

let basepath = {
  "Icob6": {
    "ajvnn": {
      "S6gLd": {
        "xEvuU": {
          "id": "testecampo",
          "name": "Campo do Formulário 1",
          "description": "",
          "colsize": "12",
          "readonly": false,
          "required": false,
          "defaultvalue": "",
          "fieldtype": "string",
          "fieldmask": "",
          "maskvalue": ""
        }
      }
    }
  }
}
let propsArray = ['Icob6', 'ajvnn', 'S6gLd', 'xEvuU'];
// let base = {}
// let retorno = validateBasePath(base, ['AAAA', 'BBBB', 'CCCC'])
//console.log('retorno', JSON.stringify(retorno))

let retorno2 = validateBasePath(basepath, propsArray)
console.log('retorno2', JSON.stringify(retorno2, null, 2))
// console.log('retorno2', stringify(retorno2))
// console.log('retorno2', retorno2)
// base = {
//   "TESTE": {}
// }
// console.log(base)
