/* ── THEME ── */
function toggleTheme(){
  const d=document.documentElement.classList.toggle('dark');
  document.getElementById('theme-btn').textContent=d?'☀️':'🌙';
  localStorage.setItem('leo-theme',d?'dark':'light');
}
function initTheme(){
  if(localStorage.getItem('leo-theme')==='dark'){
    document.documentElement.classList.add('dark');
    document.getElementById('theme-btn').textContent='☀️';
  }
}

/* ── DATA ── */
async function loadData(){
  try{ const r=await fetch('contenido.json'); window.DATA=await r.json(); }
  catch(e){ window.DATA=fallback(); }
  if(!DATA.proyectos) DATA.proyectos=[];
  DATA.miembros.forEach(m=>{
    if(!m.tipo) m.tipo='activo';
    if(!m.orcid) m.orcid='';
    if(!m.año_inicio) m.año_inicio=null;
    if(!m.año_fin) m.año_fin=null;
    if(!m.posicion_actual) m.posicion_actual='';
    // Migrate old free-text periodo field (e.g. "2018 – 2022") to numeric fields
    if(m.periodo && (!m.año_inicio && !m.año_fin)){
      const match=m.periodo.match(/(\d{4})\s*[–\-]\s*(\d{4})/);
      if(match){ m.año_inicio=parseInt(match[1]); m.año_fin=parseInt(match[2]); }
      else { const solo=m.periodo.match(/(\d{4})/); if(solo) m.año_inicio=parseInt(solo[1]); }
    }
  });
  renderSite();
}

function fallback(){
  return{laboratorio:{logo:'',nombre:"Laboratorio de Espectroscopía Óptica",sigla:"LEO",
    institucion:"Escuela Politécnica Nacional",ciudad:"Quito, Ecuador",
    descripcion_corta:"Espectroscopía láser, LIBS y MALDI-TOF para el estudio de la materia.",
    descripcion_larga:"El LEO investiga la interacción entre la radiación y la materia.",
    estadisticas:{publicaciones:"30+",investigadores:"6",proyectos:"4",años:"30+"},
    contacto:{email:"cesar.costa@epn.edu.ec",edificio:"Dpto. Física y Astronomía",
      direccion:"Ladrón de Guevara E11-253",telefono:"+593 2 2567846",web:"www.epn.edu.ec"},
    patrocinadores:["EPN","SENESCYT","Humboldt Foundation"]},
    noticias:[],investigacion:[],proyectos:[],miembros:[],publicaciones:[]};
}

/* ── RENDER SITE ── */
function renderSite(){
  const L=DATA.laboratorio;
  const ft=`© ${new Date().getFullYear()} ${L.nombre} · ${L.institucion} · ${L.ciudad}`;
  document.querySelectorAll('[id^="ft"]').forEach(el=>el.textContent=ft);
  const b=document.getElementById('nav-badge');
  b.innerHTML=L.logo?`<img src="${L.logo}" alt="logo"/>`:`<span>${L.sigla||'LEO'}</span>`;
  document.getElementById('nav-sub').textContent=`${L.sigla||'LEO'} · EPN`;
  document.getElementById('hero-eyebrow').textContent=`${L.institucion} · ${L.ciudad}`;
  document.getElementById('hero-desc').textContent=L.descripcion_corta;
  const s=L.estadisticas;
  document.getElementById('hero-stats').innerHTML=
    [{n:s.publicaciones,l:'Publicaciones'},{n:s.investigadores,l:'Investigadores'},
     {n:s.proyectos,l:'Proyectos'},{n:s.años,l:'Años'}]
    .map(x=>`<div class="stat-item"><div class="stat-num">${x.n}</div><div class="stat-lbl">${x.l}</div></div>`).join('');
  document.getElementById('about-desc').textContent=L.descripcion_larga;
  document.getElementById('about-stats').innerHTML=
    [{n:s.publicaciones,l:'Publicaciones'},{n:s.investigadores,l:'Investigadores'},
     {n:s.proyectos,l:'Proyectos activos'},{n:s.años,l:'Años de trayectoria'}]
    .map(x=>`<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.5rem;text-align:center;">
      <div style="font-family:var(--heading);font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--cyan),var(--violet-bright));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${x.n}</div>
      <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:.3rem;">${x.l}</div>
    </div>`).join('');
  renderCarousel(); renderNews(); renderResearch(); renderProjects();
  renderMembers(); renderPublications(); renderContact();
  const je=document.getElementById('join-email');
  if(je){je.href=`mailto:${L.contacto.email}`;je.textContent=L.contacto.email;}
}

