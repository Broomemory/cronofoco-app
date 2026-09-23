package com.cronofoco.app;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognitionService;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Reconhecimento de voz contínuo do Cronofoco.
 *
 * Por que um plugin próprio: o reconhecedor do Android só ouve uma frase por vez e o plugin genérico
 * usado antes não deixava controlar nada disso (qual motor usar, tempo de silêncio, resultados parciais,
 * reinício automático). Aqui:
 *  - preferimos o motor do Google (app Google) quando existe — em vários aparelhos (ex.: Samsung) o
 *    motor padrão do sistema é outro, bem pior em português;
 *  - pedimos resultados PARCIAIS: o app recebe o texto enquanto a pessoa ainda está falando, o que
 *    deixa o Stroop marcar cada cor quase na hora;
 *  - quando uma sessão termina (fim de frase, silêncio, "não entendi", serviço ocupado...) o próprio
 *    plugin volta a ouvir sozinho, sem ida e volta ao JavaScript, até o app chamar stop().
 *
 * Eventos enviados ao JS: voiceState {state, service}, voicePartial {session, matches},
 * voiceResult {session, matches}, voiceError {code, error, fatal}, voiceLevel {rms}.
 */
@CapacitorPlugin(name = "CronoVoice")
public class CronoVoicePlugin extends Plugin {

    private static final String GOOGLE_PKG = "com.google.android.googlequicksearchbox";

    private final Handler main = new Handler(Looper.getMainLooper());
    private SpeechRecognizer recognizer;
    private boolean active = false;
    private boolean useGoogle = true;
    private String language = "pt-BR";
    private int maxResults = 5;
    private String serviceName = "sistema";
    private int generation = 0;   // muda a cada recognizer criado — descarta eventos de instâncias antigas
    private int session = 0;      // muda a cada startListening — o JS zera o texto a cada sessão nova
    private int consecutiveErrors = 0;
    private long lastLevelAt = 0;
    private final Runnable listenRunnable = this::listen;

    @PluginMethod
    public void start(final PluginCall call) {
        final String lang = call.getString("language", "pt-BR");
        final Integer max = call.getInt("maxResults", 5);
        main.post(() -> {
            try {
                language = lang == null ? "pt-BR" : lang;
                maxResults = max == null ? 5 : max;
                active = true;
                consecutiveErrors = 0;
                createRecognizer();
                listen();
                JSObject ret = new JSObject();
                ret.put("service", serviceName);
                ret.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
                call.resolve(ret);
            } catch (Exception ex) {
                active = false;
                call.reject(ex.getMessage() == null ? "Falha ao iniciar o reconhecimento" : ex.getMessage());
            }
        });
    }

