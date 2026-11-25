'use strict';
const API=window.WINATRA_API,app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
const fid=u=>{const m=String(u||'').match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);return m&&(m[1]||m[2])};
const thumb=u=>fid(u)?`https://drive.google.com/thumbnail?id=${fid(u)}&sz=w800`:url(u);
const fmt=d=>{const x=new Date(d);return isNaN(x)?esc(d):x.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
const wa=n=>{let d=String(n||'').replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);return d?'https://wa.me/'+d:''};
const para=s=>esc(s).split('\n').filter(Boolean).map(x=>`<p>${x}</p>`).join('');
const toast=m=>{const t=document.getElementById('toast');t.textContent=m;t.className='on';setTimeout(()=>t.className='',3200)};
const ses=()=>{try{return JSON.parse(sessionStorage.getItem('w'))}catch(e){return null}};

/* ---- API ---- */
const cache={};
async function get(sheet){
  if(!API||API.startsWith('GANTI'))throw new Error('Alamat backend belum diisi. Lihat README.md langkah 5.');
  if(cache[sheet])return cache[sheet];
  const r=await (await fetch(`${API}?sheet=${sheet}`)).json();
  if(!r.ok)throw new Error(r.error);return cache[sheet]=r.data;
}
async function post(body){
  if(!API||API.startsWith('GANTI'))throw new Error('Alamat backend belum diisi. Lihat README.md langkah 5.');
  const s=ses();if(s)body.token=s.token;
  const r=await (await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(body)})).json();
  if(!r.ok){if(/Sesi/.test(r.error)){sessionStorage.removeItem('w');navLogin()}throw new Error(r.error)}return r;
}

/* ---- komponen ---- */
const head=(t,p)=>`<section class="page-head"><span class="px p2"></span><div class="wrap"><h1>${t}</h1><p>${p||''}</p></div></section>`;
const sec=(t,sub,body,more)=>`<section class="sec"><div class="wrap"><div class="bar"><div><h2>${t}</h2><p class="sub">${sub||''}</p></div>${more?`<a class="btn alt" href="${more}">Lihat semua</a>`:''}</div>${body}</div></section>`;
const beritaCard=b=>`<a class="card" href="#/berita/${esc(b.id)}" style="text-decoration:none"><div class="img wide">${b.gambar?`<img loading="lazy" src="${thumb(b.gambar)}" alt="" onerror="this.remove()">`:''}</div><span class="tag">${fmt(b.tanggal)}</span><h3>${esc(b.judul)}</h3><p>${esc(b.ringkasan)}</p></a>`;
const eventCard=e=>`<div class="card"><div class="img">${e.poster?`<img loading="lazy" src="${thumb(e.poster)}" alt="Poster ${esc(e.judul)}" onerror="this.remove()">`:''}</div><span class="tag">${esc(e.penyelenggara)}</span><h3>${esc(e.judul)}</h3><p>${fmt(e.tanggal)}${e.lokasi?' | '+esc(e.lokasi):''}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${e.juknis?`<a class="btn sm" href="${url(e.juknis)}" target="_blank" rel="noopener">Juknis</a>`:''}<a class="btn sm alt" ${wa(e.kontak)?`href="${wa(e.kontak)}" target="_blank" rel="noopener"`:''} title="${esc(e.kontak)}">Narahubung: ${esc(e.narahubung||'-')}</a></div></div>`;
const empty=t=>`<div class="note">${t}</div>`;

