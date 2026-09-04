import {
  createInterviewDraft,
  createJobRecord,
  jobRadarReadFailed,
  jobRadarUnsavedChanges,
  loadJobRadar,
  saveJobRadar,
} from './services/jobRadarService.js';
import { STORAGE_KEYS } from './services/storageService.js';

const jobForm = document.getElementById('jobForm');
const jobFormTitle = document.getElementById('jobFormTitle');
const jobDataStatus = document.getElementById('jobDataStatus');
const jobSearch = document.getElementById('jobSearch');
const statusFilter = document.getElementById('statusFilter');
const interviewDraftList = document.getElementById('interviewDraftList');
const jobList = document.getElementById('jobList');
const jobRecordCount = document.getElementById('jobRecordCount');
const cancelJobEdit = document.getElementById('cancelJobEdit');

let radarData = loadJobRadar();
let editingJobId = null;
let draftInterviews = [];
let formDirty = false;

function createElement(tag,className,text){
  const element = document.createElement(tag);
  if(className) element.className = className;
  if(text !== undefined) element.textContent = text;
  return element;
}

function showStatus(message,isError=false){
  jobDataStatus.textContent = message;
  jobDataStatus.classList.toggle('is-error',isError);
}

function formField(name){
  return jobForm.elements.namedItem(name);
}

function setFormField(name,value){
  formField(name).value = value ?? '';
}

function addEditorField(container,labelText,field,value,{textarea=false,required=false}={}){
  const label = createElement('label','job-field');
  label.appendChild(createElement('span','',labelText));
  const control = document.createElement(textarea ? 'textarea' : 'input');
  if(!textarea) control.type = 'text';
  control.value = value;
  control.required = required;
  control.dataset.interviewField = field;
  if(textarea) control.rows = 3;
  label.appendChild(control);
  container.appendChild(label);
}

function renderInterviewDrafts(){
  interviewDraftList.replaceChildren();
  draftInterviews.forEach((interview,index)=>{
    const editor = createElement('article','interview-editor');
    editor.dataset.interviewId = interview.id;

    const head = createElement('div','interview-editor-head');
    head.appendChild(createElement('div','interview-editor-title',`第 ${index + 1} 条面试记录`));
    const removeButton = createElement('button','job-action-button job-action-danger','删除此面试');
    removeButton.type = 'button';
    removeButton.dataset.action = 'remove-interview';
    head.appendChild(removeButton);
    editor.appendChild(head);

    const grid = createElement('div','interview-editor-grid');
    addEditorField(grid,'面试轮次','round',interview.round,{required:true});
    addEditorField(grid,'面试问题','questions',interview.questions,{textarea:true});
    addEditorField(grid,'我的回答','answer',interview.answer,{textarea:true});
    addEditorField(grid,'复盘','review',interview.review,{textarea:true});
    editor.appendChild(grid);
    interviewDraftList.appendChild(editor);
  });
}

function appendMeta(container,text){
  if(text) container.appendChild(createElement('span','',text));
}

function appendNote(container,label,value){
  if(!value) return;
  const note = createElement('div','job-record-note');
  note.appendChild(createElement('strong','',label));
  note.appendChild(document.createTextNode(value));
  container.appendChild(note);
}

function appendInterviewText(container,label,value){
  if(!value) return;
  const paragraph = createElement('p');
  paragraph.appendChild(createElement('strong','',`${label}：`));
  paragraph.appendChild(document.createTextNode(value));
  container.appendChild(paragraph);
}

