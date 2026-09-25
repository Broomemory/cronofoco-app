# 06 — Diferenças entre o site e o app

## Hoje (site v42 × app 1.3): nenhuma

O `www/index.html` do app **1.3** é **idêntico, byte a byte,** ao `cronofoco.html` do site na
**versão 42**:

| Arquivo | Linhas | md5 |
|---|---|---|
| `cronofoco.html` (site v42) | 7.486 | `ed368d93407de065a58f5454e18940ab` |
| `www/index.html` (app 1.3) | 7.486 | `ed368d93407de065a58f5454e18940ab` |
| `assets/public/index.html` dentro do APK 1.3 | 7.486 | `ed368d93407de065a58f5454e18940ab` |

O registro fica em `sincronizacao/diferencas-site-v42-para-app-1.3.diff` (só uma linha de
comentário: "Sem diferenças"). O que ainda é exclusivo do app **não está no HTML**: o plugin Java
`CronoVoicePlugin`, a configuração Capacitor/Android e o build ([01](01-estrutura-do-projeto.md),
[02](02-build-e-publicacao.md), [03](03-plugin-nativo-cronovoice.md)).

O mesmo arquivo se comporta de acordo com onde está rodando — isso **não é diferença de código**, é
o mesmo código tomando um caminho ou outro:

| Ponto | No app (APK) | No navegador (site) |
|---|---|---|
| Motor de voz (`startVoiceInput`) | plugin nativo `CronoVoice` | Web Speech API (contínua no computador; uma frase por escuta no celular) |
| `inIframe()` / `micDeviceAvailable()` | sempre `false` / `true` | conferidos de verdade (no iframe do Claude a voz fica "(indisponível)") |
| Mensagens de erro de voz | caminho nas configurações do Android | cadeado da barra de endereço; "use Chrome ou Edge" |
| Medidor de volume no painel "Pode falar" | ✔ (o Android informa o volume) | — (o navegador não informa) |

Detalhes na [04-camada-de-voz-js.md](04-camada-de-voz-js.md).

## Conferir a qualquer momento

```bash
# a partir da raiz do repositório do app
cmp www/index.html /caminho/do/cronofoco.html && echo "idênticos"
md5sum www/index.html /caminho/do/cronofoco.html
# no Windows (PowerShell): Get-FileHash www\index.html, C:\...\cronofoco.html -Algorithm MD5
```

Se não forem idênticos, alguém mudou um dos dois sem copiar para o outro — ver
[07](07-sincronizacao-com-o-site.md).

---

## Histórico: como era até o app 1.2 (site v41)

Até a 1.2 o app tinha uma camada de voz que o site não tinha (o site só podia ser testado dentro do
link do Claude, que bloqueia o microfone). Na v42 do site essa camada inteira foi **levada para o
site** — os 13 blocos abaixo passaram a fazer parte do `cronofoco.html` — e o motor do navegador foi
reescrito para entregar as frases do mesmo jeito que o motor nativo. Com isso a diferença zerou. O
diff completo daquela época está guardado em
`sincronizacao/historico/diferencas-site-v41-para-app-1.2.diff` (base em
`sincronizacao/historico/base-site-v41.html`).

### Resumo (v41 × 1.2)

| | Site v41 | App 1.2 |
|---|---|---|
| Telas, exercícios, passatempos, concursos, dicas, histórico | ✔ | ✔ idêntico |
| Dados (`localStorage`), licenças, trilha de desbloqueio | ✔ | ✔ idêntico |
| Conteúdo (textos, questões, flashcards, cruzadinha…) | ✔ | ✔ idêntico |
| Voz no navegador (Web Speech API) | versão simples | versão contínua (também usada se o app for aberto num navegador) |
| Voz no Android (plugin nativo CronoVoice) | — | ✔ |
| Cálculo por voz | 1 reconhecimento por conta, "(falado)" | microfone contínuo, lista de números, respostas grudadas, **Pular esta conta**, relatório |
| Stroop por voz | cor ouvida = próxima palavra | **alinhamento** (certa / errada / não captada), grade palavra por palavra, relatório |
| Registro `stroop.voiceScore` | `{ok, total}` | `{ok, bad, miss, total}` |

Fora da voz, **não há nenhuma diferença**: nenhuma regra, conteúdo ou texto de tela difere, exceto
o aviso do modo voz do Cálculo. Os `unlockAt` também são iguais (o Stroop voltou a abrir com 5
sessões no app 1.2; para testar sem cumprir a trilha, use o código VASSOURA).

