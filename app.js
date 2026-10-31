
const FIXO=window.FIXO||{data:"",dataISO:"2000-01-01",live:"",hero:{k:"",t:"",s:"",p:[],tm:[]},stories:[],T:{},tab:[],GG:{},r31:[],r32:[],SC:{},AS:{},OC:{},TP:{}};
const PAGE=(document.body.dataset&&document.body.dataset.pagina)||"home";
const SITE={email:"contato@seusite.com.br",fotos:false,adsense:""}; // fotos:true mostra miniaturas de outros veículos (confirme os direitos antes). adsense: "ca-pub-XXXXXXXXXXXXXXXX" (depois de aprovado)
// Anunciantes: troque os [] pela lista. Exemplo: {img:"anuncios/padaria.png",link:"https://wa.me/5542999999999",alt:"Padaria Central"}
const ANUNCIOS={topo:[],lateral:[]};
const API="/.netlify/functions/dados";
const $=id=>document.getElementById(id)||document.createElement("div");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const COMP={"Todas":"futebol brasileiro","Brasileirão":"Brasileirão Série A","Libertadores":"Copa Libertadores","Copa do Brasil":"Copa do Brasil futebol","Sul-Americana":"Copa Sul-Americana","Série B":"Brasileirão Série B"};
const MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],DIA=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const bl=d=>{const x=new Date(d);return DIA[x.getDay()]+", "+MES[x.getMonth()]+" "+x.getDate()+", "+x.getFullYear()};
let comp="Todas",TAB=[],ART=[],team="",LIST=[],shown=9,RODADA=0;
{const c=new URLSearchParams(location.search).get("c");if(c&&COMP[c])comp=c}
let NOCACHE=false;
async function api(tipo,extra){const k="ba:"+tipo+JSON.stringify(extra||{});
 if(!NOCACHE){try{const c=JSON.parse(sessionStorage.getItem(k)||"null");if(c&&Date.now()-c.t<12e4)return c.d}catch(e){}}
 const d=await apiRaw(tipo,extra);try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d}))}catch(e){}return d}