function renderJobRecord(job){
  const record = createElement('article','job-record');
  record.dataset.jobId = job.id;

  const head = createElement('div','job-record-head');
  const title = createElement('div','job-record-title');
  title.appendChild(createElement('h3','',job.company));
  title.appendChild(createElement('p','',job.position));
  head.appendChild(title);

  const actions = createElement('div','job-record-actions');
  const editButton = createElement('button','job-action-button','编辑');
  editButton.type = 'button';
  editButton.dataset.action = 'edit-job';
  actions.appendChild(editButton);
  const deleteButton = createElement('button','job-action-button job-action-danger','删除');
  deleteButton.type = 'button';
  deleteButton.dataset.action = 'delete-job';
  actions.appendChild(deleteButton);
  head.appendChild(actions);
  record.appendChild(head);

  const tags = createElement('div','job-record-tags');
  tags.appendChild(createElement('span','job-record-tag',job.status));
  tags.appendChild(createElement('span','job-record-tag is-priority',job.priority));
  if(job.match !== null) tags.appendChild(createElement('span','job-record-tag',`匹配度 ${job.match}`));
  record.appendChild(tags);

  const meta = createElement('div','job-record-meta');
  appendMeta(meta,job.salary);
  appendMeta(meta,job.location);
  appendMeta(meta,job.source);
  appendMeta(meta,job.appliedDate ? `投递 ${job.appliedDate}` : '');
  if(job.jdUrl){
    const link = createElement('a','job-record-link','打开 JD');
    link.href = job.jdUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    meta.appendChild(link);
  }
  if(meta.childNodes.length) record.appendChild(meta);

  const notes = createElement('div','job-record-notes');
  appendNote(notes,'我的优势',job.strengths);
  appendNote(notes,'岗位短板',job.gaps);
  appendNote(notes,'下一步动作',job.nextAction);
  appendNote(notes,'备注',job.notes);
  if(notes.childNodes.length) record.appendChild(notes);

  if(job.interviews.length){
    const interviews = createElement('section','job-record-interviews');
    interviews.appendChild(createElement('h4','',`面试记录 · ${job.interviews.length} 轮`));
    job.interviews.forEach(interview=>{
      const item = createElement('article','job-record-interview');
      item.appendChild(createElement('strong','',interview.round || '未填写轮次'));
      appendInterviewText(item,'问题',interview.questions);
      appendInterviewText(item,'我的回答',interview.answer);
      appendInterviewText(item,'复盘',interview.review);
      interviews.appendChild(item);
    });
    record.appendChild(interviews);
  }

  return record;
}

function filteredJobs(){
  const query = jobSearch.value.trim().toLocaleLowerCase('zh-CN');
  const status = statusFilter.value;
  return radarData.jobs.filter(job=>{
    if(status && job.status !== status) return false;
    if(!query) return true;
    return [
      job.company,job.position,job.salary,job.location,job.source,
      job.strengths,job.gaps,job.nextAction,job.notes,
    ].some(value=>value.toLocaleLowerCase('zh-CN').includes(query));
  });
}

function renderJobs(){
  const jobs = filteredJobs();
  jobList.replaceChildren();
  jobRecordCount.textContent = jobs.length === radarData.jobs.length
    ? `${jobs.length} 个岗位`
    : `${jobs.length} / ${radarData.jobs.length} 个岗位`;

  if(!jobs.length){
    const message = radarData.jobs.length ? '没有符合当前筛选条件的岗位。' : '还没有岗位记录，从上方新增第一条。';
    jobList.appendChild(createElement('div','job-empty',message));
    return;
  }
  jobs.forEach(job=>jobList.appendChild(renderJobRecord(job)));
}

function resetEditor(){
  jobForm.reset();
  editingJobId = null;
  draftInterviews = [];
  formDirty = false;
  jobFormTitle.textContent = '新增岗位';
  cancelJobEdit.hidden = true;
  renderInterviewDrafts();
}

function startEditing(job){
  editingJobId = job.id;
  draftInterviews = job.interviews.map(interview=>({...interview}));
  setFormField('priority',job.priority);
  setFormField('status',job.status);
  setFormField('company',job.company);
  setFormField('position',job.position);
  setFormField('salary',job.salary);
  setFormField('location',job.location);
  setFormField('source',job.source);
  setFormField('match',job.match);
  setFormField('applied-date',job.appliedDate);
  setFormField('link',job.jdUrl);
  setFormField('strengths',job.strengths);
  setFormField('gaps',job.gaps);
  setFormField('next-action',job.nextAction);
  setFormField('notes',job.notes);
  jobFormTitle.textContent = '编辑岗位';
  cancelJobEdit.hidden = false;
  formDirty = false;
  renderInterviewDrafts();
  showStatus(`正在编辑：${job.company} · ${job.position}`);
  jobForm.scrollIntoView({behavior:'smooth',block:'start'});
}

