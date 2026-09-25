# 90 — Referência de funções (www/index.html do app 1.2)

Gerada a partir de `www/index.html` do **app 1.2** (números de linha deste arquivo). **🎙 só no app**
marca o que não existe no site; o restante é idêntico ao site v41 (descrições detalhadas na
documentação do site). Funções internas das telas aparecem em "Internas".

## Data (linha 629)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 630 | `WORDS` | constante | 387 palavras sorteadas na Memorização e no Recall Tardio. |
| 632 | `COLORS` | constante | 6 cores do Stroop: {id, name, hex}. |
| 641 | `HISTORY_KEY` | constante | Chave do histórico no localStorage (cronofoco_history_v1). |

## Leitura e compreensão (linha 643)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 644 | `READING_PASSAGES` | constante | 30 textos da Leitura: {cat, title, text, questions[3]}. |
| 916 | `READING_CATEGORIES` | constante | Categorias da Leitura (chave vazia = Todas). |
| 925 | `pickReadingPassage(catKey)` | função | Sorteia um texto da categoria, evitando os que a pessoa leu mais recentemente. |

## Fluência verbal (linha 935)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 939 | `FLUENCY_BANK` | constante | 24 categorias de palavras válidas; alimenta Fluência, Caça-palavras e Embaralhada. |
| 965 | `FLUENCY_CATEGORIES` | constante | Nomes das categorias de FLUENCY_BANK. |

## N-back (linha 967)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 968 | `NBACK_LETTERS` | constante | Consoantes usadas no N-Back. |

## Util (linha 970)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 973 | `el(tag, attrs, children)` | função | Cria um elemento: class, html (innerHTML), on… (listener), demais atributos; filhos string ou nó. |
| 984 | `normWord(s)` | função | Minúsculas, sem acento, sem espaços nas pontas. |
| 987 | `fmtTime(ms)` | função | Milissegundos → mm:ss. |
| 993 | `fmtSecs(sec)` | função | 45 → "45s"; 180 → "3 min"; 150 → "2 min 30s" |
| 1000 | `fmtCountdown(sec)` | função | contagem regressiva: até 2 min mostra só segundos; acima disso, mm:ss |
| 1001 | `fmtDate(ts)` | função | Timestamp → dd/mm hh:mm (pt-BR). |
| 1005 | `rand(n)` | função | Inteiro aleatório de 0 a n−1. |
| 1006 | `pickN(arr, n)` | função | Sorteia n itens sem repetição. |
| 1011 | `shuffle(arr)` | função | Cópia embaralhada (Fisher–Yates). |
| 1016 | `genOperatorSequence(total)` | função | Sequência de +, −, × em saco embaralhado (proporção igual, ordem imprevisível). |

## Gate de acesso (licença) (linha 1024)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1035 | `LICENSE_KEY` | constante | Chave da licença no localStorage. |
| 1036 | `LICENSES` | constante | Lista de licenças {h: sha256, n: nome, review?}. |
| 1048 | `reviewMode()` | função | Código com "review:true" (VASSOURA) abre todos os exercícios, sem precisar cumprir a trilha. |
| 1053 | `normalizeAccessCode(v)` | função | Maiúsculas e sem espaços, antes do hash. |
| 1055 | `sha256Hex(str)` | função | SHA-256 via crypto.subtle; devolve Promise com hex. |
| 1062 | `loadLicense()` | função | Lê a licença salva. |
| 1065 | `saveLicense(lic)` | função | Grava a licença. |
| 1067 | `unlockApp(lic)` | função | Grava a licença, esconde a tela de acesso, mostra o selo e abre o Início. |
| 1080 | `renderGate(errorMsg)` | função | Desenha a tela de acesso (nome + código) e valida o código. **Internas:** submit (1089) |
| 1128 | `initGate()` | função | Ponto de entrada: libera direto se houver licença válida, senão mostra a tela de acesso. |

