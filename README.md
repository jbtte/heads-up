# Heads Up! Católico & Diversos

Jogo de adivinhação inspirado no *Heads Up!*, otimizado para grupos. O jogador coloca o telemóvel na testa e tenta adivinhar a palavra com base nas dicas dos outros — inclina para baixo ao acertar e para cima para passar.

---

## Funcionalidades

- Categorias dinâmicas carregadas via JSON
- Deteção de movimento por giroscópio (inclinação para acertar/passar)
- Contagem regressiva com animação
- Timer de 60 segundos com alerta visual nos últimos 10s
- Placar de acertos e passadas
- Histórico completo da rodada
- Categoria "Todas" que mistura palavras de todas as categorias
- Feedback sonoro via Web Audio API (sem ficheiros externos)
- Aviso para rodar o telemóvel quando em modo retrato
- **PWA** — instalável, funciona offline, abre em fullscreen

---

## Estrutura

```
heads-up/
├── index.html       # Estrutura das telas
├── style.css        # Estilos e animações
├── script.js        # Lógica do jogo
├── palavras.json    # Categorias e palavras
├── manifest.json    # Configuração PWA
├── sw.js            # Service Worker (cache offline)
└── icon.svg         # Ícone do app
```

---

## Como adicionar categorias e palavras

Edite o ficheiro `palavras.json`. Cada categoria segue este formato:

```json
{
  "id": "id-unico",
  "nome": "Nome visível",
  "icone": "🎯",
  "palavras": [
    "Palavra 1",
    "Palavra 2",
    "Palavra 3"
  ]
}
```

Adicione o objeto dentro do array `categorias`. O menu é gerado automaticamente.

---

## Como correr localmente

O jogo é HTML puro — não precisa de build ou dependências. Basta servir os ficheiros com qualquer servidor HTTP.

**Opção 1 — Python (já vem instalado no macOS/Linux):**
```bash
python3 -m http.server 8080
```

**Opção 2 — Node.js:**
```bash
npx serve .
```

Aceda em `http://localhost:8080`.

---

## Testar no telemóvel (HTTPS obrigatório)

O giroscópio e a instalação como PWA requerem HTTPS. Para expor o servidor local com HTTPS:

**Opção recomendada — ngrok:**
```bash
# Instalar: https://ngrok.com/download
ngrok http 8080
```
O ngrok gera um URL `https://xxxx.ngrok.io` que pode abrir no telemóvel.

**Alternativa — Cloudflare Tunnel (sem conta):**
```bash
# Instalar: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/
cloudflared tunnel --url http://localhost:8080
```

---

## Instalar como app (PWA)

1. Abra o URL HTTPS no Chrome (Android) ou Safari (iOS)
2. **Android:** toque nos três pontos → *Adicionar à tela inicial*
3. **iOS:** toque em Partilhar → *Adicionar ao Ecrã de Início*

O app abre em fullscreen, modo landscape, sem barra do browser.

---

## Notas técnicas

- **iOS 13+:** o acesso ao giroscópio requer permissão explícita do utilizador. A permissão é pedida ao clicar em "Entrar no Jogo".
- **Offline:** após a primeira visita, todos os assets ficam em cache pelo Service Worker. Versões futuras invalidam o cache automaticamente ao alterar `CACHE_NAME` em `sw.js`.
- **Fontes:** Poppins carregada via Google Fonts. Em modo offline, o browser usa a fonte de fallback (`Segoe UI`).
