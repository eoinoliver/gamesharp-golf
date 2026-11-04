export const PREFERENCES_KEY='gamesharp-experience-v1';
export function readPreferences(storage){
 const state={version:1,sound:false,instantText:false};try{const raw=JSON.parse(storage?.getItem(PREFERENCES_KEY)||'null');if(raw?.version===1){state.sound=raw.sound===true;state.instantText=raw.instantText===true;}else{state.sound=JSON.parse(storage?.getItem('gamesharp-golf-next-v2')||'null')?.sound===true;}}catch{}return state;
}
let storage;try{storage=globalThis.localStorage;}catch{}
let current=readPreferences(storage);
export const preferences=()=>({...current});
export function setPreference(key,value){
 if(!['sound','instantText'].includes(key))return false;
 current={...current,[key]:value===true};let saved=false;
 try{storage?.setItem(PREFERENCES_KEY,JSON.stringify(current));saved=!!storage;}catch{}
 globalThis.dispatchEvent?.(new CustomEvent('golf-preference',{detail:{...current,saved}}));return saved;
}
