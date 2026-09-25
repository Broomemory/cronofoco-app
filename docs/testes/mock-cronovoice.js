// Simula o plugin nativo CronoVoice e o Capacitor dentro do navegador (para testar a voz sem celular).
// Uso: page.addInitScript(require("./mock-cronovoice.js")) — depois window.__cv.partial(texto) / window.__cv.final(texto, [alternativas]).
// Também grava uma licença de teste e 6 sessões de Cálculo no localStorage.
module.exports = `
  (function(){
    var L = {}; var cv = window.__cv = {session:0, restarts:0, stops:0, starts:0};
    function emit(ev, d){ (L[ev]||[]).slice().forEach(function(f){ f(d); }); }
    cv.emit = emit;
    function newSession(){ cv.session++; setTimeout(function(){ emit('voiceState',{state:'ready', session:cv.session}); }, 30); }
    var CronoVoice = {
      addListener: function(ev, fn){ (L[ev]=L[ev]||[]).push(fn); return Promise.resolve({remove:function(){ L[ev]=(L[ev]||[]).filter(function(x){return x!==fn;}); }}); },
      start: function(){ cv.starts++; newSession(); return Promise.resolve({service:'google', available:true}); },
      restart: function(){ cv.restarts++; newSession(); return Promise.resolve(); },
      stop: function(){ cv.stops++; return Promise.resolve(); }
    };
    cv.partial = function(t){ emit('voicePartial', {session:cv.session, matches:[t]}); };
    cv.final = function(t, alts){ emit('voiceResult', {session:cv.session, matches:[t].concat(alts||[])}); newSession(); };
    cv.listenerCount = function(){ var n=0; Object.keys(L).forEach(function(k){ n+=L[k].length; }); return n; };
    window.Capacitor = {
      isNativePlatform: function(){ return true; },
      isPluginAvailable: function(n){ return n === 'CronoVoice' || n === 'SpeechRecognition'; },
      registerPlugin: function(n){ return n === 'CronoVoice' ? CronoVoice : null; },
      Plugins: { CronoVoice: CronoVoice, SpeechRecognition: { requestPermissions: function(){ return Promise.resolve({speechRecognition:'granted'}); }, stop: function(){} } }
    };
  })();
  localStorage.setItem('cronofoco_license_v1', JSON.stringify({n:'Teste', h:'cd4d02bd5776d2a4d3e879557fdc69771d1a2b21044d6906b34bf18b5c8fbd23'}));
  var h = {calc:[]}; for(var i=0;i<6;i++) h.calc.push({ts:Date.now()-i*1000, correct:10, total:10, elapsedMs:60000});
  localStorage.setItem('cronofoco_history_v1', JSON.stringify(h));
`;
