# 90 — Referência de funções (www/index.html do app 1.3)

Gerada a partir de `www/index.html` do **app 1.3** (números de linha deste arquivo). Desde a 1.3 o
arquivo é **idêntico** ao `cronofoco.html` do site v42 — não há mais nada "só no app"; a mesma
tabela está na documentação do site. Funções internas das telas aparecem em "Internas".

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
| 971 | `$(sel, root)` | função | querySelector abreviado (root opcional). |
| 972 | `$all(sel, root)` | função | querySelectorAll como array. |
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

## Voz (navegador + app android) (linha 1139)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1153 | `isNativePlatform()` | função | Verdadeiro só dentro do APK (Capacitor nativo); decide motor de voz e textos de erro. |
| 1157 | `nativeSpeechPlugin()` | função | Plugin da comunidade — usado só para pedir a permissão de microfone. |
| 1169 | `NativeSpeechRecognitionShim()` | função | Legado: imita a Web Speech API sobre o plugin da comunidade; hoje só indica que há voz. |
| 1255 | `getSpeechCtor()` | função | No app devolve o shim nativo; no navegador, window.SpeechRecognition ou webkitSpeechRecognition. |
| 1259 | `speechSupported()` | função | Há motor de voz (Web Speech API no navegador ou shim no app)? |
| 1260 | `inIframe()` | função | A página está dentro de um iframe (ex.: página publicada do Claude)? |
| 1270 | `voiceUsable()` | função | Suporte a voz e fora de iframe. |
| 1271 | `voiceUnavailableReason()` | função | Texto explicando por que a voz está indisponível. |
| 1281 | `micDeviceAvailable()` | função | No navegador, confere (enumerateDevices) se existe microfone antes de pedir permissão. |
| 1288 | `NO_MIC_MSG` | constante | Mensagem quando não há microfone. |
| 1290 | `PT_NUM_WORDS` | constante | Números por extenso (zero a cem) → valor. |
| 1295 | `wordsToNumber(text)` | função | Soma as palavras numéricas de um texto, ignorando pontuação. |
| 1307 | `parseSpokenNumber(text)` | função | Último grupo de dígitos do texto, ou wordsToNumber. |
| 1318 | `NUM_ALIASES` | constante | Palavras que o reconhecedor confunde com números (deus→10, novo→9, sem→100, hum→1…). |
| 1321 | `NUM_OPS` | constante | Palavras/símbolos de operação (mais, menos, vezes…) — números colados a elas são ignorados. |
| 1322 | `numWordValue(tok)` | função | Valor de uma palavra numérica (PT_NUM_WORDS ou NUM_ALIASES). |
| 1327 | `extractSpokenNumbers(text)` | função | Todos os números de um texto falado, na ordem (junta dezena+unidade e centena). **Internas:** flush (1331) |
| 1358 | `numberAddedTo(prev, now)` | função | Recupera a resposta que o reconhecedor "grudou" na anterior (20→21 dá 1). |
| 1365 | `firstSpokenNumber(texts)` | função | Primeiro número encontrado numa lista de textos. |
| 1373 | `COLOR_ALIASES` | constante | Variações faladas de cada cor (feminino, plural, erros comuns). |
| 1381 | `COLOR_LOOKUP` | constante | Mapa palavra → id da cor, montado de COLOR_ALIASES. |
| 1389 | `colorPhon(w)` | função | Forma fonética simplificada de uma palavra (h→r, x→ch, final →o…). |
| 1392 | `editDist(a, b)` | função | Distância de edição (Levenshtein). |
| 1402 | `COLOR_PHON` | constante | Formas fonéticas de vermelho, amarelo, roxo e laranja (verde e azul ficam de fora). |
| 1408 | `fuzzyColor(tok)` | função | Cor por aproximação de som (até 1 letra de diferença; 2 nas palavras longas). |
| 1418 | `extractColorTokens(text)` | função | Ids das cores citadas num texto, na ordem (aliases, palavras cortadas, aproximação por som). |
| 1443 | `alignColorTokens(tokens, expected)` | função | Alinha cores ouvidas com a grade (ok / bad / miss) por programação dinâmica. |
| 1475 | `colorName(id)` | função | Nome da cor pelo id. |
| 1477 | `copyText(text)` | função | Copia texto para a área de transferência (com alternativa por execCommand). **Internas:** fallback (1478) |
| 1494 | `stroopVoiceBreakdown(cells, states, heard, log, ctl)` | função | Grade palavra por palavra do Stroop por voz + relatório de voz. |
| 1519 | `voiceReportBlock(wrap, title, resultLine, linesTitle, lines, log, ctl)` | função | Botão "Copiar relatório de voz" e bloco com o registro do reconhecedor. |

