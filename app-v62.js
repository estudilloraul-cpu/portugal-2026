
const D=window.V6_DATA;
const LS={tab:'v6-tab',days:'bitacora-custom-days',journal:'bitacora-journal',expenses:'bitacora-expenses',checks:'bitacora-daily-checks',girls:'bitacora-girls-missions'};
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let S={tab:get(LS.tab,'today'),days:get(LS.days,D.trip),journal:get(LS.journal,{}),expenses:get(LS.expenses,[]),checks:get(LS.checks,{}),girls:get(LS.girls,{greta:{},maria:{}}),girl:'greta',screen:null,selectedDay:'D0',more:'expenses',edit:null};
const checks=['Ventanas cerradas','Claraboya cerrada','Cable eléctrico recogido','Calzos guardados','Mesa y sillas guardadas','Nevera bloqueada','WC y aguas revisados','Puertas y cajones cerrados'];
const cats=['Combustible','Peajes','Pernoctas','Supermercado','Restaurantes','Actividades','Transporte','Souvenirs'];
const $=q=>document.querySelector(q),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=n=>Number(n||0).toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const photos=id=>D.photoMap[id]||['hero.webp'];
const ph=(id,i=0)=>photos(id)[i%photos(id).length]||'hero.webp';
const tm=x=>x.split(' · ')[0], tx=x=>x.split(' · ').slice(1).join(' · ');

