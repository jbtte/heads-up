# Heads Up!

Jogo de adivinhação inspirado no _Heads Up!_, otimizado para grupos. O jogador coloca o celular na testa e tenta adivinhar a palavra com base nas dicas dos outros — inclina para baixo ao acertar e para cima para passar.

---

## Funcionalidades

- Categorias organizadas por faixa etária (5+, 9+, 14+) com cores distintas
- Categorias dinâmicas carregadas via JSON, sem precisar alterar o código
- Detecção de movimento por giroscópio (inclinação para acertar/passar)
- Contagem regressiva com animação
- Timer de 60 segundos com alerta visual nos últimos 10s
- Placar de acertos e passadas
- Histórico completo da rodada
- Categoria "Todas" que mistura palavras de todas as categorias
- Feedback sonoro via Web Audio API (sem arquivos externos)
- Aviso para girar o celular quando em modo retrato
- **PWA** — instalável, funciona offline, abre em fullscreen

---

## Estrutura

```
heads-up/
├── index.html          # Estrutura das telas
├── style.css           # Estilos e animações
├── script.js           # Lógica do jogo
├── manifest.json       # Configuração PWA
├── sw.js               # Service Worker (cache offline)
├── icon.svg            # Ícone do app
└── palavras/
    ├── index.json      # Metadados de todas as categorias
    ├── animais.json
    ├── biblia.json
    └── ...             # Um arquivo por categoria
```

---

## Como adicionar categorias e palavras

### 1. Criar o arquivo de palavras

Crie `palavras/nome-da-categoria.json` com um array de strings:

```json
["Palavra 1", "Palavra 2", "Palavra 3"]
```

### 2. Registrar no índice

Adicione uma linha em `palavras/index.json`:

```json
{ "id": "id-unico", "nome": "Nome visível", "icone": "🎯", "arquivo": "palavras/id-unico.json", "faixa_etaria": "9 anos" }
```

Valores válidos para `faixa_etaria`: `"5 anos"`, `"9 anos"`, `"14 anos"`.

O menu é gerado automaticamente e a categoria aparece agrupada e com a cor correta.

---

## Como rodar localmente

O jogo é HTML puro — não precisa de build ou dependências. Basta servir os arquivos com qualquer servidor HTTP.

**Opção 1 — Python (já vem instalado no macOS/Linux):**

```bash
python3 -m http.server 8080
```

**Opção 2 — Node.js:**

```bash
npx serve .
```

Acesse em `http://localhost:8080`.

---

## Testar no celular (HTTPS obrigatório)

O giroscópio e a instalação como PWA requerem HTTPS. Para expor o servidor local com HTTPS:

**ngrok:**
```bash
ngrok http 8080
```

**Cloudflare Tunnel (sem conta):**
```bash
cloudflared tunnel --url http://localhost:8080
```

---

## Instalar como app (PWA)

1. Abra o URL HTTPS no Chrome (Android) ou Safari (iOS)
2. **Android:** toque nos três pontos → _Adicionar à tela inicial_
3. **iOS:** toque em Compartilhar → _Adicionar à Tela de Início_

O app abre em fullscreen, modo landscape, sem barra do browser.

---

## Notas técnicas

- **iOS 13+:** o acesso ao giroscópio requer permissão explícita. A permissão é pedida ao clicar em "Entrar no Jogo".
- **Offline:** na primeira visita os assets são cacheados pelo Service Worker. Para forçar atualização do cache, incremente `CACHE_NAME` em `sw.js` (ex: `v2` → `v3`).
- **Fontes:** Poppins carregada via Google Fonts. Em modo offline o browser usa a fonte de fallback (`Segoe UI`).
