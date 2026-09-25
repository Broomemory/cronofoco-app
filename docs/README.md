# Cronofoco (app Android / APK) — documentação do código

Documentação técnica do **app Android** do Cronofoco: o projeto Capacitor que empacota o mesmo
sistema do site num APK, acrescentando reconhecimento de voz nativo.

| Item | Valor |
|---|---|
| Repositório | https://github.com/Broomemory/cronofoco-app |
| Versão | **1.2** · versionCode 3 · commit `5ec2007` (25/09/2026) |
| Conteúdo | Igual ao **site versão 41** + camada de voz nativa |
| Tecnologia | Capacitor 8.5.2 (WebView Android) + plugin Java próprio (`CronoVoicePlugin`) |
| Android | minSdk 24 (Android 7.0) · compile/target SDK 36 · JDK 21 |
| APK mais recente | https://github.com/Broomemory/cronofoco-app/releases/download/build-latest/app-debug.apk |

> **Site e app são o mesmo sistema.** O arquivo `www/index.html` do app é o `cronofoco.html` do site
> (versão 41) com uma camada de voz a mais. Tudo o que é igual — telas, exercícios, dados, licenças,
> conteúdo — está documentado na documentação do site (pasta `web/docs` do backup). Esta pasta
> documenta **o que é próprio do app** e **exatamente onde os dois diferem**.

## Índice

| Documento | Conteúdo |
|---|---|
| [01-estrutura-do-projeto.md](01-estrutura-do-projeto.md) | Pastas e arquivos do projeto, o que é versionado e o que é gerado, configurações |
| [02-build-e-publicacao.md](02-build-e-publicacao.md) | Compilação no GitHub Actions, download, versão, assinatura, instalação, build local |
| [03-plugin-nativo-cronovoice.md](03-plugin-nativo-cronovoice.md) | `CronoVoicePlugin.java`: métodos, eventos, erros, troca de motor |
| [04-camada-de-voz-js.md](04-camada-de-voz-js.md) | Ponte JavaScript: detecção do app, `startVoiceInput`, painel de status, relatório de voz |
| [05-voz-nos-exercicios.md](05-voz-nos-exercicios.md) | Algoritmos do Cálculo Mental (números falados) e do Desafio das Cores (alinhamento de cores) |
| [06-diferencas-site-x-app.md](06-diferencas-site-x-app.md) | **Lista completa das diferenças** entre `cronofoco.html` (v41) e `www/index.html` (1.2) |
| [07-sincronizacao-com-o-site.md](07-sincronizacao-com-o-site.md) | Como levar uma mudança do site para o app sem perder a voz (fusão de três vias) |
| [08-testes.md](08-testes.md) | Testes automáticos e roteiro de teste no aparelho |
| [90-referencia-de-funcoes.md](90-referencia-de-funcoes.md) | Índice de funções do `www/index.html` com linha, marcando as exclusivas do app |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões do app |

### Arquivos de apoio

| Arquivo | Para que serve |
|---|---|
| `sincronizacao/base-site-v41.html` | Cópia exata do site v41, a versão a partir da qual o app 1.2 foi montado. É a **base** da próxima sincronização — não editar |
| `sincronizacao/diferencas-site-v41-para-app-1.2.diff` | Diff unificado site v41 → app 1.2 (todas as linhas que o app tem de diferente) |
| `sincronizacao/sincronizar.sh` | Script que aplica uma versão nova do site no app, preservando a voz |
| `testes/` | Scripts de teste (Node + Playwright) para o `www/index.html` |

## Mapa rápido

```
Android (MainActivity)
 └─ WebView do Capacitor carrega www/index.html  ← mesmo sistema do site v41
      ├─ telas, exercícios, dados (localStorage)  ← idêntico ao site
      └─ voz (Cálculo Mental e Desafio das Cores)
           └─ startVoiceInput() ──► plugin CronoVoice (Java) ──► SpeechRecognizer do Android (motor do Google)
                               └─ (no navegador) Web Speech API
```

## Regras

1. Mudança de tela/conteúdo: fazer **no site** e sincronizar para o app ([07](07-sincronizacao-com-o-site.md)).
   Mudança de voz: fazer **no app**.
2. Não renomear tipos de histórico nem chaves de `localStorage` (os dados do aparelho sobrevivem às
   atualizações do APK).
3. Todo APK novo sobe `versionCode` (e, se quiser, `versionName`) em `android/app/build.gradle`.
4. Commits que só mexem em documentação levam `[skip ci]` na mensagem, para não gerar APK à toa.