## Entrada de voz contínua (linha 1545)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1553 | `cronoVoicePlugin()` | função | Obtém o plugin nativo CronoVoice (null fora do app). |
| 1563 | `startVoiceInput(h)` | função | Entrada de voz única dos exercícios: escolhe o motor (CronoVoice no app, Web Speech API no navegador) e entrega uma frase por sessão; onText/onState/onLevel/onError; devolve {stop, restart, service, log}. **Internas:** log (1567), emitText (1571), emitState (1576), emitError (1582), begin (1624) |
| 1675 | `NATIVE_NO_MIC_MSG` | constante | Mensagem quando o microfone está ocupado/indisponível no Android. |
| 1676 | `BROWSER_LANG_MSG` | constante | Mensagem quando o navegador não reconhece português (usar Chrome ou Edge). |
| 1677 | `NATIVE_LANG_MSG` | constante | Mensagem quando falta o idioma Português (Brasil) no reconhecimento do aparelho. |
| 1678 | `makeVoiceStatus()` | função | Painel "Pode falar / Ouvi:" com medidor de volume (app) e mensagens de erro próprias do navegador ou do Android. |

## História maluca (ajuda de memorização) (linha 1718)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1723 | `STORY_LINKS` | constante | Modelos de cena com 2 palavras para as cenas de associação da Memorização. |
| 1757 | `genStoryTemplateSequence(total)` | função | Sequência "saco embaralhado": consome os modelos em ordem aleatória sem repetir nenhum até esgotar o baralho, e ao reiniciar evita repetir o mesmo modelo bem na emenda entre um ciclo e outro. |
| 1770 | `STORY_LINKS_3` | constante | Cenas com 3 palavras — usadas só quando a lista tem quantidade ímpar (a última cena leva 3). |
| 1783 | `buildCrazyStory(words)` | função | Monta as cenas de associação (2 palavras por cena) e devolve HTML de lista numerada. |

## Storage (linha 1804)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1805 | `loadHistory()` | função | Lê o histórico, garantindo um array para cada tipo de ALL_KINDS. |
| 1815 | `saveHistory(h)` | função | Grava o histórico. |
| 1818 | `addRecord(kind, rec)` | função | Acrescenta um registro (com ts), limita a 200 por tipo e grava. |
| 1829 | `discardRecord(kind, ts)` | função | Permite descartar um resultado já salvo (ex.: sessão interrompida por alguém, tempo/acerto não representativo) sem precisar apagar todo o histórico daquele exercício. |
| 1836 | `medalFor(elapsedMs, thresholds)` | função | Medalha pelo tempo: ouro/prata/bronze/null conforme limites. |
| 1842 | `MEDAL_LABEL` | constante | Rótulos das medalhas. |
| 1843 | `MEDAL_COLORVAR` | constante | Variável CSS de cor de cada medalha. |
| 1844 | `DIFFS_LABEL` | constante | Rótulos Fácil/Médio/Difícil. |
| 1850 | `calcLeaderboards()` | função | Ranking interno do Cálculo Mental: como o total de contas por sessão agora varia (30 a 200), um "tempo total" só é comparável dentro da mesma quantidade — por isso o critério principal é sempre a quantidade de contas res |

