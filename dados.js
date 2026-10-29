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
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30).map((m) => {
    const fonte = tag(m[1], "source");
    let titulo = tag(m[1], "title");
    if (fonte && titulo.endsWith(" - " + fonte)) titulo = titulo.slice(0, -(fonte.length + 3));
    return { titulo, fonte, link: tag(m[1], "link"), data: tag(m[1], "pubDate") };
  }).filter((n) => n.titulo && /^https?:\/\//.test(n.link))
    .sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 20);
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

exports.handler = async (event) => {
  const p = event.queryStringParameters || {};
  const comp = COMPS[p.comp] || "BSA";
  let corpo;
  try {
    if (p.tipo === "noticias") {
      const q = (p.q || "futebol brasileiro").slice(0, 80);
      let lista = await noticias(q, 1);
      if (lista.length < 4) lista = await noticias(q, 3);
      corpo = { noticias: lista };
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
    } else if (p.tipo === "materias") {
      corpo = await materias((p.label || "").slice(0, 60));
    } else {
      return { statusCode: 400, body: JSON.stringify({ erro: "Use ?tipo=noticias|tabela|artilharia|jogos|materias" }) };
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