async function apiRaw(tipo,extra){
 if(location.protocol==="file:")throw new Error("A função de servidor não roda em arquivo aberto no computador.");
 const u=new URL(API,location.origin);u.searchParams.set("tipo",tipo);Object.entries(extra||{}).forEach(([k,v])=>u.searchParams.set(k,v));
 const r=await fetch(u);if(!(r.headers.get("content-type")||"").includes("json"))throw new Error("A função do servidor não respondeu (erro "+r.status+").");
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.erro||("Erro "+r.status));return d}
const RSS=(q,d)=>"https://news.google.com/rss/search?q="+encodeURIComponent(q+" when:"+d+"d")+"&hl=pt-BR&gl=BR&ceid=BR:pt-419";
const PROXIES=[u=>"https://api.allorigins.win/raw?url="+encodeURIComponent(u),u=>"https://corsproxy.io/?"+encodeURIComponent(u)];
const dec=s=>s.replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
const tg=(x,n)=>{const m=x.match(new RegExp("<"+n+"[^>]*>([\\s\\S]*?)</"+n+">"));return m?dec(m[1]):""};
const fixImg=s=>{if(!s)return"";let u=s.trim();const m=u.match(/[?&]q=([^&]+)/);if(/imagenewsfetcher/i.test(u)&&m){try{u=decodeURIComponent(m[1])}catch(e){}}if(u.startsWith("//"))u="https:"+u;else if(!/^https?:/i.test(u))u="https://"+u.replace(/^\/+/,"");return u.replace(/^http:/i,"https:")};
function parseItems(xml){return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,40).map(m=>{const b=m[1];let f=tg(b,"source")||tg(b,"News:Source"),t=tg(b,"title"),l=tg(b,"link");if(f&&t.endsWith(" - "+f))t=t.slice(0,-(f.length+3));
 try{const u=new URL(l).searchParams.get("url");if(u)l=u}catch(e){}
 return{titulo:t,fonte:f,link:l,data:tg(b,"pubDate"),imagem:fixImg(tg(b,"News:Image"))}}).filter(n=>n.titulo&&/^https?:\/\//.test(n.link))}
async function viaProxy(q){const bing="https://www.bing.com/news/search?q="+encodeURIComponent(q)+"&format=rss&setlang=pt-BR&cc=BR",out=[];
 const get=async u=>{for(const p of PROXIES){try{const r=await fetch(p(u));if(!r.ok)continue;return parseItems(await r.text())}catch(e){}}return[]};
 out.push(...await get(RSS(q,1)),...await get(bing));if(out.length<4)out.push(...await get(RSS(q,3)));
 if(!out.length)throw new Error("proxy");return out}
const STOP=new Set("de da do das dos para por com uma que mais como sobre apos entre contra pelo pela ate nos nas aos seu sua foi vai tem ser nao veja confira ver tudo hoje ontem".split(" "));
const tk=t=>new Set(String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)));
const jac=(a,b)=>{let i=0;a.forEach(x=>{if(b.has(x))i++});return i/(a.size+b.size-i||1)};
const KEYS=[[/\b(final|campe[aã]o|campeã|t[ií]tulo|elimina\w*|rebaix\w*|demit\w*|demiss\w*|morre\w*)\b/i,3],[/\b(lidera\w*|classific\w*|virada|goleada|les[aã]o|contrata\w*|sele[cç][aã]o|libertadores|decis[aã]o|expuls\w*|p[eê]nalti\w*)\b/i,2]];
const SRC=/^(ge|globo|lance|espn|uol|cnn|gazeta|folha|estad|terra|placar|trivela|band|sportv|metr)/i;
// Tira o que é antigo, agrupa a mesma notícia de vários veículos e ordena por importância + data
function rankNews(items){const now=Date.now(),H=36e5;let l=items.filter(n=>n.data&&!isNaN(new Date(n.data)));
 const w=[48,96].find(x=>l.filter(n=>now-new Date(n.data)<=x*H).length>=4);if(w)l=l.filter(n=>now-new Date(n.data)<=w*H);
 const cl=[];l.forEach(n=>{n._t=tk(n.titulo);const c=cl.find(c=>c.m.some(x=>jac(x._t,n._t)>=.34));if(c)c.m.push(n);else cl.push({t:n._t,m:[n]})});
 return cl.map(c=>{const m=c.m.slice().sort((a,b)=>(!!b.imagem-!!a.imagem)||new Date(b.data)-new Date(a.data)),r=Object.assign({},m[0]);
  if(!r.imagem){const x=m.find(y=>y.imagem);if(x)r.imagem=x.imagem}
  const novo=Math.max.apply(null,m.map(x=>+new Date(x.data))),idade=Math.max(0,(now-novo)/H),fontes=new Set(m.map(x=>x.fonte)).size;
  r.data=new Date(novo).toUTCString();r.cobertura=fontes;
  r.score=fontes*4+KEYS.reduce((s,[re,wt])=>re.test(r.titulo)?s+wt:s,0)+Math.max(0,24-idade)*.5+(r.imagem?1:0)+(SRC.test(r.fonte||"")?1.5:0);return r}).sort((a,b)=>b.score-a.score).slice(0,24)}
async function getNews(q){let l;try{l=(await api("noticias",{q})).noticias}catch(e){try{l=await viaProxy(q)}catch(e2){throw new Error("Não foi possível buscar as manchetes agora. Se você abriu o arquivo direto no computador, publique o site no Netlify (veja o README). Se já publicou, abra /.netlify/functions/dados?tipo=noticias no seu site para ver o erro. Detalhe: "+e.message)}}return rankNews(l)}
const ago=d=>{const m=Math.round((Date.now()-new Date(d))/6e4);return m<1?"agora":m<60?"há "+m+" min":m<1440?"há "+Math.round(m/60)+" h":"há "+Math.round(m/1440)+" d"};
const hhmm=()=>new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const fail=(el,e)=>{el.innerHTML='<div class="note">Não foi possível carregar: '+esc(e.message)+'</div>'};
const LAB=[[/libertadores/i,"Libertadores"],[/sul-?americana|sudamericana/i,"Sul-Americana"],[/copa do brasil/i,"Copa do Brasil"],[/s[ée]rie b/i,"Série B"],[/sele[cç][aã]o|copa do mundo/i,"Seleção"],[/brasileir/i,"Brasileirão"]];
const lab=t=>(LAB.find(([r])=>r.test(t))||[0,comp==="Todas"?"Futebol":comp])[1];
function banner(t){const hit=TAB.filter(x=>t.toLowerCase().includes(String(x.time).toLowerCase())).slice(0,2);
 return '<div class="ban" aria-hidden="true">'+(hit.map(x=>x.escudo?'<img src="'+esc(x.escudo)+'" alt="" loading="lazy" onerror="this.remove()">':crF(x.tla)).join("")||"⚽")+'</div>'}