## Icons (linha 1864)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1865 | `ICONS` | constante | SVGs inline de exercícios, categorias de dicas e passatempos. |
| 1893 | `homeBtn(view)` | função | Botão padrão das telas de configuração: volta para o início (ou para os passatempos) sem começar. |

## Router (linha 1898)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1901 | `setView(name, opts)` | função | Roteador: limpa a tela atual, marca a aba e chama o render da view. |

## Home (linha 1937)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 1943 | `EXERCISES` | constante | Cadastro dos 14 exercícios da trilha (key, title, desc, icon, view, unlockAt). |
| 1959 | `ALL_KINDS` | constante | Todos os tipos de histórico (trilha + concursos + passatempos). |
| 1961 | `TRAIL_KINDS` | constante | Sessões que contam para a trilha de desbloqueio: tudo, menos os passatempos. |
| 1964 | `UNLOCK_EARNED_KEY` | constante | Exercício que já foi liberado uma vez nunca volta a ficar bloqueado (ex.: quem liberou coisas quando o Sudoku ainda contava para a trilha continua com elas abertas). |
| 1965 | `loadEarnedUnlocked()` | função | Lê cronofoco_unlock_earned_v1. |
| 1966 | `saveEarnedUnlocked(keys)` | função | Grava cronofoco_unlock_earned_v1. |
| 1970 | `UNLOCK_SEEN_KEY` | constante | Chave dos exercícios que a pessoa já viu liberados (aviso de novo exercício). |
| 1971 | `loadSeenUnlocked()` | função | Lê cronofoco_unlock_seen_v1. |
| 1977 | `saveSeenUnlocked(keys)` | função | Grava cronofoco_unlock_seen_v1. |
| 1981 | `lastRecordChip(kind)` | função | Resumo de uma linha da última sessão de um tipo (card do Início e dos Passatempos). |
| 2029 | `computeStreak()` | função | Dias seguidos, até hoje, com pelo menos uma sessão. |
| 2047 | `renderHome(root)` | função | Tela Início: números, aviso de desbloqueio, painel de próximo desbloqueio, cards. **Internas:** isUnlocked (2058) |

## Calc (linha 2159)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2170 | `CALC_HARD_SHARE` | constante | Proporção de contas difíceis no Cálculo (0,65). |
| 2171 | `randIn(lo, hi)` | função | Inteiro aleatório entre lo e hi (inclusive). |
| 2172 | `makeCalcQuestion(op, hard)` | função | Gera uma conta (+, −, ×) fácil ou difícil. |
| 2190 | `buildCalcQuestions(total)` | função | Gera a sessão do Cálculo com filtros anti-repetição. |
| 2210 | `CALC_TOTALS` | constante | Quantidades de contas do Cálculo. |
| 2211 | `renderCalc(root)` | função | Tela do Cálculo Mental (digitar ou voz). **Internas:** showIntro (2239), start (2305), restart (2327), giveUp (2331), tick (2333), renderUpcoming (2335), renderLedger (2357), logAnswer (2384), updateLiveWrong (2402), numpadDigit (2409), numpadBackspace (2416), renderQuestionType (2434), submitTyped (2509), advance (2522), renderQuestionVoice (2530), startCalcVoice (2553), skipVoiceQuestion (2619), stopVoice (2626), finish (2632) |

## Stroop (linha 2675)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2676 | `STROOP_COUNTS` | constante | Quantidades de palavras do Stroop. |
| 2678 | `genStroopGrid(n)` | função | Gera as palavras coloridas do Stroop (~20% congruentes). |
| 2693 | `renderStroop(root)` | função | Tela do Desafio das Cores (Stroop). **Internas:** showIntro (2709), start (2752), restart (2784), giveUp (2787), tick (2789), startVoiceSequence (2804), stopVoiceSeq (2877), finish (2882) |

## Memorization (linha 2916)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 2917 | `renderMemo(root)` | função | Tela da Memorização de Palavras. **Internas:** clearPanelChildren (2929), showIntro (2933), start (2966), recallStage (2995), finish (3036) |

