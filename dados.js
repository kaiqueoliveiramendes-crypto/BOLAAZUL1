// Função do Bola Azul: devolve JSON com notícias do dia e dados de campeonatos.
// Notícias: manchetes do Google News (RSS), com link para a matéria original.
// Tabela, jogos e artilharia: football-data.org (precisa da variável FOOTBALL_DATA_KEY).

const FD = "https://api.football-data.org/v4";
const COMPS = { brasileirao: "BSA", libertadores: "CLI" };

const decode = (s) =>
  s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
   .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp("<" + name + "[^>]*>([\\s\\S]*?)</" + name + ">"));
  return m ? decode(m[1]) : "";
};

async function noticias(q, dias) {
  const url = "https://news.google.com/rss/search?q=" +
    encodeURIComponent(q + " when:" + dias + "d") + "&hl=pt-BR&gl=BR&ceid=BR:pt-419";
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error("Google News respondeu " + r.status);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 50).map((m) => {
    const fonte = tag(m[1], "source");
    let titulo = tag(m[1], "title");
    if (fonte && titulo.endsWith(" - " + fonte)) titulo = titulo.slice(0, -(fonte.length + 3));
    return { titulo, fonte, link: tag(m[1], "link"), data: tag(m[1], "pubDate") };
  }).filter((n) => n.titulo && /^https?:\/\//.test(n.link))
    .sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 40);
}

// Bing Notícias (RSS): costuma trazer a foto da matéria em <News:Image>.
function limpaImg(s) {
  if (!s) return "";
  let u = s.trim();
  const m = u.match(/[?&]q=([^&]+)/);
  if (/imagenewsfetcher/i.test(u) && m) { try { u = decodeURIComponent(m[1]); } catch (e) {} }
  if (u.startsWith("//")) u = "https:" + u; else if (!/^https?:/i.test(u)) u = "https://" + u.replace(/^\/+/, "");
  return u.replace(/^http:/i, "https:");
}

async function bing(q) {
  const r = await fetch("https://www.bing.com/news/search?q=" + encodeURIComponent(q) + "&format=rss&setlang=pt-BR&cc=BR", { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error("Bing respondeu " + r.status);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30).map((m) => {
    let link = tag(m[1], "link");
    try { const u = new URL(link).searchParams.get("url"); if (u) link = u; } catch (e) {}
    return { titulo: tag(m[1], "title"), fonte: tag(m[1], "News:Source"), link, data: tag(m[1], "pubDate"), imagem: limpaImg(tag(m[1], "News:Image")) };
  }).filter((n) => n.titulo && /^https?:\/\//.test(n.link));
}

async function fd(path) {
  const r = await fetch(FD + path, { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY || "" } });
  if (!r.ok) throw new Error("football-data.org respondeu " + r.status);
  return r.json();
}

const dia = (d) => d.toISOString().slice(0, 10);

// Matérias escritas no Blogger (feed JSON público do blog). Precisa da variável BLOGGER_URL.
async function materias(label) {
  const base = (process.env.BLOGGER_URL || "").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//.test(base)) return { materias: [], aviso: "BLOGGER_URL não configurada" };
  const url = base + "/feeds/posts/default" + (label ? "/-/" + encodeURIComponent(label) : "") + "?alt=json&max-results=30";
  const r = await fetch(url);
  if (!r.ok) throw new Error("Blogger respondeu " + r.status);
  const j = await r.json();
  const entradas = (j.feed && j.feed.entry) || [];
  return { materias: entradas.map((e) => {
    const html = (e.content && e.content.$t) || (e.summary && e.summary.$t) || "";
    const alt = (e.link || []).find((l) => l.rel === "alternate");
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    const imagem = e.media$thumbnail ? e.media$thumbnail.url.replace(/\/s72(-c)?\//, "/s640/") : (m ? m[1] : "");
    return { titulo: (e.title && e.title.$t) || "", data: e.published && e.published.$t, link: alt ? alt.href : "",
      labels: (e.category || []).map((c) => c.term), imagem,
      resumo: decode(html.replace(/<[^>]+>/g, " ")).replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 220), html };
  }) };
}

// Resumos automáticos de jogos: texto original, montado só com fatos (placar, rodada, tabela) vindos da API.
const escH = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
async function resumos() {
  const hoje = new Date();
  const de = dia(new Date(hoje.getTime() - 3 * 864e5)), ate = dia(hoje);
  const [st, mt] = await Promise.all([fd("/competitions/BSA/standings"),
    fd(`/competitions/BSA/matches?status=FINISHED&dateFrom=${de}&dateTo=${ate}`)]);
  const total = st.standings.find((s) => s.type === "TOTAL") || st.standings[0];
  const tab = {}; total.table.forEach((t) => { tab[t.team.id] = t; });
  const nome = (t) => t.shortName || t.name;
  const quando = (iso) => { try { return new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }); } catch (e) { return iso.slice(0, 10); } };
  const lista = (mt.matches || []).filter((m) => m.score && m.score.fullTime && m.score.fullTime.home != null && m.score.fullTime.away != null).map((m) => {
    const h = nome(m.homeTeam), a = nome(m.awayTeam), gh = m.score.fullTime.home, ga = m.score.fullTime.away;
    const th = tab[m.homeTeam.id], ta = tab[m.awayTeam.id];
    let titulo, resultado;
    if (gh === ga) {
      titulo = gh === 0 ? `${h} e ${a} empatam sem gols` : `${h} e ${a} empatam em ${gh} a ${ga}`;
      resultado = gh === 0 ? "A partida terminou empatada, sem gols." : `A partida terminou empatada em ${gh} a ${ga}.`;
    } else {
      const venc = gh > ga ? h : a, perd = gh > ga ? a : h, gv = Math.max(gh, ga), gp = Math.min(gh, ga);
      titulo = `${venc} ${gv - gp >= 3 ? "goleia" : "vence"} ${perd} por ${gv} a ${gp}`;
      resultado = `${venc} venceu por ${gv} a ${gp}.`;
    }
    const ps = [`Pela ${m.matchday}ª rodada do Campeonato Brasileiro Série A, ${h} e ${a} se enfrentaram em ${quando(m.utcDate)}. ${resultado}`];
    if (th && ta) ps.push(`Na tabela atual, o ${h} tem ${th.points} pontos e ocupa a ${th.position}ª posição; o ${a} soma ${ta.points} pontos, na ${ta.position}ª colocação.`);
    ps.push("Resumo gerado automaticamente a partir de dados do football-data.org.");
    const melhor = th && ta ? Math.min(th.position, ta.position) : 20;
    const peso = (21 - melhor) + (Math.abs(gh - ga) >= 3 ? 3 : 0) + (gh + ga >= 5 ? 2 : 0) + (th && ta && th.position <= 4 && ta.position <= 4 ? 5 : 0);
    return { titulo, data: m.utcDate, link: "", labels: ["Resumo do jogo", "Brasileirão", h, a], imagem: "",
      escudos: [m.homeTeam.crest, m.awayTeam.crest].filter(Boolean), resumo: ps[0],
      html: ps.map((p) => `<p>${escH(p)}</p>`).join(""), peso };
  });
  return lista.sort((x, y) => (y.data.slice(0, 10).localeCompare(x.data.slice(0, 10))) || y.peso - x.peso).slice(0, 12);
}

