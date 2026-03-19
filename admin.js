/* ── ADMIN STATE ── */
const ADMIN_PASS = "leo2025"; // ← Cambiar aquí
let mType=null, mId=null, mImgFile=null, mImgPath=null;

/* ── AUTH ── */
function openAdminLogin(){document.getElementById('admin-login-overlay').classList.add('show');setTimeout(()=>document.getElementById('admin-pw').focus(),100)}
function closeAdminLogin(){document.getElementById('admin-login-overlay').classList.remove('show');document.getElementById('admin-pw').value='';document.getElementById('login-err').style.display='none'}
function checkLogin(){
  if(document.getElementById('admin-pw').value===ADMIN_PASS){
    closeAdminLogin();
    document.getElementById('main-site').style.display='none';
    document.getElementById('admin-panel').classList.add('show');
    loadAdminForms();
  } else { document.getElementById('login-err').style.display='block'; }
}
function logoutAdmin(){
  document.getElementById('admin-panel').classList.remove('show');
  document.getElementById('main-site').style.display='block';
  renderSite();
}
function showAdminSec(id){
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.admin-sidebar button').forEach(b=>b.classList.remove('active'));
  document.getElementById('admin-'+id).classList.add('active');
  document.getElementById('aside-'+id).classList.add('active');
}

/* ── LOAD FORMS ── */
function loadAdminForms(){
  const L=DATA.laboratorio;
  document.getElementById('i-nombre').value=L.nombre;
  document.getElementById('i-sigla').value=L.sigla;
  document.getElementById('i-inst').value=L.institucion;
  document.getElementById('i-ciudad').value=L.ciudad;
  document.getElementById('i-desc-c').value=L.descripcion_corta;
  document.getElementById('i-desc-l').value=L.descripcion_larga;
  document.getElementById('s-pub').value=L.estadisticas.publicaciones;
  document.getElementById('s-inv').value=L.estadisticas.investigadores;
  document.getElementById('s-proy').value=L.estadisticas.proyectos;
  document.getElementById('s-anos').value=L.estadisticas.años;
  document.getElementById('i-email').value=L.contacto.email;
  document.getElementById('i-tel').value=L.contacto.telefono||'';
  document.getElementById('i-edif').value=L.contacto.edificio;
  document.getElementById('i-dir').value=L.contacto.direccion;
  document.getElementById('i-spon').value=L.patrocinadores.join(', ');
  updateLogoPreview();
  loadGHConfig();
  renderAdminLists();
}

function saveInfo(){
  const L=DATA.laboratorio;
  L.nombre=document.getElementById('i-nombre').value;
  L.sigla=document.getElementById('i-sigla').value;
  L.institucion=document.getElementById('i-inst').value;
  L.ciudad=document.getElementById('i-ciudad').value;
  L.descripcion_corta=document.getElementById('i-desc-c').value;
  L.descripcion_larga=document.getElementById('i-desc-l').value;
  L.estadisticas.publicaciones=document.getElementById('s-pub').value;
  L.estadisticas.investigadores=document.getElementById('s-inv').value;
  L.estadisticas.proyectos=document.getElementById('s-proy').value;
  L.estadisticas.años=document.getElementById('s-anos').value;
  L.contacto.email=document.getElementById('i-email').value;
  L.contacto.telefono=document.getElementById('i-tel').value;
  L.contacto.edificio=document.getElementById('i-edif').value;
  L.contacto.direccion=document.getElementById('i-dir').value;
  L.patrocinadores=document.getElementById('i-spon').value.split(',').map(s=>s.trim()).filter(Boolean);
  showToast('Información guardada');
}

/* ── LOGO ── */
function updateLogoPreview(){
  const box=document.getElementById('logo-preview-box');
  box.innerHTML=DATA.laboratorio.logo
    ?`<img src="${DATA.laboratorio.logo}" style="width:100%;height:100%;object-fit:cover;"/>`
    :`<span style="font-family:var(--heading);font-weight:800;font-size:1.5rem;color:#fff;">${DATA.laboratorio.sigla||'LEO'}</span>`;
}
async function handleLogoUpload(e){
  const file=e.target.files[0]; if(!file) return;
  const ext=file.name.split('.').pop().toLowerCase();
  const path=`img/logo.${ext}`;
  showToast('Subiendo logo a GitHub…');
  const url=await uploadImageToGitHub(file,path);
  if(url){
    DATA.laboratorio.logo=url;
    updateLogoPreview();
    showToast('Logo actualizado — publica para guardar');
  }
}
function removeLogo(){DATA.laboratorio.logo='';updateLogoPreview();showToast('Logo eliminado')}

