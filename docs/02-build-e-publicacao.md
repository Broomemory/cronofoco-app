# 02 — Build e publicação do APK

## Build automático (GitHub Actions)

Arquivo: `.github/workflows/build-apk.yml`. Roda a cada `push` na branch `main` (e manualmente, por
`workflow_dispatch`). Leva ~2 minutos.

| Passo | O que faz |
|---|---|
| Checkout | Baixa o código |
| Setup JDK | Temurin 21 (`actions/setup-java@v5`) |
| Locate sdkmanager | Procura o `sdkmanager` dentro de `$ANDROID_HOME` (vem pré-instalado no runner, mas fora do PATH) e o põe no PATH |
| Licenças + SDK | `sdkmanager --licenses`; instala `platform-tools`, `platforms;android-36`, `build-tools;36.0.0` |
| Setup Node | Node 22 (o Capacitor CLI 8 exige ≥ 22) |
| `npm ci` | Instala as dependências |
| `npx cap sync android` | Copia `www/` para dentro do projeto Android e liga os plugins |
| `./gradlew assembleDebug` | Compila o APK de debug |
| Upload artifact | Guarda o APK como artefato do workflow (30 dias) |
| Release `build-latest` | Apaga o release anterior e publica o APK novo com a tag fixa `build-latest` |
| Em caso de falha | Publica o log completo no release `build-failed-log` (arquivo `build-failed.log`) |
| Em caso de sucesso | Apaga o release `build-failed-log`, se existir |

### Links fixos (sem login)

- APK mais recente: `https://github.com/Broomemory/cronofoco-app/releases/download/build-latest/app-debug.apk`
- Log do último build que falhou: `https://github.com/Broomemory/cronofoco-app/releases/download/build-failed-log/build-failed.log`
  (só existe enquanto o último build tiver falhado)

A página de logs do GitHub Actions exige login; por isso o log de falha é publicado como release.

### Problemas já resolvidos no workflow

| Sintoma | Causa | Correção |
|---|---|---|
| Falha em ~15 s, antes de qualquer passo | `android-actions/setup-android@v3` quebra no runtime Node 24 das Actions | Removida; usa o SDK pré-instalado |
| `exit code 127` | `sdkmanager` fora do PATH | Busca com `find` + `$GITHUB_PATH` |
| `[fatal] The Capacitor CLI requires NodeJS >=22.0.0` | Workflow usava Node 20 | Node 22 |

### Evitar build em commit só de documentação

Incluir `[skip ci]` na mensagem do commit (o GitHub Actions ignora o push).

## Versão

Em `android/app/build.gradle`:

```gradle
versionCode 4        // inteiro; o Android só aceita atualizar se for maior que o instalado
versionName "1.3"    // texto exibido ao usuário
```

Histórico em [CHANGELOG.md](CHANGELOG.md).

## Assinatura

- **Teste (atual):** todo APK é assinado com `android/app/cronofoco-debug.keystore` (alias
  `androiddebugkey`, senhas `android` — padrão público de debug). Como a chave é sempre a mesma, cada
  APK novo **instala por cima** do anterior e mantém os dados do usuário. Sem essa chave fixa, cada
  build do GitHub teria uma chave diferente e o Android exigiria desinstalar antes.
- **Loja (pendente):** para a Play Store é preciso um keystore de release próprio, com senha forte,
  guardado **fora** do repositório (secrets do GitHub), e gerar `assembleRelease`/`bundleRelease`.
  A chave de release não pode ser perdida: sem ela não é possível publicar atualizações.

## Instalar no celular

1. Baixar o APK (link acima) no próprio celular.
2. Abrir o arquivo; autorizar "instalar apps desconhecidos" para o navegador/gerenciador de arquivos.
3. Se já houver uma versão instalada com a mesma chave, ela é atualizada (dados preservados).
4. Na primeira vez que usar a voz, o Android pede a permissão de microfone.

Para a voz funcionar bem: app **Google** atualizado e idioma **Português (Brasil)** disponível no
reconhecimento de voz do aparelho (ver mensagens em [04](04-camada-de-voz-js.md)). Emulador não
serve para testar voz.

## Build local (opcional)

Requisitos: Node 22+, JDK 21, Android SDK com platform 36 e build-tools 36.0.0 (`ANDROID_HOME`
configurado).

```bash
npm ci
npx cap sync android
cd android
./gradlew assembleDebug          # Windows: gradlew.bat assembleDebug
# APK em android/app/build/outputs/apk/debug/app-debug.apk
```

Para instalar direto num aparelho com depuração USB: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
Também dá para abrir a pasta `android/` no Android Studio e rodar.

## Enviar alterações

Credenciais de acesso ao repositório **não** ficam nesta documentação; o Leandro fornece
diretamente. Fluxo: editar → testar ([08](08-testes.md)) → subir `versionCode` → commit → push na
`main` → aguardar o release `build-latest` ser atualizado.