/* ---- halaman publik ---- */
async function home(){
  const [b,e]=await Promise.all([get('berita').catch(()=>[]),get('event').catch(()=>[])]);
  const bs=[...b].sort((x,y)=>String(y.tanggal).localeCompare(String(x.tanggal))).slice(0,3);
  const es=[...e].sort((x,y)=>String(x.tanggal).localeCompare(String(y.tanggal))).slice(0,3);
  return `<section class="hero"><span class="px p1"></span><span class="px p2"></span><div class="wrap"><div><h1>Kabinet Winatra</h1><h2>Menyala untuk Mahasiswa</h2><p>Pusat informasi, layanan, dan kolaborasi Badan Eksekutif Mahasiswa IKIP PGRI Bojonegoro bersama seluruh ormawa.</p><p><a class="btn" href="#/berita">Lihat berita terbaru</a> &nbsp;<a class="btn alt" href="#/login">Masuk ormawa</a></p></div><div class="art"><div><img src="assets/logo/kabinet-winatra.png" alt="Logo Kabinet Winatra"></div></div></div></section>
  <section class="sec"><div class="wrap grid g4 quick"><a href="#/event"><img src="assets/ikon/dept-seni-olahraga-kebudayaan.png" alt=""><div><b>Lihat Event</b><br><small>Agenda BEM dan ormawa</small></div></a><a href="#/template"><img src="assets/ikon/sekretaris-kabinet.png" alt=""><div><b>Unduh Template</b><br><small>Surat dan administrasi</small></div></a><a href="#/kementerian"><img src="assets/ikon/staf-khusus-komunikasi.png" alt=""><div><b>Call Center</b><br><small>Pengaduan dan aspirasi</small></div></a><a href="#/ebook"><img src="assets/ikon/dept-pendidikan-literasi.png" alt=""><div><b>E-book Gratis</b><br><small>Koleksi bacaan</small></div></a></div></section>
  ${sec('Berita dan Media','Kabar terbaru dari BEM dan ormawa',bs.length?`<div class="grid g3">${bs.map(beritaCard).join('')}</div>`:empty('Belum ada berita.'),'#/berita')}
  ${sec('Event Mendatang','Kanal promosi kegiatan BEM, UKM, dan HMP',es.length?`<div class="grid g3">${es.map(eventCard).join('')}</div>`:empty('Belum ada event tayang.'),'#/event')}`;
}
async function berita(id){
  const b=await get('berita');
  if(id){const x=b.find(i=>String(i.id)===id);if(!x)return empty('Berita tidak ditemukan.');
    return head(esc(x.judul),`${fmt(x.tanggal)}${x.penulis?' | '+esc(x.penulis):''}`)+`<section class="sec"><div class="wrap" style="max-width:780px">${x.gambar?`<img src="${thumb(x.gambar)}" alt="" onerror="this.remove()">`:''}${para(x.isi)}<p><a class="btn alt" href="#/berita">Kembali</a></p></div></section>`}
  const s=[...b].sort((x,y)=>String(y.tanggal).localeCompare(String(x.tanggal)));
  return head('Berita dan Media','Kabar terbaru dari BEM dan ormawa')+sec('','',s.length?`<div class="grid g3">${s.map(beritaCard).join('')}</div>`:empty('Belum ada berita.'));
}
async function struktur(){
  const k=(await get('kementerian')).sort((a,b)=>a.urut-b.urut);
  const pres=k.find(x=>x.logo==='presiden-wapres'),dep=pres?JSON.parse(pres.departemen||'[]'):[];
  const nm=n=>(dep.find(d=>d.n===n)||{}).p||'';
  const mem=k.filter(x=>x!==pres);
  return head('Struktur Organisasi','Susunan Kabinet Winatra')+`<section class="sec"><div class="wrap"><div class="org">
  <div class="node dark"><img src="assets/logo/presiden-wapres.png" alt="">Presiden BEM<small>${esc(nm('Presiden BEM'))}</small></div>
  <div class="row"><div class="node or">Wakil Presiden BEM<small>${esc(nm('Wakil Presiden BEM'))}</small></div><div class="node">Sekretaris Kabinet<small>${esc(nm('Sekretaris Kabinet'))}</small></div></div>
  <div class="row">${mem.map(m=>`<a class="node" href="#/kementerian/${esc(m.id)}" style="text-decoration:none"><img src="assets/logo/${esc(m.logo)}.png" alt="">${esc(m.nama)}<small>${esc(m.menteri)}</small><small>${JSON.parse(m.departemen||'[]').filter(d=>/^Departemen/.test(d.n)).length} departemen</small></a>`).join('')}</div></div></div></section>`;
}
async function kementerian(id){
  const k=(await get('kementerian')).sort((a,b)=>a.urut-b.urut);
  if(id){const x=k.find(i=>String(i.id)===id);if(!x)return empty('Tidak ditemukan.');const d=JSON.parse(x.departemen||'[]');
    const li=t=>`<ul class="t">${String(t||'').split('\n').filter(Boolean).map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`;
    return head(esc(x.nama),'Dipimpin oleh '+esc(x.menteri))+`<section class="sec"><div class="wrap grid g2" style="align-items:start"><div class="card"><img src="assets/logo/${esc(x.logo)}.png" alt="" style="height:120px;object-fit:contain;align-self:flex-start"><h3>Tugas pokok dan fungsi</h3>${li(x.tupoksi)||'<p>Belum diisi.</p>'}<h3 style="margin-top:12px">Call center</h3><p>${x.callcenter?(wa(x.callcenter)?`<a href="${wa(x.callcenter)}" target="_blank" rel="noopener">${esc(x.callcenter)}</a>`:esc(x.callcenter)):'Belum tersedia.'}</p></div>
    <div class="grid">${d.map(i=>`<div class="dep">${i.i?`<img src="assets/ikon/${esc(i.i)}.png" alt="">`:''}<div><b>${esc(i.n)}</b><small>${esc(i.p||'')}</small>${li(i.t)}</div></div>`).join('')}</div></div></section>`}
  return head('Kementerian dan Departemen','Tugas pokok, fungsi, dan jalur pengaduan')+sec('','',`<div class="grid g3">${k.map(x=>`<a class="card kcard" href="#/kementerian/${esc(x.id)}"><img src="assets/logo/${esc(x.logo)}.png" alt=""><span class="tag">${esc(x.menteri)}</span><h3>${esc(x.nama)}</h3><p>${JSON.parse(x.departemen||'[]').length} bagian | Call center: ${esc(x.callcenter||'-')}</p></a>`).join('')}</div>`);
}
let evFilter='Semua';
async function event(){
  const e=(await get('event')).sort((a,b)=>String(a.tanggal).localeCompare(String(b.tanggal)));
  const l=e.filter(x=>evFilter==='Semua'||(evFilter==='BEM'?/^BEM/i.test(x.penyelenggara):!/^BEM/i.test(x.penyelenggara)));
  return head('Event dan Panel Ormawa','Kanal promosi kegiatan BEM, UKM, dan HMP')+`<section class="sec"><div class="wrap"><div class="chips">${['Semua','BEM','Ormawa'].map(c=>`<button class="chip ${c===evFilter?'on':''}" data-filter="${c}">${c==='Semua'?'Semua':'Event '+c}</button>`).join('')}</div>${l.length?`<div class="grid g3">${l.map(eventCard).join('')}</div>`:empty('Belum ada event pada kategori ini.')}<p class="note">Ormawa yang ingin mempromosikan kegiatan dapat <a href="#/login">masuk</a> dan menambahkan event dari dasbor ormawa.</p></div></section>`;
}
async function template(){
  const t=await get('template');
  const st=[['Panitia Pelaksana','Menyusun proposal'],['Ormawa Terkait','Verifikasi dan tanda tangan'],['BEM','Telaah dan rekomendasi'],['Staf Kemahasiswaan','Pemeriksaan berkas'],['Wakil Rektor','Bidang Kemahasiswaan dan Akademik']];
  return head('Template dan Administrasi','Format surat dan alur pengajuan kegiatan')+sec('Template Penyuratan','Unduh dari Google Drive',t.length?`<div class="grid g3">${t.map(x=>`<div class="card"><span class="tag">${esc(x.kategori||'Template')}</span><h3>${esc(x.nama)}</h3><a class="btn sm" href="${url(x.tautan)}" target="_blank" rel="noopener">Unduh</a></div>`).join('')}</div>`:empty('Belum ada template.'))+sec('Alur Administrasi Ormawa','Jalur pengajuan kegiatan dari panitia sampai persetujuan akhir',`<div class="flow">${st.map((s,i)=>`<div class="st"><span class="n">${i+1}</span><b>${s[0]}</b><p>${s[1]}</p></div>`).join('')}</div>`);
}
async function ebook(){
  const e=await get('ebook');const cats=['Semua',...new Set(e.map(x=>x.kategori).filter(Boolean))];
  return head('E-book Gratis','Koleksi bacaan untuk mahasiswa')+`<section class="sec"><div class="wrap"><div class="chips">${cats.map((c,i)=>`<button class="chip ${i?'':'on'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>${e.length?`<div class="grid g4" id="books">${e.map(x=>`<div class="card" data-k="${esc(x.kategori)}"><div class="img">${x.sampul?`<img loading="lazy" src="${thumb(x.sampul)}" alt="" onerror="this.remove()">`:''}</div><h3>${esc(x.judul)}</h3><p>${esc(x.penulis)}</p><a class="btn sm" href="${url(x.tautan)}" target="_blank" rel="noopener">Baca / Unduh</a></div>`).join('')}</div>`:empty('Belum ada e-book.')}</div></section>`;
}
async function tim(){return head('Tim Pengembang Web','Departemen Informasi dan Teknologi')+`<section class="sec"><div class="wrap"><div class="card"><img src="assets/ikon/dept-informasi-teknologi.png" alt="" style="height:60px;object-fit:contain;align-self:flex-start"><h3>Departemen Informasi dan Teknologi</h3><p>Kementerian Media dan Informasi, Kabinet Winatra. Daftar anggota tim dapat diisi di sini.</p></div></div></section>`}