exports.handler = async (event) => {
  const p = event.queryStringParameters || {};
  const comp = COMPS[p.comp] || "BSA";
  let corpo;
  try {
    if (p.tipo === "noticias") {
      const q = (p.q || "futebol brasileiro").slice(0, 80);
      const [g, b] = await Promise.allSettled([noticias(q, 1), bing(q)]);
      let lista = [...(g.value || []), ...(b.value || [])];
      if (lista.length < 4 && g.status === "fulfilled") { try { lista = lista.concat(await noticias(q, 3)); } catch (e) {} }
      if (!lista.length && g.status === "rejected" && b.status === "rejected") throw g.reason;
      corpo = { noticias: lista.slice(0, 80) };
    } else if (p.tipo === "tabela") {
      const d = await fd(`/competitions/${comp}/standings`);
      const total = d.standings.find((s) => s.type === "TOTAL") || d.standings[0];
      corpo = { rodada: d.season && d.season.currentMatchday, tabela: total.table.map((t) => ({
        pos: t.position, time: t.team.shortName || t.team.name, tla: t.team.tla, escudo: t.team.crest,
        p: t.points, j: t.playedGames, v: t.won, e: t.draw, d: t.lost, gp: t.goalsFor, gc: t.goalsAgainst, sg: t.goalDifference })) };
    } else if (p.tipo === "artilharia") {
      const d = await fd(`/competitions/${comp}/scorers?limit=50`);
      corpo = { artilheiros: d.scorers.map((s) => ({ nome: s.player.name, time: s.team.shortName || s.team.name,
        tla: s.team.tla, gols: s.goals || 0, assist: s.assists || 0, jogos: s.playedMatches })) };
    } else if (p.tipo === "jogos") {
      const hoje = new Date();
      const de = dia(new Date(hoje.getTime() - 3 * 864e5)), ate = dia(new Date(hoje.getTime() + 4 * 864e5));
      const d = await fd(`/competitions/${comp}/matches?dateFrom=${de}&dateTo=${ate}`);
      corpo = { jogos: d.matches.map((m) => ({ data: m.utcDate, status: m.status,
        casa: m.homeTeam.shortName || m.homeTeam.name, fora: m.awayTeam.shortName || m.awayTeam.name,
        gc: m.score.fullTime.home, gf: m.score.fullTime.away })) };
    } else if (p.tipo === "resumos") {
      corpo = { materias: await resumos() };
    } else if (p.tipo === "materias") {
      corpo = await materias((p.label || "").slice(0, 60));
    } else {
      return { statusCode: 400, body: JSON.stringify({ erro: "Use ?tipo=noticias|tabela|artilharia|jogos|materias|resumos" }) };
    }
    corpo.atualizadoEm = new Date().toISOString();
    return { statusCode: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120" }, body: JSON.stringify(corpo) };
  } catch (e) {
    const semChave = /football-data/.test(String(e.message)) && !process.env.FOOTBALL_DATA_KEY;
    return { statusCode: 502, headers: { "content-type": "application/json" },
      body: JSON.stringify({ erro: semChave ? "Falta a variável FOOTBALL_DATA_KEY no Netlify." : String(e.message) }) };
  }
};

exports._tag = tag;