## Voz (web speech api + ponte nativa android) (linha 1139)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1148 | `isNativePlatform()` | função | Verdadeiro só dentro do APK (Capacitor nativo). **🎙 só no app** |
| 1152 | `nativeSpeechPlugin()` | função | Plugin da comunidade — usado só para pedir a permissão de microfone. **🎙 só no app** |
| 1164 | `NativeSpeechRecognitionShim()` | função | Legado: imita a Web Speech API sobre o plugin da comunidade; hoje só indica que há voz. **🎙 só no app** |
| 1250 | `getSpeechCtor()` | função | No app devolve o shim nativo; no navegador, a Web Speech API. |
| 1254 | `speechSupported()` | função | Há reconhecimento de voz no navegador? |
| 1255 | `inIframe()` | função | A página está dentro de um iframe (ex.: página publicada do Claude)? |
| 1265 | `voiceUsable()` | função | Suporte a voz e fora de iframe. |
| 1266 | `voiceUnavailableReason()` | função | Texto explicando por que a voz está indisponível. |
| 1276 | `micDeviceAvailable()` | função | Even outside the iframe, the browser can only ask for mic permission if the OS/browser reports an actual microphone device. |
| 1283 | `NO_MIC_MSG` | constante | Mensagem quando não há microfone. |
| 1285 | `PT_NUM_WORDS` | constante | Números por extenso (zero a cem) → valor. |
| 1290 | `wordsToNumber(text)` | função | Soma as palavras numéricas de um texto, ignorando pontuação. |
| 1302 | `parseSpokenNumber(text)` | função | Último grupo de dígitos do texto, ou wordsToNumber. |
| 1313 | `NUM_ALIASES` | constante | Palavras que o reconhecedor confunde com números (deus→10, novo→9, sem→100, hum→1…). **🎙 só no app** |
| 1316 | `NUM_OPS` | constante | Palavras/símbolos de operação (mais, menos, vezes…) — números colados a elas são ignorados. **🎙 só no app** |
| 1317 | `numWordValue(tok)` | função | Valor de uma palavra numérica (PT_NUM_WORDS ou NUM_ALIASES). **🎙 só no app** |
| 1322 | `extractSpokenNumbers(text)` | função | Todos os números de um texto falado, na ordem (junta dezena+unidade e centena). **🎙 só no app** **Internas:** flush (1326) |
| 1353 | `numberAddedTo(prev, now)` | função | Recupera a resposta que o reconhecedor "grudou" na anterior (20→21 dá 1). **🎙 só no app** |
| 1360 | `firstSpokenNumber(texts)` | função | Primeiro número encontrado numa lista de textos. **🎙 só no app** |
| 1368 | `COLOR_ALIASES` | constante | Variações faladas de cada cor (feminino, plural, erros comuns). **🎙 só no app** |
| 1376 | `COLOR_LOOKUP` | constante | Mapa palavra → id da cor, montado de COLOR_ALIASES. **🎙 só no app** |
| 1384 | `colorPhon(w)` | função | Forma fonética simplificada de uma palavra (h→r, x→ch, final →o…). **🎙 só no app** |
| 1387 | `editDist(a, b)` | função | Distância de edição (Levenshtein). **🎙 só no app** |
| 1397 | `COLOR_PHON` | constante | Formas fonéticas de vermelho, amarelo, roxo e laranja (verde e azul ficam de fora). **🎙 só no app** |
| 1403 | `fuzzyColor(tok)` | função | Cor por aproximação de som (até 1 letra de diferença; 2 nas palavras longas). **🎙 só no app** |
| 1413 | `extractColorTokens(text)` | função | Ids das cores citadas num texto, na ordem (aliases, palavras cortadas, aproximação por som). |
| 1438 | `alignColorTokens(tokens, expected)` | função | Alinha cores ouvidas com a grade (ok / bad / miss) por programação dinâmica. **🎙 só no app** |
| 1470 | `colorName(id)` | função | Nome da cor pelo id. **🎙 só no app** |
| 1472 | `copyText(text)` | função | Copia texto para a área de transferência (com alternativa por execCommand). **🎙 só no app** **Internas:** fallback (1473) |
| 1489 | `stroopVoiceBreakdown(cells, states, heard, log, ctl)` | função | Grade palavra por palavra do Stroop por voz + relatório de voz. **🎙 só no app** |
| 1514 | `voiceReportBlock(wrap, title, resultLine, linesTitle, lines, log, ctl)` | função | Botão "Copiar relatório de voz" e bloco com o registro do reconhecedor. **🎙 só no app** |