function current(){
 const now=new Date(),a=new Date('2026-08-10'),b=new Date('2026-08-19T23:59:59');
 if(now<a)return {mode:'before',day:S.days[0],left:Math.ceil((a-now)/86400000)};
 if(now>b)return {mode:'after',day:S.days[S.days.length-1]};
 const iso=now.toISOString().slice(0,10);return {mode:'during',day:S.days.find(d=>d.date===iso)||S.days[0]};
}
function top(){return `<header class="top"><button class="menu">☰</button><h1>VW 340<span>PORTUGAL 2026</span></h1><button class="bell">♢</button></header>`}
function nav(){return `<nav class="nav">${[['today','⌂','Hoy'],['route','⌖','Ruta'],['girls','☺','Greta & Maria'],['journal','▤','Bitácora'],['more','•••','Más']].map(([id,ic,l])=>`<button data-tab="${id}" class="${S.tab===id&&!S.screen?'active':''}"><i>${ic}</i><span>${l}</span></button>`).join('')}</nav>`}
function render(){
 let html=S.screen?.type==='city'?city(S.screen.id):S.screen?.type==='plan'?plan(S.screen.id):S.tab==='today'?today():S.tab==='route'?route():S.tab==='girls'?girls():S.tab==='journal'?journal():more();
 $('#app').innerHTML=`<div class="app">${top()}<main class="main">${html}</main>${nav()}${S.edit?editModal():''}</div>`;bind();
}
function today(){
 const c=current(),d=c.day,i=Math.max(0,S.days.findIndex(x=>x.id===d.id)),next=S.days[Math.min(i+1,S.days.length-1)],e=S.journal[d.id]||{};
 return `<article class="photo-hero"><img src="./images/${d.image}"><div class="copy"><span class="chip">${c.mode==='during'?`Día ${i+1} · ${new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long'}).format(new Date(d.date+'T12:00:00'))}`:'PORTUGAL 2026'}</span><h2>${c.mode==='before'?`Faltan ${c.left} días`:d.city}</h2><p>${d.title}</p><button class="primary" data-plan="${d.id}">Ver plan del día ›</button></div></article>
 <section class="section"><div class="head"><h2>Resumen del viaje</h2></div><div class="metrics"><div class="metric"><i>⌖</i><b>2.640 km</b><span>Recorrido</span></div><div class="metric"><i>□</i><b>10 días</b><span>10–19 agosto</span></div><div class="metric"><i>♜</i><b>8 ciudades</b><span>Por descubrir</span></div><div class="metric"><i>✥</i><b>64 misiones</b><span>Greta & Maria</span></div></div></section>
 <section class="section"><div class="head"><h2>Próxima parada</h2></div><article class="next" data-plan="${next.id}"><img src="./images/${next.image}"><div><strong>${next.city}</strong><span>${next.date}</span><p>${next.meta}</p></div><b>›</b></article></section>
 <section class="section"><div class="head"><div><span class="eyebrow">DESTINOS</span><h2>Explora el viaje</h2></div></div><div class="city-row">${D.cities.map(c=>`<article class="city-card" data-city="${c.id}"><img src="./images/${c.image}"><div><span class="eyebrow">${c.days}</span><h3>${c.name}</h3><strong>${c.subtitle}</strong><p>${c.desc}</p></div></article>`).join('')}</div></section>`;
}
function route(){
 const c=current();
 return `<article class="route-cover"><img src="./images/${ph(c.day.id)}"><div class="cover-copy"><span class="eyebrow">RUTA PORTUGAL 2026</span><h2>10 días por carretera</h2><p>2.640 km · 8 ciudades · recuerdos en familia</p></div></article>
 <section class="section"><div class="head"><div><span class="eyebrow">ITINERARIO</span><h2>La ruta, día a día</h2></div></div><div class="timeline">${S.days.map((d,i)=>`<article class="route-card"><img src="./images/${ph(d.id)}"><div class="route-body"><div class="route-date"><span>Día ${i+1}</span><span>${d.date}</span></div><h3>${d.title}</h3><p>${d.meta}</p><div class="mini">${d.items.slice(0,3).map((x,n)=>`<div><img src="./images/${ph(d.id,n+1)}"><span><b>${tm(x)}</b>${tx(x)}</span></div>`).join('')}</div><div class="actions"><button data-edit="${d.id}">Editar</button><button data-plan="${d.id}">Ver plan completo</button></div></div></article>`).join('')}</div></section>`;
}
function plan(id){
 const d=S.days.find(x=>x.id===id);
 return `<article class="plan-cover"><img src="./images/${ph(id)}"><button class="back" data-back>‹</button><div class="cover-copy"><span>${d.date}</span><h2>${d.city}</h2><p>${d.meta}</p></div></article>
 <section class="section"><div class="head"><div><span class="eyebrow">PLAN DEL DÍA</span><h2>${d.title}</h2></div><button data-edit="${d.id}">Editar</button></div><div class="plan-list">${d.items.map((x,i)=>`<article><div class="plan-time">${tm(x)}</div><div class="plan-line"><i></i></div><div class="plan-item"><img src="./images/${ph(id,i+1)}"><div><strong>${tx(x)}</strong><small>${i===0?'Comienza la aventura':i===d.items.length-1?'Última parada del día':'Siguiente experiencia'}</small></div></div></article>`).join('')}</div><button class="primary dark" data-complete="${d.id}">${S.journal[id]?.complete?'Día completado':'Marcar día como completado'}</button></section>`;
}
function city(id){
 const c=D.cities.find(x=>x.id===id);
 return `<article class="city-cover"><img src="./images/${c.image}"><button class="back" data-back>‹</button><div class="cover-copy"><span>${c.days}</span><h2>${c.name}</h2><p>${c.subtitle}</p></div></article><section class="section"><p class="muted">${c.desc}</p><div class="gallery">${c.gallery.map((g,i)=>`<figure><img src="./images/${g}"><figcaption>${['Vista principal','Lugar imprescindible','Una parada especial','Detalle de la ciudad','Momento para recordar'][i]||'Descubre más'}</figcaption></figure>`).join('')}</div></section>`;
}
function girls(){
 const g=S.girl,done=Object.values(S.girls[g]||{}).filter(Boolean).length;
 return `<section class="section"><div class="head"><div><span class="eyebrow">AVENTURAS</span><h2>Greta & Maria</h2></div></div><div class="missions-tabs"><button data-girl="greta" class="${g==='greta'?'active':''}">Greta</button><button data-girl="maria" class="${g==='maria'?'active':''}">Maria</button></div><div class="profile"><div class="avatar">${g==='greta'?'G':'M'}</div><div><strong>${g==='greta'?'Greta':'Maria'}</strong><div class="muted">${g==='greta'?'11 años · cultura y fotografía':'7 años · búsqueda y dibujo'}</div><small>${done} aventuras completadas</small></div></div>${D.missions[g].map(([city,text],i)=>{const id=g+'-'+i,ok=!!S.girls[g]?.[id];return `<article class="mission ${ok?'done':''}" data-mission="${id}"><div class="tick">${ok?'✓':''}</div><div><strong>${city}</strong><span>${text}</span></div></article>`}).join('')}</section>`;
}
function journal(){
 const d=S.days.find(x=>x.id===S.selectedDay)||S.days[0],e=S.journal[d.id]||{};
 return `<article class="journal-cover"><img src="./images/${ph(d.id,1)}"><div class="cover-copy"><span>${d.date}</span><h2>${d.city}</h2></div></article><section class="section"><div class="days-tabs">${S.days.map(x=>`<button data-jday="${x.id}" class="${x.id===d.id?'active':''}">${new Date(x.date+'T12:00:00').getDate()}</button>`).join('')}</div><div class="journal-card"><label class="journal-field"><span>Lo mejor del día</span><textarea data-j="${d.id}" data-f="best">${esc(e.best||'')}</textarea></label><label class="journal-field"><span>Qué hemos aprendido</span><textarea data-j="${d.id}" data-f="learned">${esc(e.learned||'')}</textarea></label><label class="journal-field"><span>Qué repetiríamos</span><textarea data-j="${d.id}" data-f="repeat">${esc(e.repeat||'')}</textarea></label><label class="journal-field"><span>Valoración del día</span><select data-j="${d.id}" data-f="score"><option value="">Sin valorar</option>${[1,2,3,4,5].map(n=>`<option value="${n}" ${String(e.score)===String(n)?'selected':''}>${'★'.repeat(n)} · ${n}/5</option>`).join('')}</select></label></div></section>`;
}
function more(){
 const total=S.expenses.reduce((a,b)=>a+Number(b.amount||0),0);
 return `<section class="section"><div class="head"><div><span class="eyebrow">HERRAMIENTAS</span><h2>Más</h2></div></div><div class="more-tabs"><button data-more="expenses" class="${S.more==='expenses'?'active':''}">Gastos</button><button data-more="checks" class="${S.more==='checks'?'active':''}">Checklist</button><button data-more="backup" class="${S.more==='backup'?'active':''}">Copia</button></div>${S.more==='expenses'?expenses(total):S.more==='checks'?checkView():backup()}</section>`;
}
function expenses(total){return `<div class="tool-card"><h3>Gasto registrado: ${money(total)}</h3><label class="field">Fecha<input id="ex-date" type="date" value="2026-08-10"></label><label class="field">Categoría<select id="ex-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></label><label class="field">Importe (€)<input id="ex-amount" type="number"></label><label class="field">Nota<input id="ex-note"></label><button class="primary dark" id="add-exp">Guardar gasto</button></div><div class="tool-card">${S.expenses.map(e=>`<div class="expense"><div><strong>${e.note||e.category}</strong><small>${e.date} · ${e.category}</small></div><span>${money(e.amount)}</span><button data-del="${e.id}">×</button></div>`).join('')||'<p class="muted">Todavía no hay gastos.</p>'}</div>`}
function checkView(){return `<div class="tool-card">${checks.map(x=>`<label class="check"><input type="checkbox" data-check="${x}" ${S.checks[x]?'checked':''}><span>${x}</span></label>`).join('')}</div>`}
function backup(){return `<div class="tool-card"><p class="muted">Incluye itinerario, diario, gastos, misiones y checklist.</p><button class="primary dark" id="export">Exportar datos</button><label class="primary" style="display:inline-block">Importar<input id="import" hidden type="file" accept="application/json"></label></div>`}
function editModal(){
 const d=S.days.find(x=>x.id===S.edit);
 return `<div class="modal"><div><div class="head"><h2>Editar jornada</h2><button data-close>×</button></div><label class="field">Título<input id="ed-title" value="${esc(d.title)}"></label><label class="field">Resumen<input id="ed-meta" value="${esc(d.meta)}"></label>${d.items.map((x,i)=>`<label class="field">Actividad ${i+1}<input data-item="${i}" value="${esc(x)}"></label>`).join('')}<button class="primary dark" id="save">Guardar cambios</button></div></div>`;
}
function bind(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;S.screen=null;put(LS.tab,S.tab);render()});
 document.querySelectorAll('[data-city]').forEach(b=>b.onclick=()=>{S.screen={type:'city',id:b.dataset.city};render()});
 document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{S.screen={type:'plan',id:b.dataset.plan};render()});
 const back=$('[data-back]');if(back)back.onclick=()=>{S.screen=null;render()};
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{S.edit=b.dataset.edit;render()});
 const close=$('[data-close]');if(close)close.onclick=()=>{S.edit=null;render()};
 const save=$('#save');if(save)save.onclick=()=>{const d=S.days.find(x=>x.id===S.edit);d.title=$('#ed-title').value;d.meta=$('#ed-meta').value;document.querySelectorAll('[data-item]').forEach(x=>d.items[Number(x.dataset.item)]=x.value);put(LS.days,S.days);S.edit=null;render()};
 document.querySelectorAll('[data-complete]').forEach(b=>b.onclick=()=>{const id=b.dataset.complete;S.journal[id]={...(S.journal[id]||{}),complete:!S.journal[id]?.complete};put(LS.journal,S.journal);render()});
 document.querySelectorAll('[data-girl]').forEach(b=>b.onclick=()=>{S.girl=b.dataset.girl;render()});
 document.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{const id=b.dataset.mission;S.girls[S.girl]={...(S.girls[S.girl]||{}),[id]:!S.girls[S.girl]?.[id]};put(LS.girls,S.girls);render()});
 document.querySelectorAll('[data-jday]').forEach(b=>b.onclick=()=>{S.selectedDay=b.dataset.jday;render()});
 document.querySelectorAll('[data-j]').forEach(x=>x.oninput=()=>{const id=x.dataset.j;S.journal[id]={...(S.journal[id]||{}),[x.dataset.f]:x.value};put(LS.journal,S.journal)});
 document.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>{S.more=b.dataset.more;render()});
 const add=$('#add-exp');if(add)add.onclick=()=>{const amount=$('#ex-amount').value;if(!amount)return;S.expenses.push({id:Date.now(),date:$('#ex-date').value,category:$('#ex-cat').value,amount,note:$('#ex-note').value});put(LS.expenses,S.expenses);render()};
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.expenses=S.expenses.filter(e=>String(e.id)!==b.dataset.del);put(LS.expenses,S.expenses);render()});
 document.querySelectorAll('[data-check]').forEach(x=>x.onchange=()=>{S.checks[x.dataset.check]=x.checked;put(LS.checks,S.checks)});
 const exp=$('#export');if(exp)exp.onclick=()=>{const blob=new Blob([JSON.stringify({version:'6.0.0',days:S.days,journal:S.journal,expenses:S.expenses,checks:S.checks,girls:S.girls},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='vw340-portugal-v6.json';a.click();URL.revokeObjectURL(u)};
 const imp=$('#import');if(imp)imp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);['days','journal','expenses','checks','girls'].forEach(k=>{if(d[k]!=null){S[k]=d[k];put(LS[k],d[k])}});render()}catch{alert('Archivo no válido')}};r.readAsText(f)};
}
try {
  render();
  window.setTimeout(function(){
    var splash=document.getElementById('splash');
    if(splash){ splash.classList.add('hide'); window.setTimeout(function(){ if(splash.parentNode)splash.parentNode.removeChild(splash); },500); }
  },250);
} catch (error) {
  console.error(error);
  var splash=document.getElementById('splash');
  if(splash && splash.parentNode)splash.parentNode.removeChild(splash);
  var app=document.getElementById('app');
  if(app){
    app.innerHTML='<main class="startup-error"><h1>VW 340</h1><h2>No se ha podido iniciar la aplicación</h2><p>La web se ha publicado, pero falta algún archivo. Comprueba que has subido todo el contenido de la carpeta deploy.</p><button onclick="location.reload()">Volver a cargar</button></main>';
  }
}