## Sudoku (linha 3068)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3069 | `emptyBoard()` | função | Grade 9×9 zerada. |
| 3070 | `validPlacement(board, r, c, v)` | função | O número pode ir nesta casa (linha, coluna e quadrado)? |
| 3076 | `solveFill(board)` | função | Preenche uma grade completa por backtracking. |
| 3095 | `generateSudoku(clueCount)` | função | Gera {puzzle, solution} apagando casas até sobrar a quantidade de pistas. |
| 3108 | `DIFFICULTIES` | constante | Pistas do Sudoku por nível (42/33/26). |
| 3117 | `renderSudoku(root)` | função | Tela do Sudoku com anotações, teclado na tela e atalhos. **Internas:** addPadBtn (3145), tick (3168), setNotesMode (3170), newGame (3177), isClue (3195), buildBoard (3197), select (3213), conflictsMap (3219), render (3240), inputDigit (3273), eraseCell (3297), checkComplete (3305), clearInputs (3312), showSolution (3321), finish (3350) |

## Sequência de números (span de dígitos) (linha 3376)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3377 | `ATTEMPT_OPTIONS` | constante | Tentativas por tamanho na Sequência de Números. |
| 3379 | `SPAN_GOALS` | constante | Meta de dígitos: a pessoa escolhe até onde quer chegar (0 = sem limite, vai até errar). |
| 3381 | `SPAN_SPEEDS` | constante | Quanto tempo cada número fica na tela (em ms). |
| 3382 | `renderDigitSpan(root)` | função | Tela da Sequência de Números. **Internas:** showIntro (3408), start (3462), dropSpanKeys (3472), restart (3473), giveUp (3476), tick (3478), clearRevealTimer (3480), nextRound (3482), finish (3568) |

## Jogo da memória (pares) (linha 3593)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3594 | `PAIR_EMOJI` | constante | Emojis das cartas do Jogo da Memória. |
| 3595 | `PAIR_COUNTS` | constante | Quantidades de pares. |
| 3598 | `pairsColumns(totalCards)` | função | Garante ao menos 3 linhas de cartas na grade (em vez de deixar o navegador esticar tudo numa linha só quando há muitos pares), sem deixar as colunas largas demais. |
| 3603 | `renderPairs(root)` | função | Tela do Jogo da Memória. **Internas:** showIntro (3626), start (3645), restart (3656), giveUp (3659), tick (3661), renderBoard (3663), flip (3677), finish (3702) |

## Flashcards (linha 3724)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 3730 | `FLASHCARD_GROUPS` | constante | Classes dos baralhos (Idiomas, Língua Portuguesa, Conhecimentos Gerais, Exatas e Lógica, Concursos). |
| 3737 | `tabuadaCards()` | função | Gera os cartões da Tabuada Difícil (6–9 × 3–9). |
| 3742 | `FLASHCARD_DECKS` | constante | 18 baralhos: {group, label, swap?, cards[{f, b}]}. |
| 4119 | `FLASH_SEEN_KEY` | constante | Histórico de cartões já vistos (por baralho), para o sorteio priorizar os que faz mais tempo que a pessoa não vê. |
| 4120 | `loadFlashSeen()` | função | Lê cronofoco_flash_seen_v1. |
| 4121 | `markFlashSeen(deckKey, card)` | função | Marca um cartão como visto agora. |
| 4129 | `pickFlashCards(deckKey, n)` | função | Sorteia n cartões priorizando os não vistos há mais tempo. |
| 4135 | `FLASH_COUNTS` | constante | Quantidades de cartões (0 = todos). |
| 4137 | `renderFlashcards(root)` | função | Tela dos Flashcards. **Internas:** clearPanelChildren (4146), deck (4147), frontOf (4148), backOf (4149), showIntro (4153), start (4206), progressEl (4214), sessionButtons (4217), showCard (4224), reveal (4237), rate (4266), finish (4274) |