### Os 13 blocos de diferença (v41 × 1.2)

Linhas do site (v41) → linhas do app (1.2).

| # | Site | App | Onde | O que o app tem de diferente |
|---|---|---|---|---|
| 1 | 349 | 350–364 | CSS | Estilos do painel de voz `.voice-status` (bolinha, medidor, "Ouvi:") e animação `vsPulse` |
| 2 | 380 | 396–410 | CSS | `.stroop-word.voice-miss` (palavra não captada) e `.voice-breakdown` (grade palavra por palavra e relatório) |
| 3 | 1106–1113 | 1136–1256 | VOZ | Cabeçalho da seção; `isNativePlatform`, `nativeSpeechPlugin`, `NativeSpeechRecognitionShim` (legado) e `getSpeechCtor` que devolve o shim no app |
| 4 | 1115–1120 | 1258–1265 | VOZ | `inIframe()` devolve `false` no app |
| 5 | 1126–1133 | 1271–1280 | VOZ | `micDeviceAvailable()` devolve `true` no app |
| 6 | 1142–1148 | 1289–1296 | VOZ | `wordsToNumber` separa por pontuação (o Android devolve "Cinco.") |
| 7 | 1152–1171 | 1300–1690 | VOZ | `parseSpokenNumber` usa o último grupo de dígitos; **novas:** `NUM_ALIASES`, `NUM_OPS`, `numWordValue`, `extractSpokenNumbers`, `numberAddedTo`, `firstSpokenNumber`, `COLOR_ALIASES`, `COLOR_LOOKUP`, `colorPhon`, `editDist`, `COLOR_PHON`, `fuzzyColor`, novo `extractColorTokens`, `alignColorTokens`, `colorName`, `copyText`, `stroopVoiceBreakdown`, `voiceReportBlock`, seção **ENTRADA DE VOZ CONTÍNUA** (`cronoVoicePlugin`, `startVoiceInput`), `NATIVE_NO_MIC_MSG`, `NATIVE_LANG_MSG`, `makeVoiceStatus` |
| 8 | 1666 | 2185 | Cálculo | Variáveis `voiceCtl`, `voiceStatus`, `voiceLogRef` em `renderCalc` |
| 9 | 1769 | 2288 | Cálculo | Texto do aviso do modo voz ("fale só o resultado… sem ler a conta") |
| 10 | 1777 | 2296 | Cálculo | `start()` chama `startCalcVoice()` antes da 1ª conta |
| 11 | 1990–2041 | 2509–2609 | Cálculo | `renderQuestionVoice` mostra o painel de voz e **⏭ Pular esta conta**; `listenOnce` (site) substituído por `startCalcVoice` + `skipVoiceQuestion`; `stopVoice` também para `voiceCtl`; `finish` guarda o log de voz |
| 12 | 2064 | 2632–2642 | Cálculo | Resultado com relatório de voz conta por conta (`voiceReportBlock`) |
| 13 | 2187–2254 | 2760–2885 | Stroop | `startVoiceSequence` por alinhamento (`cellState`, `cellHeard`, `freeze`, espera de 450 ms); `stopVoiceSeq` usando o controlador; `finish` com proteção contra dupla chamada, contagem ok/bad/miss, métricas "Cor certa / errada" e "Não captadas pelo microfone", `stroopVoiceBreakdown` |

### O que mudou além da cópia, ao levar a voz para o site (v42 / app 1.3)

| Mudança | Por quê |
|---|---|
| Motor do navegador entrega **cada resultado final como uma frase (sessão) separada**, com as alternativas dele | No modo contínuo do Chrome o texto acumulado era entregue como uma frase só; quando uma resposta do Cálculo vinha de uma alternativa, o texto principal não tinha aquele número e a contagem se perdia (defeito encontrado nos testes) |
| No celular (Chrome Android, Safari iPhone) o navegador usa **uma escuta por frase** (`continuous = false`) e reabre sozinho | O modo contínuo é instável nos navegadores de celular (repete trechos) |
| Mensagens de erro separadas para navegador e Android; erro `language-not-supported` tratado | Orientar a pessoa pelo caminho certo de cada ambiente |
| Cabeçalho da seção VOZ reescrito | Documentar que o arquivo é o mesmo nos dois lugares |