    /** Descarta o que está sendo ouvido agora e começa uma sessão nova (usado entre uma conta e outra). */
    @PluginMethod
    public void restart(final PluginCall call) {
        main.post(() -> {
            if (active && recognizer != null) {
                try { recognizer.cancel(); } catch (Exception ignored) {}
                main.removeCallbacks(listenRunnable);
                main.postDelayed(listenRunnable, 80);
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void stop(final PluginCall call) {
        main.post(() -> {
            shutdown();
            call.resolve();
        });
    }

    @Override
    protected void handleOnPause() {
        // App foi para segundo plano: não deixa o microfone aberto.
        main.post(this::shutdown);
    }

    @Override
    protected void handleOnDestroy() {
        main.post(this::shutdown);
    }

    // ------------------------------------------------------------------------------------------

    private void shutdown() {
        boolean wasActive = active;
        active = false;
        main.removeCallbacks(listenRunnable);
        destroyRecognizer();
        if (wasActive) emitState("stopped");
    }

    private void destroyRecognizer() {
        if (recognizer != null) {
            try { recognizer.cancel(); } catch (Exception ignored) {}
            try { recognizer.destroy(); } catch (Exception ignored) {}
            recognizer = null;
        }
    }

    private void createRecognizer() {
        destroyRecognizer();
        generation++;
        ComponentName google = useGoogle ? findGoogleService() : null;
        if (google != null) {
            recognizer = SpeechRecognizer.createSpeechRecognizer(getContext(), google);
            serviceName = "google";
        } else {
            recognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            serviceName = "sistema";
        }
        recognizer.setRecognitionListener(new Listener(generation));
    }

    private ComponentName findGoogleService() {
        try {
            List<ResolveInfo> services = getContext().getPackageManager()
                .queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
            if (services == null) return null;
            for (ResolveInfo ri : services) {
                if (ri.serviceInfo != null && GOOGLE_PKG.equals(ri.serviceInfo.packageName)) {
                    return new ComponentName(ri.serviceInfo.packageName, ri.serviceInfo.name);
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void listen() {
        if (!active) return;
        if (recognizer == null) createRecognizer();
        session++;
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, language);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, maxResults);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());
        // Deixa a sessão durar mais antes de encerrar por silêncio (o Google respeita; outros ignoram).
        intent.putExtra("android.speech.extra.DICTATION_MODE", true);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
        try {
            recognizer.startListening(intent);
        } catch (Exception ex) {
            scheduleRestart(400, true);
        }
    }

    private void scheduleRestart(long delayMs, boolean recreate) {
        if (!active) return;
        main.removeCallbacks(listenRunnable);
        if (recreate) {
            main.postDelayed(() -> {
                if (!active) return;
                createRecognizer();
                listen();
            }, delayMs);
        } else {
            main.postDelayed(listenRunnable, delayMs);
        }
    }

    private void emitState(String state) {
        JSObject ret = new JSObject();
        ret.put("state", state);
        ret.put("service", serviceName);
        ret.put("session", session);
        notifyListeners("voiceState", ret);
    }

    private void emitMatches(String event, Bundle bundle) {
        if (bundle == null) return;
        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches == null || matches.isEmpty()) return;
        JSObject ret = new JSObject();
        ret.put("session", session);
        ret.put("matches", new JSArray(matches));
        notifyListeners(event, ret);
    }

    private void emitError(String code, int error, boolean fatal) {
        JSObject ret = new JSObject();
        ret.put("code", code);
        ret.put("error", error);
        ret.put("fatal", fatal);
        ret.put("service", serviceName);
        notifyListeners("voiceError", ret);
    }

    private class Listener implements RecognitionListener {
        private final int gen;

        Listener(int gen) { this.gen = gen; }

        private boolean stale() { return !active || gen != generation; }

        @Override
        public void onReadyForSpeech(Bundle params) {
            if (stale()) return;
            emitState("ready");
        }

        @Override
        public void onBeginningOfSpeech() {
            if (stale()) return;
            emitState("speech");
        }

        @Override
        public void onRmsChanged(float rmsdB) {
            if (stale()) return;
            long now = System.currentTimeMillis();
            if (now - lastLevelAt < 120) return;
            lastLevelAt = now;
            JSObject ret = new JSObject();
            ret.put("rms", rmsdB);
            notifyListeners("voiceLevel", ret);
        }

        @Override
        public void onBufferReceived(byte[] buffer) {}

        @Override
        public void onEndOfSpeech() {
            if (stale()) return;
            emitState("end");
        }

        @Override
        public void onError(int error) {
            if (stale()) return;
            emitState("end");
            switch (error) {
                case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                    emitError("not-allowed", error, true);
                    shutdown();
                    return;
                case SpeechRecognizer.ERROR_NO_MATCH:
                case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                    // Silêncio ou "não entendi": normal, só volta a ouvir.
                    consecutiveErrors = 0;
                    scheduleRestart(60, false);
                    return;
                case 12: // ERROR_LANGUAGE_NOT_SUPPORTED (API 31+)
                case 13: // ERROR_LANGUAGE_UNAVAILABLE (API 31+)
                    if (useGoogle && "google".equals(serviceName)) {
                        useGoogle = false; // tenta o motor padrão do sistema
                        scheduleRestart(200, true);
                    } else {
                        emitError("language", error, true);
                        shutdown();
                    }
                    return;
                default:
                    consecutiveErrors++;
                    if (error == SpeechRecognizer.ERROR_NETWORK || error == SpeechRecognizer.ERROR_NETWORK_TIMEOUT
                        || error == SpeechRecognizer.ERROR_SERVER) {
                        emitError("network", error, false);
                    } else if (error == SpeechRecognizer.ERROR_AUDIO && consecutiveErrors >= 5) {
                        emitError("audio-capture", error, true);
                        shutdown();
                        return;
                    }
                    if (consecutiveErrors >= 3 && useGoogle && "google".equals(serviceName)) {
                        useGoogle = false; // motor do Google falhando seguido: tenta o do sistema
                    }
                    long delay = Math.min(250L * consecutiveErrors, 2000L);
                    scheduleRestart(delay, true);
            }
        }

        @Override
        public void onResults(Bundle results) {
            if (stale()) return;
            consecutiveErrors = 0;
            emitMatches("voiceResult", results);
            scheduleRestart(40, false);
        }

        @Override
        public void onPartialResults(Bundle partialResults) {
            if (stale()) return;
            emitMatches("voicePartial", partialResults);
        }

        @Override
        public void onEvent(int eventType, Bundle params) {}
    }
}
