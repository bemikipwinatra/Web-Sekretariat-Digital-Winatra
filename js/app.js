'use strict';
/* Winatra front-end: routing hash, Bootstrap 5.3, mode demo otomatis bila API kosong */
const API=window.WINATRA_API,DEMO_ON=!API||API.startsWith('GANTI'),app=document.getElementById('app'),$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=u=>/^https?:\/\//i.test(u||'')?esc(u):'';
const fid=u=>{const m=String(u||'').match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);return m&&(m[1]||m[2])};
const thumb=u=>fid(u)?`https://drive.google.com/thumbnail?id=${fid(u)}&sz=w800`:url(u);
const fmt=d=>{const x=new Date(d);return isNaN(x)?esc(d):x.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
const wa=n=>{let d=String(n||'').replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);return d?'https://wa.me/'+d:''};
const para=s=>esc(s).split('\n').filter(Boolean).map(x=>`<p>${x}</p>`).join('');
const ses=()=>{try{return JSON.parse(sessionStorage.getItem('w'))}catch(e){return null}};
const J=s=>{try{return JSON.parse(s||'[]')}catch(e){return[]}};
const PAGE=document.body.dataset.page||'';
if(DEMO_ON)$('#demo').hidden=false;
const DASH=r=>r==='admin'?'admin.html':r==='kemahasiswaan'?'kemahasiswaan.html':'ormawa.html';
const DEMO_USERS={kemahasiswaan:['kem123','kemahasiswaan','Kemahasiswaan Demo',''],admin:['admin123','admin','Admin Demo',''],ormawa:['ormawa123','ormawa','Ormawa Demo','UKM Demo']};

/* ---- UI: toast + modal ---- */
function toast(msg,ok=true){const el=document.createElement('div');el.className='toast '+(ok?'ok':'er');el.setAttribute('role','status');
  el.innerHTML=`<div class="tb"><i class="bi ${ok?'bi-check-circle-fill':'bi-exclamation-triangle-fill'}"></i><span class="flex-grow-1">${esc(msg)}</span><button class="btn-close" data-bs-dismiss="toast" aria-label="Tutup"></button></div>`;
  $('#tc').append(el);el.addEventListener('hidden.bs.toast',()=>el.remove());new bootstrap.Toast(el,{delay:3600}).show()}
const MD=new bootstrap.Modal('#m');
const modal=(t,b,f='')=>{$('#mt').textContent=t;$('#mb').innerHTML=b;$('#mf').innerHTML=f;MD.show()};

/* ---- API (+ simulasi demo) ---- */
const cache={};let DB=null;
async function get(sheet){
  if(DEMO_ON){const d=structuredClone((JSON.parse(sessionStorage.getItem('wdb')||'null')||DEMO)[sheet]||[]);return sheet==='event'?d.filter(x=>x.status==='Tayang'):d}
  if(cache[sheet])return cache[sheet];
  const r=await (await fetch(`${API}?sheet=${sheet}`)).json();if(!r.ok)throw new Error(r.error);return cache[sheet]=r.data}
async function post(b){
  if(DEMO_ON){DB=DB||JSON.parse(sessionStorage.getItem('wdb')||'null')||structuredClone(DEMO);const sv=()=>sessionStorage.setItem('wdb',JSON.stringify(DB));await new Promise(r=>setTimeout(r,250));const k=b.sheet==='users'?'username':'id';
    if(b.action==='login'){const u=DEMO_USERS[b.username];if(!u||u[0]!==b.password)throw new Error('Username atau kata sandi salah');return{ok:true,token:'demo',user:{username:b.username,role:u[1],nama:u[2],ormawa:u[3]}}}
    const t=DB[b.sheet]=DB[b.sheet]||[];
    if(b.action==='list')return{ok:true,data:t};
    if(b.action==='save'){const row={...b.row};if(!row[k])row[k]=Date.now();const i=t.findIndex(x=>String(x[k])===String(row[k]));i<0?t.push(row):t[i]=row;sv();return{ok:true,id:row[k]}}
    if(b.action==='arsip'){const r=t.find(x=>String(x.id)===String(b.id));if(r)r.arsip=b.val?'ya':'';sv();return{ok:true}}
    if(b.action==='tinjau'){const r=t.find(x=>String(x.id)===String(b.id));if(r){r.status=b.status;r.catatan=b.catatan;r.status_kem=b.status==='Diterima'?(r.status_kem||'Menunggu'):'';if(b.status!=='Diterima')r.catatan_kem=''}sv();return{ok:true}}
    if(b.action==='decide_kem'){const r=t.find(x=>String(x.id)===String(b.id));if(r){r.status_kem=b.status;r.catatan_kem=b.catatan}sv();return{ok:true}}
    if(b.action==='remove'){DB[b.sheet]=t.filter(x=>String(x[k])!==String(b.id));sv();return{ok:true}}}
  const s=ses();if(s)b.token=s.token;
  const r=await (await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(b)})).json();
  if(!r.ok){if(/Sesi/.test(r.error)){sessionStorage.removeItem('w');navLogin()}throw new Error(r.error)}return r}

/* ---- komponen ---- */
const head=(t,p)=>`<section class="ph"><span class="pxb" style="right:6%;top:32px"></span><div class="container"><h1>${t}</h1><p>${p||''}</p></div></section>`;
const sec=(t,sub,body,more)=>`<section class="sec"><div class="container">${t?`<div class="bar"><div><h2>${t}</h2><p class="sub mb-0">${sub||''}</p></div>${more?`<a class="btn-px alt" href="${more}">Lihat semua</a>`:''}</div>`:''}${body}</div></section>`;
const empty=t=>`<div class="note">${t}</div>`;
const rv=(arr,fn)=>arr.map((x,i)=>fn(x).replace('class="card','style="--i:'+(i%6)+'" data-rv class="card').replace('data-rv class="card','class="rv card')).join('');
const im=(src,alt,c='')=>`<div class="im ${c}">${src?`<img loading="lazy" src="${thumb(src)}" alt="${esc(alt)}" onerror="this.remove()">`:''}</div>`;
const beritaCard=b=>`<a class="card" href="#/berita/${esc(b.id)}">${im(b.gambar,'')}<span class="tag">${fmt(b.tanggal)}</span><h3>${esc(b.judul)}</h3><p>${esc(b.ringkasan)}</p></a>`;
const eventCard=e=>`<button class="card text-start" data-ev="${esc(e.id)}">${im(e.poster,'Poster '+e.judul,'t')}<span class="tag">${esc(e.penyelenggara)}</span><h3>${esc(e.judul)}</h3><p>${fmt(e.tanggal)}${e.lokasi?' &middot; '+esc(e.lokasi):''}</p></button>`;

