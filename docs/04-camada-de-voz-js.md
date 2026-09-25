# 04 — Camada de voz em JavaScript

Tudo em `www/index.html`, seção **VOZ (navegador + app Android)** (linha ~1139) e **ENTRADA DE VOZ
CONTÍNUA** (linha ~1545). Linhas citadas = app 1.3 = site v42 (o arquivo é o mesmo).

> Até a 1.2 esta camada existia só no app. Desde a 1.3 / site v42 ela está **também no site**,
> idêntica: o mesmo código escolhe o motor (plugin nativo no APK, Web Speech API no navegador) e tudo
> o que vem depois do texto reconhecido é compartilhado. A documentação do site (`web/docs/09-voz.md`)
> descreve a mesma camada pelo lado do navegador (requisitos de hospedagem: HTTPS, fora de iframe,
> Chrome/Edge/Safari).

## Detecção do ambiente

| Função (linha) | Papel |
|---|---|
| `isNativePlatform()` (1153) | `window.Capacitor.isNativePlatform()` — verdadeiro só dentro do APK |
| `nativeSpeechPlugin()` (1157) | Plugin da comunidade (`Capacitor.Plugins.SpeechRecognition`), usado só para **pedir a permissão** de microfone |
| `cronoVoicePlugin()` (1553) | Plugin nativo `CronoVoice` (via `Capacitor.registerPlugin`), guardado em cache |
| `getSpeechCtor()` (1255) | No app devolve `NativeSpeechRecognitionShim`; no navegador, `window.SpeechRecognition` ou `webkitSpeechRecognition`. Hoje serve para decidir se o botão de voz aparece habilitado |
| `inIframe()` (1260) | No app sempre `false`; no navegador, página dentro de iframe (ex.: link do Claude) → voz indisponível |
| `micDeviceAvailable()` (1281) | No app sempre `true` (o plugin cuida do microfone); no navegador confere se existe microfone (`enumerateDevices`) |

O mesmo arquivo é o site: sem Capacitor, a voz usa a Web Speech API do navegador, com o mesmo
comportamento de tela (ver "Motor do navegador" abaixo).

### `NativeSpeechRecognitionShim` (linha 1169) — legado

Primeira ponte do app (commit `e353887`): imitava a interface da Web Speech API sobre o plugin da
comunidade. Desde o `b69cb33` o Cálculo e o Stroop usam `startVoiceInput` e o shim só é usado por
`getSpeechCtor()` para indicar que há voz disponível. Pode ser removido no futuro, trocando
`speechSupported()` por um teste de `cronoVoicePlugin()`.

## `startVoiceInput(h)` (linha 1563) — a interface usada pelos exercícios

```js
var ctl = startVoiceInput({
  onText:  function(texto, final, alternativas, sessao){ … },  // texto ao vivo
  onState: function(estado){ … },     // "started" | "ready" | "speech" | "end" | "stopped"
  onLevel: function(rms){ … },        // volume do microfone
  onError: function(codigo, fatal){ … }  // "not-allowed" | "audio-capture" | "language" | "network" | …
});
ctl.stop();      // desliga
ctl.restart();   // descarta a frase atual e começa sessão nova
ctl.service;     // no app: "google" | "sistema"; no navegador: null (o relatório mostra "navegador")
ctl.log;         // registro do que o reconhecedor devolveu (até 600 entradas) — vai para o relatório
```

- **`sessao`** = uma **frase**. Muda a cada frase nova (fim de frase, silêncio, restart). Dentro de
  uma sessão, `texto` é **acumulado** (cada evento traz a frase inteira até ali). Os exercícios
  dependem disso, e os dois motores entregam exatamente assim. No app o id é `"n" + session` (do
  Java); no navegador, `"w" + escuta + "." + índice do resultado`.
- **`final`**: `false` para parciais, `true` quando a frase fecha.
- **`alternativas`**: até 5 versões do reconhecedor; `alternativas[0]` é a principal.
- No app: registra os 5 listeners do plugin, pede a permissão (`requestPermissions()` do plugin da
  comunidade) e chama `CronoVoice.start({language:"pt-BR", maxResults:5})`. Erro fatal chama `stop()`.
