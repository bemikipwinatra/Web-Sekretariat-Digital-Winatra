/**
 * BACKEND WINATRA (Google Apps Script) - tempel di Extensions > Apps Script pada Google Sheets.
 * Jalankan setup() sekali, lalu Deploy > Web app (Execute as: Me, Access: Anyone).
 */
const SCHEMA={
 berita:['id','judul','ringkasan','isi','gambar','tanggal','penulis'],
 event:['id','judul','penyelenggara','tanggal','lokasi','poster','juknis','narahubung','kontak','pemilik','status'],
 proker:['id','ormawa','program','waktu','anggaran','pj','kontak','tautan','deskripsi','status','pemilik','dibuat'],
 ebook:['id','judul','penulis','kategori','sampul','tautan'],
 template:['id','nama','kategori','tautan'],
 kementerian:['id','nama','menteri','departemen','tupoksi','callcenter','logo','urut'],
 users:['username','hash','role','nama','ormawa']
};
const PUB=['berita','event','ebook','template','kementerian'];
const OWN=['proker','event'];
const SEED=[{"id": "1", "nama": "Presiden dan Wakil Presiden", "menteri": "Dedy Indra Setiawan dan Lita Marga Ningrum", "departemen": "[{\"n\": \"Presiden BEM\", \"p\": \"Dedy Indra Setiawan\", \"t\": \"Memimpin dan mengoordinasikan seluruh jalannya organisasi;\\nMenetapkan arah kebijakan dan strategi organisasi;\\nMenjadi representasi resmi BEM;\\nMenjalin hubungan strategis dengan pihak internal maupun eksternal kampus;\\nBertanggung jawab atas seluruh pelaksanaan program kerja kabinet.\", \"i\": \"\"}, {\"n\": \"Wakil Presiden BEM\", \"p\": \"Lita Marga Ningrum\", \"t\": \"Membantu Presiden dalam menjalankan roda organisasi;\\nMengoordinasikan dan mengawasi kinerja kementerian;\\nMemastikan pelaksanaan program kerja berjalan sesuai rencana;\\nMenggantikan Presiden apabila berhalangan;\\nMelaksanakan tugas yang diberikan Presiden.\", \"i\": \"\"}, {\"n\": \"Sekretaris Kabinet\", \"p\": \"Fulan\", \"t\": \"Mengelola administrasi dan kesekretariatan organisasi;\\nMengatur persuratan, pengarsipan, dan dokumentasi administratif;\\nMenyusun notulensi rapat;\\nMengelola agenda dan kalender kegiatan kabinet;\\nMenyusun laporan administrasi organisasi.\", \"i\": \"sekretaris-kabinet\"}]", "tupoksi": "", "callcenter": "", "logo": "presiden-wapres", "urut": 1}, {"id": "2", "nama": "Kementerian Keuangan", "menteri": "Nikmah", "departemen": "[{\"n\": \"Staf Keuangan\", \"p\": \"\", \"t\": \"Membantu Menteri Keuangan dalam pencatatan transaksi;\\nMengelola bukti pemasukan dan pengeluaran;\\nMembantu penyusunan laporan keuangan;\\nMelakukan pengarsipan dokumen keuangan.\", \"i\": \"\"}]", "tupoksi": "Mengelola seluruh keuangan organisasi;\nMenyusun perencanaan dan rancangan anggaran;\nMengatur pemasukan dan pengeluaran;\nMengawasi penggunaan anggaran setiap kementerian;\nMenyusun laporan pertanggungjawaban keuangan secara transparan dan akuntabel.", "callcenter": "", "logo": "kementerian-keuangan", "urut": 2}, {"id": "3", "nama": "Kementerian Dalam Kampus", "menteri": "Ahmad", "departemen": "[{\"n\": \"Departemen Pengembangan Sumber Daya Manusia\", \"p\": \"Faza\", \"t\": \"Merancang dan melaksanakan program pengembangan kapasitas mahasiswa;\\nMenyelenggarakan pelatihan, kaderisasi, dan peningkatan kompetensi;\\nMendorong partisipasi serta pengembangan potensi mahasiswa;\\nMengembangkan kualitas sumber daya manusia organisasi.\", \"i\": \"dept-pengembangan-sdm\"}, {\"n\": \"Departemen Advokasi, Kesehatan, dan Kesejahteraan Mahasiswa\", \"p\": \"Intan\", \"t\": \"Menampung dan menyalurkan aspirasi mahasiswa;\\nMelakukan pendampingan terhadap permasalahan mahasiswa;\\nMengawal pemenuhan hak-hak mahasiswa;\\nMengidentifikasi persoalan kesehatan dan kesejahteraan mahasiswa;\\nMenyelenggarakan edukasi dan kampanye kesehatan fisik maupun mental;\\nMemfasilitasi akses mahasiswa terhadap layanan kesehatan, termasuk merujuk ke tenaga profesional dan layanan yang tersedia;\\nMendorong terciptanya lingkungan kampus yang sehat, aman, dan suportif;\\nMembangun komunikasi advokasi dengan pihak kampus serta mitra layanan kesehatan.\", \"i\": \"dept-advokasi-kesejahteraan\"}, {\"n\": \"Departemen Kajian dan Aksi Strategis\", \"p\": \"Era\", \"t\": \"Melakukan kajian terhadap isu-isu kampus dan kemahasiswaan;\\nMenyusun analisis serta rekomendasi kebijakan;\\nMembangun kesadaran kritis mahasiswa;\\nMengorganisasi gerakan, kampanye, dan aksi mahasiswa secara konstruktif dan bertanggung jawab.\", \"i\": \"dept-kajian-aksi-strategis\"}, {\"n\": \"Departemen Keagamaan dan Kerohanian\", \"p\": \"\", \"t\": \"Merancang dan melaksanakan kegiatan keagamaan;\\nMemfasilitasi pengembangan spiritualitas mahasiswa;\\nMembangun toleransi dan kerukunan antarumat beragama;\\nMengembangkan kegiatan pembinaan karakter dan nilai moral.\", \"i\": \"dept-keagamaan-kerohanian\"}, {\"n\": \"Departemen Kewirausahaan dan Ekonomi Kreatif\", \"p\": \"Lidia\", \"t\": \"Mengembangkan jiwa kewirausahaan mahasiswa;\\nMenyelenggarakan pelatihan dan kegiatan ekonomi kreatif;\\nMemfasilitasi pengembangan ide dan potensi usaha mahasiswa;\\nMembangun peluang kolaborasi ekonomi dan kewirausahaan.\", \"i\": \"dept-kewirausahaan-ekraf\"}]", "tupoksi": "Mengoordinasikan seluruh kegiatan dan urusan internal kemahasiswaan;\nMembangun partisipasi dan keterlibatan mahasiswa;\nMengoordinasikan departemen di bawah kementeriannya;\nMengembangkan kehidupan organisasi dan ruang partisipasi mahasiswa di lingkungan kampus.", "callcenter": "", "logo": "kementerian-dalam-kampus", "urut": 3}, {"id": "4", "nama": "Kementerian Luar Kampus", "menteri": "Tama", "departemen": "[{\"n\": \"Departemen Hubungan Antarlembaga dan Kemitraan\", \"p\": \"Monica\", \"t\": \"Membangun komunikasi dan hubungan dengan organisasi mahasiswa, lembaga kepemudaan, komunitas, serta instansi eksternal;\\nMenjalin kemitraan strategis;\\nMengembangkan jaringan dan kolaborasi antarlembaga.\", \"i\": \"dept-hubungan-antarlembaga\"}, {\"n\": \"Departemen Pengabdian Masyarakat\", \"p\": \"\", \"t\": \"Merancang dan melaksanakan kegiatan pengabdian kepada masyarakat;\\nMengidentifikasi kebutuhan dan persoalan masyarakat;\\nMengembangkan kegiatan sosial dan pemberdayaan masyarakat;\\nMembangun kolaborasi dengan komunitas dan lingkungan sekitar kampus.\", \"i\": \"dept-pengabdian-masyarakat\"}]", "tupoksi": "Mengoordinasikan hubungan dan kerja sama BEM dengan pihak eksternal;\nMembangun jaringan antarlembaga dan organisasi;\nMengembangkan kolaborasi dengan komunitas, pemerintah, dan masyarakat;\nMengoordinasikan departemen di bawah kementeriannya.", "callcenter": "", "logo": "kementerian-luar-kampus", "urut": 4}, {"id": "5", "nama": "Kementerian Media dan Informasi", "menteri": "Aulia", "departemen": "[{\"n\": \"Departemen Media Kreatif dan Publikasi\", \"p\": \"\", \"t\": \"Memproduksi konten kreatif dan publikasi organisasi;\\nMengelola desain grafis, fotografi, videografi, dan penyuntingan;\\nMendokumentasikan kegiatan organisasi;\\nMengelola publikasi dan penyebaran informasi melalui media sosial.\", \"i\": \"dept-media-kreatif-publikasi\"}, {\"n\": \"Departemen Informasi dan Teknologi\", \"p\": \"Yoga\", \"t\": \"Mengelola sistem informasi dan kebutuhan teknologi organisasi;\\nMengembangkan serta mengelola database dan arsip digital;\\nMengelola website atau platform digital BEM apabila tersedia;\\nMendukung digitalisasi administrasi dan komunikasi organisasi.\", \"i\": \"dept-informasi-teknologi\"}]", "tupoksi": "Mengoordinasikan pengelolaan media dan informasi organisasi;\nMengembangkan strategi komunikasi dan publikasi BEM;\nMemastikan penyebaran informasi yang akurat dan informatif;\nMembangun citra dan identitas organisasi melalui media komunikasi.", "callcenter": "", "logo": "kementerian-media-informasi", "urut": 5}, {"id": "6", "nama": "Kementerian Pendidikan, Olahraga, dan Kebudayaan", "menteri": "Dina", "departemen": "[{\"n\": \"Departemen Pendidikan dan Literasi\", \"p\": \"\", \"t\": \"Mengembangkan budaya akademik dan literasi mahasiswa;\\nMenyelenggarakan diskusi, seminar, forum intelektual, dan kegiatan edukatif;\\nMendorong peningkatan wawasan serta pengetahuan mahasiswa;\\nMemfasilitasi ruang belajar dan pertukaran gagasan.\", \"i\": \"dept-pendidikan-literasi\"}, {\"n\": \"Departemen Penelitian dan Pengembangan\", \"p\": \"Zacky\", \"t\": \"Mendorong budaya penelitian dan karya ilmiah mahasiswa;\\nMenyelenggarakan pelatihan dan kegiatan penelitian;\\nMengembangkan kajian dan inovasi;\\nMelakukan riset terhadap persoalan kemahasiswaan dan lingkungan kampus;\\nMenghasilkan rekomendasi pengembangan organisasi dan mahasiswa.\", \"i\": \"dept-penelitian-pengembangan\"}, {\"n\": \"Departemen Seni, Olahraga, dan Kebudayaan\", \"p\": \"\", \"t\": \"Memfasilitasi pengembangan minat dan bakat mahasiswa di bidang seni dan olahraga;\\nMenyelenggarakan kegiatan kompetisi dan apresiasi;\\nMengembangkan kreativitas serta potensi mahasiswa;\\nMelestarikan dan memperkenalkan kebudayaan lokal maupun nasional.\", \"i\": \"dept-seni-olahraga-kebudayaan\"}]", "tupoksi": "Mengoordinasikan pengembangan bidang pendidikan, penelitian, olahraga, seni, dan kebudayaan;\nMendorong peningkatan kualitas intelektual dan kreativitas mahasiswa;\nMemfasilitasi pengembangan minat dan bakat;\nMengembangkan kegiatan akademik dan nonakademik mahasiswa.", "callcenter": "", "logo": "kementerian-pendidikan-olahraga-kebudayaan", "urut": 6}];

