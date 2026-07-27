
(()=>{
const KEY={
 days:'bitacora-custom-days',journal:'bitacora-journal',expenses:'bitacora-expenses',
 daily:'bitacora-daily-checks',budget:'bitacora-budget'
};
const defaults=window.BITACORA_TRIP||[];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let days=get(KEY.days,defaults),journal=get(KEY.journal,{}),expenses=get(KEY.expenses,[]),daily=get(KEY.daily,{});
const checks=['Ventanas cerradas','Claraboya cerrada','Cable eléctrico recogido','Calzos guardados','Mesa y sillas guardadas','Nevera bloqueada','WC y aguas revisados','Puertas y cajones cerrados'];
const cats=['Combustible','Peajes','Pernoctas','Supermercado','Restaurantes','Actividades','Transporte','Souvenirs'];
let active='today';

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function currentDay(){
 const now=new Date(),start=new Date('2026-08-10T00:00:00'),end=new Date('2026-08-19T23:59:59');
 if(now<start)return {mode:'before',day:days[0],left:Math.ceil((start-now)/86400000)};
 if(now>end)return {mode:'after',day:days[days.length-1]};
 const iso=now.toISOString().slice(0,10);return {mode:'during',day:days.find(d=>d.date===iso)||days[0]};
}
function money(n){return Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'})}

function mount(){
 if(document.getElementById('travel-mode-button'))return;
 const header=document.querySelector('.app-header');
 if(!header)return setTimeout(mount,300);
 const btn=document.createElement('button');btn.id='travel-mode-button';btn.textContent='MODO VIAJE';header.appendChild(btn);
 btn.addEventListener('click',open);
 const overlay=document.createElement('div');overlay.id='travel-overlay';overlay.innerHTML='<div id="travel-app"></div>';document.body.appendChild(overlay);
}
function open(){document.getElementById('travel-overlay').classList.add('open');render()}
function close(){document.getElementById('travel-overlay').classList.remove('open')}
function shell(content){
 return `<header class="tm-head"><div><span>BITÁCORA</span><strong>Modo viaje</strong></div><button data-close>×</button></header>
 <main class="tm-main">${content}</main>
 <nav class="tm-nav">${[['today','Hoy'],['route','Ruta'],['journal','Diario'],['expenses','Gastos'],['check','Checklist']].map(([id,l])=>`<button data-tab="${id}" class="${active===id?'active':''}">${l}</button>`).join('')}</nav>`;
}
function render(){
 let html=active==='today'?today():active==='route'?route():active==='journal'?diary():active==='expenses'?expenseView():checkView();
 const host=document.getElementById('travel-app');host.innerHTML=shell(html);
 host.querySelector('[data-close]').onclick=close;
 host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.tab;render()});
 bind();
}
function today(){
 const s=currentDay(),d=s.day,e=journal[d.id]||{};
 const title=s.mode==='before'?`Faltan ${s.left} días`:s.mode==='after'?'Viaje completado':`Hoy: ${d.title}`;
 return `<section class="tm-hero"><img src="./images/${d.image}"><div><span>${s.mode==='during'?'HOY':'PORTUGAL 2026'}</span><h1>${esc(title)}</h1><p>${esc(d.meta)}</p></div></section>
 <section class="tm-section"><small>PLAN DEL DÍA</small><h2>${esc(d.title)}</h2><div class="tm-list">${d.items.map(x=>`<div><i></i><span>${esc(x)}</span></div>`).join('')}</div></section>
 <section class="tm-section"><small>DIARIO</small><h2>${e.best?'Recuerdo guardado':'Esta noche...'}</h2><article class="tm-note"><strong>${esc(e.best||'¿Qué ha sido lo mejor del día?')}</strong><p>${esc(e.learned||'Anotad qué habéis aprendido y qué repetirías.')}</p><button data-go="journal">Abrir diario</button></article></section>`;
}
function route(){
 return `<section class="tm-section"><small>ESQUEMA DE RUTA</small><h1>Diez jornadas</h1><p class="tm-muted">Este recorrido es una secuencia visual, no un mapa geográfico.</p><div class="tm-route">${days.map((d,i)=>`<article><b>${i+1}</b><div><strong>${esc(d.title)}</strong><small>${esc(d.meta)}</small></div><button data-edit="${d.id}">Editar</button></article>`).join('')}</div></section>`;
}
function diary(){
 const opts=days.map(d=>`<option value="${d.id}">${d.date} · ${esc(d.title)}</option>`).join('');
 return `<section class="tm-section"><small>DIARIO DEL VIAJE</small><h1>Un recuerdo por jornada</h1><select id="tm-day">${opts}</select><div id="tm-diary-fields"></div></section>`;
}
function expenseView(){
 const total=expenses.reduce((a,b)=>a+Number(b.amount||0),0);
 const totals=Object.fromEntries(cats.map(c=>[c,expenses.filter(e=>e.category===c).reduce((a,b)=>a+Number(b.amount||0),0)]));
 return `<section class="tm-section"><div class="tm-total"><span>Gasto registrado</span><strong>${money(total)}</strong></div>
 <article class="tm-card"><h2>Añadir gasto</h2><div class="tm-form"><label>Fecha<input id="ex-date" type="date" value="2026-08-10"></label><label>Categoría<select id="ex-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Importe (€)<input id="ex-amount" type="number" min="0" step=".01"></label><label>Nota<input id="ex-note" placeholder="Camping, gasolinera..."></label></div><button id="add-expense">Guardar gasto</button></article>
 <article class="tm-card"><h2>Por categoría</h2>${cats.map(c=>`<div class="tm-cat"><span>${c}</span><strong>${money(totals[c])}</strong></div>`).join('')}</article>
 <article class="tm-card"><h2>Últimos gastos</h2>${expenses.slice().reverse().map(e=>`<div class="tm-exp"><div><strong>${esc(e.note||e.category)}</strong><small>${e.date} · ${e.category}</small></div><span>${money(e.amount)}</span><button data-del-exp="${e.id}">×</button></div>`).join('')||'<p class="tm-muted">Todavía no hay gastos.</p>'}</article></section>`;
}
function checkView(){
 return `<section class="tm-section"><small>ANTES DE ARRANCAR</small><h1>Checklist diaria</h1><article class="tm-card">${checks.map(x=>`<label class="tm-check"><input type="checkbox" data-check="${esc(x)}" ${daily[x]?'checked':''}><span>${esc(x)}</span></label>`).join('')}<button id="clear-checks" class="tm-danger">Desmarcar todo</button></article>
 <article class="tm-card"><h2>Copia de seguridad</h2><p class="tm-muted">Exporta también favoritos, misiones y datos de Greta & Maria guardados por la app principal.</p><button id="export-all">Exportar todo</button><label class="tm-import">Importar archivo<input id="import-all" type="file" accept="application/json"></label></article></section>`;
}
function bind(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{active=b.dataset.go;render()});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editDay(b.dataset.edit));
 if(active==='journal'){
  const sel=document.getElementById('tm-day');sel.onchange=()=>drawDiary(sel.value);drawDiary(sel.value);
 }
 const add=document.getElementById('add-expense');if(add)add.onclick=()=>{
  const amount=document.getElementById('ex-amount').value;if(!amount)return;
  expenses.push({id:Date.now(),date:document.getElementById('ex-date').value,category:document.getElementById('ex-cat').value,amount,note:document.getElementById('ex-note').value});
  put(KEY.expenses,expenses);render();
 };
 document.querySelectorAll('[data-del-exp]').forEach(b=>b.onclick=()=>{expenses=expenses.filter(e=>String(e.id)!==b.dataset.delExp);put(KEY.expenses,expenses);render()});
 document.querySelectorAll('[data-check]').forEach(i=>i.onchange=()=>{daily[i.dataset.check]=i.checked;put(KEY.daily,daily)});
 const clear=document.getElementById('clear-checks');if(clear)clear.onclick=()=>{daily={};put(KEY.daily,daily);render()};
 const exp=document.getElementById('export-all');if(exp)exp.onclick=exportAll;
 const imp=document.getElementById('import-all');if(imp)imp.onchange=importAll;
}
function drawDiary(id){
 const e=journal[id]||{},host=document.getElementById('tm-diary-fields');
 host.innerHTML=`<label>Lo mejor del día<textarea data-field="best">${esc(e.best||'')}</textarea></label><label>Qué hemos aprendido<textarea data-field="learned">${esc(e.learned||'')}</textarea></label><label>Qué repetiríamos<textarea data-field="repeat">${esc(e.repeat||'')}</textarea></label><label>Valoración<select data-field="score"><option value="">Sin valorar</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${String(e.score)===String(n)?'selected':''}>${n} / 5</option>`).join('')}</select></label>`;
 host.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{journal[id]={...(journal[id]||{}),[el.dataset.field]:el.value};put(KEY.journal,journal)});
}
function editDay(id){
 const d=days.find(x=>x.id===id);if(!d)return;
 const modal=document.createElement('div');modal.className='tm-modal';modal.innerHTML=`<div><header><h2>Editar jornada</h2><button>×</button></header><label>Título<input id="ed-title" value="${esc(d.title)}"></label><label>Resumen<input id="ed-meta" value="${esc(d.meta)}"></label><div id="ed-items">${d.items.map((x,i)=>`<label>Actividad ${i+1}<input data-ed-item="${i}" value="${esc(x)}"></label>`).join('')}</div><button id="ed-add">Añadir actividad</button><button id="ed-save">Guardar cambios</button></div>`;
 document.body.appendChild(modal);modal.querySelector('header button').onclick=()=>modal.remove();
 modal.querySelector('#ed-add').onclick=()=>{d.items.push('12:00 · Nueva actividad');modal.remove();put(KEY.days,days);editDay(id)};
 modal.querySelector('#ed-save').onclick=()=>{d.title=modal.querySelector('#ed-title').value;d.meta=modal.querySelector('#ed-meta').value;modal.querySelectorAll('[data-ed-item]').forEach(x=>d.items[Number(x.dataset.edItem)]=x.value);put(KEY.days,days);modal.remove();render()};
}
function exportAll(){
 const keys=['bitacora-favorites','bitacora-missions','bitacora-girls-missions','bitacora-checklist','bitacora-budget',KEY.days,KEY.journal,KEY.expenses,KEY.daily];
 const data={version:'4.3.0'};keys.forEach(k=>data[k]=get(k,k===KEY.days?defaults:k===KEY.expenses?[]:{}));
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='bitacora-portugal-2026-completa.json';a.click();URL.revokeObjectURL(u);
}
function importAll(ev){
 const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);Object.entries(d).forEach(([k,v])=>{if(k!=='version')localStorage.setItem(k,JSON.stringify(v))});alert('Datos importados. La app se recargará.');location.reload()}catch{alert('Archivo no válido')}};r.readAsText(f);
}
mount();
})();
