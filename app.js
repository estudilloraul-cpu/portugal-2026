
let DATA;
let deferredPrompt;
const views = [...document.querySelectorAll('.view')];
const navButtons = [...document.querySelectorAll('.bottomnav button')];

const storageKey = 'explorer-family-portugal-days-v1';

async function init(){
  DATA = await fetch('./data/trip.json').then(r => r.json());
  const saved = localStorage.getItem(storageKey);
  if(saved){
    try{ DATA.days = JSON.parse(saved); }catch(e){}
  }
  renderHome();
  renderDays();
  renderCards();
  renderSettings();
  bindNav();
  registerSW();
}

function showView(id){
  views.forEach(v => v.classList.toggle('active', v.id === id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.view === id));
  window.scrollTo({top:0, behavior:'smooth'});
}

function bindNav(){
  navButtons.forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
}

function renderHome(){
  const next = DATA.days[0];
  document.getElementById('homeView').innerHTML = `
    <section class="hero">
      <p class="eyebrow" style="color:#bae6fd">ROAD TRIP FAMILIAR</p>
      <h2 style="font-size:1.7rem">${DATA.trip.title}</h2>
      <p>${DATA.trip.subtitle}<br>${DATA.trip.travellers}</p>
      <button class="primary" id="todayBtn" type="button">Ver planificación</button>
    </section>
    <div class="grid">
      <div class="metric"><strong>${DATA.days.length}</strong><span>Días preparados</span></div>
      <div class="metric"><strong>${DATA.cards.length}</strong><span>Fichas disponibles</span></div>
      <div class="metric"><strong>Offline</strong><span>Tras la primera carga</span></div>
      <div class="metric"><strong>Editable</strong><span>Solo cambian los días</span></div>
    </div>
    <section style="margin-top:22px">
      <p class="eyebrow">PRIMERA ETAPA</p>
      <article class="card">
        <span class="code">${next.id}</span>
        <h2>${next.title}</h2>
        <p>${formatDate(next.date)} · ${next.distance}</p>
        <p class="muted">${next.summary}</p>
      </article>
    </section>
    <div class="notice">
      <strong>Versión inicial</strong>
      <p>Ya permite consultar fichas, trabajar sin conexión y modificar únicamente las tarjetas de los días. Lisboa es la primera ciudad cargada.</p>
    </div>`;
  document.getElementById('todayBtn').addEventListener('click',()=>showView('daysView'));
}

function renderDays(){
  const host = document.getElementById('daysView');
  host.innerHTML = `<p class="eyebrow">PLANIFICACIÓN</p><h2>Tarjetas de días</h2><p class="muted">Puedes editar horarios y actividades sin tocar las fichas detalladas.</p>`;
  DATA.days.forEach(day => {
    const node = document.getElementById('dayTemplate').content.cloneNode(true);
    node.querySelector('.code').textContent = day.id;
    node.querySelector('h2').textContent = day.title;
    node.querySelector('.summary').textContent = `${formatDate(day.date)} · ${day.summary}`;
    const chips = node.querySelector('.chips');
    [day.distance,day.duration].forEach(x=>{
      const s=document.createElement('span');s.className='chip';s.textContent=x;chips.appendChild(s);
    });
    const tl = node.querySelector('.timeline');
    day.items.forEach(item=>{
      const row=document.createElement('div');row.className='timeline-item';
      row.innerHTML=`<div class="time">${item.time}</div>
      <button type="button" class="ref-button ${item.ref?'has-ref':''}">${item.title}</button>`;
      if(item.ref) row.querySelector('button').addEventListener('click',()=>openCard(item.ref));
      tl.appendChild(row);
    });
    node.querySelector('.edit-day').addEventListener('click',()=>editDay(day.id));
    host.appendChild(node);
  });
}

function editDay(id){
  const day=DATA.days.find(d=>d.id===id);
  const host=document.getElementById('detailView');
  host.innerHTML=`
    <button class="ghost" id="backDays" type="button">← Volver</button>
    <p class="eyebrow" style="margin-top:18px">EDITAR ${day.id}</p>
    <h2>${day.title}</h2>
    <label>Título</label><input id="editTitle" type="text" value="${escapeHTML(day.title)}">
    <label>Resumen</label><input id="editSummary" type="text" value="${escapeHTML(day.summary)}">
    <label>Actividades</label>
    <div id="editorItems"></div>
    <button class="ghost" id="addItem" type="button">+ Añadir actividad</button>
    <button class="primary" id="saveDay" type="button" style="margin-left:8px">Guardar cambios</button>
    <button class="ghost danger" id="resetDays" type="button" style="display:block;margin-top:18px">Restaurar planificación original</button>`;
  const editor=document.getElementById('editorItems');
  const draft=JSON.parse(JSON.stringify(day.items));
  function draw(){
    editor.innerHTML='';
    draft.forEach((it,i)=>{
      const r=document.createElement('div');r.className='editor-row';
      r.innerHTML=`<input type="time" value="${it.time}">
      <input type="text" value="${escapeHTML(it.title)}">
      <button class="ghost danger" type="button">×</button>`;
      const inputs=r.querySelectorAll('input');
      inputs[0].addEventListener('input',e=>draft[i].time=e.target.value);
      inputs[1].addEventListener('input',e=>draft[i].title=e.target.value);
      r.querySelector('button').addEventListener('click',()=>{draft.splice(i,1);draw()});
      editor.appendChild(r);
    });
  }
  draw();
  document.getElementById('addItem').addEventListener('click',()=>{draft.push({time:'12:00',title:'Nueva actividad',ref:''});draw()});
  document.getElementById('saveDay').addEventListener('click',()=>{
    day.title=document.getElementById('editTitle').value.trim()||day.title;
    day.summary=document.getElementById('editSummary').value.trim();
    day.items=draft;
    localStorage.setItem(storageKey,JSON.stringify(DATA.days));
    renderHome();renderDays();showView('daysView');
  });
  document.getElementById('resetDays').addEventListener('click',()=>{
    localStorage.removeItem(storageKey);location.reload();
  });
  document.getElementById('backDays').addEventListener('click',()=>showView('daysView'));
  showView('detailView');
}

