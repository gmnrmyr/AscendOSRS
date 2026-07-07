# Roadmap — paridade com os apps pagos do mercado

O que GE Tracker (~US$5/mês), Flipping Copilot (~US$5/mês) e afins cobram, e como
a gente entrega local-first de graça. Fonte de dados de TUDO isso é pública:
`prices.runescape.wiki/api/v1/osrs` (/latest, /5m, /1h, /timeseries — com volume)
+ mapping (buy limits) + GE tax 2%. Eles vendem UI, não dados.

## F1 — Flipping core (o que o GE Tracker cobra) — FEITO 07/jul (c2f1404)
- [x] Tela **Flipping**: margem (high-low), ROI %, lucro pós-tax (2%), buy limit
      (vem no /mapping), volume 5m/1h → filtro "flipa de verdade"
- [x] **Sugestões de flip**: rank por lucro realista = margem × min(limite,
      budget, vol/h); budget padrão = Coins+plat das contas ativas; filtro F2P
- [x] **Gráfico de preço** por item — linha high/low + volume em painéis
      separados; 6h/24h/7d/30d/1y (/timeseries) e **all-time desde 2015**
      (api.weirdgloop.org/exchange/history, CORS aberto, série única)
- [x] **Favoritos** + notas por item
- [x] **Journal de flips**: compra/venda manual, P&L realizado por dia
      (persistido no dashboard.json em `flipping: {favorites, journal}`)

## F2 — Alertas (diferencial deles = infra; nossa = ntfy-hub já existe!)
- [ ] Alerta de preço (acima/abaixo de X) e de margem — server.js checa a cada
      5min e dispara push via **notify.sh do homelab** (celular do Gui)
- [ ] Alerta de crash/spike (variação % em 1h)

## F3 — Updates do jogo (nerfs/buffs)
- [ ] Feed **Game Updates**: RSS oficial do OSRS + página "Game updates" da Wiki
      via server (cache), aba própria no app
- [ ] **Resumo por update**: destacar itens/métodos citados que EXISTEM no bank/
      methods do usuário ("teu Scythe foi citado no balancing de hoje")
- [ ] (Opcional) resumo em 3 bullets via pipeline local do ecossistema

## F4 — Monetização (branch public-static)
- [ ] Branch público: build estático + localStorage (sem server), deploy Vercel
- [ ] Card Support: **cripto honor-system** (USDC/BTC + QR) — decisão atual
- [ ] **Stripe Payment Links** quando houver tração: assinatura sem backend,
      só taxa por venda (~4%), exige conta Stripe com CPF/CNPJ do Gui.
      Gate de features pagas SÓ com backend próprio (fase futura, se valer)

## F5 — Paridade de polish
- [ ] Ícones de item em tudo (chisel.weirdgloop.org já usado nos goals)
- [ ] Busca de item global (unificar no idByName do priceEngine, matar osrsApi)
- [ ] Code-split do bundle (1.1MB) + abas Bank/Goals/Methods na passada visual

Ordem sugerida: F1 (2-3 sessões) → F3 (1 sessão) → F2 (1 sessão) → F4 → F5.
