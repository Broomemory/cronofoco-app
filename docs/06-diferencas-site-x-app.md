# 06 — Diferenças entre o site (v41) e o app (1.2)

Comparação entre `cronofoco.html` do site na **versão 41** (cópia em
`sincronizacao/base-site-v41.html`) e `www/index.html` do app **1.2**. O diff completo, linha a
linha, está em `sincronizacao/diferencas-site-v41-para-app-1.2.diff` (13 blocos: 719 linhas do app
que não existem no site e 88 linhas do site que o app substituiu).

## Resumo

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

## Todos os blocos de diferença

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

## O que é igual e deve continuar igual

Todas as outras ~6.700 linhas: gate de acesso e `LICENSES`, roteador, Início e trilha, todos os
exercícios (fora a voz), passatempos, concursos, flashcards, leitura, dicas, resultado, histórico,
chaves de `localStorage`, CSS de tema. Qualquer mudança nessas partes deve ser feita no site e
trazida para o app pela sincronização ([07](07-sincronizacao-com-o-site.md)).

## Conferir as diferenças a qualquer momento

```bash
# a partir da raiz do repositório
diff -u docs/sincronizacao/base-site-v41.html www/index.html | less
# ou, no Windows (Git Bash): git diff --no-index docs/sincronizacao/base-site-v41.html www/index.html
```

Se aparecer diferença fora dos blocos acima, o app e o site deixaram de estar iguais.
