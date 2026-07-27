
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
const PHOTO_MAP=window.PHOTO_MAP||{};
function dayPhotos(id){return PHOTO_MAP[id]||['hero.webp']}
function photoForDay(id,index=0){const p=dayPhotos(id);return p[index%p.length]||p[0]||'hero.webp'}
function activityTitle(item){const p=item.split(' · ');return p.slice(1).join(' · ')||item}
function activityTime(item){return item.split(' · ')[0]||''}


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
 return `<header class="topbar"><div class="brand"><div class="brand-mark">P</div><div><strong>BITÁCORA</strong><span>PORTUGAL 2026</span></div></div><div class="avatar">RE</div></header>`;
}
function app(){
 const content=state.modal?.dayPlan?dayPlan(state.modal.dayPlan):state.city?cityDetail(state.city):state.tab==='today'?today():state.tab==='route'?route():state.tab==='girls'?girls():state.tab==='journal'?journal():more();
 $('#app').innerHTML=`<div class="app">${topbar()}<main class="main">${content}</main>${nav()}${state.modal?modal():''}</div>`;
 bind();
}
function today(){
 const c=current(),d=c.day,e=state.journal[d.id]||{};
 const idx=Math.max(0,state.days.findIndex(x=>x.id===d.id));
 const next=state.days[Math.min(idx+1,state.days.length-1)];
 const progress=Math.round(((idx+1)/state.days.length)*100);
 const title=c.mode==='before'?`Faltan ${c.left} días`:c.mode==='after'?'Portugal ya forma parte de vuestra historia':d.city;
 const subtitle=c.mode==='during'?d.title:'Diez días, ocho ciudades y una bitácora para recordarlo todo.';
 return `
 <section class="home-hero-shell">
   <article class="home-hero">
     <img src="./images/${d.image}" alt="">
     <div class="home-hero-overlay"></div>
     <div class="home-hero-content">
       <span class="date-chip">${c.mode==='during'?`Día ${idx+1} · ${new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long'}).format(new Date(d.date+'T12:00:00'))}`:'PORTUGAL 2026'}</span>
       <h1>${esc(title)}</h1>
       <p>${esc(subtitle)}</p>
       <button class="home-cta" data-tab="route">Ver plan del día <span>›</span></button>
     </div>
   </article>
   <div class="hero-dots" aria-label="Progreso visual"><i class="active"></i><i></i><i></i></div>
 </section>

 <section class="section home-summary-section">
   <div class="section-head compact-head"><div><h2>Resumen del viaje</h2></div></div>
   <div class="home-metrics">
     <article><span class="metric-icon">⌖</span><strong>2.640 km</strong><small>Recorrido</small></article>
     <article><span class="metric-icon">□</span><strong>10 días</strong><small>10–19 agosto</small></article>
     <article><span class="metric-icon">♜</span><strong>8 ciudades</strong><small>Por descubrir</small></article>
     <article><span class="metric-icon">✥</span><strong>64 misiones</strong><small>Greta & Maria</small></article>
   </div>
 </section>

 <section class="section next-stop-section">
   <div class="section-head compact-head"><div><h2>Próxima parada</h2></div></div>
   <article class="next-stop-card" data-tab="route">
     <img src="./images/${next.image}" alt="">
     <div>
       <strong>${esc(next.city)}</strong>
       <span>${idx+1>=state.days.length?'Fin del viaje':`Mañana · ${new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long'}).format(new Date(next.date+'T12:00:00'))}`}</span>
       <p>${esc(next.meta)}</p>
     </div>
     <b>›</b>
   </article>
 </section>

 <section class="section progress-section">
   <div class="progress-card">
     <div class="progress-copy">
       <span class="eyebrow">PROGRESO DEL VIAJE</span>
       <strong>${progress}% completado</strong>
       <small>${idx+1} de ${state.days.length} jornadas</small>
     </div>
     <div class="progress-track"><i style="width:${progress}%"></i></div>
   </div>
 </section>

 <section class="section">
   <div class="section-head"><div><span class="eyebrow">HOY</span><h2>${esc(d.title)}</h2></div><button data-tab="journal">Escribir</button></div>
   <article class="today-card refined">
     <div class="today-list">${d.items.map(x=>{const p=x.split(' · ');return `<div><b>${esc(p[0])}</b><i></i><span>${esc(p.slice(1).join(' · '))}</span></div>`}).join('')}</div>
   </article>
 </section>

 <section class="section">
   <div class="section-head"><div><span class="eyebrow">DESTINOS</span><h2>Explora la ruta</h2></div><button data-tab="route">Ver todos</button></div>
   <div class="city-scroll">${cities.map(cityCard).join('')}</div>
 </section>

 <section class="section">
   <div class="section-head"><div><span class="eyebrow">RECUERDO DEL DÍA</span><h2>${e.best?'Ya hay una nota guardada':'¿Qué recordaréis hoy?'}</h2></div><button data-tab="journal">Abrir</button></div>
   <article class="memory-card">
     <span class="memory-mark">“</span>
     <strong>${esc(e.best||'Lo mejor del día aparecerá aquí.')}</strong>
     <p>${esc(e.learned||'Al final de cada jornada podéis guardar una pequeña nota familiar.')}</p>
   </article>
 </section>`;
}
function cityCard(c){return `<article class="city-card" data-city="${c.id}"><img src="./images/${c.image}" alt=""><div><span class="eyebrow" style="color:${c.color}">${c.days}</span><h3>${c.name}</h3><strong>${c.subtitle}</strong><p>${c.desc}</p><div class="city-meta"><span>${c.places} lugares</span><span>Abrir →</span></div></div></article>`}
function route(){
 const c=current(),currentId=c.day.id;
 return `<section class="photo-route-page">
   <article class="route-photo-hero">
     <img src="./images/${photoForDay(currentId,0)}" alt="">
     <div class="route-photo-shade"></div>
     <div class="route-photo-copy">
       <span class="eyebrow">RUTA PORTUGAL 2026</span>
       <h1>10 días por carretera</h1>
       <p>2.640 km · 8 ciudades · recuerdos en familia</p>
     </div>
   </article>

   <section class="section route-photo-content">
     <div class="section-head"><div><span class="eyebrow">ITINERARIO</span><h2>La ruta, día a día</h2></div><span class="route-distance">10–19 agosto</span></div>
     <div class="journey-progress"><i style="width:${Math.round(((Math.max(0,state.days.findIndex(d=>d.id===currentId))+1)/state.days.length)*100)}%"></i></div>

     <div class="photo-timeline">
       ${state.days.map((d,i)=>{
         const isToday=d.id===currentId&&c.mode==='during';
         const completed=c.mode==='after'||(c.mode==='during'&&new Date(d.date)<new Date(c.day.date));
         return `<article class="photo-route-card ${isToday?'is-today':''} ${completed?'is-complete':''}">
           <img class="photo-route-thumb" src="./images/${photoForDay(d.id,0)}" alt="">
           <div class="photo-route-body">
             <div class="photo-route-date">
               <span>Día ${i+1}</span>
               <small>${new Intl.DateTimeFormat('es-ES',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d.date+'T12:00:00'))}</small>
               ${isToday?'<b>HOY</b>':completed?'<b>HECHO</b>':''}
             </div>
             <h3>${esc(d.title)}</h3>
             <p>${esc(d.meta)}</p>
             <div class="route-photo-preview">
               ${d.items.slice(0,3).map((item,n)=>`<div>
                 <img src="./images/${photoForDay(d.id,n+1)}" alt="">
                 <span><b>${esc(activityTime(item))}</b>${esc(activityTitle(item))}</span>
               </div>`).join('')}
             </div>
             <div class="route-actions">
               <button data-edit-day="${d.id}">Editar jornada</button>
               <button data-open-day="${d.id}">Ver plan completo</button>
             </div>
           </div>
         </article>`;
       }).join('')}
     </div>
   </section>
 </section>`;
}

function dayPlan(id){
 const d=state.days.find(x=>x.id===id)||state.days[0];
 return `<section class="day-plan-page">
   <article class="day-plan-hero">
     <img src="./images/${photoForDay(d.id,0)}" alt="">
     <div class="day-plan-gradient"></div>
     <button class="round-back" data-close-day>‹</button>
     <div class="day-plan-title">
       <span>${new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date(d.date+'T12:00:00'))}</span>
       <h1>${esc(d.city)}</h1>
       <p>${esc(d.meta)}</p>
     </div>
   </article>
   <section class="section">
     <div class="section-head"><div><span class="eyebrow">PLAN DEL DÍA</span><h2>${esc(d.title)}</h2></div><button data-edit-day="${d.id}">Editar</button></div>
     <div class="day-agenda-photo">
       ${d.items.map((item,i)=>`<article>
         <div class="agenda-time">${esc(activityTime(item))}</div>
         <div class="agenda-line"><i></i></div>
         <div class="agenda-photo-card">
           <img src="./images/${photoForDay(d.id,i+1)}" alt="">
           <div><strong>${esc(activityTitle(item))}</strong><small>${i===0?'Comienza la aventura':i===d.items.length-1?'Última parada del día':'Siguiente experiencia'}</small></div>
         </div>
       </article>`).join('')}
     </div>
     <button class="complete-day-btn" data-complete-day="${d.id}">${state.journal[d.id]?.complete?'Día completado':'Marcar día como completado'}</button>
   </section>
 </section>`;
}

function girls(){
 const g=state.girl,data=missions[g],done=Object.values(state.girls[g]||{}).filter(Boolean).length;
 return `<section class="section"><div class="section-head"><div><span class="eyebrow">AVENTURAS</span><h2>Greta & Maria</h2></div></div><div class="girl-tabs"><button data-girl="greta" class="${g==='greta'?'active':''}">Greta</button><button data-girl="maria" class="${g==='maria'?'active':''}">Maria</button></div><div class="profile"><div class="profile-icon">${g==='greta'?'G':'M'}</div><div><strong>${g==='greta'?'Greta':'Maria'}</strong><span>${g==='greta'?'11 años · cultura y fotografía':'7 años · búsqueda y dibujo'}</span><span>${done} aventuras completadas</span></div></div>${data.map(([city,text],i)=>{const id=g+'-'+i,ok=!!state.girls[g]?.[id];return `<article class="mission ${ok?'done':''}" data-mission="${id}"><div class="mission-check">${ok?'✓':''}</div><div><strong>${city}</strong><span>${text}</span></div></article>`}).join('')}</section>`;
}
function journal(){
 const selected=state.modal?.day||state.days[0].id,d=state.days.find(x=>x.id===selected),e=state.journal[selected]||{};
 return `<section class="journal-photo-page">
   <article class="journal-photo-hero">
     <img src="./images/${photoForDay(d.id,1)}" alt="">
     <div class="journal-photo-overlay"></div>
     <div><span>${new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date(d.date+'T12:00:00'))}</span><h1>${esc(d.city)}</h1></div>
   </article>
   <section class="section">
     <div class="subtabs journal-days">${state.days.map(x=>`<button data-jday="${x.id}" class="${x.id===selected?'active':''}">${new Date(x.date+'T12:00:00').getDate()}</button>`).join('')}</div>
     <article class="journal-story-card">
       <label class="journal-photo-field"><span>Lo mejor del día</span><textarea data-jfield="best" data-day="${d.id}" placeholder="Las vistas, una comida, un momento juntos...">${esc(e.best||'')}</textarea></label>
       <label class="journal-photo-field"><span>Qué hemos aprendido</span><textarea data-jfield="learned" data-day="${d.id}" placeholder="Una historia, una curiosidad o algo que no sabíamos...">${esc(e.learned||'')}</textarea></label>
       <label class="journal-photo-field"><span>Qué repetiríamos</span><textarea data-jfield="repeat" data-day="${d.id}" placeholder="Ese lugar al que volveríamos sin dudar...">${esc(e.repeat||'')}</textarea></label>
       <label class="journal-photo-field score-field"><span>Valoración del día</span><select data-jfield="score" data-day="${d.id}"><option value="">Sin valorar</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${String(e.score)===String(n)?'selected':''}>${'★'.repeat(n)} · ${n}/5</option>`).join('')}</select></label>
     </article>
   </section>
 </section>`;
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
 const c=cities.find(x=>x.id===id);
 const related=state.days.filter(d=>d.city.toLowerCase().includes(c.name.toLowerCase())||d.title.toLowerCase().includes(c.name.toLowerCase()));
 const baseDay=related[0]||state.days[0];
 const imgs=[c.image,...dayPhotos(baseDay.id).slice(1),c.image].slice(0,5);
 return `<section class="city-photo-page">
   <article class="city-photo-hero">
     <img src="./images/${c.image}" alt="">
     <div class="city-photo-shade"></div>
     <button class="round-back" data-back>‹</button>
     <div class="city-photo-copy"><span>${c.days}</span><h1>${c.name}</h1><p>${c.subtitle}</p></div>
   </article>
   <section class="section">
     <p class="city-intro">${c.desc}</p>
     <div class="photo-gallery-grid">
       ${imgs.map((im,i)=>`<figure class="${i===0?'featured':''}"><img src="./images/${im}" alt=""><figcaption>${['Vista principal','Lugar imprescindible','Una parada especial','Detalle de la ciudad','Momento para recordar'][i]}</figcaption></figure>`).join('')}
     </div>
   </section>
   <section class="section">
     <div class="section-head"><div><span class="eyebrow">EXPERIENCIAS</span><h2>Qué vivir en ${c.name}</h2></div></div>
     <div class="experience-photo-list">
       ${(related.length?related:[baseDay]).flatMap(d=>d.items.slice(0,3).map((item,i)=>({d,item,i}))).slice(0,5).map(({d,item,i})=>`<article>
         <img src="./images/${photoForDay(d.id,i+1)}" alt="">
         <div><strong>${esc(activityTitle(item))}</strong><span>${esc(d.title)}</span><small>${esc(activityTime(item))}</small></div>
       </article>`).join('')}
     </div>
   </section>
 </section>`;
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
 document.querySelectorAll('[data-open-day]').forEach(b=>b.onclick=()=>{state.modal={dayPlan:b.dataset.openDay};app()});
 const closeDay=$('[data-close-day]');if(closeDay)closeDay.onclick=()=>{state.modal=null;app()};
 document.querySelectorAll('[data-complete-day]').forEach(b=>b.onclick=()=>{const id=b.dataset.completeDay;state.journal[id]={...(state.journal[id]||{}),complete:!state.journal[id]?.complete};put(LS.journal,state.journal);app()});

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

window.addEventListener('load',()=>{
  window.setTimeout(()=>{
    const splash=document.getElementById('splash');
    if(splash)splash.classList.add('hide');
  },1150);
});
