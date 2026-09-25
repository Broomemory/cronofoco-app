# 05 — Voz nos exercícios

Só dois exercícios usam voz: **Cálculo Mental** e **Desafio das Cores (Stroop)**. A lógica descrita
aqui nasceu no app e, desde a 1.3 / site v42, é **a mesma no site** (o arquivo é o mesmo). Ela não
depende do motor: recebe texto por frase de `startVoiceInput` ([04](04-camada-de-voz-js.md)), venha
ele do plugin nativo ou da Web Speech API do navegador. Linhas citadas = app 1.3 = site v42.

---

## Cálculo Mental por voz

Código: `startCalcVoice()` (linha ~2553), `skipVoiceQuestion()` (~2619) e `renderQuestionVoice()`
dentro de `renderCalc`; funções de apoio na seção VOZ.

### Ideia

**Um único microfone aberto durante o exercício inteiro, sem reiniciar entre as contas.** Cada
reinício leva 0,5–1 s para o Android voltar a ouvir e o começo da resposta seguinte se perdia. A
pessoa fala só os resultados ("quarenta e dois… cinquenta e seis…"); o texto de cada sessão do
reconhecedor vira uma lista de números na ordem falada, e cada número novo responde a conta atual.

### Passo a passo de cada `onText`

1. **Nova sessão do reconhecedor?** Confirma o número pendente da sessão anterior e zera o estado
   (`seen = []`).
2. `extractSpokenNumbers(texto)` → lista de números da sessão.
3. `newNumbers(lista)` compara com `seen` (números da sessão já usados como resposta):
   - posições novas → respostas novas;
   - posição já usada que **mudou** → `numberAddedTo(antes, agora)` tenta recuperar a resposta que o
     reconhecedor "grudou" na anterior. Ex.: disse "vinte" e depois "um" e veio "21" → resposta 1.
4. Frase **final** sem número na principal → tenta as alternativas.
5. Parcial: números seguidos de outro são confirmados na hora; **o último espera 800 ms parado**
   (pode ser "vinte…" virando "vinte e cinco"). Frase final confirma tudo.
6. Cada confirmação chama `answer(v)` → `logAnswer`, painel lateral e próxima conta. Não dá para
   corrigir, e o painel mostra só ✓/✗.

Fala sem número ("hã", "é…") é ignorada. O botão **⏭ Pular esta conta** registra a conta como
não acertada ("pulada").

### `extractSpokenNumbers(texto)` (linha ~1327)

| Regra | Exemplo |
|---|---|
| Dígitos contam direto | "42" → 42 |
| Palavras numéricas (`PT_NUM_WORDS`) e apelidos (`NUM_ALIASES`) | "deus" → 10, "novo" → 9, "sem" → 100, "hum" → 1, "dose" → 12, "treis" → 3 |
| Dezena + unidade | "vinte e cinco", "vinte cinco" → 25 |
| Centena + resto | "cento e dez" → 110 |
| Números colados a operação são descartados (pessoa lendo a conta) | "seis vezes sete quarenta e dois" → [42] |
| Ordem preservada | "doze trinta e cinco 7" → [12, 35, 7] |

Operações reconhecidas (`NUM_OPS`): mais, menos, vezes, x, por, dividido, e os símbolos × * + ÷ / −.

### `numberAddedTo(antes, agora)` (linha ~1358)

| Antes → agora | Resposta nova |
|---|---|
| 20 → 21 (dezena redonda + unidade) | 1 |
| 100 → 125 (centena redonda + resto) | 25 |
| 10 → 100, 1 → 12, 7 → 75 (texto que começa igual) | 0, 2, 5 |
| 13 → 30, 21 → 20, 40 → 40 | nenhuma (`null`) |

### Relatório no fim

Resultado mostra, conta por conta, "ouviu X ✓/✗" ou "pulada", mais o registro bruto do
reconhecedor.

---

## Desafio das Cores (Stroop) por voz

Código: `startVoiceSequence()` (linha ~2804) em `renderStroop`; `extractColorTokens`,
`alignColorTokens` na seção VOZ.

