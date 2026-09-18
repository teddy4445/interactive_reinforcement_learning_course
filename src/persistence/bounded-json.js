/** Parse bounded inert JSON and reject duplicate object fields before data validation.
 * @param {string} text @param {number} maxBytes
 */
export function parseBoundedJson(text,maxBytes){
 if(text.length>maxBytes||new TextEncoder().encode(text).length>maxBytes)throw Error('JSON exceeds the size limit.');
 const result=JSON.parse(text);
 /** @type {({keys:Set<string>,expectKey:boolean}|null)[]} */const scopes=[];
 for(const token of text.match(/"(?:\\.|[^"\\])*"|[{}[\],:]/g)??[]){if(token==='{')scopes.push({keys:new Set(),expectKey:true});else if(token==='[')scopes.push(null);else if(token==='}'||token===']')scopes.pop();else {const scope=scopes.at(-1);if(scope&&token===',')scope.expectKey=true;else if(scope?.expectKey&&token.startsWith('"')){const key=JSON.parse(token);if(scope.keys.has(key))throw Error('Duplicate JSON field.');scope.keys.add(key);scope.expectKey=false;}}}
 return result;
}
