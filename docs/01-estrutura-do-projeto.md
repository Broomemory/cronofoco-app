# 01 — Estrutura do projeto

## Arquivos versionados (o que importa)

```
cronofoco-app/
├── www/
│   └── index.html                  ← O SISTEMA (site v41 + voz nativa). Único arquivo da interface.
├── android/                        ← Projeto Android nativo gerado pelo Capacitor
│   ├── app/
│   │   ├── build.gradle            ← versionCode/versionName, assinatura de debug
│   │   ├── cronofoco-debug.keystore← chave fixa dos APKs de teste
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/cronofoco/app/
│   │       │   ├── MainActivity.java      ← registra o plugin CronoVoice
│   │       │   └── CronoVoicePlugin.java  ← reconhecimento de voz nativo (escrito para o app)
│   │       └── res/                ← ícones, splash, textos (padrão do Capacitor)
│   ├── variables.gradle            ← versões de SDK e bibliotecas AndroidX
│   └── build.gradle, settings.gradle, gradlew…  (padrão do Capacitor/Gradle)
├── .github/workflows/build-apk.yml ← compila o APK a cada push na main
├── capacitor.config.json           ← appId, appName, webDir
├── package.json / package-lock.json← dependências npm (Capacitor e plugin da comunidade)
└── docs/                           ← esta documentação
```

Arquivos escritos à mão para o Cronofoco: `www/index.html`, `CronoVoicePlugin.java`,
`MainActivity.java` (só a linha do `registerPlugin`), `build.gradle` (versão e assinatura) e o
workflow. O resto é o padrão gerado pelo Capacitor.

## Gerados (não versionados)

| Pasta | Gerada por | Observação |
|---|---|---|
| `node_modules/` | `npm ci` | Dependências |
| `android/app/src/main/assets/public/` | `npx cap sync android` | Cópia do `www/` que vai dentro do APK |
| `android/capacitor-cordova-android-plugins/`, `android/app/capacitor.build.gradle` (conteúdo), `capacitor.settings.gradle` | `npx cap sync android` | Ligação dos plugins npm ao projeto Android |
| `android/app/build/`, `android/.gradle/` | Gradle | Saída da compilação (o APK sai em `android/app/build/outputs/apk/debug/app-debug.apk`) |

Nunca edite a cópia em `assets/public/`: ela é sobrescrita a cada `cap sync`.

## Configurações

| Arquivo | Valor | Observação |
|---|---|---|
| `capacitor.config.json` | `appId: com.cronofoco.app`, `appName: Cronofoco`, `webDir: www` | O `appId` é provisório: definir o definitivo antes da Play Store (não dá para trocar depois de publicado) |
| `android/app/build.gradle` | `versionCode 3`, `versionName "1.2"` | Subir `versionCode` a cada APK distribuído |
| `android/variables.gradle` | `minSdkVersion 24`, `compileSdkVersion 36`, `targetSdkVersion 36` | |
| `package.json` | `@capacitor/android`, `@capacitor/cli`, `@capacitor/core` ^8.5.2; `@capacitor-community/speech-recognition` ^7.0.1 | |

## Permissões

O `AndroidManifest.xml` do app declara só `INTERNET`. A permissão de microfone (`RECORD_AUDIO`) e a
consulta ao serviço de reconhecimento (`<queries>` para `android.speech.RecognitionService`) vêm do
manifesto do plugin `@capacitor-community/speech-recognition`, que o Gradle mescla no manifesto
final. **Por isso esse plugin continua instalado**, mesmo com a voz feita pelo `CronoVoicePlugin`:
ele fornece o manifesto e o pedido de permissão em tempo de execução (`requestPermissions()`).
Se um dia ele for removido, acrescente ao manifesto do app:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<queries>
  <intent><action android:name="android.speech.RecognitionService" /></intent>
</queries>
```

e implemente o pedido de permissão no `CronoVoicePlugin` (anotação `@CapacitorPlugin(permissions=…)`).

## Por que o app existe

No site publicado (página do Claude, dentro de iframe) o navegador bloqueia o microfone, e a Web
Speech API também não existe dentro do WebView do Android. O app resolve as duas coisas: roda o
mesmo sistema fora de iframe e troca a voz do navegador pelo reconhecedor nativo do Android.
