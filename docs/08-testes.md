# 08 — Testes

Scripts em `docs/testes/`, rodados sobre `www/index.html` (ou outro arquivo, com a variável `HTML`).

## Preparação

```bash
cd docs/testes
npm install playwright
npx playwright install chromium     # ou defina CHROMIUM_PATH para um Chromium/Chrome já instalado
```

## Scripts

| Script | Navegador | O que verifica | Resultado no app 1.3 |
|---|---|---|---|
| `unit.js` | Não | Sintaxe do `<script>`; gerador do Cálculo (20.000 contas); gerador da cruzadinha (450 grades); cenas da Memorização; **funções de voz**: números falados, respostas grudadas, cores (pontuação, palavras cortadas, variações, aproximação por som) e alinhamento | Tudo OK |
| `fluxos.js` | Sim | 46 verificações de ponta a ponta (as mesmas do site): voltar/desistir/parar, novos recursos da v41, concursos, passatempos, cruzadinha, histórico | TUDO OK |
| `overflow.js` | Sim | Nada passa da largura da tela em 360 px, tema escuro, em todas as telas | Nenhum estouro, nenhum erro |
| `voz-calculo.js` | Sim | Voz do Cálculo com o reconhecedor **simulado** (padrão: plugin nativo, `mock-cronovoice.js`; ver motores abaixo): espera de 0,8 s, respostas seguidas, sem reiniciar o microfone, fala sem número ignorada, leitura da conta ignorada, alternativas, erro, resposta grudada, Pular, relatório | TUDO OK |
| `voz-stroop.js` | Sim | Voz do Stroop simulada (mesmos motores): palavra perdida = "não captada" sem deslocar as seguintes, cor errada, pontuação, espera de 0,45 s da última cor, resultado, grade palavra por palavra, `voiceScore` no histórico, microfone desligado no fim | TUDO OK |

```bash
node unit.js
node fluxos.js
node overflow.js
node voz-calculo.js
node voz-stroop.js
# outro arquivo: HTML=/caminho/cronofoco.html node fluxos.js
```

### Os três motores de voz

Como o mesmo arquivo roda no app e no site, os testes de voz devem passar com os três motores:

| Comando | Simula |
|---|---|
| `node voz-calculo.js` (padrão, `mock-cronovoice.js`) | App Android: plugin nativo CronoVoice |
| `MOCK=./mock-webspeech.js node voz-calculo.js` | Site no Chrome/Edge do computador: Web Speech API em modo contínuo |
| `MOCK=./mock-webspeech.js UA="Mozilla/5.0 (Linux; Android 14) Chrome/128 Mobile" node voz-calculo.js` (ou um `UA` de iPhone) | Site no navegador do celular: uma frase por escuta |

O mesmo vale para `voz-stroop.js`. Resultado na 1.3: **TUDO OK** nos três, repetidos várias vezes.
Se o Chromium do Playwright não estiver no lugar padrão: `CHROMIUM_PATH=/caminho/do/chrome`.

### `mock-cronovoice.js`

Simula, dentro do navegador, o `window.Capacitor` com os plugins `CronoVoice` e `SpeechRecognition`.
Para "falar": `window.__cv.partial("texto")` (parcial) e `window.__cv.final("texto", [alternativas])`
(fim de frase, abre sessão nova). Contadores: `__cv.starts`, `__cv.restarts`, `__cv.stops`.

### `mock-webspeech.js`

Simula a Web Speech API do navegador com o comportamento do Chrome: no modo contínuo, `ev.results`
acumula um resultado por frase; no modo de uma frase (celular), a frase final encerra a escuta e o
app abre outra. Mesma interface `window.__cv` do mock nativo, para os mesmos testes servirem aos
dois motores. Define `window.SpeechRecognition` **e** `webkitSpeechRecognition` (o Chromium de
teste tem um `SpeechRecognition` próprio, que falharia sem microfone).

## Teste no aparelho e no navegador (obrigatório para voz)

Os testes simulam o reconhecedor; a qualidade real só aparece no celular.

1. Instalar o APK ([02](02-build-e-publicacao.md)); entrar com o código VASSOURA (tudo liberado).
2. **Cálculo Mental** → "Responder falando", 30 contas. Falar só os resultados, em ritmo normal.
   Incluir respostas curtas (0, 1, 2, 10) e respostas seguidas sem pausa.
3. **Desafio das Cores** → "Conferir por voz", 20 palavras. Falar as cores em sequência; incluir
   "roxo" e "laranja".
4. No resultado, tocar **📋 Copiar relatório de voz** e enviar o texto. Ele mostra o motor usado
   (google/sistema), o aparelho e tudo o que o reconhecedor entendeu, com tempos — é a base para
   ajustar aliases e esperas.
5. Conferir também: app em segundo plano durante a voz (o microfone deve desligar), permissão
   negada (mensagem clara), sem internet (aviso "Sem conexão…").
6. Repetir 2–4 **no navegador**: abrir o `cronofoco.html` no Chrome do computador (arquivo local ou
   site em HTTPS — não o link do Claude, que bloqueia o microfone), permitir o microfone e copiar o
   relatório (o motor aparece como "navegador").
