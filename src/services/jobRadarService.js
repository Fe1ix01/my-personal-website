import { STORAGE_KEYS, storageService } from './storageService.js';

export const JOB_RADAR_VERSION = 1;
export const JOB_STATUSES = Object.freeze(['发现','分析','投递','回复','面试','Offer','结束']);
export const JOB_PRIORITIES = Object.freeze(['重点关注','普通','放弃']);

export let jobRadarReadFailed = false;
export let jobRadarUnsavedChanges = false;

let lastSavedRaw = null;

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix){
  if(globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value,field,{required=false}={}){
  if(typeof value !== 'string') throw new Error(`${field}格式无效，未修改岗位数据。`);
  const text = value.trim();
  if(required && !text) throw new Error(`请填写${field}。`);
  return text;
}

function normalizeDate(value){
  const date = normalizeText(value,'投递日期');
  if(date && !/^\d{4}-\d{2}-\d{2}$/.test(date)){
    throw new Error('投递日期格式无效，未修改岗位数据。');
  }
  return date;
}

function normalizeUrl(value){
  const url = normalizeText(value,'JD 链接');
  if(!url) return '';
  try{
    const parsed = new URL(url);
    if(!['http:','https:'].includes(parsed.protocol)) throw new Error();
  }catch{
    throw new Error('JD 链接必须是有效的 HTTP 或 HTTPS 地址。');
  }
  return url;
}

function normalizeTimestamp(value,field,{nullable=false}={}){
  if(nullable && value === null) return null;
  if(typeof value !== 'string' || !Number.isFinite(Date.parse(value))){
    throw new Error(`${field}无效，未修改岗位数据。`);
  }
  return value;
}

function normalizeInterview(value){
  if(!value || typeof value !== 'object' || Array.isArray(value)){
    throw new Error('面试记录格式无效，未修改岗位数据。');
  }
  return {
    id: normalizeText(value.id,'面试记录 ID',{required:true}),
    round: normalizeText(value.round,'面试轮次'),
    questions: normalizeText(value.questions,'面试问题'),
    answer: normalizeText(value.answer,'我的回答'),
    review: normalizeText(value.review,'面试复盘'),
    createdAt: normalizeTimestamp(value.createdAt,'面试记录创建时间'),
    updatedAt: normalizeTimestamp(value.updatedAt,'面试记录更新时间'),
  };
}

function normalizeJob(value){
  if(!value || typeof value !== 'object' || Array.isArray(value)){
    throw new Error('岗位记录格式无效，未修改岗位数据。');
  }
  if(!JOB_STATUSES.includes(value.status)) throw new Error('岗位状态无效，未修改岗位数据。');
  if(!JOB_PRIORITIES.includes(value.priority)) throw new Error('岗位优先级无效，未修改岗位数据。');

  const match = value.match === null ? null : Number(value.match);
  if(match !== null && (!Number.isInteger(match) || match < 0 || match > 100)){
    throw new Error('岗位匹配度必须是 0 到 100 的整数。');
  }

  const interviews = value.interviews === undefined ? [] : value.interviews;
  if(!Array.isArray(interviews)) throw new Error('面试记录格式无效，未修改岗位数据。');

  return {
    id: normalizeText(value.id,'岗位记录 ID',{required:true}),
    company: normalizeText(value.company,'公司名称',{required:true}),
    position: normalizeText(value.position,'岗位名称',{required:true}),
    salary: normalizeText(value.salary,'薪资'),
    location: normalizeText(value.location,'地点'),
    source: normalizeText(value.source,'来源'),
    jdUrl: normalizeUrl(value.jdUrl),
    appliedDate: normalizeDate(value.appliedDate),
    status: value.status,
    priority: value.priority,
    match,
    strengths: normalizeText(value.strengths,'我的优势'),
    gaps: normalizeText(value.gaps,'岗位短板'),
    nextAction: normalizeText(value.nextAction,'下一步动作'),
    notes: normalizeText(value.notes,'备注'),
    interviews: interviews.map(normalizeInterview),
    createdAt: normalizeTimestamp(value.createdAt,'岗位记录创建时间'),
    updatedAt: normalizeTimestamp(value.updatedAt,'岗位记录更新时间'),
  };
}

function normalizeData(value){
  if(!value || typeof value !== 'object' || Array.isArray(value) ||
      value.version !== JOB_RADAR_VERSION || !Array.isArray(value.jobs)){
    throw new Error('岗位数据格式无效，已暂停保存以保护现有数据。');
  }

  const jobs = value.jobs.map(normalizeJob);
  const jobIds = new Set(jobs.map(job=>job.id));
  if(jobIds.size !== jobs.length) throw new Error('岗位数据包含重复记录，已暂停保存。');

  return {
    version: JOB_RADAR_VERSION,
    jobs,
    updatedAt: normalizeTimestamp(value.updatedAt,'岗位数据更新时间',{nullable:true}),
  };
}

function emptyData(){
  return {version:JOB_RADAR_VERSION,jobs:[],updatedAt:null};
}

export function loadJobRadar(){
  try{
    lastSavedRaw = storageService.get(STORAGE_KEYS.jobRadar);
    const data = lastSavedRaw === null ? emptyData() : normalizeData(JSON.parse(lastSavedRaw));
    jobRadarReadFailed = false;
    jobRadarUnsavedChanges = false;
    return clone(data);
  }catch{
    jobRadarReadFailed = true;
    return emptyData();
  }
}

export function saveJobRadar(value){
  try{
    if(jobRadarReadFailed){
      throw new Error('岗位数据读取失败，已暂停保存。请先保留当前输入并检查浏览器存储。');
    }
    if(storageService.get(STORAGE_KEYS.jobRadar) !== lastSavedRaw){
      throw new Error('其他标签页已更新岗位数据。请刷新页面后再继续，避免覆盖更新。');
    }

    const next = normalizeData({...value,version:JOB_RADAR_VERSION,updatedAt:new Date().toISOString()});
    const raw = JSON.stringify(next);
    storageService.set(STORAGE_KEYS.jobRadar,raw);
    lastSavedRaw = raw;
    jobRadarUnsavedChanges = false;
    return clone(next);
  }catch(error){
    jobRadarUnsavedChanges = true;
    throw error;
  }
}

export function createInterviewDraft(value={},previous=null){
  const now = new Date().toISOString();
  return normalizeInterview({
    id: previous?.id || createId('interview'),
    round: value.round || '',
    questions: value.questions || '',
    answer: value.answer || '',
    review: value.review || '',
    createdAt: previous?.createdAt || now,
    updatedAt: now,
  });
}

export function createJobRecord(value,previous=null){
  const now = new Date().toISOString();
  return normalizeJob({
    id: previous?.id || createId('job'),
    company: value.company || '',
    position: value.position || '',
    salary: value.salary || '',
    location: value.location || '',
    source: value.source || '',
    jdUrl: value.jdUrl || '',
    appliedDate: value.appliedDate || '',
    status: value.status || JOB_STATUSES[0],
    priority: value.priority || JOB_PRIORITIES[0],
    match: value.match === '' || value.match === undefined ? null : value.match,
    strengths: value.strengths || '',
    gaps: value.gaps || '',
    nextAction: value.nextAction || '',
    notes: value.notes || '',
    interviews: value.interviews || [],
    createdAt: previous?.createdAt || now,
    updatedAt: now,
  });
}