const thumb=n=>SITE.fotos&&okUrl(n.imagem)?'<img class="pic" src="'+esc(n.imagem)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=this.dataset.f" data-f="'+esc(banner(n.titulo))+'">':banner(n.titulo);
const card=n=>'<a class="post" href="'+esc(n.link)+'" target="_blank" rel="noopener noreferrer"><div class="thumb">'+thumb(n)+'<span class="lab">'+esc(lab(n.titulo))+'</span></div><h2>'+esc(n.titulo)+'</h2><time datetime="'+esc(n.data)+'">'+bl(n.data)+'</time><span class="src">'+esc(n.fonte)+' · '+ago(n.data)+(n.cobertura>1?' · '+n.cobertura+' veículos':'')+'</span></a>';
const cards=l=>l.length?l.map(card).join(""):'<div class="empty">Sem manchetes das últimas horas para este assunto.</div>';
function paint(){$("news").innerHTML=cards(LIST.slice(0,shown));$("more").hidden=shown>=LIST.length}
async function loadNews(){$("sech").textContent=comp==="Todas"?"Veja também em outros veículos":"Outros veículos · "+comp;try{LIST=await getNews(COMP[comp]);shown=9;paint()}catch(e){fail($("news"),e)}}
const zone=(i,n)=>n!==20?"":i<4?"z1":i==4?"z2":i<11?"z3":i>=16?"z4":"";
const crest=t=>t.escudo?'<img src="'+esc(t.escudo)+'" alt="" onerror="this.remove()">':crF(t.tla);
async function loadTable(){let rod="",fb=false;const full=PAGE==="tabela";
 try{const d=await api("tabela");TAB=d.tabela;RODADA=d.rodada||0;rod=d.rodada?" · rodada "+d.rodada:""}catch(e){TAB=fixTab();fb=true;rod=" · dados de "+FIXO.data}
 $("tt").textContent="Brasileirão Série A"+rod;
 $("tab").innerHTML='<div class="scroll"><table><tr><th>#</th><th class="l">Clube</th><th>P</th><th>J</th><th>V</th>'+(full?'<th>E</th><th>D</th><th>GP</th><th>GC</th>':'')+'<th>SG</th>'+(full?'<th>%</th>':'')+'</tr>'+TAB.map((t,i)=>'<tr class="'+zone(i,TAB.length)+'"><td class="pos">'+t.pos+'</td><td class="l"><div class="club">'+crest(t)+'<a href="times.html?t='+encodeURIComponent(t.time)+'">'+esc(t.time)+'</a></div></td><td><b>'+t.p+'</b></td><td>'+t.j+'</td><td>'+t.v+'</td>'+(full?'<td>'+t.e+'</td><td>'+t.d+'</td><td>'+t.gp+'</td><td>'+t.gc+'</td>':'')+'<td>'+(t.sg>0?"+":"")+t.sg+'</td>'+(full?'<td>'+Math.round(t.p/(t.j*3||1)*100)+'</td>':'')+'</tr>').join("")+'</table></div>'
  +(full?'<div class="leg"><span style="--c:#19c26b">Libertadores (grupos)</span><span style="--c:#8fe3b4">Libertadores (2ª fase)</span><span style="--c:#3b82f6">Sul-Americana</span><span style="--c:#e5484d">Rebaixamento</span></div>':'')
  +(fb?'<div class="note">Mostrando os dados salvos no site. Com a chave da API configurada, a tabela passa a ser ao vivo.</div>':'');
 const sel=$("sel");if(sel.tagName==="SELECT"){const keep=sel.value,want=new URLSearchParams(location.search).get("t"),c=want?codeOf(want):"";
  sel.innerHTML=TAB.map(t=>'<option>'+esc(t.time)+'</option>').join("");const o=[...sel.options].find(x=>c&&codeOf(x.value)===c);if(o)sel.value=o.value;else if(keep&&TAB.some(t=>t.time===keep))sel.value=keep;team=sel.value}}
