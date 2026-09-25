# 07 — Sincronização com o site

O site (`cronofoco.html`) e o app (`www/index.html`) precisam ser o mesmo sistema. A regra:

- mudança de **tela, regra ou conteúdo** → fazer **no site** e trazer para o app;
- mudança de **voz** → fazer **no app** (o site não tem a camada nativa).

## Como o app 1.2 foi montado (25/09/2026)

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

Depois: conferido que o diff site v41 × app 1.2 contém só os blocos de voz
([06](06-diferencas-site-x-app.md)) e rodados todos os testes ([08](08-testes.md)).

## Próximas sincronizações — script pronto

A base agora é o site v41, guardada em `docs/sincronizacao/base-site-v41.html`.

```bash
# na raiz do repositório (Linux/macOS ou "Git Bash" no Windows)
docs/sincronizacao/sincronizar.sh /caminho/do/cronofoco.html 42
```

| Situação | O que o script faz |
|---|---|
| Sem conflito | Grava o resultado em `www/index.html`, troca a base para `base-site-v42.html` e regenera `diferencas-site-v42-para-app.diff` |
| Com conflito | **Não altera nada**; grava `www/index.html.merge` com marcadores `<<<<<<<` / `\|\|\|\|\|\|\|` / `=======` / `>>>>>>>` (formato diff3: app / base / site) e para |

Resolvendo conflito:

1. Abrir `www/index.html.merge`, procurar os marcadores e, em cada bloco, manter a lógica de voz do
   app **e** a mudança do site (os conflitos só devem aparecer nos trechos de voz do Cálculo e do
   Stroop).
2. Concluir: `docs/sincronizacao/sincronizar.sh --concluir /caminho/do/cronofoco.html 42`
   (verifica se não sobrou marcador, instala o arquivo, troca a base e regenera o diff).

Depois de sincronizar:

1. `node docs/testes/unit.js` e os testes com navegador ([08](08-testes.md)).
2. Conferir o diff novo: só pode ter blocos de voz.
3. Subir `versionCode` (e `versionName`) em `android/app/build.gradle`.
4. Atualizar [06-diferencas-site-x-app.md](06-diferencas-site-x-app.md) (linhas) e [CHANGELOG.md](CHANGELOG.md).
5. Commit e push → APK novo no release `build-latest`.

### Sem o script (manual)

```bash
git merge-file -p --diff3 www/index.html docs/sincronizacao/base-site-v41.html /caminho/do/cronofoco.html > resultado.html
echo $?    # 0 = sem conflito; N = número de conflitos
```

## Se a mudança for de voz

Fazer direto em `www/index.html` (e/ou no `CronoVoicePlugin.java`). Como o site não tem esse
código, não há o que sincronizar — mas atualize a documentação 04/05/06 e o diff:

```bash
diff -u docs/sincronizacao/base-site-v41.html www/index.html > docs/sincronizacao/diferencas-site-v41-para-app-1.2.diff
```

## Ideia para o futuro: uma fonte só

A camada de voz já funciona no navegador (Web Speech API contínua) e só usa o plugin nativo quando
`window.Capacitor` existe. Levar essa camada para o site eliminaria a divergência: os dois arquivos
passariam a ser idênticos e o app só copiaria o `cronofoco.html` para `www/index.html`. Antes, vale
validar a voz nova no Chrome desktop (fora do iframe do Claude).