/* ── ADMIN LISTS ── */
function renderAdminLists(){
  document.getElementById('list-noticias').innerHTML=(DATA.noticias||[]).map(n=>`
    <div class="admin-item">
      <div class="admin-item-thumb">${n.imagen?`<img src="${n.imagen}"/>`:'📰'}</div>
      <div class="admin-item-info"><div class="admin-item-title">${n.titulo}</div><div class="admin-item-sub">${n.tag} · ${n.fecha}</div></div>
      <div class="admin-item-btns"><button class="btn-edit-sm" onclick="openModal('noticia',${n.id})">Editar</button><button class="btn-del-sm" onclick="delItem('noticias',${n.id})">Eliminar</button></div>
    </div>`).join('');

  document.getElementById('list-investigacion').innerHTML=(DATA.investigacion||[]).map(i=>`
    <div class="admin-item">
      <div class="admin-item-thumb">${i.imagen?`<img src="${i.imagen}"/>`:'🔬'}</div>
      <div class="admin-item-info"><div class="admin-item-title">${i.titulo}</div><div class="admin-item-sub">${i.tags.join(' · ')}</div></div>
      <div class="admin-item-btns"><button class="btn-edit-sm" onclick="openModal('investigacion',${i.id})">Editar</button><button class="btn-del-sm" onclick="delItem('investigacion',${i.id})">Eliminar</button></div>
    </div>`).join('');

  document.getElementById('list-proyectos').innerHTML=(DATA.proyectos||[]).map(p=>`
    <div class="admin-item">
      <div class="admin-item-thumb">${p.imagen?`<img src="${p.imagen}"/>`:'🚀'}</div>
      <div class="admin-item-info"><div class="admin-item-title">${p.titulo}</div><div class="admin-item-sub">${p.estado==='activo'?'En curso':'Completado'} · ${p.financiador||''}</div></div>
      <div class="admin-item-btns"><button class="btn-edit-sm" onclick="openModal('proyecto',${p.id})">Editar</button><button class="btn-del-sm" onclick="delItem('proyectos',${p.id})">Eliminar</button></div>
    </div>`).join('');

  document.getElementById('list-miembros').innerHTML=(DATA.miembros||[]).map(m=>`
    <div class="admin-item">
      <div class="admin-item-thumb">${m.foto?`<img src="${m.foto}"/>`:'👤'}</div>
      <div class="admin-item-info"><div class="admin-item-title">${m.nombre}</div><div class="admin-item-sub">${m.tipo==='alumni'?'Alumni':'Miembro'} · ${m.rol}${m.orcid?' · ORCID ✓':''}</div></div>
      <div class="admin-item-btns"><button class="btn-edit-sm" onclick="openModal('miembro',${m.id})">Editar</button><button class="btn-del-sm" onclick="delItem('miembros',${m.id})">Eliminar</button></div>
    </div>`).join('');

  document.getElementById('list-publicaciones').innerHTML=(DATA.publicaciones||[]).map(p=>`
    <div class="admin-item">
      <div class="admin-item-thumb">📄</div>
      <div class="admin-item-info"><div class="admin-item-title">${p.titulo}</div><div class="admin-item-sub">${p.autores} · ${p.año}</div></div>
      <div class="admin-item-btns"><button class="btn-edit-sm" onclick="openModal('publicacion',${p.id})">Editar</button><button class="btn-del-sm" onclick="delItem('publicaciones',${p.id})">Eliminar</button></div>
    </div>`).join('');
}

/* ── IMAGE UPLOAD FIELD (path-based, uploads to GitHub) ── */
function imgUploadField(label, folder, existingPath){
  const hasImg = existingPath && existingPath.trim()!=='';
  return`<div class="form-group">
    <label class="form-label">${label}</label>
    ${hasImg?`<img src="${existingPath}" class="img-current" alt="imagen actual"/>`:``}
    <div class="img-upload-zone">
      <input type="file" accept="image/*" onchange="handleModalImg(event,'${folder}')"/>
      <p>📎 ${hasImg?'Reemplazar imagen':'Subir imagen'}</p>
      <small>PNG, JPG o WebP · Se sube a img/${folder}/ en GitHub</small>
    </div>
    <img id="modal-img-preview" class="img-preview" alt="preview"/>
    <p class="img-uploading" id="modal-img-status"></p>
    <span id="modal-img-remove" class="img-remove ${hasImg?'show':''}" onclick="removeModalImg()">✕ Quitar imagen</span>
  </div>`;
}