- No navegador: ver a seção seguinte.

### Motor do navegador (Web Speech API) — `begin()` (linha 1624)

- `lang = "pt-BR"`, `interimResults = true`, `maxAlternatives = 5`.
- **Computador:** `continuous = true`. O Chrome acumula as frases da escuta em `ev.results`; o
  `onresult` entrega **cada resultado final sozinho** (com as alternativas dele) como a sessão
  `"w<escuta>.<índice>"`, e os resultados ainda parciais do fim, juntos, como a frase em andamento.
  (Entregar o texto acumulado como uma frase só fazia o Cálculo perder a contagem quando uma
  resposta vinha de uma alternativa — defeito corrigido na 1.3/v42.)
- **Celular** (`MOBILE_BROWSER`, linha 1620: `/Android|iPhone|iPad|iPod/` no user agent):
  `continuous = false` — uma escuta por frase, reaberta 150 ms depois do fim, o mesmo modelo do
  plugin nativo. O modo contínuo é instável nos navegadores de celular.
- Erros: `not-allowed`/`service-not-allowed` → permissão (fatal); `audio-capture` → sem microfone
  (fatal); `network` → aviso; `language-not-supported` → idioma (fatal); `no-speech`/`aborted` são
  normais e a escuta recomeça.
- `onend` (fim natural da escuta) reabre em 150 ms; `ctl.restart()` aborta e reabre.

## `makeVoiceStatus()` (linha 1678) — painel "Pode falar / Ouvi:"

Elemento `.voice-status` com bolinha de estado (verde pulsando = ouvindo; amarela = um instante;
vermelha = erro), medidor de volume (só no app — o navegador não informa o volume) e a linha
"Ouvi: …". Métodos: `state(s)`, `level(rms)`,
`heard(texto, "ok"|"bad"|"")`, `error(codigo, fatal)`.

Mensagens de erro:

| Código | No app (`isNativePlatform()`) | No navegador |
|---|---|---|
| `not-allowed` | Permissão negada — liberar nas configurações do Android ou usar o modo sem voz | "Clique no cadeado (ou no ícone de microfone) ao lado do endereço do site, permita o microfone e recarregue a página — ou use o modo sem voz." |
| `audio-capture` | "Não consegui usar o microfone. Feche outros apps que possam estar usando o microfone…" (`NATIVE_NO_MIC_MSG`) | `NO_MIC_MSG` (microfone não encontrado; caminho no Windows) |
| `language` | Baixar Português (Brasil) no app Google (`NATIVE_LANG_MSG`) | "Use o Google Chrome ou o Microsoft Edge atualizados, ou o modo sem voz." (`BROWSER_LANG_MSG`) |
| `network` (não fatal) | "Sem conexão com a internet? O reconhecimento de voz precisa de internet." (some em 4 s) | igual |

## Relatório de voz

`voiceReportBlock(...)` (linha 1519) acrescenta ao resultado o botão **📋 Copiar relatório de voz**
e um bloco "Ver relatório técnico" com: data, motor, `navigator.userAgent`, resultado, linha a linha
do exercício e **tudo o que o reconhecedor devolveu com tempo** (`+2.3s [n4] parcial: …`). Serve
para ajustar aliases e tempos a partir de uso real: a pessoa copia e envia. `copyText` usa a API de
área de transferência com alternativa por `execCommand("copy")`.

`stroopVoiceBreakdown(...)` (linha 1494) monta, no resultado do Stroop, a grade palavra por palavra
(cor certa / cor errada "ouvi X" / não captada) e chama o relatório.

## CSS da voz

Linhas ~350–364 (`.voice-status…`, animação `vsPulse`) e ~396–410 (`.stroop-word.voice-miss`,
`.voice-breakdown…`). Usam as variáveis de tema do site (com valores de reserva). Estão no mesmo
arquivo, então valem para o site e para o app.
