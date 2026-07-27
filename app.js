
const {trip,cities,missions}=window.APP_DATA;
const LS={
  tab:'v5-tab',days:'bitacora-custom-days',journal:'bitacora-journal',expenses:'bitacora-expenses',
  checks:'bitacora-daily-checks',girls:'bitacora-girls-missions',favorites:'bitacora-favorites'
};
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let state={
  tab:get(LS.tab,'today'),days:get(LS.days,trip),journal:get(LS.journal,{}),expenses:get(LS.expenses,[]),
  checks:get(LS.checks,{}),girls:get(LS.girls,{greta:{},maria:{}}),girl:'greta',city:null,modal:null
};
const checks=['Ventanas cerradas','Claraboya cerrada','Cable eléctrico recogido','Calzos guardados','Mesa y sillas guardadas','Nevera bloqueada','WC y aguas revisados','Puertas y cajones cerrados'];
const cats=['Combustible','Peajes','Pernoctas','Supermercado','Restaurantes','Actividades','Transporte','Souvenirs'];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'});

function current(){
 const now=new Date(),start=new Date('2026-08-10T00:00:00'),end=new Date('2026-08-19T23:59:59');
 if(now<start)return {mode:'before',day:state.days[0],left:Math.ceil((start-now)/86400000)};
 if(now>end)return {mode:'after',day:state.days.at(-1)};
 const iso=now.toISOString().slice(0,10);return {mode:'during',day:state.days.find(d=>d.date===iso)||state.days[0]};
}
function nav(){
 return `<nav class="bottom-nav">${[
  ['today','⌂','Hoy'],['route','⌖','Ruta'],['girls','G&M','Greta & Maria'],['journal','▤','Bitácora'],['more','•••','Más']
 ].map(([id,ic,l])=>`<button data-tab="${id}" class="${state.tab===id?'active':''}"><i>${ic}</i><span>${l}</span></button>`).join('')}</nav>`;
}
function topbar(){
 return `<header class="topbar"><div class="brand"><div class="brand-mark">P</div><div><strong>Portugal 2026</strong><span>Viaje en familia · 10–19 agosto</span></div></div><div class="avatar">RE</div></header>`;
}
function app(){
 const content=state.city?cityDetail(state.city):state.tab==='today'?today():state.tab==='route'?route():state.tab==='girls'?girls():state.tab==='journal'?journal():more();
 $('#app').innerHTML=`<div class="app">${topbar()}<main class="main">${content}</main>${nav()}${state.modal?modal():''}</div>`;
 bind();
}
function today(){
 const c=current(),d=c.day,e=state.journal[d.id]||{};
 const title=c.mode==='before'?`Faltan ${c.left} días`:c.mode==='after'?'Portugal ya forma parte de vuestra historia':d.city;
 const subtitle=c.mode==='during'?d.title:'Diez días, siete destinos y una bitácora para recordarlo todo.';
 return `<section class="hero"><img src="./images/${d.image}" alt=""><div class="hero-content"><span class="eyebrow">${c.mode==='during'?'HOY · '+d.date:'PORTUGAL 2026'}</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p><div class="hero-actions"><button class="btn btn-primary" data-tab="route">Ver itinerario</button><button class="btn btn-light" data-tab="journal">Abrir bitácora</button></div></div></section>
 <section class="section"><div class="trip-summary"><div class="stat"><strong>10</strong><span>días</span></div><div class="stat"><strong>7</strong><span>destinos</span></div><div class="stat"><strong>2.600+</strong><span>km aprox.</span></div></div></section>
 <section class="section"><div class="section-head"><div><span class="eyebrow">JORNADA DESTACADA</span><h2>${esc(d.title)}</h2></div><button data-tab="route">Editar</button></div><article class="today-card"><div class="today-title"><div><span class="pill">${esc(d.city)}</span><p class="muted">${esc(d.meta)}</p></div></div><div class="today-list">${d.items.map(x=>{const p=x.split(' · ');return `<div><b>${esc(p[0])}</b><i></i><span>${esc(p.slice(1).join(' · '))}</span></div>`}).join('')}</div></article></section>
 <section class="section"><div class="section-head"><div><span class="eyebrow">DESTINOS</span><h2>Tu viaje de un vistazo</h2></div><button data-tab="route">Ver todos</button></div><div class="city-scroll">${cities.map(cityCard).join('')}</div></section>
 <section class="section"><div class="section-head"><div><span class="eyebrow">RECUERDO DEL DÍA</span><h2>${e.best?'Ya hay una nota guardada':'¿Qué recordaréis hoy?'}</h2></div><button data-tab="journal">Escribir</button></div><article class="card"><strong>${esc(e.best||'Lo mejor del día aparecerá aquí.')}</strong><p class="muted">${esc(e.learned||'Al final de cada jornada podéis dejar una pequeña nota familiar.')}</p></article></section>`;
}
function cityCard(c){return `<article class="city-card" data-city="${c.id}"><img src="./images/${c.image}" alt=""><div><span class="eyebrow" style="color:${c.color}">${c.days}</span><h3>${c.name}</h3><strong>${c.subtitle}</strong><p>${c.desc}</p><div class="city-meta"><span>${c.places} lugares</span><span>Abrir →</span></div></div></article>`}
function route(){
 return `<section class="section"><div class="section-head"><div><span class="eyebrow">ITINERARIO</span><h2>10 días por carretera</h2></div></div><p class="muted">Una vista cronológica y editable, inspirada en las listas de viaje de Wanderlog.</p><div class="route">${state.days.map((d,i)=>`<article class="route-item ${i<2?'complete':''}"><span class="eyebrow">${new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d.date+'T12:00:00'))}</span><strong>${esc(d.title)}</strong><small>${esc(d.meta)}</small>${d.items.map(x=>`<small>· ${esc(x)}</small>`).join('')}<button data-edit-day="${d.id}">Editar día</button></article>`).join('')}</div></section>`;
}
function girls(){
 const g=state.girl,data=missions[g],done=Object.values(state.girls[g]||{}).filter(Boolean).length;
 return `<section class="section"><div class="section-head"><div><span class="eyebrow">AVENTURAS</span><h2>Greta & Maria</h2></div></div><div class="girl-tabs"><button data-girl="greta" class="${g==='greta'?'active':''}">Greta</button><button data-girl="maria" class="${g==='maria'?'active':''}">Maria</button></div><div class="profile"><div class="profile-icon">${g==='greta'?'G':'M'}</div><div><strong>${g==='greta'?'Greta':'Maria'}</strong><span>${g==='greta'?'11 años · cultura y fotografía':'7 años · búsqueda y dibujo'}</span><span>${done} aventuras completadas</span></div></div>${data.map(([city,text],i)=>{const id=g+'-'+i,ok=!!state.girls[g]?.[id];return `<article class="mission ${ok?'done':''}" data-mission="${id}"><div class="mission-check">${ok?'✓':''}</div><div><strong>${city}</strong><span>${text}</span></div></article>`}).join('')}</section>`;
}
function journal(){
 const selected=state.modal?.day||state.days[0].id,d=state.days.find(x=>x.id===selected),e=state.journal[selected]||{};
 return `<section class="section"><div class="section-head"><div><span class="eyebrow">BITÁCORA FAMILIAR</span><h2>Un recuerdo por día</h2></div></div><div class="subtabs">${state.days.map(x=>`<button data-jday="${x.id}" class="${x.id===selected?'active':''}">${new Date(x.date+'T12:00:00').getDate()}</button>`).join('')}</div><article class="card"><span class="eyebrow">${d.date} · ${esc(d.city)}</span><h3>${esc(d.title)}</h3><label class="field">Lo mejor del día<textarea data-jfield="best" data-day="${d.id}" placeholder="El momento que más recordaréis...">${esc(e.best||'')}</textarea></label><label class="field">Qué hemos aprendido<textarea data-jfield="learned" data-day="${d.id}" placeholder="Una curiosidad, una historia o algo nuevo...">${esc(e.learned||'')}</textarea></label><label class="field">Qué repetiríamos<textarea data-jfield="repeat" data-day="${d.id}" placeholder="Un lugar, una comida o una experiencia...">${esc(e.repeat||'')}</textarea></label><label class="field">Valoración<select data-jfield="score" data-day="${d.id}"><option value="">Sin valorar</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${String(e.score)===String(n)?'selected':''}>${n} / 5</option>`).join('')}</select></label></article></section>`;
}
function more(){
 const total=state.expenses.reduce((a,b)=>a+Number(b.amount||0),0);
 return `<section class="section"><div class="section-head"><div><span class="eyebrow">HERRAMIENTAS</span><h2>Todo lo demás</h2></div></div><div class="subtabs"><button data-more="expenses" class="active">Gastos</button><button data-more="checks">Checklist</button><button data-more="backup">Copia</button></div><div id="more-content">${expensesView(total)}</div></section>`;
}
function expensesView(total){
 return `<div class="expense-total"><span>Gasto registrado</span><strong>${money(total)}</strong></div><article class="card"><h3>Añadir gasto</h3><div class="form-grid"><label class="field">Fecha<input id="ex-date" type="date" value="2026-08-10"></label><label class="field">Categoría<select id="ex-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></label><label class="field">Importe (€)<input id="ex-amount" type="number" min="0" step=".01"></label><label class="field">Nota<input id="ex-note" placeholder="Camping, gasolinera..."></label></div><button class="btn btn-primary" id="add-expense">Guardar gasto</button></article><article class="card"><h3>Últimos gastos</h3>${state.expenses.slice().reverse().map(e=>`<div class="expense-row"><div><strong>${esc(e.note||e.category)}</strong><small>${e.date} · ${e.category}</small></div><span>${money(e.amount)}</span><button class="icon-btn" data-del-exp="${e.id}">×</button></div>`).join('')||'<div class="empty">Todavía no hay gastos registrados.</div>'}</article>`;
}
function checksView(){return `<article class="card"><h3>Antes de arrancar</h3>${checks.map(x=>`<label class="check"><input type="checkbox" data-check="${esc(x)}" ${state.checks[x]?'checked':''}><span>${x}</span></label>`).join('')}<button class="btn btn-light" id="clear-checks">Desmarcar todo</button></article>`}
function backupView(){return `<article class="card"><h3>Copia de seguridad</h3><p class="muted">Incluye itinerario, diario, gastos, misiones y checklist.</p><button class="btn btn-primary" id="export">Exportar datos</button><label class="btn btn-light" style="display:inline-block">Importar<input id="import" hidden type="file" accept="application/json"></label></article>`}
function cityDetail(id){
 const c=cities.find(x=>x.id===id);const imgs=[c.image, id==='lisboa'?'alfama.webp':id==='porto'?'porto-saobento.webp':id==='aveiro'?'costa-nova.webp':id==='nazare'?'nazare-sitio.webp':id==='sintra'?'pena.webp':id==='obidos'?'obidos-centro.webp':'burgos-centro.webp'];
 return `<section class="city-detail-hero"><img src="./images/${c.image}"><button data-back>‹</button><div><span class="eyebrow">${c.days}</span><h1>${c.name}</h1><p>${c.subtitle}</p></div></section><section class="section"><p class="muted">${c.desc}</p><div class="trip-summary"><div class="stat"><strong>${c.places}</strong><span>lugares</span></div><div class="stat"><strong>${c.days.split(' ')[0]}</strong><span>agosto</span></div><div class="stat"><strong>Familia</strong><span>tipo de viaje</span></div></div></section><section class="section"><div class="section-head"><div><span class="eyebrow">IMPRESCINDIBLES</span><h2>Qué ver</h2></div></div><div class="place-grid">${imgs.map((im,i)=>`<article class="place"><img src="./images/${im}"><div><strong>${['Paseo principal','Lugar destacado','Parada familiar'][i]}</strong><small>${c.name}</small></div></article>`).join('')}</div></section>`;
}
function modal(){
 const d=state.days.find(x=>x.id===state.modal.id);
 return `<div class="modal"><div><div class="modal-head"><h3>Editar jornada</h3><button data-close>×</button></div><label class="field">Título<input id="ed-title" value="${esc(d.title)}"></label><label class="field">Resumen<input id="ed-meta" value="${esc(d.meta)}"></label>${d.items.map((x,i)=>`<label class="field">Actividad ${i+1}<input data-ed-item="${i}" value="${esc(x)}"></label>`).join('')}<button class="btn btn-primary" id="save-day">Guardar cambios</button></div></div>`;
}
function bind(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.city=null;state.modal=null;put(LS.tab,state.tab);app()});
 document.querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>{state.city=b.dataset.city;app()});
 const back=$('[data-back]');if(back)back.onclick=()=>{state.city=null;app()};
 document.querySelectorAll('[data-girl]').forEach(b=>b.onclick=()=>{state.girl=b.dataset.girl;app()});
 document.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{const id=b.dataset.mission;state.girls[state.girl]={...(state.girls[state.girl]||{}),[id]:!state.girls[state.girl]?.[id]};put(LS.girls,state.girls);app()});
 document.querySelectorAll('[data-jfield]').forEach(el=>el.oninput=()=>{const id=el.dataset.day;state.journal[id]={...(state.journal[id]||{}),[el.dataset.jfield]:el.value};put(LS.journal,state.journal)});
 document.querySelectorAll('[data-jday]').forEach(b=>b.onclick=()=>{state.modal={day:b.dataset.jday};app()});
 document.querySelectorAll('[data-edit-day]').forEach(b=>b.onclick=()=>{state.modal={id:b.dataset.editDay};app()});
 const close=$('[data-close]');if(close)close.onclick=()=>{state.modal=null;app()};
 const save=$('#save-day');if(save)save.onclick=()=>{const d=state.days.find(x=>x.id===state.modal.id);d.title=$('#ed-title').value;d.meta=$('#ed-meta').value;document.querySelectorAll('[data-ed-item]').forEach(x=>d.items[Number(x.dataset.edItem)]=x.value);put(LS.days,state.days);state.modal=null;app()};
 document.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-more]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#more-content').innerHTML=b.dataset.more==='expenses'?expensesView(state.expenses.reduce((a,x)=>a+Number(x.amount||0),0)):b.dataset.more==='checks'?checksView():backupView();bindMore()});
 bindMore();
}
function bindMore(){
 const add=$('#add-expense');if(add)add.onclick=()=>{const amount=$('#ex-amount').value;if(!amount)return;state.expenses.push({id:Date.now(),date:$('#ex-date').value,category:$('#ex-cat').value,amount,note:$('#ex-note').value});put(LS.expenses,state.expenses);app()};
 document.querySelectorAll('[data-del-exp]').forEach(b=>b.onclick=()=>{state.expenses=state.expenses.filter(e=>String(e.id)!==b.dataset.delExp);put(LS.expenses,state.expenses);app()});
 document.querySelectorAll('[data-check]').forEach(i=>i.onchange=()=>{state.checks[i.dataset.check]=i.checked;put(LS.checks,state.checks)});
 const clear=$('#clear-checks');if(clear)clear.onclick=()=>{state.checks={};put(LS.checks,state.checks);app()};
 const exp=$('#export');if(exp)exp.onclick=()=>{const data={version:'5.0.0',...state};delete data.modal;delete data.city;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='bitacora-portugal-v5.json';a.click();URL.revokeObjectURL(u)};
 const imp=$('#import');if(imp)imp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);['days','journal','expenses','checks','girls'].forEach(k=>{if(d[k]!=null){state[k]=d[k];put(LS[k]||k,d[k])}});alert('Datos importados');app()}catch{alert('Archivo no válido')}};r.readAsText(f)};
}
app();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