function renderCards(){
  const host=document.getElementById('cardsView');
  const zones=['Todos',...new Set(DATA.cards.map(c=>c.zone))];
  host.innerHTML=`<p class="eyebrow">DOSSIER</p><h2>Fichas de Lisboa</h2>
  <input id="searchCards" class="search" type="search" placeholder="Buscar: tranvía, castillo, niñas, comida…">
  <div class="filters">${zones.map((z,i)=>`<button class="filter ${i===0?'active':''}" data-zone="${z}" type="button">${z}</button>`).join('')}</div>
  <div id="cardList" class="card-list"></div>`;
  let activeZone='Todos';
  const search=document.getElementById('searchCards');
  const draw=()=>{
    const q=search.value.toLowerCase().trim();
    const filtered=DATA.cards.filter(c=>(activeZone==='Todos'||c.zone===activeZone)&&
      `${c.id} ${c.title} ${c.zone} ${c.detail} ${c.tags.join(' ')}`.toLowerCase().includes(q));
    const list=document.getElementById('cardList');
    list.innerHTML='';
    filtered.forEach(c=>{
      const a=document.createElement('article');a.className='card place-card';
      a.innerHTML=`<div class="place-icon">${c.icon}</div><div>
      <span class="code">${c.id}</span><h3>${c.title}</h3>
      <p class="muted">${c.zone}</p>
      <ul class="quick-list">${c.quick.map(x=>`<li>${x}</li>`).join('')}</ul>
      <button class="ghost" type="button">Ampliar ficha</button></div>`;
      a.querySelector('button').addEventListener('click',()=>openCard(c.id));
      list.appendChild(a);
    });
  };
  search.addEventListener('input',draw);
  host.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{
    activeZone=b.dataset.zone;
    host.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));
    draw();
  }));
  draw();
}

function openCard(id){
  const c=DATA.cards.find(x=>x.id===id); if(!c)return;
  const host=document.getElementById('detailView');
  host.innerHTML=`
    <button class="ghost" id="backCards" type="button">← Volver a fichas</button>
    <section class="detail-hero" style="margin-top:16px">
      <div class="detail-icon">${c.icon}</div>
      <span class="code">${c.id}</span>
      <h2>${c.title}</h2>
      <p class="muted">${c.city} · ${c.zone}</p>
      <div class="chips">${c.quick.map(x=>`<span class="chip">${x}</span>`).join('')}</div>
    </section>
    <article class="card" style="margin-top:14px">
      <h3>Información ampliada</h3>
      <p>${c.detail}</p>
      <div class="tags">${c.tags.map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
    </article>`;
  document.getElementById('backCards').addEventListener('click',()=>showView('cardsView'));
  showView('detailView');
}

function renderSettings(){
  document.getElementById('settingsView').innerHTML=`
    <p class="eyebrow">AJUSTES</p><h2>Aplicación y datos</h2>
    <article class="card">
      <h3>Funcionamiento sin conexión</h3>
      <p>Abre la web una vez con Internet. Después, el contenido básico quedará guardado en el dispositivo.</p>
    </article>
    <article class="card">
      <h3>Cambios de planificación</h3>
      <p>Las modificaciones de las tarjetas de días se guardan solo en este dispositivo. Las fichas del dossier no cambian.</p>
      <button class="ghost danger" id="clearLocal" type="button">Borrar cambios locales</button>
    </article>
    <article class="card">
      <h3>Compartir con otro móvil</h3>
      <p>Ambos podéis instalar la misma URL de GitHub Pages. Por ahora, los cambios locales no se sincronizan entre dispositivos.</p>
    </article>`;
  document.getElementById('clearLocal').addEventListener('click',()=>{
    localStorage.removeItem(storageKey);location.reload();
  });
}

function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js');
  }
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();deferredPrompt=e;
    const b=document.getElementById('installBtn');b.classList.remove('hidden');
    b.addEventListener('click',async()=>{deferredPrompt.prompt();await deferredPrompt.userChoice;b.classList.add('hidden')},{once:true});
  });
}

function formatDate(s){
  return new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date(s+'T12:00:00'));
}
function escapeHTML(s=''){
  return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
init();