## Entrada de voz contínua (linha 1540)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1548 | `cronoVoicePlugin()` | função | Obtém o plugin nativo CronoVoice (null fora do app). **🎙 só no app** |
| 1558 | `startVoiceInput(h)` | função | Entrada de voz contínua: onText/onState/onLevel/onError; devolve {stop, restart, service, log}. **🎙 só no app** **Internas:** log (1562), emitText (1566), emitState (1571), emitError (1577), begin (1618) |
| 1650 | `NATIVE_NO_MIC_MSG` | constante | Mensagem quando o microfone está ocupado/indisponível no Android. **🎙 só no app** |
| 1651 | `NATIVE_LANG_MSG` | constante | Mensagem quando falta o idioma Português (Brasil) no reconhecimento do aparelho. **🎙 só no app** |
| 1652 | `makeVoiceStatus()` | função | Painel "Pode falar / Ouvi:" com medidor de volume e mensagens de erro. **🎙 só no app** |

## História maluca (ajuda de memorização) (linha 1690)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1695 | `STORY_LINKS` | constante | Modelos de cena com 2 palavras para as cenas de associação da Memorização. |
| 1729 | `genStoryTemplateSequence(total)` | função | Sequência "saco embaralhado": consome os modelos em ordem aleatória sem repetir nenhum até esgotar o baralho, e ao reiniciar evita repetir o mesmo modelo bem na emenda entre um ciclo e outro. |
| 1742 | `STORY_LINKS_3` | constante | Cenas com 3 palavras — usadas só quando a lista tem quantidade ímpar (a última cena leva 3). |
| 1755 | `buildCrazyStory(words)` | função | Monta as cenas de associação (2 palavras por cena) e devolve HTML de lista numerada. |

## Storage (linha 1776)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1777 | `loadHistory()` | função | Lê o histórico, garantindo um array para cada tipo de ALL_KINDS. |
| 1787 | `saveHistory(h)` | função | Grava o histórico. |
| 1790 | `addRecord(kind, rec)` | função | Acrescenta um registro (com ts), limita a 200 por tipo e grava. |
| 1801 | `discardRecord(kind, ts)` | função | Permite descartar um resultado já salvo (ex.: sessão interrompida por alguém, tempo/acerto não representativo) sem precisar apagar todo o histórico daquele exercício. |
| 1808 | `medalFor(elapsedMs, thresholds)` | função | Medalha pelo tempo: ouro/prata/bronze/null conforme limites. |
| 1814 | `MEDAL_LABEL` | constante | Rótulos das medalhas. |
| 1815 | `MEDAL_COLORVAR` | constante | Variável CSS de cor de cada medalha. |
| 1816 | `DIFFS_LABEL` | constante | Rótulos Fácil/Médio/Difícil. |
| 1822 | `calcLeaderboards()` | função | Ranking interno do Cálculo Mental: como o total de contas por sessão agora varia (30 a 200), um "tempo total" só é comparável dentro da mesma quantidade — por isso o critério principal é sempre a quantidade de contas res |

## Icons (linha 1836)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1837 | `ICONS` | constante | SVGs inline de exercícios, categorias de dicas e passatempos. |
| 1865 | `homeBtn(view)` | função | Botão padrão das telas de configuração: volta para o início (ou para os passatempos) sem começar. |