function ss_(){return SpreadsheetApp.getActive();}
function hash_(p){const salt=PropertiesService.getScriptProperties().getProperty('SALT')||'';return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+p));}
function setup(){
  const sp=PropertiesService.getScriptProperties();
  if(!sp.getProperty('SALT'))sp.setProperty('SALT',Utilities.getUuid());
  Object.keys(SCHEMA).forEach(n=>{const s=ss_().getSheetByName(n)||ss_().insertSheet(n);if(!s.getLastRow()){s.appendRow(SCHEMA[n]);s.setFrozenRows(1);}});
  const k=ss_().getSheetByName('kementerian');
  if(k.getLastRow()<2)SEED.forEach(o=>k.appendRow(SCHEMA.kementerian.map(h=>o[h]??'')));
  const u=ss_().getSheetByName('users');
  if(u.getLastRow()<2){const pw=Utilities.getUuid().slice(0,8);u.appendRow(['admin',hash_(pw),'admin','Super Admin','']);Logger.log('Akun super admin -> username: admin | password: '+pw+' (segera ganti dari menu Pengguna)');}
}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function rows_(n){
  const v=ss_().getSheetByName(n).getDataRange().getValues();const h=v.shift();
  return v.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i] instanceof Date?Utilities.formatDate(r[i],'Asia/Jakarta','yyyy-MM-dd'):r[i]])));
}
function doGet(e){
  const n=e.parameter.sheet;
  if(PUB.indexOf(n)<0)return out_({ok:false,error:'Data tidak tersedia'});
  let r=rows_(n);if(n==='event')r=r.filter(x=>x.status==='Tayang');
  return out_({ok:true,data:r});
}
function user_(t){const c=t&&CacheService.getScriptCache().get(t);return c?JSON.parse(c):null;}
function doPost(e){
  try{
    const b=JSON.parse(e.postData.contents);
    if(b.action==='login'){
      const u=rows_('users').find(x=>x.username===b.username);
      if(!u||u.hash!==hash_(String(b.password||'')))throw 'Username atau kata sandi salah';
      const t=Utilities.getUuid();const us={username:u.username,role:u.role,nama:u.nama,ormawa:u.ormawa};
      CacheService.getScriptCache().put(t,JSON.stringify(us),21600);
      return out_({ok:true,token:t,user:us});
    }
    const u=user_(b.token);if(!u)throw 'Sesi berakhir, silakan masuk lagi';
    const n=b.sheet;if(!SCHEMA[n])throw 'Sheet tidak dikenal';
    const admin=u.role==='admin';
    if(!admin&&OWN.indexOf(n)<0)throw 'Tidak punya akses';
    const lock=LockService.getScriptLock();lock.waitLock(15000);
    try{
      if(b.action==='list'){
        let r=rows_(n);if(!admin)r=r.filter(x=>x.pemilik===u.username);
        if(n==='users')r=r.map(x=>{delete x.hash;return x;});
        return out_({ok:true,data:r});
      }
      if(b.action==='save')return out_({ok:true,id:save_(n,b.row||{},u,admin)});
      if(b.action==='remove'){remove_(n,b.id,u,admin);return out_({ok:true});}
      throw 'Aksi tidak dikenal';
    }finally{lock.releaseLock();}
  }catch(err){return out_({ok:false,error:String(err&&err.message||err)});}
}
function find_(n,id){
  const h=SCHEMA[n],key=n==='users'?'username':'id',v=ss_().getSheetByName(n).getDataRange().getValues();
  const i=id?v.findIndex((r,j)=>j>0&&String(r[h.indexOf(key)])===String(id)):-1;
  return {h:h,key:key,i:i,row:i>0?v[i]:null};
}
function save_(n,o,u,admin){
  const f=find_(n,o[find_(n,null).key]),h=f.h,s=ss_().getSheetByName(n);
  if(f.i>0&&!admin&&String(f.row[h.indexOf('pemilik')])!==u.username)throw 'Data bukan milik Anda';
  const d={};h.forEach(k=>{let x=o[k];if(typeof x==='string'&&/^[=+@\-]/.test(x))x="'"+x;d[k]=x;});
  if(f.i>0)h.forEach((k,j)=>{if(d[k]===undefined)d[k]=f.row[j];});
  if(n==='users'){
    if(!admin)throw 'Tidak punya akses';
    if(!d.username)throw 'Username wajib diisi';
    if(o.password)d.hash=hash_(String(o.password));else if(f.i<0)throw 'Kata sandi wajib untuk akun baru';
  }else if(f.i<0)d.id=Utilities.getUuid().slice(0,8);
  if(!admin){
    d.pemilik=u.username;
    if(n==='proker'){d.ormawa=u.ormawa;d.status='Ditinjau';}
    if(n==='event'){d.penyelenggara=u.ormawa;d.status='Menunggu';}
  }
  if(n==='proker'&&f.i<0)d.dibuat=Utilities.formatDate(new Date(),'Asia/Jakarta','yyyy-MM-dd');
  if((n==='proker'||n==='event')&&f.i<0&&admin&&!d.pemilik)d.pemilik='admin';
  const arr=h.map(k=>d[k]===undefined?'':d[k]);
  if(f.i>0)s.getRange(f.i+1,1,1,h.length).setValues([arr]);else s.appendRow(arr);
  return d[f.key];
}
function remove_(n,id,u,admin){
  const f=find_(n,id);if(f.i<1)throw 'Data tidak ditemukan';
  if(!admin&&String(f.row[f.h.indexOf('pemilik')])!==u.username)throw 'Data bukan milik Anda';
  ss_().getSheetByName(n).deleteRow(f.i+1);
}