function handleModalImg(e, folder){
  const file=e.target.files[0]; if(!file) return;
  mImgFile=file;
  // Show local preview immediately
  const reader=new FileReader();
  reader.onload=ev=>{
    const p=document.getElementById('modal-img-preview');
    p.src=ev.target.result; p.classList.add('show');
  };
  reader.readAsDataURL(file);
  document.getElementById('modal-img-remove').classList.add('show');
  document.getElementById('modal-img-remove').style.display='inline';
  document.getElementById('modal-img-status').textContent='Imagen lista — se subirá al guardar';
  document.getElementById('modal-img-status').classList.add('show');
}

function removeModalImg(){
  mImgFile=null; mImgPath=null;
  const p=document.getElementById('modal-img-preview');
  const rm=document.getElementById('modal-img-remove');
  const st=document.getElementById('modal-img-status');
  p.src=''; p.classList.remove('show');
  rm.classList.remove('show'); rm.style.display='none';
  if(st){st.textContent='';st.classList.remove('show');}
}

function toggleAlumniFields(){
  const isAlumni=document.getElementById('m-tipo')?.value==='alumni';
  const f=document.getElementById('alumni-fields');
  if(f) f.style.display=isAlumni?'block':'none';
}

/* ── MODAL ── */
function openModal(type,id){
  mType=type; mId=id; mImgFile=null; mImgPath=null;
  const map={noticia:'noticias',investigacion:'investigacion',proyecto:'proyectos',miembro:'miembros',publicacion:'publicaciones'};
  const item=id!==null?DATA[map[type]]?.find(x=>x.id===id):null;
  if(item) mImgPath=item.imagen||item.foto||null;
  const labels={noticia:'noticia',investigacion:'área de investigación',proyecto:'proyecto',miembro:'miembro',publicacion:'publicación'};
  document.getElementById('modal-title').textContent=id?`Editar ${labels[type]}`:`Nuevo/a ${labels[type]}`;
  const body=document.getElementById('modal-body');

  if(type==='noticia') body.innerHTML=`
    <div class="form-group"><label class="form-label">Etiqueta</label><input class="form-ctrl" id="m-tag" value="${item?.tag||''}"/></div>
    <div class="form-group"><label class="form-label">Título</label><input class="form-ctrl" id="m-titulo" value="${item?.titulo||''}"/></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-ctrl" id="m-desc">${item?.descripcion||''}</textarea></div>
    <div class="form-group"><label class="form-label">Fecha</label><input class="form-ctrl" id="m-fecha" value="${item?.fecha||''}"/><p class="form-hint">Ej: Enero 2025</p></div>
    ${imgUploadField('Imagen de portada','noticias',item?.imagen||null)}`;

  else if(type==='investigacion') body.innerHTML=`
    <div class="form-group"><label class="form-label">Título</label><input class="form-ctrl" id="m-titulo" value="${item?.titulo||''}"/></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-ctrl" id="m-desc">${item?.descripcion||''}</textarea></div>
    <div class="form-group"><label class="form-label">Etiquetas</label><input class="form-ctrl" id="m-tags" value="${item?.tags?.join(', ')||''}"/><p class="form-hint">Separadas por coma</p></div>
    ${imgUploadField('Imagen representativa','investigacion',item?.imagen||null)}`;

  else if(type==='proyecto') body.innerHTML=`
    <div class="form-group"><label class="form-label">Título</label><input class="form-ctrl" id="m-titulo" value="${item?.titulo||''}"/></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-ctrl" id="m-desc">${item?.descripcion||''}</textarea></div>
    <div class="form-group"><label class="form-label">Estado</label>
      <select class="form-ctrl" id="m-estado">
        <option value="activo" ${item?.estado==='activo'?'selected':''}>En curso</option>
        <option value="completado" ${item?.estado==='completado'?'selected':''}>Completado</option>
      </select></div>
    <div class="form-group"><label class="form-label">Financiador</label><input class="form-ctrl" id="m-financiador" value="${item?.financiador||''}"/></div>
    <div class="form-group"><label class="form-label">Investigador principal</label><input class="form-ctrl" id="m-ip" value="${item?.investigadorPrincipal||''}"/></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div class="form-group"><label class="form-label">Año inicio</label><input class="form-ctrl" id="m-inicio" value="${item?.inicio||''}"/></div>
      <div class="form-group"><label class="form-label">Año fin</label><input class="form-ctrl" id="m-fin" value="${item?.fin||''}"/><p class="form-hint">Dejar vacío si está en curso</p></div>
    </div>
    ${imgUploadField('Imagen del proyecto','proyectos',item?.imagen||null)}`;

  else if(type==='miembro') body.innerHTML=`
    <div class="form-group"><label class="form-label">Tipo</label>
      <select class="form-ctrl" id="m-tipo" onchange="toggleAlumniFields()">
        <option value="activo" ${item?.tipo!=='alumni'?'selected':''}>Miembro actual</option>
        <option value="alumni" ${item?.tipo==='alumni'?'selected':''}>Alumni</option>
      </select></div>
    <div class="form-group"><label class="form-label">Nombre completo</label><input class="form-ctrl" id="m-nombre" value="${item?.nombre||''}"/></div>
    <div class="form-group"><label class="form-label">Iniciales (2-3)</label><input class="form-ctrl" id="m-ini" value="${item?.iniciales||''}"/></div>
    <div class="form-group"><label class="form-label">Categoría</label>
      <select class="form-ctrl" id="m-cat">
        <option value="investigador" ${item?.categoria==='investigador'?'selected':''}>Investigador</option>
        <option value="posgrado" ${item?.categoria==='posgrado'?'selected':''}>Posgrado</option>
        <option value="pregrado" ${item?.categoria==='pregrado'?'selected':''}>Pregrado</option>
      </select></div>
    <div class="form-group"><label class="form-label">Rol</label><input class="form-ctrl" id="m-rol" value="${item?.rol||''}"/></div>
    <div class="form-group"><label class="form-label">Especialidad</label><input class="form-ctrl" id="m-esp" value="${item?.especialidad||''}"/></div>
    <div class="form-group"><label class="form-label">Año de ingreso al laboratorio</label><input class="form-ctrl" id="m-inicio" type="number" value="${item?.año_inicio||''}" placeholder="ej: 2018"/><p class="form-hint">Usado para filtrar publicaciones ORCID por período.</p></div>
    <div id="alumni-fields" style="display:${item?.tipo==='alumni'?'block':'none'};">
      <div class="form-group"><label class="form-label">Año de salida del laboratorio</label><input class="form-ctrl" id="m-fin" type="number" value="${item?.año_fin||''}" placeholder="ej: 2022"/></div>
      <div class="form-group"><label class="form-label">Posición actual</label><input class="form-ctrl" id="m-posicion" value="${item?.posicion_actual||''}"/><p class="form-hint">Ej: Posdoctorante, MIT · Boston</p></div>
    </div>
    <div class="form-group"><label class="form-label">ORCID iD</label><input class="form-ctrl" id="m-orcid" value="${item?.orcid||''}" placeholder="0000-0000-0000-0000"/><p class="form-hint">Permite sincronizar publicaciones automáticamente.</p></div>
    ${imgUploadField('Foto del miembro','miembros',item?.foto||null)}`;

  else if(type==='publicacion') body.innerHTML=`
    <div class="form-group"><label class="form-label">Título</label><textarea class="form-ctrl" id="m-titulo">${item?.titulo||''}</textarea></div>
    <div class="form-group"><label class="form-label">Autores</label><input class="form-ctrl" id="m-autores" value="${item?.autores||''}"/></div>
    <div class="form-group"><label class="form-label">Revista / Journal</label><input class="form-ctrl" id="m-revista" value="${item?.revista||''}"/></div>
    <div class="form-group"><label class="form-label">Año</label><input class="form-ctrl" type="number" id="m-ano" value="${item?.año||new Date().getFullYear()}"/></div>`;

  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal(){document.getElementById('modal-overlay').classList.remove('show');mType=null;mId=null;mImgFile=null;mImgPath=null;}

async function saveModal(){
  // If there's a new image file, upload it first
  if(mImgFile){
    const st=document.getElementById('modal-img-status');
    if(st){st.textContent='⬆ Subiendo imagen a GitHub…';st.classList.add('show');}
    const folder=mImgFile._folder||guessFolder(mType);
    const ext=mImgFile.name.split('.').pop().toLowerCase();
    const safeName=`${mType}-${Date.now()}.${ext}`;
    const path=`img/${folder}/${safeName}`;
    const uploadedUrl=await uploadImageToGitHub(mImgFile,path);
    if(uploadedUrl){ mImgPath=uploadedUrl; }
    else { showToast('Error subiendo imagen. Configura GitHub primero.'); return; }
  }

  const map={noticia:'noticias',investigacion:'investigacion',proyecto:'proyectos',miembro:'miembros',publicacion:'publicaciones'};
  const arr=DATA[map[mType]]; if(!arr) return;
  const newId=mId!==null?mId:(arr.length?Math.max(...arr.map(x=>x.id))+1:1);
  let item={id:newId};

  if(mType==='noticia') item={...item,tag:v('m-tag'),titulo:v('m-titulo'),descripcion:v('m-desc'),fecha:v('m-fecha'),imagen:mImgPath||''};
  else if(mType==='investigacion') item={...item,titulo:v('m-titulo'),descripcion:v('m-desc'),tags:v('m-tags').split(',').map(t=>t.trim()).filter(Boolean),imagen:mImgPath||''};
  else if(mType==='proyecto') item={...item,titulo:v('m-titulo'),descripcion:v('m-desc'),estado:v('m-estado'),financiador:v('m-financiador'),investigadorPrincipal:v('m-ip'),inicio:v('m-inicio'),fin:v('m-fin'),imagen:mImgPath||''};
  else if(mType==='miembro') item={...item,tipo:v('m-tipo'),nombre:v('m-nombre'),iniciales:v('m-ini'),categoria:v('m-cat'),rol:v('m-rol'),especialidad:v('m-esp'),año_inicio:parseInt(v('m-inicio'))||null,año_fin:parseInt(v('m-fin'))||null,posicion_actual:v('m-posicion')||'',orcid:v('m-orcid').trim(),foto:mImgPath||''};
  else if(mType==='publicacion') item={...item,titulo:v('m-titulo'),autores:v('m-autores'),revista:v('m-revista'),año:parseInt(v('m-ano'))};

  if(mId!==null){const idx=arr.findIndex(x=>x.id===mId);arr[idx]=item;}else{arr.push(item);}
  closeModal(); renderAdminLists(); showToast('Guardado. Pulsa Publicar para actualizar el sitio.');
}

function v(id){const el=document.getElementById(id);return el?el.value:'';}
function guessFolder(type){return{noticia:'noticias',investigacion:'investigacion',proyecto:'proyectos',miembro:'miembros'}[type]||'misc';}
function delItem(col,id){if(!confirm('¿Eliminar este elemento?'))return;DATA[col]=DATA[col].filter(x=>x.id!==id);renderAdminLists();showToast('Eliminado');}

/* ── GITHUB API ── */
const GHK={user:'leo_gh_user',repo:'leo_gh_repo',branch:'leo_gh_branch',path:'leo_gh_path',token:'leo_gh_token',last:'leo_gh_last'};

function ghGet(k){return localStorage.getItem(GHK[k])||'';}
function ghHeaders(){return{'Authorization':`Bearer ${ghGet('token')}`,'Content-Type':'application/json','Accept':'application/vnd.github+json'};}
function ghBase(filePath){return`https://api.github.com/repos/${ghGet('user')}/${ghGet('repo')}/contents/${filePath}`;}

function loadGHConfig(){
  document.getElementById('gh-user').value=ghGet('user');
  document.getElementById('gh-repo').value=ghGet('repo');
  document.getElementById('gh-branch').value=ghGet('branch')||'main';
  document.getElementById('gh-path').value=ghGet('path')||'contenido.json';
  document.getElementById('gh-token').value=ghGet('token');
  const last=localStorage.getItem(GHK.last);
  if(last) document.getElementById('gh-last-publish').textContent=`Última publicación: ${last}`;
  updateGHStatus();
}
function saveGHConfig(){
  ['user','repo','branch','path','token'].forEach(k=>localStorage.setItem(GHK[k],document.getElementById('gh-'+k).value.trim()));
  updateGHStatus(); showToast('Configuración de GitHub guardada');
}
function updateGHStatus(){
  const u=ghGet('user'),r=ghGet('repo'),t=ghGet('token');
  const bar=document.getElementById('gh-status-bar'),dot=document.getElementById('gh-dot'),txt=document.getElementById('gh-status-text');
  const btn=document.getElementById('btn-publish');
  if(u&&r&&t){bar.className='gh-status-bar ok';dot.className='gh-dot ok';txt.textContent=`Conectado a ${u}/${r}`;btn.disabled=false;}
  else{bar.className='gh-status-bar idle';dot.className='gh-dot idle';txt.textContent='Sin configurar — completa los campos abajo';btn.disabled=true;}
}

/* Upload a single file to GitHub, returns the raw URL or null */
async function uploadImageToGitHub(file, path){
  if(!ghGet('token')||!ghGet('user')||!ghGet('repo')) return null;
  try{
    const b64=await fileToBase64(file);
    const branch=ghGet('branch')||'main';
    const url=ghBase(path);
    // Check if file exists (to get SHA for update)
    let sha=null;
    const get=await fetch(`${url}?ref=${branch}`,{headers:ghHeaders()});
    if(get.ok){const j=await get.json();sha=j.sha;}
    const body={message:`Imagen: ${path}`,content:b64,branch};
    if(sha) body.sha=sha;
    const put=await fetch(url,{method:'PUT',headers:ghHeaders(),body:JSON.stringify(body)});
    if(!put.ok) throw new Error(`HTTP ${put.status}`);
    const j=await put.json();
    // Return the raw GitHub Pages URL (relative path works on the same repo)
    return path; // relative path — works when site is served from same repo
  }catch(e){console.error('Image upload failed',e);return null;}
}

function fileToBase64(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result.split(',')[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}

/* Publish contenido.json to GitHub */
async function publishToGitHub(){
  const u=ghGet('user'),r=ghGet('repo'),br=ghGet('branch')||'main',path=ghGet('path')||'contenido.json',t=ghGet('token');
  if(!u||!r||!t){showToast('Configura GitHub primero');return;}
  const btn=document.getElementById('btn-publish');
  btn.classList.add('loading'); btn.disabled=true;
  ghLog('info','Iniciando publicación…');
  try{
    const base=ghBase(path);
    let sha=null;
    ghLog('info','Obteniendo versión actual del archivo…');
    const g=await fetch(`${base}?ref=${br}`,{headers:ghHeaders()});
    if(g.ok){const j=await g.json();sha=j.sha;ghLog('ok','Archivo encontrado, preparando actualización…');}
    else if(g.status===404){ghLog('info','Archivo nuevo, creando…');}
    else throw new Error(`Error ${g.status} obteniendo archivo`);
    const b64=btoa(unescape(encodeURIComponent(JSON.stringify(DATA,null,2))));
    const now=new Date().toLocaleString('es-EC',{timeZone:'America/Guayaquil'});
    const body={message:`Actualización de contenido — ${now}`,content:b64,branch:br};
    if(sha) body.sha=sha;
    ghLog('info','Subiendo contenido.json…');
    const p=await fetch(base,{method:'PUT',headers:ghHeaders(),body:JSON.stringify(body)});
    if(!p.ok){const e=await p.json().catch(()=>({}));throw new Error(e.message||`Error ${p.status}`);}
    localStorage.setItem(GHK.last,now);
    document.getElementById('gh-last-publish').textContent=`Última publicación: ${now}`;
    document.getElementById('gh-status-bar').className='gh-status-bar ok';
    document.getElementById('gh-dot').className='gh-dot ok';
    document.getElementById('gh-status-text').textContent=`✓ Publicado en ${u}/${r} — GitHub Pages actualizará en ~30s`;
    ghLog('ok',`✓ Publicado correctamente — ${now}`);
    showToast('✓ Publicado en GitHub');
  }catch(err){
    document.getElementById('gh-status-bar').className='gh-status-bar err';
    document.getElementById('gh-dot').className='gh-dot err';
    document.getElementById('gh-status-text').textContent=`Error: ${err.message}`;
    ghLog('err',`Error: ${err.message}`);
    showToast(`Error: ${err.message}`);
  }finally{btn.classList.remove('loading');btn.disabled=false;}
}

function ghLog(type,msg){
  const log=document.getElementById('gh-log');
  if(!log) return;
  log.classList.add('show');
  log.innerHTML+=`<div class="gh-log-line ${type}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  log.scrollTop=log.scrollHeight;
}

/* ── EXPORT LOCAL ── */
function exportJSON(){
  const b=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b);const a=document.createElement('a');
  a.href=u;a.download='contenido.json';a.click();URL.revokeObjectURL(u);
  showToast('JSON exportado localmente');
}

/* ── TOAST ── */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3200);
}
