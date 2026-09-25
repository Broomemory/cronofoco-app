# 04 — Camada de voz em JavaScript (só no app)

Tudo em `www/index.html`, seção **VOZ (Web Speech API + ponte nativa Android)** (linha ~1139) e
**ENTRADA DE VOZ CONTÍNUA** (linha ~1540). Linhas citadas = app 1.2.

## Detecção do ambiente

| Função (linha) | Papel |
|---|---|
| `isNativePlatform()` (1148) | `window.Capacitor.isNativePlatform()` — verdadeiro só dentro do APK |
| `nativeSpeechPlugin()` (1152) | Plugin da comunidade (`Capacitor.Plugins.SpeechRecognition`), usado só para **pedir a permissão** de microfone |
| `cronoVoicePlugin()` (1548) | Plugin nativo `CronoVoice` (via `Capacitor.registerPlugin`), guardado em cache |
| `getSpeechCtor()` (1250) | No app devolve `NativeSpeechRecognitionShim`; no navegador, a Web Speech API. Hoje serve para decidir se o botão de voz aparece habilitado |
| `inIframe()` (1255) | No app sempre `false` |
| `micDeviceAvailable()` (1276) | No app sempre `true` (o plugin cuida do microfone) |

O mesmo `www/index.html` também funciona num navegador comum: sem Capacitor, a voz cai na Web
Speech API (modo contínuo), com o mesmo comportamento de tela.

### `NativeSpeechRecognitionShim` (linha 1164) — legado

Primeira ponte do app (commit `e353887`): imitava a interface da Web Speech API sobre o plugin da
comunidade. Desde o `b69cb33` o Cálculo e o Stroop usam `startVoiceInput` e o shim só é usado por
`getSpeechCtor()` para indicar que há voz disponível. Pode ser removido no futuro, trocando
`speechSupported()` por um teste de `cronoVoicePlugin()`.

## `startVoiceInput(h)` (linha 1558) — a interface usada pelos exercícios

```js
var ctl = startVoiceInput({
  onText:  function(texto, final, alternativas, sessao){ … },  // texto ao vivo
  onState: function(estado){ … },     // "started" | "ready" | "speech" | "end" | "stopped"
  onLevel: function(rms){ … },        // volume do microfone
  onError: function(codigo, fatal){ … }  // "not-allowed" | "audio-capture" | "language" | "network" | …
});
ctl.stop();      // desliga
ctl.restart();   // descarta a frase atual e começa sessão nova
ctl.service;     // "google" | "sistema" (motor nativo em uso)
ctl.log;         // registro do que o reconhecedor devolveu (até 600 entradas) — vai para o relatório
```

- **`sessao`** muda sempre que o reconhecedor recomeça do zero (fim de frase, silêncio, restart).
  Dentro de uma sessão, `texto` é **acumulado** (cada evento traz a frase inteira até ali).
  No app o id é `"n" + session` (do Java); no navegador, `"w" + contador`.
- **`final`**: `false` para parciais, `true` quando a frase fecha.
- **`alternativas`**: até 5 versões do reconhecedor; `alternativas[0]` é a principal.
- No app: registra os 5 listeners do plugin, pede a permissão (`requestPermissions()` do plugin da
  comunidade) e chama `CronoVoice.start({language:"pt-BR", maxResults:5})`. Erro fatal chama `stop()`.
- No navegador: Web Speech API com `continuous`, `interimResults`, 5 alternativas e reinício
  automático em `onend`.

## `makeVoiceStatus()` (linha 1652) — painel "Pode falar / Ouvi:"

Elemento `.voice-status` com bolinha de estado (verde pulsando = ouvindo; amarela = um instante;
vermelha = erro), medidor de volume e a linha "Ouvi: …". Métodos: `state(s)`, `level(rms)`,
`heard(texto, "ok"|"bad"|"")`, `error(codigo, fatal)`.

Mensagens de erro:

| Código | Mensagem ao usuário |
|---|---|
| `not-allowed` | Permissão de microfone negada — liberar nas configurações do Android ou usar o modo sem voz |
| `audio-capture` | App: "Não consegui usar o microfone. Feche outros apps que possam estar usando o microfone…" (`NATIVE_NO_MIC_MSG`) |
| `language` | Português não disponível — atualizar o app Google e baixar Português (Brasil) em Configurações → Google → … → Voz → Idiomas (`NATIVE_LANG_MSG`) |
| `network` (não fatal) | "Sem conexão com a internet? O reconhecimento de voz precisa de internet." (some em 4 s) |

## Relatório de voz

`voiceReportBlock(...)` (linha 1514) acrescenta ao resultado o botão **📋 Copiar relatório de voz**
e um bloco "Ver relatório técnico" com: data, motor, `navigator.userAgent`, resultado, linha a linha
do exercício e **tudo o que o reconhecedor devolveu com tempo** (`+2.3s [n4] parcial: …`). Serve
para ajustar aliases e tempos a partir de uso real: a pessoa copia e envia. `copyText` usa a API de
área de transferência com alternativa por `execCommand("copy")`.

`stroopVoiceBreakdown(...)` (linha 1489) monta, no resultado do Stroop, a grade palavra por palavra
(cor certa / cor errada "ouvi X" / não captada) e chama o relatório.

## CSS exclusivo do app

Linhas ~350–364 (`.voice-status…`, animação `vsPulse`) e ~396–410 (`.stroop-word.voice-miss`,
`.voice-breakdown…`). Usam as variáveis de tema do site (com valores de reserva).