## Leitura e compreensão (linha 4295)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4296 | `renderReading(root)` | função | Tela da Leitura e Compreensão. **Internas:** showIntro (4317), start (4337), restart (4352), giveUp (4355), tick (4357), showPassage (4359), showQuestions (4370), finish (4406) |

## Fluência verbal (linha 4443)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4444 | `renderFluency(root)` | função | Tela da Fluência Verbal. **Internas:** showIntro (4458), start (4475), giveUp (4513), addWord (4515), finish (4526) |

## Cálculo em cadeia (linha 4552)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4553 | `renderChainCalc(root)` | função | Tela do Cálculo em Cadeia. **Internas:** showIntro (4581), genChain (4623), start (4649), restart (4659), giveUp (4662), tick (4664), clearRevealTimer (4666), nextRound (4668), finish (4721) |

## N-back (linha 4744)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4745 | `renderNBack(root)` | função | Tela do N-Back. **Internas:** showIntro (4774), genSequence (4807), start (4821), restart (4845), giveUp (4853), tick (4860), clearTimers (4862), handlePress (4867), showTrial (4872), evaluateTrial (4889), finish (4898) |

## Recall tardio (linha 4928)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 4929 | `renderRecall(root)` | função | Tela do Recall Tardio. **Internas:** clearPanelChildren (4943), showIntro (4947), start (4974), distractorStage (4997), recallStage (5026), giveUp (5067), finish (5069) |

## Percepção de tempo (linha 5102)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5106 | `renderTimePerception(root)` | função | Tela da Percepção de Tempo. **Internas:** showIntro (5121), start (5138), nextRound (5143), runRound (5156), markNow (5172), finish (5188) |

## Busca de símbolos (linha 5208)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5212 | `renderSymbolSearch(root)` | função | Tela da Busca de Símbolos. **Internas:** showIntro (5246), start (5264), nextRound (5271), giveUp (5308), onCellClick (5310), finish (5331) |

## Chute calibrado (linha 5352)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5357 | `CALIBRATION_QUESTIONS` | constante | 12 perguntas numéricas do Chute Calibrado. |
| 5371 | `renderCalibration(root)` | função | Tela do Chute Calibrado. **Internas:** showIntro (5386), start (5403), nextQuestion (5410), showFeedback (5442), finish (5456) |

## Dicas (hábitos de estilo de vida) (linha 5484)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5485 | `TIPS` | constante | Conteúdo da seção Dicas (sections ou subtabs). |
| 5635 | `TIPS_ORDER` | constante | Ordem das categorias de Dicas. |

## Ilustrações da seção dicas (linha 5637)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5642 | `TIP_ILLUSTRATIONS` | constante | Ilustrações SVG das Dicas. |
| 5736 | `renderTipItems(container, items)` | função | Desenha itens de dica (título, explicação, benefício). |
| 5744 | `renderTipSections(container, sections)` | função | Desenha as seções de uma categoria de dica. |
| 5751 | `renderTips(root, categoryKey, subtabKey)` | função | Tela Dicas: grade de categorias ou uma categoria aberta. |

## Concursos (raciocínio lógico) (linha 5801)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 5809 | `CONCURSO_CATEGORIES` | constante | Categorias de concursos: {label, icon, desc, questions}. |
| 5910 | `CONCURSO_ORDER` | constante | Ordem das categorias (reatribuída depois de CONCURSO_EXTRA). |
| 5913 | `CONCURSO_EXTRA` | constante | Questões acrescentadas na v41, concatenadas às categorias; cria Porcentagem e Associação. |
| 6114 | `CONCURSO_OK_KEY` | constante | Guarda (só neste aparelho) quais questões a pessoa já acertou, para ela poder escolher treinar só as que ainda não acertou. |
| 6115 | `loadConcursoOk()` | função | Lê cronofoco_concursos_ok_v1. |
| 6116 | `saveConcursoOk(m)` | função | Grava cronofoco_concursos_ok_v1. |
| 6117 | `concursoQid(catKey, q)` | função | Identidade de uma questão: categoria\\|enunciado. |
| 6119 | `concursoPool(key)` | função | Todas as questões de uma categoria (ou de todas, no "misto"), cada uma com a categoria de origem. |
| 6125 | `CONCURSO_COUNTS` | constante | Quantidades de questões (0 = todas). |
| 6127 | `renderConcursos(root)` | função | Tela Concursos: grade → configuração → questões → resultado. **Internas:** catLabel (6131), showCategoryGrid (6133), showSetup (6159), startQuiz (6206) |

