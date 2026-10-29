# Voz do Povo Esportes — site com notícias do dia

O site busca as manchetes do dia **toda vez que a página abre e a cada clique em "Recarregar notícias"**.
Ele precisa de hospedagem com função de servidor. O passo a passo abaixo usa o Netlify (grátis).

## O que ele usa
- **Notícias:** manchetes do Google Notícias (últimas 24 horas; se houver poucas, 3 dias), com link para a matéria original.
- **Tabela, jogos da semana, artilharia e assistências:** football-data.org (plano gratuito).

## Passo a passo
1. **Chave da API de futebol.** Crie uma conta grátis em https://www.football-data.org/client/register e copie o token que chega por e-mail.
   Confira na página de planos se o plano gratuito inclui o "Campeonato Brasileiro Série A" (código BSA).
2. **Suba os arquivos no GitHub.** Crie um repositório e envie esta pasta inteira (incluindo `netlify/functions/dados.js`, `netlify.toml` e `index.html`).
3. **Publique no Netlify.** Em https://app.netlify.com escolha *Add new site → Import an existing project*, selecione o repositório e confirme (não precisa mudar nada).
4. **Coloque a chave.** No Netlify: *Site configuration → Environment variables → Add a variable*. Nome: `FOOTBALL_DATA_KEY`. Valor: o token do passo 1.
   Depois faça *Deploys → Trigger deploy*.
5. **Abra o endereço do site** que o Netlify mostrar.

## Como testar a função
Abra no navegador (troque pelo seu endereço):
- `/.netlify/functions/dados?tipo=noticias&q=Flamengo` → deve listar manchetes.
- `/.netlify/functions/dados?tipo=tabela` → deve listar os 20 clubes.
Se aparecer `{"erro": ...}`, a mensagem diz o que falta.

## Limites
- A tabela, os jogos e a artilharia vêm só do Brasileirão. Copa do Brasil, Sul-Americana e Série B aparecem como notícias.
- As assistências consideram os 50 maiores artilheiros do campeonato.
- O Google Notícias é para uso pessoal e não comercial; as manchetes sempre levam à matéria original.
- Sem fotos dos jogos: elas pertencem aos veículos. Os cartões usam o escudo dos clubes citados na manchete.

## Personalizar
- No começo do `<script>` do `index.html`, troque `contato@seusite.com.br` pelo seu e-mail (aparece em "Contato", "Envie sua pauta" e no rodapé).
- Os quadros "Anuncie aqui" são espaços para anunciantes: troque o texto por uma imagem com link.

## Conteúdo salvo no site (dentro do `index.html`)
- **Destaques da redação:** manchete e matérias com texto completo (abrem ao clicar), vindas do site anterior (dados de 25/10/2026).
- **Temporada 2026:** Brasileirão, Libertadores, Copa do Brasil, Sul-Americana, Série B e Copa do Mundo.
- **Painel do time:** linha "Outras competições em 2026".
- **Plano B:** se a API de tabela, jogos ou artilharia falhar (por exemplo, antes de colocar a chave), o site mostra esses dados salvos, com aviso.
- Esse conteúdo não se atualiza sozinho. Só as manchetes do bloco "Últimas notícias" são buscadas a cada clique. Para renovar o arquivo, peça ao Claude.

## Se as notícias derem erro
- **Não abra o `index.html` com duplo clique.** A função de servidor só existe no site publicado. Mesmo assim, o site tenta buscar as manchetes por um serviço público alternativo; se ele estiver fora do ar, aparece o aviso.
- Se publicou no Netlify e ainda dá erro, abra `https://SEU-SITE.netlify.app/.netlify/functions/dados?tipo=noticias`. A mensagem que aparecer ali diz o que está errado (me envie, se precisar).
- Confira se a pasta `netlify/functions/dados.js` foi enviada ao GitHub com esse caminho exato.

## Criar matérias com o Blogger do Google
O site mostra as matérias que você escrever num blog do Blogger, sem precisar mexer em código.
1. Acesse https://www.blogger.com com sua conta Google e clique em **Criar blog**. Nome: Voz do Povo Esportes. Escolha o endereço (por exemplo `vozdopovoesportes.blogspot.com`).
2. No blog, abra **Configurações → Feed do site** e escolha **Completo** (assim o texto inteiro chega ao site).
3. Clique em **Nova postagem**: escreva o título e o texto, adicione fotos pelo botão de imagem, e em **Marcadores** coloque o assunto, por exemplo `Brasileirão`, `Libertadores`, `Copa do Brasil`, `Sul-Americana`, `Série B` ou o nome do time (`Palmeiras`). Clique em **Publicar**.
4. No Netlify: **Site configuration → Environment variables → Add a variable**. Nome: `BLOGGER_URL`. Valor: o endereço do blog com https, por exemplo `https://vozdopovoesportes.blogspot.com`. Faça um novo deploy.
5. Pronto: as matérias aparecem em **Matérias** no topo do site, e abrem dentro do próprio site ao clicar. O marcador com o nome de um campeonato filtra pelo menu, e o marcador com o nome de um time coloca a matéria no painel desse time.
Enquanto o blog não tiver matérias (ou a variável não existir), o site mostra os "Destaques da redação" salvos.

## Como atualizar os arquivos no GitHub
Abra o repositório, entre na pasta do arquivo, clique em **Add file → Upload files**, envie o arquivo novo (mesmo nome) e confirme com **Commit changes**. O Netlify publica sozinho em alguns segundos. Para `dados.js`, entre antes em `netlify/functions`.