const row=(h,m,a)=>'<div class="g"><div class="h">'+esc(h)+'</div><div class="m">'+m+'</div><div>'+esc(a)+'</div></div>';
async function loadGames(){const full=PAGE==="jogos",rs=$("rod");let rod=0;
 if(full){try{rod=+rs.value||RODADA||(await api("tabela")).rodada||0}catch(e){}
  if(!rs.options.length)rs.innerHTML=Array.from({length:38},(_,i)=>'<option value="'+(i+1)+'">Rodada '+(i+1)+'</option>').join("");
  if(rod)rs.value=rod;$("jt").textContent=rod?"Jogos da rodada "+rod:"Jogos"}
 try{const d=await api("jogos",full&&rod?{rodada:rod}:{}),by={};
 d.jogos.sort((a,b)=>new Date(a.data)-new Date(b.data)).forEach(j=>{const k=new Date(j.data).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"});(by[k]=by[k]||[]).push(j)});
 $("jogos").innerHTML=Object.keys(by).map(k=>'<div class="day">'+esc(k)+'</div>'+by[k].map(j=>{const f=j.gc!=null&&j.gf!=null;return row(j.casa,f?j.gc+" × "+j.gf:new Date(j.data).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),j.fora)}).join("")).join("")||'<div class="note">Sem jogos nesta janela.</div>'}
 catch(e){$("jogos").innerHTML='<div class="day">Resultados da 32ª rodada</div>'+FIXO.r31.map(([a,x,y,b])=>row(nmF(a),x+" × "+y,nmF(b))).join("")+FIXO.r32.map(([d,gs])=>'<div class="day">'+esc(d)+'</div>'+gs.map(([t,a,b])=>row(nmF(a),t,nmF(b))).join("")).join("")+'<div class="note">Dados salvos de '+esc(FIXO.data)+'.</div>'}}
const rank=(list,key)=>'<ol class="lst">'+list.map((a,i)=>'<li><b>'+(i+1)+'</b><span>'+esc(a.nome)+'<br><small>'+esc(a.time)+'</small></span><span class="v">'+a[key]+'</span></li>').join("")+'</ol>';
async function loadScorers(){let fb=false;try{ART=(await api("artilharia")).artilheiros}catch(e){ART=fixArt();fb=true}
 const nt=fb?'<div class="note">Dados salvos de '+esc(FIXO.data)+'.</div>':'';
 $("art").innerHTML=rank([...ART].sort((a,b)=>b.gols-a.gols).slice(0,PAGE==="artilharia"?25:8),"gols")+nt;
 const as=[...ART].filter(a=>a.assist>0).sort((a,b)=>b.assist-a.assist).slice(0,PAGE==="artilharia"?25:8);
 $("ast").innerHTML=as.length?rank(as,"assist")+(fb?nt:'<div class="note">Considera os 50 maiores artilheiros do campeonato.</div>'):'<div class="note">A fonte não trouxe assistências.</div>'}
async function loadTeam(){const t=TAB.find(x=>x.time===team);if(!t){$("tp").innerHTML="";return}
 const s=(l,v)=>'<div class="st"><b>'+v+'</b><span>'+l+'</span></div>',mine=ART.filter(a=>codeOf(a.time)===codeOf(team)),oc=FIXO.OC[codeOf(team)];
 $("tp").innerHTML='<div class="sts">'+s("Posição",t.pos+"º")+s("Pontos",t.p)+s("Jogos",t.j)+s("Vitórias",t.v)+s("Empates",t.e)+s("Derrotas",t.d)+s("Gols pró",t.gp)+s("Gols contra",t.gc)+s("Saldo",(t.sg>0?"+":"")+t.sg)+s("Aproveit.",Math.round(t.p/(t.j*3||1)*100)+"%")+'</div>'+(oc?'<div class="oc"><b>Outras competições em 2026:</b> '+esc(oc)+'</div>':'')
 +'<div class="tg"><div><h3>Notícias do time</h3><div class="feed" id="tn" style="grid-template-columns:1fr">carregando…</div></div><div><h3>Artilheiros do time</h3>'+(mine.length?rank([...mine].sort((a,b)=>b.gols-a.gols),"gols"):'<div class="note">Nenhum jogador do clube entre os 50 maiores artilheiros.</div>')
 +'<h3 style="margin-top:14px">Assistências</h3>'+(mine.some(a=>a.assist>0)?rank([...mine].filter(a=>a.assist>0).sort((a,b)=>b.assist-a.assist),"assist"):'<div class="note">Sem assistências registradas.</div>')+'</div></div>';
 const mine2=l=>l.some(x=>x.toLowerCase()===team.toLowerCase()||(codeOf(x)&&codeOf(x)===codeOf(team)));
 const ed=POSTS.length?POSTS.map((p,i)=>mine2(p.labels||[])?postCard(i):"").join(""):(fresco()?FIXO.stories.map((n,i)=>(n.tm||[]).includes(codeOf(team))?storyCard(i):"").join(""):"");
 try{const l=await getNews(team+" futebol");$("tn").innerHTML=ed+cards(l.slice(0,6))}catch(e){$("tn").innerHTML=ed;if(!ed)fail($("tn"),e)}}
async function all(manual){NOCACHE=!!manual;const b=$("rl"),st=$("st");b.disabled=true;b.classList.add("ld");st.textContent="Atualizando…";
 const P={home:[loadTable,loadPosts],tabela:[loadTable],jogos:[loadGames],artilharia:[loadScorers],times:[loadTable,loadScorers],temporada:[]}[PAGE]||[];
 await Promise.all(P.map(f=>f()));if(PAGE==="home")await loadNews();if(PAGE==="times")await loadTeam();
 st.textContent=(manual?"Atualizado às ":"Carregado às ")+hhmm()+(PAGE==="home"?" · manchetes recentes":"");b.disabled=false;b.classList.remove("ld");NOCACHE=false}
$("nav").onclick=e=>{if(e.target.closest("a")){$("nav").classList.remove("open");$("burger").setAttribute("aria-expanded","false")}};
$("burger").onclick=()=>{const o=$("nav").classList.toggle("open");$("burger").setAttribute("aria-expanded",o)};
$("rod").onchange=()=>loadGames();
$("more").onclick=()=>{shown+=9;paint()};
$("sel").onchange=()=>{team=$("sel").value;loadTeam()};
$("rl").onclick=()=>all(true);
$("mail").href=$("mail2").href="mailto:"+SITE.email;$("fmail").textContent="Contato: "+SITE.email;$("yr").textContent=new Date().getFullYear();
$("today").textContent=bl(new Date());
const T=FIXO.T,nmF=c=>T[c]?T[c][0]:c;
const crF=c=>{const t=T[c]||["","#888","#fff"];return '<span class="cr" style="background:'+t[1]+';color:'+t[2]+'">'+esc(c)+'</span>'};
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const TOK={FLA:["flamengo"],PAL:["palmeiras"],CAP:["athletico","paranaense"],CRU:["cruzeiro"],FLU:["fluminense"],CAM:["atleticomg","atleticomineiro"],BAH:["bahia"],SAN:["santos"],SAO:["saopaulo"],RBB:["bragantino"],BOT:["botafogo"],CFC:["coritiba"],VIT:["vitoria"],MIR:["mirassol"],VAS:["vasco"],COR:["corinthians"],INT:["internacional"],GRE:["gremio"],REM:["remo"],CHA:["chapecoense"]};
const codeOf=n=>{const k=norm(n);return Object.keys(TOK).find(c=>TOK[c].some(t=>k.includes(t)))||""};
const fixTab=()=>FIXO.tab.map((r,i)=>({pos:i+1,time:nmF(r[0]),tla:r[0],escudo:"",p:r[1],j:r[2],v:r[3],e:r[4],d:r[5],gp:FIXO.GG[r[0]][0],gc:FIXO.GG[r[0]][1],sg:r[6]}));
const fixArt=()=>{const m={};Object.entries(FIXO.SC).forEach(([c,l])=>l.forEach(([n,g])=>m[c+n]={nome:n,time:nmF(c),tla:c,gols:g,assist:0}));Object.entries(FIXO.AS).forEach(([c,l])=>l.forEach(([n,a])=>{(m[c+n]=m[c+n]||{nome:n,time:nmF(c),tla:c,gols:0,assist:0}).assist=a}));return Object.values(m)};
function shirt(c,x,y){const t=T[c]||["","#888","#fff"];return '<g transform="translate('+x+' '+y+') scale(1.5)"><path d="M-20 -26L-36 -14L-28 2L-20 -4V28H20V-4L28 2L36 -14L20 -26Q0 -14 -20 -26Z" fill="'+t[1]+'" stroke="#fff" stroke-width="2"/><text y="14" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-weight="800" font-size="12" fill="'+t[2]+'">'+esc(c)+'</text></g>'}
function art(cd,cup,alt){cd=(cd||[]).filter(c=>T[c]).slice(0,2);let s='<svg class="pic" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+esc(alt)+'"><rect width="400" height="180" fill="#0d5f35"/>';
 for(let i=0;i<8;i++)s+='<rect x="'+i*50+'" width="25" height="180" fill="#0f6b3a"/>';
 s+='<g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"><rect x="12" y="12" width="376" height="156"/><path d="M200 12V168"/><circle cx="200" cy="90" r="28"/><rect x="12" y="52" width="46" height="76"/><rect x="342" y="52" width="46" height="76"/></g>';
 if(cd[0])s+=shirt(cd[0],cd[1]?105:200,84);if(cd[1])s+=shirt(cd[1],295,84);
 s+=cup?'<g transform="translate(200 84)"><path d="M-16 -26H16V-8A16 16 0 0 1 -16 -8Z" fill="#ffd24a" stroke="#b8860b" stroke-width="2"/><path d="M-16 -22H-26Q-26 -4 -14 -4M16 -22H26Q26 -4 14 -4" fill="none" stroke="#e0a800" stroke-width="3"/><rect x="-4" y="8" width="8" height="14" fill="#e0a800"/><rect x="-14" y="22" width="28" height="7" rx="2" fill="#b8860b"/></g>':'<g transform="translate(200 142)"><circle r="13" fill="#fff" stroke="#222" stroke-width="1.5"/><polygon points="0,-6 6,-2 4,5 -4,5 -6,-2" fill="#222"/></g>';
 return s+'<text x="392" y="174" text-anchor="end" font-size="10" fill="#fff" fill-opacity=".75" font-family="Roboto,Arial,sans-serif">Ilustração</text></svg>'}
const CUP=["Libertadores","Sul-Americana","Copa do Brasil"];
const storyCard=i=>{const n=FIXO.stories[i];return '<a class="post" href="#" role="button" data-s="'+i+'"><div class="thumb">'+art(n.tm,CUP.includes(n.k),"Ilustração: "+n.t)+'<span class="lab">'+esc(n.k)+'</span></div><h2>'+esc(n.t)+'</h2><time>Redação · '+esc(FIXO.data)+'</time><span class="src">'+esc(n.s)+'</span></a>'};
function paintDest(){if(POSTS.length)return paintPosts();if(!fresco()){$("dest").hidden=true;return}$("desth").textContent="Destaques da redação";const h=FIXO.hero,show=comp==="Todas"||comp===h.k;
 $("hero").innerHTML=show?'<a class="hero2" href="#" role="button" data-h="1">'+art(h.tm,CUP.includes(h.k),"Ilustração: "+h.t)+'<div><span class="lab">'+esc(h.k)+'</span><h2>'+esc(h.t)+'</h2><p>'+esc(h.s)+'</p></div></a>':"";
 const l=FIXO.stories.map((n,i)=>[n,i]).filter(([n])=>comp==="Todas"||n.k===comp);
 $("destf").innerHTML=l.map(([n,i])=>storyCard(i)).join("");$("destd").textContent="Matérias da redação de "+FIXO.data;$("dest").hidden=!show&&!l.length}
let last=null,POSTS=[];
function abrir(k,t,ps,tm){last=document.activeElement;$("dk").textContent=k;$("dt").textContent=t;$("db").innerHTML=art(tm,CUP.includes(k),"Ilustração: "+t)+ps.map(p=>'<p>'+esc(p)+'</p>').join("")+'<p class="note" style="padding:0">Matéria da redação, com informações de '+esc(FIXO.data)+'.</p>';$("ov").classList.add("on");$("x").focus()}
const fechar=()=>{$("ov").classList.remove("on");if(last)last.focus()};
$("x").onclick=fechar;$("ov").onclick=e=>{if(e.target.id==="ov")fechar()};
document.addEventListener("keydown",e=>{if(e.key==="Escape")fechar()});
document.addEventListener("click",e=>{const a=e.target.closest("[data-s],[data-h]");if(!a)return;e.preventDefault();const n=a.dataset.h?FIXO.hero:FIXO.stories[+a.dataset.s];abrir(n.k,n.t,n.p,n.tm)});
const gmF=(a,x,y,b)=>'<div class="g"><div class="h">'+esc(nmF(a))+' '+crF(a)+'</div><div class="m">'+x+' × '+y+'</div><div>'+crF(b)+' '+esc(nmF(b))+'</div></div>';
function temp(k){const p=FIXO.TP[k];let h='<div style="padding:0 16px 8px"><b style="font:900 22px Roboto;text-transform:uppercase">'+esc(p.t)+'</b><br><span class="note" style="padding:0">'+esc(p.s)+'</span></div>';
 (p.g||[]).forEach(([t,gs])=>{h+='<div class="day">'+esc(t)+'</div>'+gs.map(([a,x,y,b,n])=>gmF(a,x,y,b)+(n?'<div class="sub">'+esc(n)+'</div>':"")).join("")});
 if(p.tb)h+='<div class="scroll"><table><tr><th>#</th><th class="l">Clube</th><th>P</th><th>J</th><th>V</th><th>SG</th></tr>'+p.tb.map((r,i)=>'<tr><td class="pos">'+(i+1)+'</td><td class="l"><b>'+esc(r[0])+'</b></td><td><b>'+r[1]+'</b></td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+(r[4]>0?"+":"")+r[4]+'</td></tr>').join("")+'</table></div>';
 h+='<ul class="fl">'+p.f.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>';$("tt2").innerHTML=h;[...$("tk").children].forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===k))}
$("tk").innerHTML=Object.keys(FIXO.TP).map(k=>'<button type="button" data-k="'+esc(k)+'" aria-pressed="false">'+esc(k)+'</button>').join("");
$("tk").onclick=e=>{const b=e.target.closest("[data-k]");if(b)temp(b.dataset.k)};
if(FIXO.TP["Libertadores"]){const c=new URLSearchParams(location.search).get("c");temp(FIXO.TP[c]?c:"Libertadores")}
paintDest();
$("chips").innerHTML=Object.keys(COMP).map(k=>'<a class="chip" href="index.html'+(k==="Todas"?"":"?c="+encodeURIComponent(k))+'" aria-current="'+(k===comp)+'">'+esc(k)+'</a>').join("");
const hoje=(()=>{const n=new Date();return n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0")})();
if(FIXO.live&&hoje===FIXO.dataISO){$("live").innerHTML=FIXO.live;$("live").hidden=false}
const okUrl=u=>/^https:\/\//.test(u||"");
function limpa(html){const d=new DOMParser().parseFromString(html||"","text/html");
 d.querySelectorAll("script,style,link,meta,object,embed,form,input,button,textarea,select,base,svg,math").forEach(e=>e.remove());
 d.querySelectorAll("iframe").forEach(f=>{if(!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\//.test(f.getAttribute("src")||""))f.remove();else f.setAttribute("loading","lazy")});
 d.querySelectorAll("*").forEach(e=>{[...e.attributes].forEach(a=>{const n=a.name.toLowerCase(),v=a.value.trim().toLowerCase();if(n.startsWith("on")||n==="style"||((n==="href"||n==="src"||n==="xlink:href")&&/^(javascript|vbscript|data):/.test(v)&&!(n==="src"&&/^data:image\//.test(v))))e.removeAttribute(a.name)});if(e.tagName==="A"){e.target="_blank";e.rel="noopener noreferrer"}});
 return d.body.innerHTML}
const postImg=p=>okUrl(p.imagem)?'<img class="pic" src="'+esc(p.imagem)+'" alt="" loading="lazy" onerror="this.remove()">':(p.escudos&&p.escudos.some(okUrl)?'<div class="ban" aria-hidden="true">'+p.escudos.filter(okUrl).map(u=>'<img src="'+esc(u)+'" alt="" loading="lazy" onerror="this.remove()">').join("")+'</div>':art([],false,"Ilustração"));
const plabel=p=>(p.labels&&p.labels[0])||"Matéria";
const postCard=i=>{const p=POSTS[i];return '<a class="post" href="#" role="button" data-p="'+i+'"><div class="thumb">'+postImg(p)+'<span class="lab">'+esc(plabel(p))+'</span></div><h2>'+esc(p.titulo)+'</h2><time datetime="'+esc(p.data)+'">'+bl(p.data)+'</time><span class="src">'+esc(p.resumo)+'</span></a>'};
function paintPosts(){const f=norm(comp),l=POSTS.map((p,i)=>[p,i]).filter(([p])=>comp==="Todas"||(p.labels||[]).some(x=>norm(x)===f)),h=l[0];
 $("desth").textContent=comp==="Todas"?"Matérias":"Matérias · "+comp;
 $("hero").innerHTML=h?'<a class="hero2" href="#" role="button" data-p="'+h[1]+'">'+postImg(h[0])+'<div><span class="lab">'+esc(plabel(h[0]))+'</span><h2>'+esc(h[0].titulo)+'</h2><p>'+esc(h[0].resumo)+'</p></div></a>':"";
 $("destf").innerHTML=l.slice(1).map(([p,i])=>postCard(i)).join("");$("destd").textContent="";$("dest").hidden=!l.length}
async function loadPosts(){const lim=7*864e5,now=Date.now(),dest=p=>(p.labels||[]).some(x=>/^(destaque|manchete)$/i.test(x)),dk=p=>Math.floor(new Date(p.data)/864e5)||0;
 const [b,a]=await Promise.allSettled([api("materias"),api("resumos")]);
 const blog=((b.value&&b.value.materias)||[]).filter(p=>p.titulo&&(!p.data||now-new Date(p.data)<=lim)),auto=((a.value&&a.value.materias)||[]).filter(p=>p.titulo).map(p=>Object.assign(p,{auto:true}));
 POSTS=blog.concat(auto).sort((x,y)=>dest(y)-dest(x)||dk(y)-dk(x)||(!!x.auto-!!y.auto)||(y.peso||0)-(x.peso||0)||new Date(y.data)-new Date(x.data));paintDest()}
function fresco(){return Date.now()-new Date(FIXO.dataISO+"T12:00:00")<=2.5*864e5}
function abrirPost(i){const p=POSTS[i];last=document.activeElement;$("dk").textContent=plabel(p);$("dt").textContent=p.titulo;
 $("db").innerHTML='<p class="note" style="padding:12px 0 0">'+bl(p.data)+'</p><div class="post-body">'+limpa(p.html)+'</div>'+(okUrl(p.link)?'<p><a href="'+esc(p.link)+'" target="_blank" rel="noopener noreferrer">Ver no Blogger</a></p>':'');
 $("ov").classList.add("on");$("x").focus()}
document.addEventListener("click",e=>{const a=e.target.closest("[data-p]");if(!a)return;e.preventDefault();abrirPost(+a.dataset.p)});
const okImg=u=>/^(https:\/\/|anuncios\/)/.test(u||"");
function paintAds(){const slot=a=>okUrl(a.link)&&okImg(a.img)?'<a class="adbox com-img" href="'+esc(a.link)+'" target="_blank" rel="sponsored noopener noreferrer"><img src="'+esc(a.img)+'" alt="'+esc(a.alt||"Anunciante")+'" loading="lazy"></a>':"";
 const vazio='<a class="adbox" href="mailto:'+esc(SITE.email)+'?subject=Quero%20anunciar">Anuncie aqui</a>';
 const t=ANUNCIOS.topo.map(slot).filter(Boolean).slice(0,5);while(t.length<5)t.push(vazio);
 const l=ANUNCIOS.lateral.map(slot).filter(Boolean).slice(0,3);if(!l.length)l.push(vazio);
 $("adtopo").innerHTML='<span class="adl">Publicidade</span>'+t.join("");$("adlat").innerHTML='<div class="adl" style="margin-bottom:6px">Publicidade</div>'+l.join("")}
paintAds();
if(SITE.adsense){const s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(SITE.adsense);document.head.appendChild(s)}
all(false);setInterval(()=>all(false),300000);