/* ── CAROUSEL ── */
const rIcons=[
  `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
  `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>`,
  `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>`
];
let carouselIdx=0, carouselTimer=null;
function renderCarousel(){
  const items=DATA.investigacion;
  if(!items.length){document.getElementById('carousel-wrap').innerHTML='<div style="padding:2rem;text-align:center;color:var(--muted);font-size:.88rem;">Sin áreas de investigación.</div>';return;}
  document.getElementById('carousel-track').innerHTML=items.map((item,i)=>{
    const img=item.imagen
      ?`<img src="${item.imagen}" style="width:100%;height:200px;object-fit:cover;" alt="${item.titulo}"/>`
      :`<div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;background:var(--bg2);color:var(--cyan);">${rIcons[i%rIcons.length]}</div>`;
    return`<div class="carousel-slide"><div class="carousel-img-wrap">${img}</div><div class="carousel-body"><p class="carousel-tag">Área de investigación</p><p class="carousel-title">${item.titulo}</p></div></div>`;
  }).join('');
  document.getElementById('carousel-dots').innerHTML=items.map((_,i)=>
    `<button class="carousel-dot ${i===0?'active':''}" onclick="carouselGo(${i})"></button>`).join('');
  carouselIdx=0; clearInterval(carouselTimer); carouselTimer=setInterval(carouselNext,4000);
}
function carouselGo(i){
  const n=DATA.investigacion.length; if(!n) return;
  carouselIdx=(i+n)%n;
  document.getElementById('carousel-track').style.transform=`translateX(-${carouselIdx*100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d,j)=>d.classList.toggle('active',j===carouselIdx));
  clearInterval(carouselTimer); carouselTimer=setInterval(carouselNext,4000);
}
function carouselNext(){carouselGo(carouselIdx+1)}
function carouselPrev(){carouselGo(carouselIdx-1)}

/* ── NEWS ── */
function newsCardHTML(n){
  const img=n.imagen
    ?`<img src="${n.imagen}" class="news-card-img" alt="${n.titulo}"/>`
    :`<div class="news-card-img-placeholder">📰</div>`;
  return`<div class="news-card">${img}<div class="news-card-body"><span class="news-tag-pill">${n.tag}</span><h3>${n.titulo}</h3><p>${n.descripcion}</p><p class="news-date">${n.fecha}</p></div></div>`;
}
function renderNews(){
  document.getElementById('home-news').innerHTML=DATA.noticias.slice(0,3).map(newsCardHTML).join('')||'<p style="color:var(--muted);font-size:.88rem;">Sin noticias recientes.</p>';
  document.getElementById('all-news').innerHTML=DATA.noticias.map(newsCardHTML).join('')||'<p style="color:var(--muted);font-size:.88rem;">Sin noticias aún.</p>';
}

/* ── RESEARCH ── */
function renderResearch(){
  document.getElementById('research-grid').innerHTML=DATA.investigacion.map((item,i)=>{
    const img=item.imagen
      ?`<img src="${item.imagen}" class="research-card-img" alt="${item.titulo}" style="height:170px;object-fit:cover;width:100%;"/>`
      :`<div class="research-card-img" style="height:170px;background:var(--bg2);color:var(--cyan);">${rIcons[i%rIcons.length]}</div>`;
    return`<div class="research-card">${img}<div class="research-card-body"><h3>${item.titulo}</h3><p>${item.descripcion}</p><div class="tag-row">${item.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div></div>`;
  }).join('');
}

/* ── PROJECTS ── */
let projectFilter='todos';
function filterProjects(f,btn){
  projectFilter=f;
  document.querySelectorAll('#project-filter-btns .pub-source-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProjectsList();
}
function renderProjects(){renderProjectsList();}
function renderProjectsList(){
  const items=DATA.proyectos.filter(p=>projectFilter==='todos'||p.estado===projectFilter);
  document.getElementById('projects-list').innerHTML=items.length
    ?items.map(projectCardHTML).join('')
    :'<p style="color:var(--muted);font-size:.88rem;">Sin proyectos en esta categoría.</p>';
}
function projectCardHTML(p){
  const img=p.imagen
    ?`<img src="${p.imagen}" style="width:220px;min-height:160px;object-fit:cover;" alt="${p.titulo}"/>`
    :`<div class="project-card-img" style="font-size:2.5rem;opacity:.2;">🔬</div>`;
  const status=p.estado==='activo'
    ?'<span class="project-status active">En curso</span>'
    :'<span class="project-status completed">Completado</span>';
  const periodo=p.inicio?(p.fin?`${p.inicio} – ${p.fin}`:p.inicio):'';
  return`<div class="project-card"><div class="project-card-inner">
    <div class="project-card-img">${img}</div>
    <div class="project-card-body">${status}<h3>${p.titulo}</h3><p>${p.descripcion}</p>
      <div class="project-meta">
        ${p.financiador?`<span>💰 ${p.financiador}</span>`:''}
        ${periodo?`<span>📅 ${periodo}</span>`:''}
        ${p.investigadorPrincipal?`<span>👤 ${p.investigadorPrincipal}</span>`:''}
      </div>
    </div>
  </div></div>`;
}

/* ── MEMBERS ── */
const orcidSVG=(size=14)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#a6ce39"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-1.374 4.306a1.177 1.177 0 110 2.353 1.177 1.177 0 010-2.353zM9.21 8.123h1.897v8.02H9.21zm3.382 0h3.196c3.041 0 4.29 2.181 4.29 4.01 0 2.045-1.59 4.01-4.223 4.01h-3.263zm1.897 1.498v5.023h1.185c1.614 0 2.475-1.048 2.475-2.518 0-1.48-.883-2.505-2.47-2.505z"/></svg>`;

function switchMembersTab(tab,btn){
  document.querySelectorAll('.members-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.members-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('members-'+tab).classList.add('active');
}
function renderMembers(){
  const activos=DATA.miembros.filter(m=>m.tipo!=='alumni');
  const alumni=DATA.miembros.filter(m=>m.tipo==='alumni');
  const cats=[{k:'investigador',l:'Investigadores'},{k:'posgrado',l:'Estudiantes de posgrado'},{k:'pregrado',l:'Estudiantes de pregrado'}];
  document.getElementById('members-activos').innerHTML=cats.map(c=>{
    const ms=activos.filter(m=>m.categoria===c.k); if(!ms.length) return '';
    return`<p class="members-group-label">${c.l}</p><div class="members-grid">${ms.map(memberCardHTML).join('')}</div>`;
  }).join('')||'<p style="color:var(--muted);font-size:.88rem;">Sin miembros activos.</p>';
  document.getElementById('members-alumni-panel').innerHTML=alumni.length
    ?`<div class="alumni-grid">${alumni.map(alumniCardHTML).join('')}</div>`
    :'<p style="color:var(--muted);font-size:.88rem;">Sin alumni registrados aún.</p>';
}
function memberCardHTML(m){
  const photo=m.foto?`<img src="${m.foto}" class="member-photo" alt="${m.nombre}"/>`:`<div class="member-photo-placeholder"></div>`;
  const orcidLink=m.orcid?`<a href="https://orcid.org/${m.orcid}" target="_blank" class="member-orcid">${orcidSVG(14)} ORCID</a>`:'';
  return`<div class="member-card">${photo}<div class="member-card-body"><div class="avatar-ring"><span>${m.iniciales}</span></div><p class="member-name">${m.nombre}</p><p class="member-role">${m.rol}</p>${m.especialidad?`<p class="member-spec">${m.especialidad}</p>`:''}${orcidLink}</div></div>`;
}
function alumniCardHTML(m){
  const av=m.foto?`<img src="${m.foto}" style="width:100%;height:100%;object-fit:cover;" alt="${m.nombre}"/>`:`<span>${m.iniciales}</span>`;
  const orcidLink=m.orcid?`<a href="https://orcid.org/${m.orcid}" target="_blank" class="member-orcid" style="margin-top:.3rem;">${orcidSVG(12)} ORCID</a>`:'';
  const periodoStr=m.año_inicio?(m.año_fin?`${m.año_inicio} – ${m.año_fin}`:`desde ${m.año_inicio}`):'';
  const periodoBadge=periodoStr?`<span style="font-size:.7rem;background:rgba(109,40,217,.1);color:var(--violet-bright);border:1px solid rgba(109,40,217,.2);border-radius:100px;padding:.1rem .6rem;margin-left:.5rem;">${periodoStr}</span>`:'';
  const posicion=m.posicion_actual?`<p class="alumni-info" style="font-style:italic;margin-top:.15rem;">↗ ${m.posicion_actual}</p>`:'';
  return`<div class="alumni-card"><div class="alumni-avatar">${av}</div><div style="flex:1;min-width:0;"><p class="alumni-name">${m.nombre}${periodoBadge}</p><p class="alumni-info">${m.rol||''}${m.especialidad?' · '+m.especialidad:''}</p>${posicion}${orcidLink}</div></div>`;
}

/* ── PUBLICATIONS ── */
let orcidPubsLoaded=false;
function switchPubTab(tab,btn){
  document.querySelectorAll('.pub-source-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.pub-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('pub-'+tab).classList.add('active');
  if(tab==='orcid'&&!orcidPubsLoaded) loadOrcidPubs();
}
function renderPublications(){
  const years=[...new Set(DATA.publicaciones.map(p=>p.año))].sort((a,b)=>b-a);
  document.getElementById('pub-manual').innerHTML=years.map(y=>
    `<p class="pub-year">${y}</p>${DATA.publicaciones.filter(p=>p.año===y).map(p=>
      `<div class="pub-item"><h4>${p.titulo}</h4><p class="pub-authors">${p.autores}</p><p class="pub-journal">${p.revista}</p></div>`
    ).join('')}`).join('')||'<p style="color:var(--muted);font-size:.88rem;">Sin publicaciones manuales aún.</p>';
  const orcidMembers=DATA.miembros.filter(m=>m.orcid);
  document.getElementById('orcid-tab-btn').textContent=orcidMembers.length
    ?`Desde ORCID (${orcidMembers.length} miembro${orcidMembers.length>1?'s':''})`
    :'Desde ORCID';
  orcidPubsLoaded=false;
  // Auto-load ORCID tab by default
  const orcidBtn=document.getElementById('orcid-tab-btn');
  const manualBtn=document.querySelector('.pub-source-tab');
  if(orcidBtn && manualBtn){
    manualBtn.classList.remove('active');
    orcidBtn.classList.add('active');
    document.getElementById('pub-manual').classList.remove('active');
    document.getElementById('pub-orcid').classList.add('active');
    loadOrcidPubs();
  }
}
async function loadOrcidPubs(){
  const members=DATA.miembros.filter(m=>m.orcid);
  const container=document.getElementById('pub-orcid');
  if(!members.length){
    container.innerHTML='<p style="color:var(--muted);font-size:.88rem;">Ningún miembro tiene ORCID iD configurado. Edítalo desde el panel admin.</p>';
    orcidPubsLoaded=true; return;
  }
  container.innerHTML=`<div class="orcid-loading"><span class="orcid-spin"></span>Cargando publicaciones desde ORCID…</div>`;

  const hdrs={Accept:'application/json'};
  // key → {title, year, journal, doi, authors:string, labAuthorNames:[]}
  const worksMap=new Map();
  // Set of lab member last names (lowercase) for highlighting
  const labLastNames=new Set(
    members.map(m=>m.nombre.trim().split(/\s+/).pop().toLowerCase())
  );

  for(const m of members){
    const yearStart=m.año_inicio?parseInt(m.año_inicio):null;
    const yearEnd=m.tipo==='alumni'&&m.año_fin?parseInt(m.año_fin):null;
    try{
      const r=await fetch(`https://pub.orcid.org/v3.0/${m.orcid}/works`,{headers:hdrs});
      if(!r.ok) continue;
      const data=await r.json();

      for(const g of (data.group||[])){
        const s=g['work-summary']?.[0]; if(!s) continue;
        const title=s.title?.title?.value||'Sin título';
        const year=parseInt(s['publication-date']?.year?.value)||0;
        if(year===0) continue;
        if(yearStart&&year<yearStart) continue;
        if(yearEnd&&year>yearEnd) continue;

        const doi=(s['external-ids']?.['external-id']||[])
          .find(e=>e['external-id-type']==='doi')?.['external-id-value']||'';
        const key=doi?`doi:${doi.toLowerCase().trim()}`:`title:${title.toLowerCase().trim()}`;

        if(worksMap.has(key)){
          // Already have the full record — just register this lab member
          const ex=worksMap.get(key);
          if(!ex.labAuthorNames.includes(m.nombre)) ex.labAuthorNames.push(m.nombre);
          continue;
        }

        // Fetch the full work record to get the complete contributor list
        const putCode=s['put-code'];
        let authors='';
        let journal=s['journal-title']?.value||'';
        if(putCode){
          try{
            const wr=await fetch(`https://pub.orcid.org/v3.0/${m.orcid}/work/${putCode}`,{headers:hdrs});
            if(wr.ok){
              const wd=await wr.json();
              journal=wd['journal-title']?.value||journal;
              const contribs=wd.contributors?.contributor||[];
              if(contribs.length){
                authors=contribs
                  .map(c=>{
                    // credit-name is the preferred field; fall back to ORCID path
                    return c['credit-name']?.value||c['contributorOrcid']?.path||'';
                  })
                  .filter(Boolean)
                  .join(', ');
              }
            }
          }catch(_){}
        }

        worksMap.set(key,{title,year,journal,doi,authors,labAuthorNames:[m.nombre]});
      }
    }catch(e){console.warn('ORCID error',m.orcid,e);}
  }

  const allWorks=[...worksMap.values()];
  if(!allWorks.length){
    container.innerHTML='<p style="color:var(--muted);font-size:.88rem;">No se encontraron publicaciones en el período de estancia. Verifica que los perfiles ORCID tengan visibilidad pública y que el año de ingreso esté configurado.</p>';
    orcidPubsLoaded=true; return;
  }

  allWorks.sort((a,b)=>b.year-a.year);
  const years=[...new Set(allWorks.map(w=>w.year))].filter(y=>y>0).sort((a,b)=>b-a);

  container.innerHTML=years.map(y=>`
    <p class="pub-year">${y}</p>
    ${allWorks.filter(w=>w.year===y).map(w=>{
      let authorLine='';
      if(w.authors){
        // Highlight any author whose last name matches a lab member
        authorLine=w.authors.split(', ').map(a=>{
          const aLast=a.trim().split(/\s+/).pop().toLowerCase();
          return labLastNames.has(aLast)?`<strong>${a}</strong>`:a;
        }).join(', ');
      } else if(w.labAuthorNames.length){
        // No contributor list from ORCID — fall back to lab members only
        authorLine=w.labAuthorNames.map(a=>`<strong>${a}</strong>`).join(', ');
      }
      return`<div class="pub-item">
        <h4>${w.title}</h4>
        ${authorLine?`<p class="pub-authors">${authorLine}</p>`:''}
        ${w.journal?`<p class="pub-journal">${w.journal}</p>`:''}
        ${w.doi?`<a href="https://doi.org/${w.doi}" target="_blank" class="pub-doi">DOI: ${w.doi}</a>`:''}
      </div>`;
    }).join('')}`).join('');
  orcidPubsLoaded=true;
}

/* ── CONTACT ── */
function renderContact(){
  const L=DATA.laboratorio,C=L.contacto;
  document.getElementById('contact-wrap').innerHTML=`
    <div class="contact-block"><h4>${L.nombre}</h4><a href="mailto:${C.email}">${C.email}</a><p>${C.telefono||''}</p><p>${C.edificio}</p><p>${L.institucion}</p><p>${C.direccion}</p></div>
    <div class="contact-block"><h4>Departamento de Física y Astronomía</h4><a href="https://${C.web}">${C.web}</a><p>${L.institucion}</p><p>${L.ciudad}</p></div>
    <div class="contact-block"><h4>¿Te interesa unirte?</h4><p>Aceptamos estudiantes e investigadores con interés en espectroscopía óptica.</p><a href="mailto:${C.email}" style="margin-top:.8rem;color:var(--cyan);">Escríbenos →</a></div>`;
  document.getElementById('sponsors-list').innerHTML=L.patrocinadores.map(s=>`<span class="sponsor-pill">${s}</span>`).join('');
}

/* ── NAV ── */
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const b=document.getElementById('nav-'+id); if(b) b.classList.add('active');
  // Close mobile menu if open
  closeMenu();
  window.scrollTo(0,0);
}

function toggleMenu(){
  const drawer=document.getElementById('mobile-drawer');
  const overlay=document.getElementById('drawer-overlay');
  const ham=document.getElementById('hamburger');
  const isOpen=drawer.classList.toggle('open');
  overlay.classList.toggle('show',isOpen);
  ham.classList.toggle('open',isOpen);
  document.body.style.overflow=isOpen?'hidden':'';
}
function closeMenu(){
  document.getElementById('mobile-drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('show');
  document.getElementById('hamburger')?.classList.remove('open');
  document.body.style.overflow='';
}

// Show hamburger only via matchMedia — no flash on desktop
function initResponsive(){
  // hamburger visibility is now handled purely by CSS @media
  // This function just wires up resize listener to close menu when going back to desktop
  const mq=window.matchMedia('(max-width:640px)');
  const update=()=>{ if(!mq.matches) closeMenu(); };
  mq.addEventListener('change',update);
}

// Remove old initMobileAdminLink — admin button is now in drawer HTML directly
function initMobileAdminLink(){}