/* ---- halaman publik ---- */
async function home(){
  const [b,e]=await Promise.all([get('berita').catch(()=>[]),get('event').catch(()=>[])]);
  const bs=[...b].sort((x,y)=>String(y.tanggal).localeCompare(x.tanggal)).slice(0,3),es=[...e].sort((x,y)=>String(x.tanggal).localeCompare(y.tanggal)).slice(0,3);
  const q=[['event','dept-seni-olahraga-kebudayaan','Lihat Event','Agenda BEM dan ormawa'],['template','sekretaris-kabinet','Unduh Template','Surat dan administrasi'],['kementerian','staf-khusus-komunikasi','Call Center','Pengaduan dan aspirasi'],['ebook','dept-pendidikan-literasi','E-book Gratis','Koleksi bacaan']];
  return `<section class="hero"><span class="pxb a"></span><span class="pxb b"></span><div class="container"><div class="row align-items-center g-4"><div class="col-lg-7"><span class="eyebrow hi" style="--i:0">BEM IKIP PGRI BOJONEGORO</span><h1 class="hi" style="--i:1">Kabinet Winatra</h1><h2 class="hi" style="--i:2">Menyala untuk Mahasiswa</h2><p class="hi" style="--i:3">Pusat informasi, layanan, dan kolaborasi Badan Eksekutif Mahasiswa IKIP PGRI Bojonegoro bersama seluruh ormawa.</p><div class="cta hi" style="--i:4"><a class="btn-px" href="#/berita">Lihat berita terbaru</a><a class="btn-px alt" href="#/login">Masuk ormawa</a></div></div><div class="col-lg-5"><div class="stage hi" style="--i:3"><i></i><i></i><i></i><img src="assets/logo/kabinet-winatra-coklat.svg" alt="Logo Kabinet Winatra"></div></div></div></div></section>
  <section class="sec qk"><div class="container"><div class="grid g4">${q.map((x,i)=>`<a class="card quick rv" style="--i:${i}" href="#/${x[0]}"><img src="assets/ikon/${x[1]}.png" alt=""><div><b>${x[2]}</b><br><small>${x[3]}</small></div></a>`).join('')}</div></div></section>
  ${sec('Berita dan Media','Kabar terbaru dari BEM dan ormawa',bs.length?`<div class="grid g3">${rv(bs,beritaCard)}</div>`:empty('Belum ada berita.'),'#/berita')}
  ${sec('Event Mendatang','Kegiatan BEM, UKM, dan HMP',es.length?`<div class="grid g3">${rv(es,eventCard)}</div>`:empty('Belum ada event tayang.'),'#/event')}`}
async function berita(id){
  const b=await get('berita');
  if(id){const x=b.find(i=>String(i.id)===id);if(!x)return empty('Berita tidak ditemukan.');
    return head(esc(x.judul),`${fmt(x.tanggal)}${x.penulis?' &middot; '+esc(x.penulis):''}`)+`<section class="sec"><div class="container"><div class="prose">${x.gambar?`<img src="${thumb(x.gambar)}" alt="" onerror="this.remove()">`:''}${para(x.isi)}<a class="btn-px alt mt-3" href="#/berita"><i class="bi bi-arrow-left"></i> Kembali</a></div></div></section>`}
  const s=[...b].sort((x,y)=>String(y.tanggal).localeCompare(x.tanggal));
  return head('Berita dan Media','Kabar terbaru dari BEM dan ormawa')+sec('','',s.length?`<div class="grid g3">${rv(s,beritaCard)}</div>`:empty('Belum ada berita.'))}
const ini=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const photo=(u,n,w=96)=>`<div class="ph-w" style="--pw:${w}px"><span>${esc(ini(n))}</span>${u?`<img loading="lazy" src="${thumb(u)}" alt="Foto ${esc(n)}" onerror="this.remove()">`:''}</div>`;
const person=(p,cls='',w=104,tag='div',href='')=>`<${tag} class="pc ${cls}"${href?` href="${href}"`:''}>${photo(p.foto,p.nama,w)}<b class="pn">${esc(p.nama||'Belum diisi')}</b><span class="pj">${esc(p.jabatan)}</span>${p.extra||''}</${tag}>`;
const dc=m=>{if(m.logo==='presiden-wapres')return 'Pimpinan BEM';const d=J(m.departemen),n=d.filter(i=>/^Departemen/.test(i.n)).length,st=d.length-n;return `${n} departemen${st?` &middot; ${st} staf`:''}`};
async function pimpinan(){
  let p=[];try{p=(await get('pejabat')).filter(x=>String(x.jabatan||'').trim()&&String(x.nama||'').trim())}catch(e){}
  if(!p.length){const pr=(await get('kementerian')).find(x=>x.logo==='presiden-wapres');p=pr?J(pr.departemen).map((d,i)=>({jabatan:d.n,nama:d.p,foto:d.f||'',urut:i+1})):[]}
  return [...p].filter(x=>!/pertimbangan|khusus/i.test(x.jabatan)).sort((a,b)=>a.urut-b.urut)}