## Router (linha 1870)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1873 | `setView(name, opts)` | função | Roteador: limpa a tela atual, marca a aba e chama o render da view. |

## Home (linha 1909)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1915 | `EXERCISES` | constante | Cadastro dos 14 exercícios da trilha (key, title, desc, icon, view, unlockAt). |
| 1931 | `ALL_KINDS` | constante | Todos os tipos de histórico (trilha + concursos + passatempos). |
| 1933 | `TRAIL_KINDS` | constante | Sessões que contam para a trilha de desbloqueio: tudo, menos os passatempos. |
| 1936 | `UNLOCK_EARNED_KEY` | constante | Exercício que já foi liberado uma vez nunca volta a ficar bloqueado (ex.: quem liberou coisas quando o Sudoku ainda contava para a trilha continua com elas abertas). |
| 1937 | `loadEarnedUnlocked()` | função | Lê cronofoco_unlock_earned_v1. |
| 1938 | `saveEarnedUnlocked(keys)` | função | Grava cronofoco_unlock_earned_v1. |
| 1942 | `UNLOCK_SEEN_KEY` | constante | Chave dos exercícios que a pessoa já viu liberados (aviso de novo exercício). |
| 1943 | `loadSeenUnlocked()` | função | Lê cronofoco_unlock_seen_v1. |
| 1949 | `saveSeenUnlocked(keys)` | função | Grava cronofoco_unlock_seen_v1. |
| 1953 | `lastRecordChip(kind)` | função | Resumo de uma linha da última sessão de um tipo (card do Início e dos Passatempos). |
| 2001 | `computeStreak()` | função | Dias seguidos, até hoje, com pelo menos uma sessão. |
| 2019 | `renderHome(root)` | função | Tela Início: números, aviso de desbloqueio, painel de próximo desbloqueio, cards. **Internas:** isUnlocked (2030) |

## Calc (linha 2131)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2142 | `CALC_HARD_SHARE` | constante | Proporção de contas difíceis no Cálculo (0,65). |
| 2143 | `randIn(lo, hi)` | função | Inteiro aleatório entre lo e hi (inclusive). |
| 2144 | `makeCalcQuestion(op, hard)` | função | Gera uma conta (+, −, ×) fácil ou difícil. |
| 2162 | `buildCalcQuestions(total)` | função | Gera a sessão do Cálculo com filtros anti-repetição. |
| 2182 | `CALC_TOTALS` | constante | Quantidades de contas do Cálculo. |
| 2183 | `renderCalc(root)` | função | Tela do Cálculo Mental (digitar ou voz). **Internas:** showIntro (2211), start (2277), restart (2299), giveUp (2303), tick (2305), renderUpcoming (2307), renderLedger (2329), logAnswer (2356), updateLiveWrong (2374), numpadDigit (2381), numpadBackspace (2388), renderQuestionType (2406), submitTyped (2481), advance (2494), renderQuestionVoice (2502), **startCalcVoice** 🎙 (2525), **skipVoiceQuestion** 🎙 (2591), stopVoice (2598), finish (2604) |

## Stroop (linha 2647)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2648 | `STROOP_COUNTS` | constante | Quantidades de palavras do Stroop. |
| 2650 | `genStroopGrid(n)` | função | Gera as palavras coloridas do Stroop (~20% congruentes). |
| 2665 | `renderStroop(root)` | função | Tela do Desafio das Cores (Stroop). **Internas:** showIntro (2681), start (2724), restart (2756), giveUp (2759), tick (2761), **startVoiceSequence** 🎙 (2776), stopVoiceSeq (2849), finish (2854) |

## Memorization (linha 2888)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2889 | `renderMemo(root)` | função | Tela da Memorização de Palavras. **Internas:** clearPanelChildren (2901), showIntro (2905), start (2938), recallStage (2967), finish (3008) |

