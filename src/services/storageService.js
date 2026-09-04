// Keep existing keys stable so local data survives data-layer refactors.
export const STORAGE_KEYS = Object.freeze({
  appState: 'suze-os-v3',
  jobRadar: 'suze-os-v3-job-radar',
});

function getBrowserStorage(){
  return globalThis.localStorage;
}

export const storageService = Object.freeze({
  get(key){
    return getBrowserStorage().getItem(key);
  },

  set(key,value){
    getBrowserStorage().setItem(key,value);
  },

  remove(key){
    getBrowserStorage().removeItem(key);
  },
});
