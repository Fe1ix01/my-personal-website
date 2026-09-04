import { STORAGE_KEYS, storageService } from './services/storageService.js';

// V3.0 compatibility: keep the storage key and unwrapped JSON shape unchanged.
export const DATA_VERSION = 3;
export const STORAGE_KEY = STORAGE_KEYS.appState;
export const defaultState = {job:{applied:0,replies:0,interviews:0,offers:0},journal:'',review:'',updatedAt:null};
export let storageReadFailed = false;
export let unsavedChanges = false;
let lastSavedRaw = null;
export let state = loadState();

function structuredCloneSafe(value){ return JSON.parse(JSON.stringify(value)); }

function validateState(value){
  if(!value || typeof value !== 'object' || Array.isArray(value) ||
      !value.job || typeof value.job !== 'object' || Array.isArray(value.job) ||
      typeof value.journal !== 'string' || typeof value.review !== 'string'){
    throw new Error('请选择 Suze OS V3 导出的 JSON 备份文件，旧版备份请在旧版页面恢复。');
  }
  const job = {};
  for(const key of Object.keys(defaultState.job)){
    if(!Number.isSafeInteger(value.job[key]) || value.job[key] < 0){
      throw new Error('求职数据必须是非负整数，未修改现有数据。');
    }
    job[key] = value.job[key];
  }
  if(value.updatedAt != null && (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt)))){
    throw new Error('备份中的更新时间无效，未修改现有数据。');
  }
  return {job,journal:value.journal,review:value.review,updatedAt:value.updatedAt || null};
}

function loadState(){
  try{
    lastSavedRaw = storageService.get(STORAGE_KEY);
    return lastSavedRaw === null ? structuredCloneSafe(defaultState) : validateState(JSON.parse(lastSavedRaw));
  }catch(error){
    storageReadFailed = true;
    return structuredCloneSafe(defaultState);
  }
}

export function saveState(allowRecovery=false){
  try{
    if(storageReadFailed && !allowRecovery) throw new Error('本地数据读取失败，已暂停保存。请先检查存储权限或导入有效的 V3 备份。');
    if(!allowRecovery && storageService.get(STORAGE_KEY) !== lastSavedRaw){
      throw new Error('其他标签页已更新数据。请先导出当前内容备份，再刷新页面，避免覆盖更新。');
    }
    const next = validateState({...state,updatedAt:new Date().toISOString()});
    const raw = JSON.stringify(next);
    storageService.set(STORAGE_KEY,raw);
    lastSavedRaw = raw;
    state = next;
    storageReadFailed = false;
    unsavedChanges = false;
    return true;
  }catch(error){
    unsavedChanges = true;
    throw error;
  }
}

export function exportData(){
  if(storageReadFailed) throw new Error('本地数据尚未成功读取，已取消导出，避免生成空白备份。');
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download='suze-os-v3-backup-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export async function importData(file){
  const next=validateState(JSON.parse(await file.text()));
  if(!confirm('导入将覆盖当前 V3 的求职数据、日记和复盘。确定继续吗？')) return false;
  const previous=state;
  const previouslyUnsaved=unsavedChanges;
  state=next;
  try{
    saveState(true);
    return true;
  }catch(error){
    state=previous;
    unsavedChanges=previouslyUnsaved;
    throw error;
  }
}

export function resetAllData(){
  storageService.remove(STORAGE_KEY);
  state=structuredCloneSafe(defaultState);
  lastSavedRaw=null;
  storageReadFailed=false;
  unsavedChanges=false;
}