## Sudoku (linha 3040)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3041 | `emptyBoard()` | função | Grade 9×9 zerada. |
| 3042 | `validPlacement(board, r, c, v)` | função | O número pode ir nesta casa (linha, coluna e quadrado)? |
| 3048 | `solveFill(board)` | função | Preenche uma grade completa por backtracking. |
| 3067 | `generateSudoku(clueCount)` | função | Gera {puzzle, solution} apagando casas até sobrar a quantidade de pistas. |
| 3080 | `DIFFICULTIES` | constante | Pistas do Sudoku por nível (42/33/26). |
| 3089 | `renderSudoku(root)` | função | Tela do Sudoku com anotações, teclado na tela e atalhos. **Internas:** addPadBtn (3117), tick (3140), setNotesMode (3142), newGame (3149), isClue (3167), buildBoard (3169), select (3185), conflictsMap (3191), render (3212), inputDigit (3245), eraseCell (3269), checkComplete (3277), clearInputs (3284), showSolution (3293), finish (3322) |

## Sequência de números (span de dígitos) (linha 3348)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3349 | `ATTEMPT_OPTIONS` | constante | Tentativas por tamanho na Sequência de Números. |
| 3351 | `SPAN_GOALS` | constante | Meta de dígitos: a pessoa escolhe até onde quer chegar (0 = sem limite, vai até errar). |
| 3353 | `SPAN_SPEEDS` | constante | Quanto tempo cada número fica na tela (em ms). |
| 3354 | `renderDigitSpan(root)` | função | Tela da Sequência de Números. **Internas:** showIntro (3380), start (3434), dropSpanKeys (3444), restart (3445), giveUp (3448), tick (3450), clearRevealTimer (3452), nextRound (3454), finish (3540) |

## Jogo da memória (pares) (linha 3565)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3566 | `PAIR_EMOJI` | constante | Emojis das cartas do Jogo da Memória. |
| 3567 | `PAIR_COUNTS` | constante | Quantidades de pares. |
| 3570 | `pairsColumns(totalCards)` | função | Garante ao menos 3 linhas de cartas na grade (em vez de deixar o navegador esticar tudo numa linha só quando há muitos pares), sem deixar as colunas largas demais. |
| 3575 | `renderPairs(root)` | função | Tela do Jogo da Memória. **Internas:** showIntro (3598), start (3617), restart (3628), giveUp (3631), tick (3633), renderBoard (3635), flip (3649), finish (3674) |

## Flashcards (linha 3696)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3702 | `FLASHCARD_GROUPS` | constante | Classes dos baralhos (Idiomas, Língua Portuguesa, Conhecimentos Gerais, Exatas e Lógica, Concursos). |
| 3709 | `tabuadaCards()` | função | Gera os cartões da Tabuada Difícil (6–9 × 3–9). |
| 3714 | `FLASHCARD_DECKS` | constante | 18 baralhos: {group, label, swap?, cards[{f, b}]}. |
| 4091 | `FLASH_SEEN_KEY` | constante | Histórico de cartões já vistos (por baralho), para o sorteio priorizar os que faz mais tempo que a pessoa não vê. |
| 4092 | `loadFlashSeen()` | função | Lê cronofoco_flash_seen_v1. |
| 4093 | `markFlashSeen(deckKey, card)` | função | Marca um cartão como visto agora. |
| 4101 | `pickFlashCards(deckKey, n)` | função | Sorteia n cartões priorizando os não vistos há mais tempo. |
| 4107 | `FLASH_COUNTS` | constante | Quantidades de cartões (0 = todos). |
| 4109 | `renderFlashcards(root)` | função | Tela dos Flashcards. **Internas:** clearPanelChildren (4118), deck (4119), frontOf (4120), backOf (4121), showIntro (4125), start (4178), progressEl (4186), sessionButtons (4189), showCard (4196), reveal (4209), rate (4238), finish (4246) |

## Leitura e compreensão (linha 4267)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4268 | `renderReading(root)` | função | Tela da Leitura e Compreensão. **Internas:** showIntro (4289), start (4309), restart (4324), giveUp (4327), tick (4329), showPassage (4331), showQuestions (4342), finish (4378) |

