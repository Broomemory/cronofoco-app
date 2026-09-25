// Simula a Web Speech API do navegador (webkitSpeechRecognition), com o comportamento do Chrome:
//  - modo contínuo (computador): a sessão continua depois de cada frase; ev.results acumula um
//    resultado por frase e o último pode ser parcial (isFinal=false);
//  - modo de uma frase (continuous=false, usado no celular): a frase final encerra a sessão (onend) e
//    o app abre outra.
// Mesma interface do mock do plugin nativo (mock-cronovoice.js), para os mesmos testes rodarem nos
// dois motores: window.__cv.partial(texto), window.__cv.final(texto, [alternativas]),
// window.__cv.emit('voiceResult', {matches:[texto, alternativa…]}), contadores __cv.starts,
// __cv.restarts (sessões reabertas pelo app via abort) e __cv.stops (microfone desligado).
// "texto" = o que foi dito desde a última frase final, como no mock nativo.
module.exports = `
  (function(){
    var cv = window.__cv = {session:0, restarts:0, stops:0, starts:0, instances:0};
    var cur = null;
    function Rec(){ this.lang=''; this.continuous=false; this.interimResults=false; this.maxAlternatives=1;
      this._finals=[]; this._live=false; this._aborted=false; cv.instances++; }
    Rec.prototype.start = function(){
      if(this._live) throw new Error('InvalidStateError');
      var self=this; self._live=true; cur=self; cv.starts++; cv.session++;
      setTimeout(function(){ if(self._live && self.onstart) self.onstart({}); }, 20);
    };
    function endRec(r, isAbort){
      if(!r._live) return; r._live=false;
      if(isAbort){ r._aborted=true; }
      setTimeout(function(){ if(r.onend) r.onend({}); }, 10);
    }
    Rec.prototype.stop = function(){ endRec(this, false); };
    Rec.prototype.abort = function(){ cv.stops++; endRec(this, true); };
    function mkResult(texts, isFinal){
      var r = texts.map(function(t){ return {transcript:t, confidence:0.9}; });
      r.isFinal = isFinal; r.item = function(i){ return r[i]; }; return r;
    }
    function fire(r, interim, alts, isFinal){
      var list = r._finals.slice();
      list.push(mkResult([interim].concat(alts||[]), isFinal));
      list.item = function(i){ return list[i]; };
      if(r.onresult) r.onresult({resultIndex: list.length-1, results: list});
      if(isFinal){
        r._finals.push(mkResult([interim], true));
        if(!r.continuous) endRec(r, false);          // uma frase por sessão (celular)
      }
    }
    cv.partial = function(t){ if(cur && cur._live) fire(cur, t, [], false); };
    cv.final = function(t, alts){ if(cur && cur._live) fire(cur, t, alts||[], true); };
    cv.emit = function(ev, d){ if(ev === 'voiceResult') cv.final(d.matches[0], d.matches.slice(1)); };
    window.webkitSpeechRecognition = Rec; window.SpeechRecognition = Rec;
    try{ Object.defineProperty(navigator, 'mediaDevices', {value:{enumerateDevices:function(){ return Promise.resolve([{kind:'audioinput'}]); }}, configurable:true}); }catch(e){}
  })();
  localStorage.setItem('cronofoco_license_v1', JSON.stringify({n:'Teste', h:'cd4d02bd5776d2a4d3e879557fdc69771d1a2b21044d6906b34bf18b5c8fbd23'}));
  var h = {calc:[]}; for(var i=0;i<6;i++) h.calc.push({ts:Date.now()-i*1000, correct:10, total:10, elapsedMs:60000});
  localStorage.setItem('cronofoco_history_v1', JSON.stringify(h));
`;