### Ideia: conferência por ALINHAMENTO

No site, cada cor ouvida é comparada com "a próxima palavra da grade" — se o reconhecedor perde uma
palavra, todas as seguintes ficam deslocadas e viram erro. No app, as cores ouvidas em cada sessão
do reconhecedor são **alinhadas** com a grade (como um "diff"), e cada palavra da grade fica:

- **ok** — disse a cor certa (verde);
- **bad** — disse outra cor (vermelho, "ouvi X");
- **miss** — o microfone não captou nada ali (cinza tracejado, **não conta como erro**).

### `alignColorTokens(ouvidas, esperadas)` (linha ~1443)

Programação dinâmica (distância de edição) com custos: acerto **0**, cor trocada **1**, palavra da
grade não captada **1,2**, palavra ouvida sobrando **1,5**. Olha no máximo 4 palavras além do número
de cores ouvidas. Devolve o estado de cada casa e quantas casas a sessão "consumiu" (`consumed`), que
define onde fica o ponteiro.

**Limitação conhecida:** se o reconhecedor perde uma palavra e a sessão termina logo depois, com só
**uma** cor ouvida após a falha, o menor custo é "cor errada" (1) e não "não captada + certa" (1,2):
`[azul, amarelo]` contra a grade `[azul, vermelho, amarelo]` vira *certa, errada*. Com duas ou mais
cores depois da falha, o alinhamento acerta (*certa, não captada, certa, certa…*). Ver `testes/unit.js`.
Com **cores repetidas em sequência** na grade (ex.: azul, azul, verde, verde), "perdida" e "trocada"
podem ficar indistinguíveis e a marca pode cair como "errada"; o `testes/voz-stroop.js` escolhe
sempre um caso sem essa ambiguidade.

### Fluxo

- Dentro da sessão, a cada texto novo recalcula as marcas a partir da casa onde a sessão começou
  (`base`) — as marcas podem ser corrigidas enquanto chega mais texto.
- A **última cor** da fala espera **450 ms** sem mudar antes de contar (o reconhecedor às vezes
  corrige a última palavra).
- Quando a sessão fecha (`freeze`), as marcas ficam definitivas e a próxima sessão começa depois.
- Frase final sem cor na principal → tenta as alternativas.
- Ao chegar ao fim da grade, `finish()`.

### Reconhecimento de cores — `extractColorTokens(texto)` (linha ~1418)

1. Separa por qualquer caractere que não seja letra/número (o Android devolve pontuação: "Azul, vermelho.").
2. Palavra cortada em duas: "a sul"/"as sul" → azul; "ver de" → verde.
3. Lista de variações `COLOR_ALIASES` (feminino, plural e erros comuns; "roxo" tem 17 variações:
   rocha, rosto, roche, rock, roxy, hoxo…).
4. Aproximação por som (`fuzzyColor`): forma fonética simplificada (`colorPhon`: h inicial → r,
   x → ch, final a/e/i/u → o…) com diferença de até 1 letra (2 nas palavras longas) — **só para
   vermelho, amarelo, roxo e laranja**. Verde e azul ficam de fora porque há muitas palavras comuns a
   1 letra delas ("vendo", "verba"…).

### Resultado e histórico

Métricas "Cor certa / errada", "Não captadas pelo microfone", "Conferência: 🎙 Pelo microfone",
grade palavra por palavra e relatório de voz. No histórico, `voiceScore = {ok, bad, miss, total}`
(o site grava `{ok, total}`; a tela de Histórico usa só `ok` e `total`, então os dois formatos
convivem).

---

## Situação da validação

- Stroop: aprovado em aparelho real pelo Leandro ("bem melhor"); "roxo" precisa ser dito mais forte.
- Cálculo: ajustado após testes com relatório de voz (números "1" e "0", respostas grudadas); ainda
  em validação.
- Para qualquer ajuste, pedir o **relatório de voz** copiado do app: ele mostra exatamente o que o
  reconhecedor entendeu.