## Fluência verbal (linha 4415)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4416 | `renderFluency(root)` | função | Tela da Fluência Verbal. **Internas:** showIntro (4430), start (4447), giveUp (4485), addWord (4487), finish (4498) |

## Cálculo em cadeia (linha 4524)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4525 | `renderChainCalc(root)` | função | Tela do Cálculo em Cadeia. **Internas:** showIntro (4553), genChain (4595), start (4621), restart (4631), giveUp (4634), tick (4636), clearRevealTimer (4638), nextRound (4640), finish (4693) |

## N-back (linha 4716)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4717 | `renderNBack(root)` | função | Tela do N-Back. **Internas:** showIntro (4746), genSequence (4779), start (4793), restart (4817), giveUp (4825), tick (4832), clearTimers (4834), handlePress (4839), showTrial (4844), evaluateTrial (4861), finish (4870) |

## Recall tardio (linha 4900)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4901 | `renderRecall(root)` | função | Tela do Recall Tardio. **Internas:** clearPanelChildren (4915), showIntro (4919), start (4946), distractorStage (4969), recallStage (4998), giveUp (5039), finish (5041) |

## Percepção de tempo (linha 5074)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5078 | `renderTimePerception(root)` | função | Tela da Percepção de Tempo. **Internas:** showIntro (5093), start (5110), nextRound (5115), runRound (5128), markNow (5144), finish (5160) |

## Busca de símbolos (linha 5180)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5184 | `renderSymbolSearch(root)` | função | Tela da Busca de Símbolos. **Internas:** showIntro (5218), start (5236), nextRound (5243), giveUp (5280), onCellClick (5282), finish (5303) |

## Chute calibrado (linha 5324)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5329 | `CALIBRATION_QUESTIONS` | constante | 12 perguntas numéricas do Chute Calibrado. |
| 5343 | `renderCalibration(root)` | função | Tela do Chute Calibrado. **Internas:** showIntro (5358), start (5375), nextQuestion (5382), showFeedback (5414), finish (5428) |

## Dicas (hábitos de estilo de vida) (linha 5456)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5457 | `TIPS` | constante | Conteúdo da seção Dicas (sections ou subtabs). |
| 5607 | `TIPS_ORDER` | constante | Ordem das categorias de Dicas. |

## Ilustrações da seção dicas (linha 5609)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5614 | `TIP_ILLUSTRATIONS` | constante | Ilustrações SVG das Dicas. |
| 5708 | `renderTipItems(container, items)` | função | Desenha itens de dica (título, explicação, benefício). |
| 5716 | `renderTipSections(container, sections)` | função | Desenha as seções de uma categoria de dica. |
| 5723 | `renderTips(root, categoryKey, subtabKey)` | função | Tela Dicas: grade de categorias ou uma categoria aberta. |

## Concursos (raciocínio lógico) (linha 5773)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5781 | `CONCURSO_CATEGORIES` | constante | Categorias de concursos: {label, icon, desc, questions}. |
| 5882 | `CONCURSO_ORDER` | constante | Ordem das categorias (reatribuída depois de CONCURSO_EXTRA). |
| 5885 | `CONCURSO_EXTRA` | constante | Questões acrescentadas na v41, concatenadas às categorias; cria Porcentagem e Associação. |
| 6086 | `CONCURSO_OK_KEY` | constante | Guarda (só neste aparelho) quais questões a pessoa já acertou, para ela poder escolher treinar só as que ainda não acertou. |
| 6087 | `loadConcursoOk()` | função | Lê cronofoco_concursos_ok_v1. |
| 6088 | `saveConcursoOk(m)` | função | Grava cronofoco_concursos_ok_v1. |
| 6089 | `concursoQid(catKey, q)` | função | Identidade de uma questão: categoria|enunciado. |
| 6091 | `concursoPool(key)` | função | Todas as questões de uma categoria (ou de todas, no "misto"), cada uma com a categoria de origem. |
| 6097 | `CONCURSO_COUNTS` | constante | Quantidades de questões (0 = todas). |
| 6099 | `renderConcursos(root)` | função | Tela Concursos: grade → configuração → questões → resultado. **Internas:** catLabel (6103), showCategoryGrid (6105), showSetup (6131), startQuiz (6178) |