const ICO={'sekretaris':'sekretaris-kabinet','pertimbangan':'dewan-pertimbangan-presiden','khusus':'staf-khusus-komunikasi'};
const icoOf=j=>{const k=Object.keys(ICO).find(x=>String(j).toLowerCase().includes(x));return k?`assets/ikon/${ICO[k]}.png`:''};
const pr=(p,o={})=>{const t=o.tag||'div';return `<${t} class="pr ${o.cls||''}"${o.href?` href="${o.href}"`:''}>${photo(p.foto,p.nama,o.w||52)}<span class="pt"><b>${esc(p.nama||'Belum diisi')}</b><small>${esc(p.jabatan)}</small></span>${o.logo?`<img class="pl" src="${o.logo}" alt="">`:''}</${t}>`};
async function struktur(){
  const [k,p]=await Promise.all([get('kementerian'),pimpinan()]);k.sort((a,b)=>a.urut-b.urut);
  const mem=k.filter(x=>x.logo!=='presiden-wapres'),pres=p.find(x=>/^presiden/i.test(x.jabatan)),wp=p.find(x=>/^wakil/i.test(x.jabatan)),sek=p.find(x=>/sekretaris/i.test(x.jabatan)),LG='assets/logo/presiden-wapres.png';
  const dep=m=>J(m.departemen).map(d=>`<li>${d.i?`<img src="assets/ikon/${esc(d.i)}.png" alt="">`:'<i></i>'}<span><b>${esc(d.p||'Belum diisi')}</b><small>${esc(d.n)}</small></span></li>`).join('');
  return head('Struktur Organisasi','Susunan Kabinet Winatra')+`<section class="sec"><div class="container"><div class="org3">
  ${pres?`<div class="olead">${pr(pres,{cls:'dk big',w:64,logo:LG})}</div><div class="vl s"></div>`:''}
<<<<<<< HEAD
  ${wp?`<div class="wprow"><div class="olead">${pr(wp,{cls:'wp big',w:64,logo:LG})}</div>${sek?`<div class="vl s sekv"></div><div class="sekr">${pr(sek,{cls:'plain',w:52})}</div>`:''}</div><div class="vl s"></div>`:''}
=======
  ${wp?`<div class="wprow"><div class="olead">${pr(wp,{cls:'wp big',w:64,logo:LG})}</div>${sek?`<div class="vl s sekv"></div><div class="sekr">${pr(sek,{w:52,logo:icoOf(sek.jabatan)})}</div>`:''}</div><div class="vl tall"></div>`:''}
>>>>>>> c966afd (final struktur desain)
  <div class="kids2" style="--n:${mem.length||1}">${mem.map(m=>`<div class="kc"><div class="mn"><a class="mh" href="#/kementerian/${esc(m.id)}"><img src="assets/logo/${esc(m.logo)}.png" alt=""><b>${esc(m.nama)}</b></a>${pr({foto:m.foto,nama:m.menteri,jabatan:'Menteri'},{cls:'flat',w:48})}<ul class="dl3">${dep(m)}</ul></div></div>`).join('')}</div></div></div></section>`}
async function kementerian(id){
  const k=(await get('kementerian')).sort((a,b)=>a.urut-b.urut),pjs=await pimpinan();
  const pres=pjs.find(x=>/^presiden/i.test(x.jabatan)),wp=pjs.find(x=>/^wakil/i.test(x.jabatan));
  if(id){const x=k.find(i=>String(i.id)===id);if(!x)return empty('Tidak ditemukan.');
    const isP=x.logo==='presiden-wapres',li=t=>`<ul class="mt-2">${String(t||'').split('\n').filter(Boolean).map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`;
    const lead=isP?[pres,wp].filter(Boolean).map(q=>({nm:q.nama,f:q.foto,tg:q.jabatan})):[{nm:x.menteri,f:x.foto,tg:'Menteri'}];
    const deps=J(x.departemen).filter(d=>!(isP&&/^(presiden|wakil presiden)/i.test(d.n)));
    const dcard=d=>{const q=pjs.find(z=>z.jabatan===d.n)||{},f=d.f||q.foto||'',nm=d.p||q.nama||'';return `<div class="dcard">${photo(f,nm||d.n,72)}<div class="dbody"><b class="dn">${esc(nm||'Belum diisi')}</b><span class="dd">${d.i?`<img src="assets/ikon/${esc(d.i)}.png" alt="">`:''}${esc(d.n)}</span>${d.t?`<details><summary>Lihat tupoksi</summary>${li(d.t)}</details>`:''}</div></div>`};
    return head(esc(x.nama),dc(x))+`<section class="sec"><div class="container"><div class="row g-4"><div class="col-lg-5"><div class="card"><div class="kc-top"><div class="d-grid gap-3">${lead.map(l=>`<div class="ldr">${photo(l.f,l.nm,84)}<div><span class="tag">${esc(l.tg)}</span><div class="mname">${esc(l.nm||'Belum diisi')}</div></div></div>`).join('')}</div><img class="kimg" src="assets/logo/${esc(x.logo)}.png" alt="Logo ${esc(x.nama)}"></div><h3 class="mt-3">Tugas pokok dan fungsi</h3>${li(x.tupoksi)||'<p>Belum diisi.</p>'}<h3 class="mt-3">Call center</h3><p>${x.callcenter?(wa(x.callcenter)?`<a href="${wa(x.callcenter)}" target="_blank" rel="noopener">${esc(x.callcenter)}</a>`:esc(x.callcenter)):'Belum tersedia.'}</p></div></div><div class="col-lg-7"><div class="grid">${deps.map(dcard).join('')}</div></div></div><a class="btn-px alt mt-4" href="#/kementerian"><i class="bi bi-arrow-left"></i> Kembali</a></div></section>`}
  const rows=k.filter(x=>x.logo!=='presiden-wapres');
  return head('Kementerian dan Departemen','Tugas pokok, fungsi, dan jalur pengaduan')+sec('','',`<div class="grid g3">${rv(rows,x=>`<a class="card" href="#/kementerian/${esc(x.id)}"><div class="kc-top">${photo(x.foto,x.menteri,84)}<img class="kimg" src="assets/logo/${esc(x.logo)}.png" alt=""></div><div class="mname mt-2">${esc(x.menteri)}</div><h3 class="kname">${esc(x.nama)}</h3><p>${dc(x)} &middot; Call center: ${esc(x.callcenter||'-')}</p></a>`)}</div>`)}
let evFilter='Semua';
async function event(){
  const e=(await get('event')).sort((a,b)=>String(a.tanggal).localeCompare(b.tanggal)),l=e.filter(x=>evFilter==='Semua'||(evFilter==='BEM'?/^BEM/i.test(x.penyelenggara):!/^BEM/i.test(x.penyelenggara)));
  return head('Event dan Panel Ormawa','Kanal promosi kegiatan BEM, UKM, dan HMP')+`<section class="sec"><div class="container"><div class="chips">${['Semua','BEM','Ormawa'].map(c=>`<button class="chip ${c===evFilter?'on':''}" data-filter="${c}">${c==='Semua'?c:'Event '+c}</button>`).join('')}</div>${l.length?`<div class="grid g3">${rv(l,eventCard)}</div>`:empty('Belum ada event pada kategori ini.')}<p class="note">Ormawa yang ingin mempromosikan kegiatan dapat <a href="#/login">masuk</a> dan menambahkan event dari dasbor.</p></div></section>`}