/* ---- login ---- */
const navLogin=()=>{const s=ses(),a=document.getElementById('loginLink');a.textContent=s?'Dasbor':'Masuk';a.href=s?(s.user.role==='admin'?'#/admin':'#/ormawa'):'#/login'};
async function login(){
  const s=ses();if(s){location.hash=s.user.role==='admin'?'#/admin':'#/ormawa';return''}
  return head('Masuk','Khusus ormawa dan admin BEM')+`<section class="sec"><div class="wrap"><form class="f" id="loginForm"><label>Username<input name="username" required autocomplete="username"></label><label>Kata sandi<input name="password" type="password" required autocomplete="current-password"></label><button class="btn" type="submit">Masuk</button><p class="sub">Akun ormawa dibuat oleh super admin BEM.</p></form></div></section>`;
}

/* ---- dasbor (ormawa + admin) ---- */
const TITLE={berita:'Berita',event:'Event',proker:'Proker',ebook:'E-book',template:'Template',kementerian:'Kementerian',users:'Pengguna'};
const FIELDS={
 berita:[['judul','Judul'],['ringkasan','Ringkasan','area'],['isi','Isi berita','area'],['gambar','Tautan gambar (Drive)'],['tanggal','Tanggal','date'],['penulis','Penulis']],
 event:[['judul','Judul event'],['penyelenggara','Penyelenggara'],['tanggal','Tanggal','date'],['lokasi','Lokasi'],['poster','Tautan poster (Drive)'],['juknis','Tautan juknis (Drive)'],['narahubung','Nama narahubung'],['kontak','WhatsApp narahubung'],['status','Status','select:Tayang,Draf,Menunggu']],
 proker:[['ormawa','Ormawa'],['program','Nama program kerja'],['waktu','Waktu pelaksanaan'],['anggaran','Perkiraan anggaran (Rp)'],['pj','Penanggung jawab'],['kontak','WhatsApp'],['tautan','Tautan dokumen proker (Drive)'],['deskripsi','Deskripsi singkat','area'],['status','Status','select:Ditinjau,Diterima,Revisi']],
 ebook:[['judul','Judul'],['penulis','Penulis'],['kategori','Kategori'],['sampul','Tautan sampul (Drive)'],['tautan','Tautan e-book (Drive)']],
 template:[['nama','Nama template'],['kategori','Kategori'],['tautan','Tautan file (Drive)']],
 kementerian:[['nama','Nama'],['menteri','Menteri'],['tupoksi','Tupoksi (satu baris satu poin)','area'],['callcenter','Call center (WhatsApp)'],['logo','Nama file logo'],['urut','Urutan','number'],['departemen','Departemen (JSON)','area']],
 users:[['username','Username'],['password','Kata sandi (kosongkan jika tidak diubah)'],['nama','Nama'],['role','Peran','select:ormawa,admin'],['ormawa','Nama ormawa']]
};
let S={sheet:null,edit:null};
async function dash(kind){
  const s=ses();if(!s||(kind==='admin'&&s.user.role!=='admin')){location.hash='#/login';return''}
  const tabs=kind==='admin'?Object.keys(TITLE):['proker','event'];
  if(!tabs.includes(S.sheet)){S.sheet=tabs[0];S.edit=null}
  const r=(await post({action:'list',sheet:S.sheet})).data,own=s.user.role!=='admin';
  const f=FIELDS[S.sheet].filter(x=>!(own&&['status','penyelenggara','ormawa'].includes(x[0])&&!(x[0]==='ormawa'&&S.sheet==='users'))),key=S.sheet==='users'?'username':'id';
  const cols=f.slice(0,3).map(x=>x[0]).concat(f.find(x=>x[0]==='status')?['status']:[]);
  const inp=([k,l,t])=>{const v=S.edit?.[k]??'';const base=`name="${k}"`;
    if(t==='area')return`<label>${l}<textarea ${base}>${esc(v)}</textarea></label>`;
    if(t&&t.startsWith('select'))return`<label>${l}<select ${base}>${t.slice(7).split(',').map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></label>`;
    return`<label>${l}<input ${base} type="${t||'text'}" value="${k==='password'?'':esc(v)}" ${k==='judul'||k==='program'||k==='username'||k==='nama'?'required':''}></label>`};
  return head(kind==='admin'?'Dasbor Super Admin':'Dasbor Ormawa',`Masuk sebagai ${esc(s.user.nama)}${s.user.ormawa?' ('+esc(s.user.ormawa)+')':''}`)+`<section class="sec"><div class="wrap dash">
  <div class="bar"><div class="chips" style="margin:0">${tabs.map(t=>`<button class="chip ${t===S.sheet?'on':''}" data-tab="${t}">${own&&t==='proker'?'Tambah Proker':own&&t==='event'?'Event Ormawa':TITLE[t]}</button>`).join('')}</div><span><button class="btn" data-act="new">+ Tambah</button> <button class="btn alt" data-act="logout">Keluar</button></span></div>
  ${S.edit?`<form class="f card" id="crudForm" style="max-width:none"><h3>${S.edit[key]?'Ubah':'Tambah'} ${TITLE[S.sheet]}</h3>${f.map(inp).join('')}<div><button class="btn" type="submit">Simpan</button> <button class="btn alt" type="button" data-act="cancel">Batal</button></div></form>`:''}
  <div class="tablewrap">${r.length?`<table><tr>${cols.map(c=>`<th>${c}</th>`).join('')}<th>Aksi</th></tr>${r.map(x=>`<tr>${cols.map(c=>`<td>${c==='status'?`<span class="badge ${esc(x[c])}">${esc(x[c])}</span>`:esc(String(x[c]).slice(0,70))}</td>`).join('')}<td><button class="btn sm" data-act="edit" data-id="${esc(x[key])}">Ubah</button> <button class="btn sm del" data-act="del" data-id="${esc(x[key])}">Hapus</button></td></tr>`).join('')}</table>`:empty('Belum ada data.')}</div></div></section>`;
}