## Passatempos (linha 6264)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 6270 | `PASTIMES` | constante | Cadastro dos 4 passatempos. |
| 6276 | `PASTIME_KINDS` | constante | Chaves dos passatempos (derivado de PASTIMES). |
| 6278 | `renderPastimes(root)` | função | Tela Passatempos (cards). |
| 6301 | `pastimeWordPool(category, minLen, maxLen)` | função | Palavras de uma categoria prontas para jogo: só palavras simples (sem espaço/hífen), em maiúsculas e sem acento (como nas revistas), mantendo a grafia original para exibir na lista. |
| 6311 | `pastimeCategories(minLen, maxLen, need)` | função | Categorias com palavras suficientes no tamanho pedido. |
| 6314 | `themePicker(cats, current, onPick)` | função | <select> de tema (aleatório + categorias). |

## Caça-palavras (linha 6322)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 6323 | `WS_DIFFS` | constante | Níveis do Caça-palavras (tamanho e nº de palavras). |
| 6329 | `WS_FILL` | constante | Letras de preenchimento com frequência parecida com a do português (grade com "cara" de revista). |
| 6331 | `genWordSearch(size, count, dirs, pool)` | função | Gera a grade do Caça-palavras (melhor de 40 tentativas). |
| 6367 | `WS_DIR_STRAIGHT` | constante | Direções → e ↓ (WS_DIR_DIAG, WS_DIR_BACK e WS_DIR_BACKDIAG logo abaixo). |
| 6368 | `wsDirs(diag, back)` | função | Monta a lista de direções conforme as opções diagonal / de trás pra frente. |
| 6375 | `renderWordSearch(root)` | função | Tela do Caça-palavras. **Internas:** showIntro (6386), start (6415), cellAt (6452), lineCells (6459), paintSel (6473), bindGrid (6477), tryCells (6506), sameCells (6518), markFound (6523), reveal (6532), finish (6539) |

## Palavra embaralhada (linha 6561)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 6562 | `scrambleWord(w)` | função | Embaralha as letras garantindo resultado diferente da palavra. |
| 6570 | `sortedLetters(w)` | função | Letras em ordem alfabética (para aceitar anagramas). |
| 6572 | `renderScramble(root)` | função | Tela da Palavra Embaralhada. **Internas:** showIntro (6584), start (6602), showWord (6614), next (6670), finish (6676) |

## Palavras cruzadas (linha 6698)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 6702 | `CROSS_BANK` | constante | 189 palavras com dica da cruzadinha (normalizadas). |
| 6769 | `CW_DIFFS` | constante | Níveis da cruzadinha (palavras, grade máxima, palavra mais longa). |
| 6775 | `genCrossword(D)` | função | Gera a cruzadinha: posições, numeração e solução. |
| 6865 | `renderCrossword(root)` | função | Tela das Palavras Cruzadas. **Internas:** showIntro (6876), start (6892), wordAt (6951), select (6954), paint (6960), move (6972), bindInput (6978), checkSolved (7010), checkAll (7016), revealLetter (7026), revealWord (7032), finish (7041) |

## Result screen (linha 7070)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 7071 | `showResult(panel, opts)` | função | Tela padrão de resultado (ver 10-resultado-e-historico.md). |

## History (linha 7118)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 7119 | `sparkline(values, w, h)` | função | Minigráfico SVG de uma série. |
| 7147 | `renderHistory(root)` | função | Tela Histórico. **Internas:** confirmClickButton (7152), section (7175), leaderboardSection (7224) |