async function template(){
  const t=await get('template'),st=[['Panitia Pelaksana','Menyusun proposal'],['Ormawa Terkait','Verifikasi dan tanda tangan'],['BEM','Telaah dan rekomendasi'],['Staf Kemahasiswaan','Pemeriksaan berkas'],['Wakil Rektor','Bidang Kemahasiswaan dan Akademik']];
  return head('Template dan Administrasi','Format surat dan alur pengajuan kegiatan')+sec('Template Penyuratan','Unduh dari Google Drive',t.length?`<div class="grid g3">${rv(t,x=>`<div class="card"><span class="tag">${esc(x.kategori||'Template')}</span><h3>${esc(x.nama)}</h3><div><a class="btn-px sm" href="${url(x.tautan)}" target="_blank" rel="noopener"><i class="bi bi-download"></i> Unduh</a></div></div>`)}</div>`:empty('Belum ada template.'))+sec('Alur Administrasi Ormawa','Jalur pengajuan kegiatan sampai persetujuan akhir',`<div class="flow">${st.map((s,i)=>`<div class="st rv" style="--i:${i}"><span class="n">${i+1}</span><br><b>${s[0]}</b><p>${s[1]}</p></div>`).join('')}</div>`)}
async function ebook(){
  const e=await get('ebook'),cats=['Semua',...new Set(e.map(x=>x.kategori).filter(Boolean))];
  return head('E-book Gratis','Koleksi bacaan untuk mahasiswa')+`<section class="sec"><div class="container"><div class="chips">${cats.map((c,i)=>`<button class="chip ${i?'':'on'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>${e.length?`<div class="grid g4" id="books">${e.map((x,i)=>`<div class="card rv" style="--i:${i%6}" data-k="${esc(x.kategori)}">${im(x.sampul,'Sampul '+x.judul,'t')}<h3>${esc(x.judul)}</h3><p>${esc(x.penulis)}</p><div><a class="btn-px sm" href="${url(x.tautan)}" target="_blank" rel="noopener">Baca / Unduh</a></div></div>`).join('')}</div>`:empty('Belum ada e-book.')}</div></section>`}
async function tim(){
  let t=[];try{t=await get('tim')}catch(e){}
  t=t.filter(x=>String(x.nama||'').trim());
  if(!t.length)t=[{peran:'Pimpinan Produksi',nama:'Dedy Indra Setiawan',urut:1},{peran:'Penanggung Jawab',nama:'Aulia',urut:2},{peran:'Monitoring & Maintenance',nama:'Yoga',urut:3}];
  t.sort((a,b)=>a.urut-b.urut);const g=[];t.forEach(x=>{let e=g.find(y=>y[0]===x.peran);if(!e)g.push(e=[x.peran,[]]);e[1].push(x)});
  return head('Tim Pengembang Web','Departemen Informasi dan Teknologi, Kementerian Media dan Informasi')+`<section class="sec"><div class="container"><div class="org3">${g.map(([r,l],i)=>`${i?'<div class="vl s"></div>':''}<div class="tg"><h2>${esc(r)}</h2><div class="tgl">${l.map(p=>pr({...p,jabatan:r},{w:60,cls:i?'':'dk big',logo:'assets/ikon/dept-informasi-teknologi.png'})).join('')}</div></div>`).join('')}</div></div></section>`}

/* ---- login + dasbor ---- */
const navLogin=()=>{const s=ses(),a=$('#loginLink');if(!a)return;a.textContent=s?'Dasbor':'Masuk';a.href=s?DASH(s.user.role):'#/login'};
async function login(){
  const s=ses();if(s){location.href=DASH(s.user.role);return''}
  return head('Masuk','Akses khusus pemegang Winatra Card')+`<section class="sec"><div class="container"><div class="lg-wrap"><div class="lg-f"><form class="card" id="loginForm"><label>Username<input class="form-control" name="username" required autocomplete="username" autocapitalize="none"></label><label>Kata sandi<input class="form-control" name="password" type="password" required autocomplete="current-password"></label><button class="btn-px" type="submit">Masuk</button><p class="mb-0 small">${DEMO_ON?'Mode demo:<br>Admin: <b>admin</b> / <b>admin123</b><br>Ormawa: <b>ormawa</b> / <b>ormawa123</b><br>Kemahasiswaan: <b>kemahasiswaan</b> / <b>kem123</b>':'Isi dengan username dan kata sandi yang tertera pada Winatra Card.'}</p></form></div>
  <div class="lg-c"><div class="wcard"><img class="wc-img" src="assets/img/winatra-card-sensor.png" width="1100" height="693" alt="Contoh Winatra Card, data akun disamarkan"><div class="wc-sh" aria-hidden="true"></div><div class="wc-cap"><span class="tag"><i class="bi bi-credit-card-2-front"></i> Winatra Card</span><h2>Masuk hanya dengan Winatra Card</h2><p>Username dan kata sandi hanya tertera pada Winatra Card yang dibagikan BEM kepada setiap ormawa.</p></div></div></div></div></div></section>`}
const TITLE={berita:'Berita',event:'Event',proker:'Proker',proker_bem:'Proker BEM',tinjau:'Tinjau Proker Ormawa',pejabat:'Struktur: Pimpinan',struktur:'Struktur',tim:'Tim Web',ebook:'E-book',template:'Template',kementerian:'Kementerian',users:'Pengguna'};
const FIELDS={
 berita:[['judul','Judul'],['ringkasan','Ringkasan','area'],['isi','Isi berita','area'],['gambar','Tautan gambar (Drive)','url'],['tanggal','Tanggal','date'],['penulis','Penulis']],
 event:[['judul','Judul event'],['penyelenggara','Penyelenggara'],['tanggal','Tanggal','date'],['lokasi','Lokasi'],['poster','Tautan poster (Drive)','url'],['juknis','Tautan juknis (Drive)','url'],['narahubung','Nama narahubung'],['kontak','WhatsApp narahubung','tel'],['status','Status','select:Tayang,Draf,Menunggu']],
 proker:[['ormawa','Ormawa'],['program','Nama program kerja'],['waktu','Waktu pelaksanaan'],['anggaran','Perkiraan anggaran (Rp)','number'],['pj','Penanggung jawab'],['kontak','WhatsApp','tel'],['tautan','Tautan dokumen proker (Drive)','url'],['deskripsi','Deskripsi singkat','area'],['status','Status BEM','select:Ditinjau,Diterima,Revisi,Ditolak'],['catatan','Catatan untuk ormawa (wajib jika Revisi/Ditolak)','area']],
 ebook:[['judul','Judul'],['penulis','Penulis'],['kategori','Kategori'],['sampul','Tautan sampul (Drive)','url'],['tautan','Tautan e-book (Drive)','url']],
 template:[['nama','Nama template'],['kategori','Kategori'],['tautan','Tautan file (Drive)','url']],
 tim:[['peran','Peran (contoh: Pimpinan Produksi)'],['nama','Nama'],['foto','Foto (tautan Google Drive)','url'],['urut','Urutan','number']],
 struktur:[['jabatan','Jabatan'],['nama','Nama'],['foto','Foto','url']],
 pejabat:[['jabatan','Jabatan'],['nama','Nama'],['foto','Foto (tautan Google Drive)','url'],['urut','Urutan','number']],
 kementerian:[['nama','Nama kementerian'],['menteri','Nama menteri'],['foto','Foto menteri (tautan Google Drive)','url'],['tupoksi','Tupoksi (satu baris satu poin)','area'],['callcenter','Call center (WhatsApp)','tel'],['logo','Nama file logo'],['urut','Urutan','number'],['departemen','Departemen dan staf','dep']],
 users:[['username','Username'],['password','Kata sandi (kosongkan jika tidak diubah)','password'],['nama','Nama'],['role','Peran','select:ormawa,admin,kemahasiswaan'],['ormawa','Nama ormawa']]};
let S={sheet:null,rows:[],edit:null,next:null};
const DESC={struktur:'Semua nama yang tampil di halaman Struktur: Presiden, Wakil Presiden, Sekretaris Kabinet, menteri, dan pejabat tiap departemen. Klik Ubah untuk mengganti nama dan foto (tautan Drive). Menambah atau menghapus departemen dilakukan lewat tab Kementerian.',pejabat:'Mengatur Presiden, Wakil Presiden, Sekretaris Kabinet, Dewan Pertimbangan Presiden, dan Staf Khusus yang tampil di halaman Struktur. Isi nama, foto (tautan Drive), dan urutan. Urutan 1 = Presiden, 2 = Wakil Presiden.',tim:'Susunan tim pengembang web di halaman Tim Web. Orang dengan peran yang sama otomatis dikelompokkan. Urutan menentukan posisi kelompok.',kementerian:'Nama menteri, foto menteri, tupoksi, call center, dan daftar departemen beserta pejabat dan fotonya.'};
const ARS=['proker','proker_bem','event','tinjau'];
const SH=()=>['proker_bem','tinjau'].includes(S.sheet)?'proker':S.sheet;
const isBem=x=>x.pemilik==='admin'||x.ormawa==='BEM';
const keyOf=()=>S.sheet==='users'?'username':S.sheet==='struktur'?'rid':'id';
const LBL={grup:'Bagian',foto:'Foto',jabatan:'Jabatan',nama:'Nama',status:'Status BEM',catatan:'Catatan BEM',status_kem:'Status Kemahasiswaan',catatan_kem:'Catatan Kemahasiswaan'};
const cell=(x,c)=>{if(/^status/.test(c)){const v=c==='status_kem'&&x.status==='Diterima'&&!x[c]?'Menunggu':x[c];return v?`<span class="badge ${esc(v)}">${esc(v)}</span>`:'-'}if(c==='foto')return x.foto?'Ada':'-';return esc(String(x[c]??'').slice(0,140))||'-'};
async function kemDash(s){
  S.sheet='proker';S.kind='kemahasiswaan';
  S.rows=(await post({action:'list',sheet:'proker'})).data.filter(x=>x.status==='Diterima');
  const st=x=>x.status_kem||'Menunggu',n=k=>S.rows.filter(x=>st(x)===k).length;
  return head('Dasbor Kemahasiswaan','Proposal yang sudah disetujui BEM, siap dicetak dan diajukan')+`<section class="sec"><div class="container"><div class="stats"><div class="card"><small>Total proposal dari BEM</small><b>${S.rows.length}</b></div><div class="card"><small>Menunggu putusan</small><b>${n('Menunggu')}</b></div><div class="card"><small>Disetujui</small><b>${n('Disetujui')}</b></div><div class="card"><small>Revisi / Ditolak</small><b>${n('Revisi')+n('Ditolak')}</b></div></div>
  <div class="bar"><div class="chips">${['Semua','Menunggu','Disetujui','Revisi','Ditolak'].map((k,i)=>`<button class="chip ${i?'':'on'}" data-kf="${k}">${k}</button>`).join('')}</div><span class="acts"><button class="btn-px alt" data-act="print"><i class="bi bi-printer"></i> Cetak daftar</button><button class="btn-px dark" data-act="logout"><i class="bi bi-box-arrow-right"></i> Keluar</button></span></div>
  ${S.rows.length?`<table class="tbl"><thead><tr><th>Ormawa</th><th>Program kerja</th><th>Waktu</th><th>Anggaran</th><th>Proposal</th><th>Putusan</th><th>Keterangan</th><th class="noprint">Aksi</th></tr></thead><tbody>${S.rows.map(x=>`<tr data-s="${esc(st(x))}"><td data-l="Ormawa">${esc(x.ormawa)}</td><td data-l="Program">${esc(x.program)}</td><td data-l="Waktu">${esc(x.waktu)}</td><td data-l="Anggaran">${x.anggaran?'Rp '+Number(x.anggaran).toLocaleString('id-ID'):'-'}</td><td data-l="Proposal">${url(x.tautan)?`<a href="${url(x.tautan)}" target="_blank" rel="noopener">Buka</a>`:'-'}</td><td data-l="Putusan"><span class="badge ${esc(st(x))}">${esc(st(x))}</span></td><td data-l="Keterangan">${esc(x.catatan_kem)||'-'}</td><td class="noprint"><button class="btn-px sm" data-act="kem" data-id="${esc(x.id)}">Beri putusan</button></td></tr>`).join('')}</tbody></table>`:empty('Belum ada proposal yang disetujui BEM.')}</div></section>`}
function kemForm(r){
  S.edit=r;modal('Putusan proposal',`<p class="small mb-2"><b>${esc(r.program)}</b><br>${esc(r.ormawa)}</p><form id="kemForm"><label>Putusan<select class="form-select" name="status">${['Disetujui','Revisi','Ditolak'].map(o=>`<option ${o===r.status_kem?'selected':''}>${o}</option>`).join('')}</select></label><label>Keterangan untuk ormawa (wajib jika Revisi atau Ditolak, langsung terlihat oleh ormawa)<textarea class="form-control" name="catatan" rows="4">${esc(r.catatan_kem)}</textarea></label></form>`,`<button class="btn-px alt" data-bs-dismiss="modal">Batal</button><button class="btn-px" type="submit" form="kemForm">Simpan putusan</button>`)}
const stat=(t,v)=>`<div class="card"><small>${t}</small><b>${v}</b></div>`;
function statCards(f){
  const c=fn=>S.rows.filter(fn).length,sk=x=>x.status_kem||(x.status==='Diterima'?'Menunggu':'');
  let a;
  if(S.sheet==='tinjau')a=[['Proker ormawa',S.rows.length],['Perlu ditinjau',c(x=>x.status==='Ditinjau')],['Diterima BEM',c(x=>x.status==='Diterima')],['Revisi / Ditolak',c(x=>['Revisi','Ditolak'].includes(x.status))]];
  else if(S.sheet==='proker_bem')a=[['Proker BEM',S.rows.length],['Menunggu Kemahasiswaan',c(x=>sk(x)==='Menunggu')],['Disetujui',c(x=>sk(x)==='Disetujui')],['Revisi / Ditolak',c(x=>['Revisi','Ditolak'].includes(sk(x)))]];
  else a=[['Total '+TITLE[S.sheet],S.rows.length]].concat(f.find(x=>x[0]==='status')?[['Menunggu / Ditinjau',c(x=>['Menunggu','Ditinjau'].includes(x.status))],['Tayang / Diterima',c(x=>['Tayang','Diterima'].includes(x.status))]]:[]);
  return `<div class="stats">${a.map(x=>stat(...x)).join('')}</div>`}
function tinjauForm(r){
  S.edit=r;const lk=url(r.tautan),w=wa(r.kontak);
  modal('Tinjau proker: '+r.program,`<dl class="det"><dt>Ormawa</dt><dd>${esc(r.ormawa)}</dd><dt>Waktu</dt><dd>${esc(r.waktu)||'-'}</dd><dt>Anggaran</dt><dd>${r.anggaran?'Rp '+Number(r.anggaran).toLocaleString('id-ID'):'-'}</dd><dt>Penanggung jawab</dt><dd>${esc(r.pj)||'-'}${w?` | <a href="${w}" target="_blank" rel="noopener">WhatsApp</a>`:''}</dd><dt>Deskripsi</dt><dd>${esc(r.deskripsi)||'-'}</dd><dt>Status saat ini</dt><dd>${cell(r,'status')}${r.catatan?' | '+esc(r.catatan):''}</dd></dl>${lk?`<p><a class="btn-px alt sm" href="${lk}" target="_blank" rel="noopener"><i class="bi bi-file-earmark-text"></i> Buka dokumen proposal</a></p>`:'<p class="small">Tautan proposal belum diisi.</p>'}
  <form id="tinjauForm"><label>Keputusan BEM<select class="form-select" name="status">${['Diterima','Revisi','Ditolak'].map(o=>`<option ${o===r.status?'selected':''}>${o}</option>`).join('')}</select></label><label>Catatan untuk ormawa (wajib jika Revisi atau Ditolak, langsung terlihat oleh ormawa)<textarea class="form-control" name="catatan" rows="3">${esc(r.catatan)}</textarea></label><p class="small mb-0">Jika <b>Diterima</b>, proposal otomatis diteruskan ke Kemahasiswaan.</p></form>`,`<button class="btn-px alt" data-bs-dismiss="modal">Batal</button><button class="btn-px" type="submit" form="tinjauForm">Simpan keputusan</button>`)}
const acts=x=>{const id=esc(x[keyOf()]),own=ses().user.role!=='admin',a=x.arsip==='ya';
  return (S.sheet==='tinjau'?`<button class="btn-px sm" data-act="tinjau" data-id="${id}">Tinjau</button>`:`<button class="btn-px sm" data-act="edit" data-id="${id}">Ubah</button>`)
  +(ARS.includes(S.sheet)?`<button class="btn-px sm alt" data-act="arsip" data-id="${id}" data-v="${a?0:1}"><i class="bi bi-${a?'arrow-counterclockwise':'archive'}"></i> ${a?'Aktifkan':'Arsipkan'}</button>`:'')
  +(['proker','proker_bem','tinjau','struktur'].includes(S.sheet)||(S.sheet==='event'&&own)?'':`<button class="btn-px sm del" data-act="del" data-id="${id}">Hapus</button>`)};
const viewChips=()=>ARS.includes(S.sheet)?`<div class="chips">${[['aktif','Aktif'],['arsip','Arsip (selesai)']].map(([v,l])=>`<button class="chip ${S.view===v?'on':''}" data-view="${v}">${l} (${S.all.filter(x=>(x.arsip==='ya')===(v==='arsip')).length})</button>`).join('')}</div>`:'';
const deItem=(d={})=>`<fieldset class="de"><label>Nama departemen / jabatan<input class="form-control" data-k="n" value="${esc(d.n)}"></label><label>Nama pejabat<input class="form-control" data-k="p" value="${esc(d.p)}"></label><label>Foto pejabat (tautan Google Drive)<input class="form-control" data-k="f" type="url" value="${esc(d.f)}"></label><label>Nama file ikon (opsional)<input class="form-control" data-k="i" value="${esc(d.i)}"></label><label>Tupoksi (satu baris satu poin)<textarea class="form-control" data-k="t" rows="3">${esc(d.t)}</textarea></label><button type="button" class="btn-px sm del" data-act="depdel">Hapus bagian ini</button></fieldset>`;
const depEditor=r=>`<div id="depEd"><b class="d-block mb-2">Departemen dan staf</b><div class="dl">${J(r?.departemen).map(deItem).join('')}</div><button type="button" class="btn-px sm alt mb-3" data-act="depadd"><i class="bi bi-plus-lg"></i> Tambah departemen / staf</button></div>`;
const collectDep=()=>[...document.querySelectorAll('#depEd .de')].map(f=>Object.fromEntries([...f.querySelectorAll('[data-k]')].map(x=>[x.dataset.k,x.value.trim()]))).filter(d=>d.n);
const NOTIN=/pertimbangan|khusus/i;
async function strukturRows(){
  const [pj,k]=await Promise.all([post({action:'list',sheet:'pejabat'}).then(r=>r.data).catch(()=>[]),post({action:'list',sheet:'kementerian'}).then(r=>r.data)]);
  k.sort((a,b)=>a.urut-b.urut);const rows=[],pw=k.find(x=>x.logo==='presiden-wapres');
  const pim=pj.filter(x=>String(x.jabatan||'').trim());
  if(pim.length)pim.filter(x=>!NOTIN.test(x.jabatan)).sort((a,b)=>a.urut-b.urut).forEach(x=>rows.push({rid:'p:'+x.id,grup:'Pimpinan',jabatan:x.jabatan,nama:x.nama,foto:x.foto,_:{t:'p',row:x}}));
  else if(pw)J(pw.departemen).filter(d=>!NOTIN.test(d.n)).forEach((d,i)=>rows.push({rid:'d:'+pw.id+':'+i,grup:'Pimpinan',jabatan:d.n,nama:d.p,foto:d.f,_:{t:'d',row:pw,i}}));
  k.filter(x=>x.logo!=='presiden-wapres').forEach(m=>{rows.push({rid:'m:'+m.id,grup:m.nama,jabatan:'Menteri',nama:m.menteri,foto:m.foto,_:{t:'m',row:m}});J(m.departemen).forEach((d,i)=>rows.push({rid:'d:'+m.id+':'+i,grup:m.nama,jabatan:d.n,nama:d.p,foto:d.f,_:{t:'d',row:m,i}}))});
  return rows}
function strForm(r){
  S.edit=r;modal('Ubah: '+r.jabatan,`<p class="small mb-2">${esc(r.grup)}</p><form id="strForm"><label>Nama<input class="form-control" name="nama" required value="${esc(r.nama)}"></label><label>Foto (tautan Google Drive)<input class="form-control" name="foto" type="url" value="${esc(r.foto)}"></label></form>`,`<button class="btn-px alt" data-bs-dismiss="modal">Batal</button><button class="btn-px" type="submit" form="strForm">Simpan</button>`)}
async function dash(kind){
  const s=ses();
  if(!s){location.href='index.html#/login';return''}
  if(s.user.role!==kind){location.href=DASH(s.user.role);return''}
  if(kind==='kemahasiswaan')return kemDash(s);
  const tabs=kind==='admin'?['tinjau','proker_bem','berita','event','ebook','template','struktur','tim','kementerian','users']:['proker','event'];if(!tabs.includes(S.sheet))S.sheet=tabs[0];S.kind=kind;
  S.rows=S.sheet==='struktur'?await strukturRows():(await post({action:'list',sheet:SH()})).data;S.view=S.view||'aktif';if(S.sheet==='proker_bem')S.rows=S.rows.filter(isBem);if(S.sheet==='tinjau')S.rows=S.rows.filter(x=>!isBem(x));S.all=S.rows;if(ARS.includes(S.sheet))S.rows=S.rows.filter(x=>(x.arsip==='ya')===(S.view==='arsip'));const f=FIELDS[SH()],own=s.user.role!=='admin',cols=S.sheet==='struktur'?['grup','jabatan','nama','foto']:S.sheet==='tinjau'?['ormawa','program','waktu','status','catatan','status_kem']:S.sheet==='proker_bem'?['program','waktu','status_kem','catatan_kem']:SH()==='proker'?(own?['program','waktu']:['ormawa','program']).concat(['status','catatan','status_kem','catatan_kem']):f.slice(0,3).map(x=>x[0]).concat(f.find(x=>x[0]==='status')?['status']:[]);
  const cnt=st=>S.rows.filter(x=>x.status===st).length;
  return head(kind==='admin'?'Dasbor Super Admin':'Dasbor Ormawa',`Masuk sebagai ${esc(s.user.nama)}${s.user.ormawa?' ('+esc(s.user.ormawa)+')':''}`)+`<section class="sec"><div class="container"><div class="dash"><nav class="side" aria-label="Data">${tabs.map(t=>`<button class="chip ${t===S.sheet?'on':''}" data-tab="${t}">${TITLE[t]}</button>`).join('')}<button class="chip" data-act="logout"><i class="bi bi-box-arrow-right"></i> Keluar</button></nav>
  <div>${statCards(f)}
  <div class="bar"><input class="form-control" id="q" type="search" placeholder="Cari data..." aria-label="Cari" style="max-width:320px">${['tinjau','struktur'].includes(S.sheet)?'':'<button class="btn-px" data-act="new"><i class="bi bi-plus-lg"></i> Tambah</button>'}</div>
  ${DESC[S.sheet]?`<p class="hint">${DESC[S.sheet]}</p>`:''}${viewChips()}
  ${S.rows.length?`<table class="tbl"><thead><tr>${cols.map(c=>`<th>${LBL[c]||c}</th>`).join('')}<th>Aksi</th></tr></thead><tbody>${S.rows.map(x=>`<tr>${cols.map(c=>`<td data-l="${LBL[c]||c}">${cell(x,c)}</td>`).join('')}<td><div class="acts">${acts(x)}</div></td></tr>`).join('')}</tbody></table>`:empty('Belum ada data.')}</div></div></div></section>`}
function form(row){
  if(S.sheet==='struktur')return strForm(row);
  S.edit=row;
  const own=ses().user.role!=='admin',f=FIELDS[SH()].filter(x=>!((own||S.sheet==='proker_bem')&&['status','penyelenggara','catatan','ormawa'].includes(x[0])));
  const inp=([k,l,t])=>{const v=row?.[k]??'',b=`class="form-control" name="${k}"`;
    if(t==='dep')return depEditor(row);
    if(t==='area')return`<label>${l}<textarea ${b} rows="3">${esc(v)}</textarea></label>`;
    if(t?.startsWith('select'))return`<label>${l}<select class="form-select" name="${k}">${t.slice(7).split(',').map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></label>`;
    return`<label>${l}<input ${b} type="${t||'text'}" ${t==='tel'?'inputmode="tel"':''} value="${k==='password'?'':esc(v)}" ${['judul','program','username','nama','jabatan','peran'].includes(k)?'required':''}></label>`};
  modal((row?'Ubah ':'Tambah ')+TITLE[S.sheet],`<form id="crudForm">${f.map(inp).join('')}</form>`,`<button class="btn-px alt" data-bs-dismiss="modal">Batal</button><button class="btn-px" type="submit" form="crudForm">Simpan</button>`)}

/* ---- router ---- */
const R={'':home,berita,struktur,kementerian,event,template,ebook,tim,login};
const reveal=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');reveal.unobserve(e.target)}}),{threshold:.12});
async function route(){
  if(PAGE.startsWith('dash-')){app.innerHTML=await dash(PAGE.slice(5));return}
  const [p,id]=location.hash.slice(2).split('/');
  app.innerHTML=`<section class="sec"><div class="container"><div class="grid g3">${'<div class="sk"></div>'.repeat(3)}</div></div></section>`;
  try{app.innerHTML=await (R[p||'']||home)(id)}catch(e){app.innerHTML=`<section class="sec"><div class="container">${empty(esc(e.message||e))}</div></section>`}
  app.querySelectorAll('.rv').forEach(el=>reveal.observe(el));
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+(p||'')));
  navLogin()}
