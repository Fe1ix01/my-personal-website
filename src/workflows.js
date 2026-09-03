let workflowUrls = [];
const workflowNames = {'chatgpt.com':'ChatGPT','www.perplexity.ai':'Perplexity','gemini.google.com':'Gemini','www.zhipin.com':'BOSS直聘','mail.google.com':'Gmail','www.linkedin.com':'LinkedIn','www.youtube.com':'YouTube','github.com':'GitHub','x.com':'X','www.tiktok.com':'TikTok','www.instagram.com':'Instagram'};
function openSet(urls){
  workflowUrls = urls;
  const list = document.getElementById('workflowLinks');
  list.replaceChildren();
  urls.forEach(url=>{
    const link = document.createElement('a');
    link.className = 'btn';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = workflowNames[new URL(url).hostname] || new URL(url).hostname;
    list.appendChild(link);
  });
  document.getElementById('workflowStatus').textContent = '';
  document.getElementById('workflowDialog').showModal();
}
export function openAllWorkflowLinks(){
  let blocked = 0;
  workflowUrls.forEach(url=>{
    const tab = window.open(url,'_blank');
    if(tab) tab.opener = null;
    else blocked += 1;
  });
  document.getElementById('workflowStatus').textContent = blocked ? '浏览器拦截了部分窗口，请使用上方链接逐个打开。' : '已打开全部工具。';
}
export function launchResearchMode(){openSet(['https://chatgpt.com','https://www.perplexity.ai','https://gemini.google.com']);}
export function launchJobMode(){openSet(['https://www.zhipin.com','https://chatgpt.com','https://mail.google.com','https://www.linkedin.com']);}
export function launchLearnMode(){openSet(['https://chatgpt.com','https://www.youtube.com','https://github.com','https://www.perplexity.ai']);}
export function launchContentMode(){openSet(['https://www.youtube.com','https://x.com','https://www.tiktok.com','https://www.instagram.com']);}
