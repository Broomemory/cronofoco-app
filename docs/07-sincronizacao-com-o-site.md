# 07 — Sincronização com o site

Desde o site **v42** / app **1.3**, `cronofoco.html` (site) e `www/index.html` (app) são **o mesmo
arquivo**. A regra agora é uma só:

- **toda** mudança no HTML — tela, regra, conteúdo **ou voz** — é feita no `cronofoco.html` do site;
- depois o arquivo é **copiado** para `www/index.html` do app;
- só o que não é HTML (plugin Java `CronoVoicePlugin`, configuração Capacitor/Android, build) é
  editado direto neste repositório.

## Levar uma versão nova do site para o app

### Jeito simples (caso normal)

```bash
# na raiz do repositório do app
cp /caminho/do/cronofoco.html www/index.html
cp /caminho/do/cronofoco.html docs/sincronizacao/base-site-v43.html   # nova base (apague a anterior)
cmp www/index.html /caminho/do/cronofoco.html && echo idênticos
```

### Com o script (faz a mesma coisa e confere)

```bash
# na raiz do repositório (Linux/macOS ou "Git Bash" no Windows)
docs/sincronizacao/sincronizar.sh /caminho/do/cronofoco.html 43
```

| Situação | O que o script faz |
|---|---|
| `www/index.html` igual à base (caso normal) | **Cópia direta** do site para `www/index.html`; troca a base para `base-site-v43.html`; grava `diferencas-site-v43-para-app.diff` com "Sem diferenças" |
| Alguém mexeu em `www/index.html` por fora | Fusão de três vias (`git merge-file --diff3`: base = site anterior, nosso = app, deles = site novo) para não perder a mudança; no fim **avisa que o app ficou diferente do site** e grava o diff — leve essa mudança para o `cronofoco.html` |
| Fusão com conflito | **Não altera nada**; grava `www/index.html.merge` com marcadores `<<<<<<<` / `\|\|\|\|\|\|\|` / `=======` / `>>>>>>>`; resolva e conclua com `sincronizar.sh --concluir /caminho/do/cronofoco.html 43` |

### Depois de sincronizar

1. Testes ([08](08-testes.md)): `node docs/testes/unit.js`, os testes com navegador e os de voz
   **nos dois motores** (app e navegador).
2. Subir `versionCode` (e `versionName`) em `android/app/build.gradle`.
3. Atualizar [CHANGELOG.md](CHANGELOG.md) e, se as linhas mudaram, regenerar a
   [90-referencia-de-funcoes.md](90-referencia-de-funcoes.md) (a do site serve: é o mesmo arquivo).
4. Commit e push → APK novo no release `build-latest`.
5. Conferir no APK baixado: `unzip -p app-debug.apk assets/public/index.html | md5sum` deve dar o
   mesmo md5 do `cronofoco.html`.

## Se a mudança for de voz

Também no `cronofoco.html` do site (seções **VOZ** e **ENTRADA DE VOZ CONTÍNUA**, e os modos voz de
`renderCalc`/`renderStroop`), e depois copiar. Como o mesmo código roda com dois motores, teste nos
dois: `MOCK=./mock-cronovoice.js` (app) e `MOCK=./mock-webspeech.js` com e sem `UA` de celular
(navegador) — ver [08](08-testes.md). Se a mudança for no **plugin Java**, ela é só do app, mas
precisa manter o mesmo contrato de eventos ([03](03-plugin-nativo-cronovoice.md)): uma frase por
sessão, `voicePartial` durante a fala e `voiceResult` no fim.

---

## Histórico

### App 1.3 (25/09/2026) — os dois viram um arquivo só

A camada de voz, que até então só existia no app, foi levada para o site v42 (13 blocos, listados
em [06](06-diferencas-site-x-app.md)), com o motor do navegador ajustado para entregar as frases
como o motor nativo. O `www/index.html` da 1.3 é a cópia do `cronofoco.html` v42. A base de
sincronização passou a ser `sincronizacao/base-site-v42.html`; a base anterior e o diff da época
foram para `sincronizacao/historico/`.

### App 1.2 (25/09/2026) — fusão de três vias site v41 + voz

O app tinha partido do site v39 e recebido a camada de voz. Para trazer o site v41 foi feita uma
**fusão de três vias**:

```
base   = site v39 (de onde o app tinha partido)
nosso  = www/index.html do app 1.1 (= site v39 + voz)
deles  = site v41
resultado = site v41 + voz
```

`git merge-file` aplicou tudo automaticamente, com **2 conflitos**, ambos no Desafio das Cores
(Stroop), resolvidos à mão:

| Conflito | Resolução |
|---|---|
| Item do Stroop em `EXERCISES`: o app estava com `unlockAt:0` (liberado para teste) e o site tinha o nome novo "Desafio das Cores" | Nome e descrição do site; `unlockAt:5` igual ao site (para teste, usar o código VASSOURA) |
| Métricas do resultado do Stroop: o app tinha "Cor certa / errada" e "Não captadas"; o site acrescentou "Conferência" | As duas coisas: métricas do app + linha "Conferência" do site |
