# 03 — Plugin nativo `CronoVoicePlugin`

Arquivo: `android/app/src/main/java/com/cronofoco/app/CronoVoicePlugin.java` (321 linhas).
Registrado em `MainActivity.onCreate` com `registerPlugin(CronoVoicePlugin.class)` **antes** de
`super.onCreate` (plugins locais precisam disso). Nome no JavaScript: `CronoVoice`.

## Por que um plugin próprio

O `SpeechRecognizer` do Android ouve uma frase por vez e o plugin genérico da comunidade não deixava
controlar o motor, o tempo de silêncio, os resultados parciais nem o reinício. Com ele o
reconhecimento ficava ruim em português e o Stroop "travava" na primeira palavra. O CronoVoice:

- **prefere o motor do Google** (`com.google.android.googlequicksearchbox`) quando instalado — em
  vários aparelhos (ex.: Samsung) o motor padrão é outro, bem pior em português;
- pede **resultados parciais** (texto chega enquanto a pessoa ainda fala);
- **reinicia sozinho** a escuta ao fim de cada frase/silêncio, sem ida e volta ao JavaScript, até o
  app chamar `stop()`.

## Métodos (`@PluginMethod`)

| Método | Parâmetros | Retorno | Efeito |
|---|---|---|---|
| `start` | `language` (padrão `"pt-BR"`), `maxResults` (padrão 5) | `{service: "google"\|"sistema", available: bool}` | Liga o modo ativo, cria o reconhecedor e começa a ouvir |
| `restart` | — | — | Descarta a frase em andamento e começa uma sessão nova em 80 ms |
| `stop` | — | — | Desliga tudo (`shutdown`) |

Ciclo de vida: `handleOnPause` e `handleOnDestroy` também chamam `shutdown()` — o microfone nunca
fica aberto com o app em segundo plano.

## Configuração de cada escuta (`listen()`)

| Extra do Intent | Valor |
|---|---|
| `EXTRA_LANGUAGE_MODEL` | `LANGUAGE_MODEL_FREE_FORM` |
| `EXTRA_LANGUAGE` / `EXTRA_LANGUAGE_PREFERENCE` | `pt-BR` |
| `EXTRA_MAX_RESULTS` | 5 (alternativas) |
| `EXTRA_PARTIAL_RESULTS` | `true` |
| `android.speech.extra.DICTATION_MODE` | `true` (sessão mais longa; o Google respeita) |
| `EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS` e `…POSSIBLY_COMPLETE…` | 2500 ms |

Cada `listen()` incrementa `session`. `generation` muda a cada reconhecedor criado; o `Listener`
descarta eventos de reconhecedores antigos (`stale()`).

## Eventos enviados ao JavaScript (`notifyListeners`)

| Evento | Dados | Quando |
|---|---|---|
| `voiceState` | `{state, service, session}` — `state`: `ready`, `speech`, `end`, `stopped` | Pronto para ouvir, começou a fala, terminou a fala/erro, parado |
| `voicePartial` | `{session, matches: [texto…]}` | Texto parcial durante a fala |
| `voiceResult` | `{session, matches: [texto…]}` | Frase final (depois reinicia em 40 ms) |
| `voiceLevel` | `{rms}` | Volume do microfone, no máximo a cada 120 ms |
| `voiceError` | `{code, error, fatal, service}` | Ver tabela abaixo |

## Tratamento de erros (`onError`)

| Erro do Android | Ação | Evento |
|---|---|---|
| `ERROR_INSUFFICIENT_PERMISSIONS` | Desliga | `not-allowed`, fatal |
| `ERROR_NO_MATCH`, `ERROR_SPEECH_TIMEOUT` | Silêncio ou "não entendi": normal, volta a ouvir em 60 ms | — |
| 12 / 13 (idioma não suportado/indisponível, API 31+) | Se estava no Google, troca para o motor do sistema e tenta de novo; senão desliga | `language`, fatal |
| `ERROR_NETWORK`, `ERROR_NETWORK_TIMEOUT`, `ERROR_SERVER` | Avisa e tenta de novo | `network`, não fatal |
| `ERROR_AUDIO` 5 vezes seguidas | Desliga | `audio-capture`, fatal |
| Outros (ex.: ocupado, cliente) | Tenta de novo com espera crescente (250 ms × erros seguidos, até 2 s), recriando o reconhecedor | — |
| 3 erros seguidos no motor do Google | Passa a usar o motor do sistema | — |

## Onde mexer

- Tempo de silêncio: as duas linhas `2500L` em `listen()`.
- Número de alternativas: `maxResults` no `start` (o JS pede 5).
- Motor: `GOOGLE_PKG` e `useGoogle`.
- Depois de alterar o Java, só há efeito num APK novo (não basta mudar o `www/index.html`).
