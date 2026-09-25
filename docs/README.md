# Cronofoco (app Android / APK) — documentação do código

Documentação técnica do **app Android** do Cronofoco: o projeto Capacitor que empacota o mesmo
sistema do site num APK, usando o reconhecimento de voz nativo do Android.

| Item | Valor |
|---|---|
| Repositório | https://github.com/Broomemory/cronofoco-app |
| Versão | **1.3** · versionCode 4 · commit `cab1ee9` (25/09/2026) |
| Conteúdo | `www/index.html` **idêntico** ao `cronofoco.html` do **site versão 42** (md5 `ed368d93407de065a58f5454e18940ab`) |
| Tecnologia | Capacitor 8.5.2 (WebView Android) + plugin Java próprio (`CronoVoicePlugin`) |
| Android | minSdk 24 (Android 7.0) · compile/target SDK 36 · JDK 21 |
| APK mais recente | https://github.com/Broomemory/cronofoco-app/releases/download/build-latest/app-debug.apk |

> **Site e app são o mesmo arquivo.** Desde o app 1.3 / site v42, o `www/index.html` do app é
> **byte a byte igual** ao `cronofoco.html` do site — inclusive toda a voz (Cálculo Mental e Desafio
> das Cores). O mesmo código escolhe o motor sozinho: plugin nativo `CronoVoice` dentro do APK, Web
> Speech API no navegador. Telas, exercícios, dados, licenças e conteúdo estão documentados na
> documentação do site (pasta `web/docs` do backup). Esta pasta documenta **o que é próprio do app**
> (empacotamento, plugin Java, build), a voz vista pelo lado do app e o registro das diferenças que
> existiram até a 1.2.

## Índice

| Documento | Conteúdo |
|---|---|
| [01-estrutura-do-projeto.md](01-estrutura-do-projeto.md) | Pastas e arquivos do projeto, o que é versionado e o que é gerado, configurações |
| [02-build-e-publicacao.md](02-build-e-publicacao.md) | Compilação no GitHub Actions, download, versão, assinatura, instalação, build local |
| [03-plugin-nativo-cronovoice.md](03-plugin-nativo-cronovoice.md) | `CronoVoicePlugin.java`: métodos, eventos, erros, troca de motor |
| [04-camada-de-voz-js.md](04-camada-de-voz-js.md) | Ponte JavaScript: detecção do app, `startVoiceInput`, painel de status, relatório de voz |
| [05-voz-nos-exercicios.md](05-voz-nos-exercicios.md) | Algoritmos do Cálculo Mental (números falados) e do Desafio das Cores (alinhamento de cores) |
| [06-diferencas-site-x-app.md](06-diferencas-site-x-app.md) | Diferenças site × app: **nenhuma** na 1.3 (como conferir) + registro histórico das diferenças v41 × 1.2 e de como foram levadas para o site |
| [07-sincronizacao-com-o-site.md](07-sincronizacao-com-o-site.md) | Como levar uma versão nova do site para o app (cópia do arquivo; fusão de três vias só se o app tiver sido editado à parte) |
| [08-testes.md](08-testes.md) | Testes automáticos e roteiro de teste no aparelho |
| [90-referencia-de-funcoes.md](90-referencia-de-funcoes.md) | Índice de funções do `www/index.html` com linha (as mesmas do site v42) |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões do app |

### Arquivos de apoio

| Arquivo | Para que serve |
|---|---|
| `sincronizacao/base-site-v42.html` | Cópia exata do site v42 (= `www/index.html` da 1.3). É a **base** da próxima sincronização — não editar |
| `sincronizacao/diferencas-site-v42-para-app-1.3.diff` | Registro de que **não há diferença** entre site v42 e app 1.3 |
| `sincronizacao/sincronizar.sh` | Script que leva uma versão nova do site para o app (cópia; fusão só se o app tiver mudanças próprias) |
| `sincronizacao/historico/` | Registro da época em que eram diferentes: `base-site-v41.html` e `diferencas-site-v41-para-app-1.2.diff` (13 blocos de voz, hoje incorporados ao site) |
| `testes/` | Scripts de teste (Node + Playwright) para o `www/index.html` |

## Mapa rápido

```
Android (MainActivity)
 └─ WebView do Capacitor carrega www/index.html  ← o MESMO arquivo que o cronofoco.html do site v42
      ├─ telas, exercícios, dados (localStorage)
      └─ voz (Cálculo Mental e Desafio das Cores)
           └─ startVoiceInput() ─┬─► no APK: plugin CronoVoice (Java) ──► SpeechRecognizer do Android (motor do Google)
                                 └─► no navegador (site): Web Speech API do Chrome/Edge/Safari
```

## Regras

1. **Toda** mudança — tela, conteúdo **e voz** — é feita no `cronofoco.html` do site e copiada para
   `www/index.html` ([07](07-sincronizacao-com-o-site.md)). Os dois arquivos devem continuar
   idênticos. Só o plugin Java e a configuração Android são exclusivos deste repositório.
   Mudança de voz precisa ser testada nos dois motores ([08](08-testes.md)).
2. Não renomear tipos de histórico nem chaves de `localStorage` (os dados do aparelho sobrevivem às
   atualizações do APK).
3. Todo APK novo sobe `versionCode` (e, se quiser, `versionName`) em `android/app/build.gradle`.
4. Commits que só mexem em documentação levam `[skip ci]` na mensagem, para não gerar APK à toa.