addEventListener('hashchange',()=>{if(PAGE)return;bootstrap.Offcanvas.getInstance('#oc')?.hide();scrollTo(0,0);route()});
addEventListener('scroll',()=>{$('#top').classList.toggle('sm',scrollY>24);$('#up').classList.toggle('on',scrollY>400)},{passive:true});
$('#up').onclick=()=>scrollTo({top:0});
document.addEventListener('input',e=>{if(e.target.id==='q'){const v=e.target.value.toLowerCase();document.querySelectorAll('.tbl tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(v))}});
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-filter],[data-cat],[data-tab],[data-act],[data-ev],[data-kf],[data-view]');if(!b)return;const d=b.dataset;
  if(d.ev){const x=(await get('event')).find(i=>String(i.id)===d.ev);if(x)modal(x.judul,`${x.poster?`<img class="w-100 mb-3 border border-2 border-dark" src="${thumb(x.poster)}" alt="Poster ${esc(x.judul)}" onerror="this.remove()">`:''}<p class="tag mb-1">${esc(x.penyelenggara)}</p><p><i class="bi bi-calendar-event"></i> ${fmt(x.tanggal)}${x.lokasi?'<br><i class="bi bi-geo-alt"></i> '+esc(x.lokasi):''}</p><p class="mb-0">Narahubung: <b>${esc(x.narahubung||'-')}</b></p>`,`${x.juknis?`<a class="btn-px alt" href="${url(x.juknis)}" target="_blank" rel="noopener">Juknis</a>`:''}${wa(x.kontak)?`<a class="btn-px" href="${wa(x.kontak)}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Hubungi</a>`:''}`);return}
  if(d.kf){document.querySelectorAll('[data-kf]').forEach(c=>c.classList.toggle('on',c===b));document.querySelectorAll('.tbl tbody tr').forEach(r=>r.hidden=!(d.kf==='Semua'||r.dataset.s===d.kf));return}
  if(d.act==='print')return print();
  if(d.view){S.view=d.view;return route()}
  if(d.act==='depadd'){document.querySelector('#depEd .dl').insertAdjacentHTML('beforeend',deItem());return}
  if(d.act==='depdel'){b.closest('.de').remove();return}
  if(d.act==='arsip'){try{await post({action:'arsip',sheet:SH(),id:d.id,val:d.v==='1'});delete cache[SH()];toast(d.v==='1'?'Diarsipkan: program selesai':'Diaktifkan kembali');route()}catch(err){toast(err.message,false)}return}
  if(d.filter){evFilter=d.filter;return route()}
  if(d.cat){document.querySelectorAll('[data-cat]').forEach(c=>c.classList.toggle('on',c===b));document.querySelectorAll('#books .card').forEach(c=>c.hidden=!(d.cat==='Semua'||c.dataset.k===d.cat));return}
  if(d.tab){S.sheet=d.tab;S.view='aktif';return route()}
  if(d.act==='logout'){sessionStorage.removeItem('w');location.href='index.html#/login';return}
  if(d.act==='new')return form(null);
  const row=S.rows.find(x=>String(x[keyOf()])===d.id);
  if(d.act==='kem')return kemForm(row);
  if(d.act==='tinjau')return tinjauForm(row);
  if(d.act==='edit')return form(row);
  if(d.act==='del')modal('Hapus data?',`<p class="mb-0">Data <b>${esc(row?.judul||row?.program||row?.nama||row?.username||d.id)}</b> akan dihapus permanen.</p>`,`<button class="btn-px alt" data-bs-dismiss="modal">Batal</button><button class="btn-px del" data-act="confirm" data-id="${esc(d.id)}">Hapus</button>`);
  if(d.act==='confirm'){try{await post({action:'remove',sheet:SH(),id:d.id});MD.hide();delete cache[SH()];toast('Data dihapus');route()}catch(err){toast(err.message,false)}}
});
document.addEventListener('submit',async e=>{
  e.preventDefault();const o=Object.fromEntries(new FormData(e.target)),btn=e.target.querySelector('[type=submit]')||document.querySelector('[form=crudForm]');
  try{
    if(e.target.id==='loginForm'){const r=await post({action:'login',...o});sessionStorage.setItem('w',JSON.stringify(r));location.href=DASH(r.user.role)}
    if(e.target.id==='tinjauForm'){if(o.status!=='Diterima'&&!o.catatan.trim())throw new Error('Isi catatan alasan untuk ormawa');await post({action:'tinjau',sheet:'proker',id:S.edit.id,status:o.status,catatan:o.catatan});MD.hide();toast('Keputusan tersimpan');route()}
    if(e.target.id==='kemForm'){if(o.status!=='Disetujui'&&!o.catatan.trim())throw new Error('Isi keterangan untuk ormawa');await post({action:'decide_kem',sheet:'proker',id:S.edit.id,status:o.status,catatan:o.catatan});MD.hide();toast('Putusan tersimpan');route()}
    if(e.target.id==='strForm'){const t=S.edit._;let sh,row;
      if(t.t==='p'){sh='pejabat';row={...t.row,nama:o.nama,foto:o.foto}}
      else if(t.t==='m'){sh='kementerian';row={...t.row,menteri:o.nama,foto:o.foto}}
      else{const dp=J(t.row.departemen);dp[t.i]={...dp[t.i],p:o.nama,f:o.foto};sh='kementerian';row={...t.row,departemen:JSON.stringify(dp)}}
      await post({action:'save',sheet:sh,row});MD.hide();delete cache.pejabat;delete cache.kementerian;toast('Tersimpan');route()}
    if(e.target.id==='crudForm'){const k=keyOf();if(S.edit)o[k]=S.edit[k];if(SH()==='kementerian')o.departemen=JSON.stringify(collectDep());await post({action:'save',sheet:SH(),row:o});MD.hide();delete cache[SH()];toast('Tersimpan');route()}
  }catch(err){toast(err.message||'Gagal',false)}
});
route();
