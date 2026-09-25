# Histórico de versões do app

| Versão | versionCode | Commit | Data | Conteúdo |
|---|---|---|---|---|
| 1.3 | 4 | `cab1ee9` | 25/09/2026 | `www/index.html` idêntico ao site v42 (voz unificada) |
| 1.2 | 3 | `5ec2007` | 25/09/2026 | Paridade com o site v41 + voz nativa |
| 1.1 | 2 | `b69cb33` → `1d7157b` | 23/09/2026 | Plugin nativo CronoVoice e evolução da voz |
| 1.0 | 1 | `e353887` → `d17b84f` | 23/09/2026 | Primeiro APK: site + ponte de voz sobre o plugin da comunidade |

## 1.3 — 25/09/2026

- A camada de voz do app foi levada para o site: `www/index.html` passa a ser **idêntico** ao
  `cronofoco.html` do site **v42** (md5 `ed368d93407de065a58f5454e18940ab`). Não há mais diferença
  entre os dois arquivos; sincronizar = copiar ([07](07-sincronizacao-com-o-site.md)).
- Motor do navegador (usado quando o arquivo roda como site) reescrito para entregar uma frase por
  sessão, como o nativo: contínuo no computador (cada resultado final vira uma sessão, com as
  alternativas dele — corrige a perda de contagem do Cálculo quando a resposta vinha de uma
  alternativa) e uma escuta por frase no celular.
- Mensagens de erro de voz próprias para o navegador (cadeado da barra de endereço; "use Chrome ou
  Edge") e para o Android; tratamento de `language-not-supported`.
- No aparelho, nada muda no comportamento da voz: o motor nativo e a lógica dos exercícios são os
  mesmos da 1.2.
- Documentação: diferenças zeradas (06), sincronização simplificada (07), testes de voz nos três
  motores (08), `sincronizacao/base-site-v42.html`; registro da 1.2 em `sincronizacao/historico/`.

## 1.2 — 25/09/2026

- Conteúdo do **site v41** trazido por fusão de três vias ([07](07-sincronizacao-com-o-site.md)):
  aba Passatempos (Sudoku, Caça-palavras, Palavra Embaralhada, **Palavras Cruzadas**), 18 baralhos de
  flashcards, 30 textos de leitura, 84 questões de concursos, novo gerador do Cálculo, "Já
  memorizei", meta na Sequência de Números, botões "Desistir e voltar" / "Voltar ao início" / "Parar",
  painel de próximo desbloqueio, modo revisão (VASSOURA) e "Desafio das Cores".
- Stroop volta a liberar com 5 sessões (igual ao site); o resultado por voz ganhou a linha
  "Conferência".
- Documentação em `docs/` com o registro das diferenças site × app e script de sincronização.

## 1.1 — 23/09/2026

- `b69cb33` — Plugin nativo próprio **CronoVoice** (motor do Google, resultados parciais, reinício
  automático no Android) e `startVoiceInput` com texto ao vivo; chave de assinatura fixa
  (atualizações instalam por cima); versionCode 2.
- `e9bee88` — Licença de teste mostra o nome digitado; Stroop liberado desde o início para teste.
- `7782aca` — Stroop por voz com **alinhamento** e relatório de voz.
- `bb4c4c0` — Sudoku com anotações; rótulos do teclado do Cálculo.
- `d30af9e` — Cálculo sem reiniciar o microfone entre contas; cores por aproximação fonética.
- `1d7157b` — Cálculo recupera respostas "grudadas", botão Pular, relatório; Stroop volta a usar a
  frase principal.

## 1.0 — 23/09/2026

- `e353887` — Projeto Capacitor com o site e a ponte `NativeSpeechRecognitionShim` sobre
  `@capacitor-community/speech-recognition`.
- `25a73e8` — Release automático do APK (`build-latest`).
- `2fbc876`, `da08bec`, `ce9397a` — Correções do workflow (action quebrada, sdkmanager fora do
  PATH, Node 22).
- `d17b84f` — Correção: Stroop travava na primeira palavra.