/* ---- router + event ---- */
const R={'':home,berita,struktur,kementerian,event,template,ebook,tim,login,ormawa:()=>dash('ormawa'),admin:()=>dash('admin')};
async function route(){
  const [p,id]=location.hash.slice(2).split('/');
  app.innerHTML='<p class="load">Memuat...</p>';
  try{app.innerHTML=await (R[p||'']||home)(id)}catch(e){app.innerHTML=`<section class="sec"><div class="wrap">${empty(esc(e.message||e))}</div></section>`}
  document.querySelectorAll('#nav a:not(.login)').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+(p||'')));
  navLogin();
}
window.addEventListener('hashchange',()=>{scrollTo(0,0);route()});
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-filter],[data-cat],[data-tab],[data-act]');if(!b)return;
  if(b.dataset.filter){evFilter=b.dataset.filter;return route()}
  if(b.dataset.cat){document.querySelectorAll('[data-cat]').forEach(c=>c.classList.toggle('on',c===b));document.querySelectorAll('#books .card').forEach(c=>c.style.display=b.dataset.cat==='Semua'||c.dataset.k===b.dataset.cat?'':'none');return}
  if(b.dataset.tab){S.sheet=b.dataset.tab;S.edit=null;return route()}
  const a=b.dataset.act;
  if(a==='logout'){sessionStorage.removeItem('w');location.hash='#/login';return route()}
  if(a==='new'){S.edit={};return route()}
  if(a==='cancel'){S.edit=null;return route()}
  try{
    const key=S.sheet==='users'?'username':'id';
    if(a==='edit'){S.edit=(await post({action:'list',sheet:S.sheet})).data.find(x=>String(x[key])===b.dataset.id);return route()}
    if(a==='del'&&confirm('Hapus data ini?')){await post({action:'remove',sheet:S.sheet,id:b.dataset.id});toast('Dihapus');route()}
  }catch(err){toast(err.message)}
});
document.addEventListener('submit',async e=>{
  e.preventDefault();const o=Object.fromEntries(new FormData(e.target));
  try{
    if(e.target.id==='loginForm'){const r=await post({action:'login',...o});sessionStorage.setItem('w',JSON.stringify(r));S={sheet:null,edit:null};location.hash=r.user.role==='admin'?'#/admin':'#/ormawa';route()}
    if(e.target.id==='crudForm'){const key=S.sheet==='users'?'username':'id';if(S.edit[key])o[key]=S.edit[key];await post({action:'save',sheet:S.sheet,row:o});toast('Tersimpan');S.edit=null;delete cache[S.sheet];route()}
  }catch(err){toast(err.message)}
});
route();