function valuesFromForm(){
  const values = new FormData(jobForm);
  return {
    company: values.get('company'),
    position: values.get('position'),
    salary: values.get('salary'),
    location: values.get('location'),
    source: values.get('source'),
    match: values.get('match'),
    appliedDate: values.get('applied-date'),
    jdUrl: values.get('link'),
    status: values.get('status'),
    priority: values.get('priority'),
    strengths: values.get('strengths'),
    gaps: values.get('gaps'),
    nextAction: values.get('next-action'),
    notes: values.get('notes'),
    interviews: draftInterviews.map(interview=>createInterviewDraft(interview,interview)),
  };
}

function saveCurrentJob(event){
  event.preventDefault();
  if(!jobForm.reportValidity()) return;

  const previous = editingJobId ? radarData.jobs.find(job=>job.id === editingJobId) : null;
  try{
    const record = createJobRecord(valuesFromForm(),previous);
    const jobs = previous
      ? radarData.jobs.map(job=>job.id === previous.id ? record : job)
      : [record,...radarData.jobs];
    radarData = saveJobRadar({...radarData,jobs});
    resetEditor();
    renderJobs();
    showStatus(previous ? '岗位记录已更新。' : '岗位记录已保存到当前浏览器。');
  }catch(error){
    showStatus(error instanceof Error ? error.message : '岗位保存失败，请检查浏览器存储。',true);
  }
}

function deleteJob(job){
  if(!confirm(`确定删除“${job.company} · ${job.position}”及其面试记录吗？`)) return;
  try{
    radarData = saveJobRadar({...radarData,jobs:radarData.jobs.filter(item=>item.id !== job.id)});
    if(editingJobId === job.id) resetEditor();
    renderJobs();
    showStatus('岗位记录已删除。');
  }catch(error){
    showStatus(error instanceof Error ? error.message : '岗位删除失败，请检查浏览器存储。',true);
  }
}

jobForm.addEventListener('submit',saveCurrentJob);
jobForm.addEventListener('input',()=>{formDirty = true;});
jobForm.addEventListener('change',()=>{formDirty = true;});
jobSearch.addEventListener('input',renderJobs);
statusFilter.addEventListener('change',renderJobs);

document.getElementById('addInterview').addEventListener('click',()=>{
  draftInterviews.push(createInterviewDraft());
  formDirty = true;
  renderInterviewDrafts();
});

interviewDraftList.addEventListener('input',event=>{
  const field = event.target.dataset.interviewField;
  const editor = event.target.closest('[data-interview-id]');
  if(!field || !editor) return;
  const interview = draftInterviews.find(item=>item.id === editor.dataset.interviewId);
  if(interview) interview[field] = event.target.value;
});

interviewDraftList.addEventListener('click',event=>{
  const button = event.target.closest('[data-action="remove-interview"]');
  if(!button) return;
  const editor = button.closest('[data-interview-id]');
  draftInterviews = draftInterviews.filter(item=>item.id !== editor.dataset.interviewId);
  formDirty = true;
  renderInterviewDrafts();
});

jobList.addEventListener('click',event=>{
  const button = event.target.closest('[data-action]');
  const record = event.target.closest('[data-job-id]');
  if(!button || !record) return;
  const job = radarData.jobs.find(item=>item.id === record.dataset.jobId);
  if(!job) return;
  if(button.dataset.action === 'edit-job') startEditing(job);
  if(button.dataset.action === 'delete-job') deleteJob(job);
});

cancelJobEdit.addEventListener('click',()=>{
  resetEditor();
  showStatus('已取消编辑。');
});

window.addEventListener('storage',event=>{
  if(event.key === STORAGE_KEYS.jobRadar){
    showStatus('其他标签页已更新岗位数据，请刷新页面后继续。',true);
  }
});

window.addEventListener('beforeunload',event=>{
  if(!formDirty && !jobRadarUnsavedChanges) return;
  event.preventDefault();
  event.returnValue = '';
});

resetEditor();
renderJobs();
if(jobRadarReadFailed){
  showStatus('岗位数据读取失败，已暂停保存。请检查浏览器存储权限或数据完整性。',true);
}