## Passatempos (linha 6292)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 6298 | `PASTIMES` | constante | Cadastro dos 4 passatempos. |
| 6304 | `PASTIME_KINDS` | constante | Chaves dos passatempos (derivado de PASTIMES). |
| 6306 | `renderPastimes(root)` | função | Tela Passatempos (cards). |
| 6329 | `pastimeWordPool(category, minLen, maxLen)` | função | Palavras de uma categoria prontas para jogo: só palavras simples (sem espaço/hífen), em maiúsculas e sem acento (como nas revistas), mantendo a grafia original para exibir na lista. |
| 6339 | `pastimeCategories(minLen, maxLen, need)` | função | Categorias com palavras suficientes no tamanho pedido. |
| 6342 | `themePicker(cats, current, onPick)` | função | <select> de tema (aleatório + categorias). |
| 6351 | `WS_DIFFS` | constante | Níveis do Caça-palavras (tamanho e nº de palavras). |
| 6357 | `WS_FILL` | constante | Letras de preenchimento com frequência parecida com a do português (grade com "cara" de revista). |
| 6359 | `genWordSearch(size, count, dirs, pool)` | função | Gera a grade do Caça-palavras (melhor de 40 tentativas). |
| 6395 | `WS_DIR_STRAIGHT` | constante | Direções → e ↓ (WS_DIR_DIAG, WS_DIR_BACK e WS_DIR_BACKDIAG logo abaixo). |
| 6396 | `wsDirs(diag, back)` | função | Monta a lista de direções conforme as opções diagonal / de trás pra frente. |
| 6403 | `renderWordSearch(root)` | função | Tela do Caça-palavras. **Internas:** showIntro (6414), start (6443), cellAt (6480), lineCells (6487), paintSel (6501), bindGrid (6505), tryCells (6534), sameCells (6546), markFound (6551), reveal (6560), finish (6567) |
| 6590 | `scrambleWord(w)` | função | Embaralha as letras garantindo resultado diferente da palavra. |
| 6598 | `sortedLetters(w)` | função | Letras em ordem alfabética (para aceitar anagramas). |
| 6600 | `renderScramble(root)` | função | Tela da Palavra Embaralhada. **Internas:** showIntro (6612), start (6630), showWord (6642), next (6698), finish (6704) |
| 6730 | `CROSS_BANK` | constante | 189 palavras com dica da cruzadinha (normalizadas). |
| 6797 | `CW_DIFFS` | constante | Níveis da cruzadinha (palavras, grade máxima, palavra mais longa). |
| 6803 | `genCrossword(D)` | função | Gera a cruzadinha: posições, numeração e solução. |
| 6893 | `renderCrossword(root)` | função | Tela das Palavras Cruzadas. **Internas:** showIntro (6904), start (6920), wordAt (6979), select (6982), paint (6988), move (7000), bindInput (7006), checkSolved (7038), checkAll (7044), revealLetter (7054), revealWord (7060), finish (7069) |

## Result screen (linha 7098)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 7099 | `showResult(panel, opts)` | função | Tela padrão de resultado (ver 10-resultado-e-historico.md). |

## History (linha 7146)

| Linha | Nome | Tipo | Descrição |
|---|---|---|---|
| 7147 | `sparkline(values, w, h)` | função | Minigráfico SVG de uma série. |
| 7175 | `renderHistory(root)` | função | Tela Histórico. **Internas:** confirmClickButton (7180), section (7203), leaderboardSection (7252) |
