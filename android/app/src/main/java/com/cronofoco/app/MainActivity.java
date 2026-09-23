package com.cronofoco.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Plugins locais (que vivem dentro deste app, não num pacote npm) precisam ser
        // registrados antes do super.onCreate.
        registerPlugin(CronoVoicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
