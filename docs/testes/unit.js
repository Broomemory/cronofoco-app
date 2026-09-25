// Uso: node unit.js  (só Node, sem navegador). Confere a sintaxe do www/index.html, os geradores e as funções de voz do app.
const fs=require('fs'); const path=require('path');
const html=fs.readFileSync(process.env.HTML || path.resolve(__dirname,'../../www/index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const src=scripts.sort((a,b)=>b.length-a.length)[0];
new Function(src); console.log('sintaxe do <script>: OK');
function grab(a,b){ const i=src.indexOf(a), j=src.indexOf(b,i); if(i<0||j<0) throw new Error('grab '+a); return src.slice(i,j); }
const util = grab('  function normWord(s){','  function fmtTime(ms){') + grab('  function rand(n){','  /* ============================= GATE');
const calc = grab('  var CALC_HARD_SHARE','  var CALC_TOTALS');
const cw = grab('  var CROSS_BANK','  function renderCrossword(root){');
const story = grab('  var STORY_LINKS = [','  /* ============================= STORAGE');
const env = new Function(util+calc+cw+story+'; return {buildCalcQuestions, genCrossword, CW_DIFFS, CROSS_BANK, buildCrazyStory};')();
// ---- calc
let n=0, hard=0, zero=0, rep=0, t69=0, mul=0, stats={'+':0,'-':0,'×':0};
for(let s=0;s<200;s++){ const qs=env.buildCalcQuestions(100); qs.forEach((q,i)=>{ n++; stats[q.op]++; if(q.hard) hard++; if(q.answer===0) zero++; if(i>0 && qs[i-1].answer===q.answer) rep++; if(i>1 && qs[i-2].answer===q.answer) rep++;
  if(q.op==='×'){ mul++; if((q.a>=6&&q.a<=9)||(q.b>=6&&q.b<=9)) t69++; }
  const ok = q.op==='+'? q.a+q.b===q.answer : q.op==='-'? q.a-q.b===q.answer && q.answer>=0 : q.a*q.b===q.answer; if(!ok) throw new Error('bad '+JSON.stringify(q)); }); }
console.log('calc: difíceis', (hard/n*100).toFixed(1)+'%', '| zero', (zero/n*100).toFixed(2)+'%', '| resposta repetida em 2 seguintes', rep, '| × com tabuada 6-9', (t69/mul*100).toFixed(1)+'%', JSON.stringify(stats));
// ---- crossword
const DIRS={a:[0,1],d:[1,0]};
for(const k of Object.keys(env.CW_DIFFS)){
  const D=env.CW_DIFFS[k]; let short=0, bad=0, sizes=[];
  for(let t=0;t<150;t++){
    const p=env.genCrossword(D); sizes.push(p.rows+'x'+p.cols);
    if(p.words.length < D.words) short++;
    if(p.rows>D.maxSize||p.cols>D.maxSize) bad++;
    // todas as sequências de 2+ letras na grade precisam ser palavras colocadas
    const set=new Set(p.words.map(w=>w.dir+':'+w.r+','+w.c+':'+w.norm));
    for(const dir of ['a','d']){ const [dr,dc]=DIRS[dir];
      for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++){
        if(p.sol[r][c]===null) continue; const pr=r-dr, pc=c-dc; if(pr>=0&&pc>=0&&p.sol[pr]&&p.sol[pr][pc]!=null) continue;
        let s='', rr=r, cc=c; while(rr<p.rows&&cc<p.cols&&p.sol[rr][cc]!=null){ s+=p.sol[rr][cc]; rr+=dr; cc+=dc; }
        if(s.length>=2 && !set.has(dir+':'+r+','+c+':'+s)){ bad++; }
      } }
    // números: cada palavra tem número e as de mesmo início compartilham
    p.words.forEach(w=>{ if(!w.num) bad++; });
    // conectividade: todas cruzam alguma
  }
  console.log('cruzadinha', k, '| abaixo da meta:', short, '/150 | inválidas:', bad, '| ex. tamanhos', sizes.slice(0,5).join(' '));
}
console.log('banco de palavras:', env.CROSS_BANK.length);
// ---- story
const words=['abelha','gato','casa','sol','mesa','rio','uva'];
const storyHtml=env.buildCrazyStory(words);
const li=(storyHtml.match(/<li>/g)||[]).length; const counts=words.map(w=>(storyHtml.match(new RegExp('<b>'+w.toUpperCase()+'</b>','g'))||[]).length);
console.log('história: cenas', li, '| cada palavra aparece', counts.join(','));

// ---- funções de voz (exclusivas do app)
const voz = new Function(util + grab('  var COLORS = [','  var HISTORY_KEY') + grab('  var PT_NUM_WORDS','  var STORY_LINKS = [') .replace(/function stroopVoiceBreakdown[\s\S]*$/,'') +
  '; return {extractSpokenNumbers, numberAddedTo, extractColorTokens, alignColorTokens};')();
let vf=0; const eq=(nome, got, want)=>{ const ok=JSON.stringify(got)===JSON.stringify(want); if(!ok) vf++; console.log((ok?'OK   ':'FALHA')+' '+nome+'  → '+JSON.stringify(got)); };
eq('números em sequência', voz.extractSpokenNumbers('doze trinta e cinco 7'), [12,35,7]);
eq('lendo a conta: só o resultado', voz.extractSpokenNumbers('seis vezes sete quarenta e dois'), [42]);
eq('dezena + unidade sem "e"', voz.extractSpokenNumbers('vinte cinco'), [25]);
eq('centena', voz.extractSpokenNumbers('cento e dez'), [110]);
eq('apelidos (deus, novo, hum)', voz.extractSpokenNumbers('deus novo hum'), [10,9,1]);
eq('numberAddedTo 20→21', voz.numberAddedTo(20,21), 1);
eq('numberAddedTo 100→125', voz.numberAddedTo(100,125), 25);
eq('numberAddedTo 10→100', voz.numberAddedTo(10,100), 0);
eq('numberAddedTo 1→12', voz.numberAddedTo(1,12), 2);
eq('numberAddedTo 13→30', voz.numberAddedTo(13,30), null);
eq('cores com pontuação', voz.extractColorTokens('Azul, vermelho.'), [1,2]);
eq('palavras cortadas (a sul, ver de)', voz.extractColorTokens('a sul ver de'), [1,4]);
eq('variação de roxo (rocha)', voz.extractColorTokens('rocha'), [5]);
eq('aproximação por som (vermeio)', voz.extractColorTokens('vermeio'), [2]);
eq('palavra comum não vira cor (vendo)', voz.extractColorTokens('vendo'), []);
eq('alinhamento com palavra perdida', voz.alignColorTokens([1,3,4,5],[1,2,3,4,5]).cells.map(c=>c.state), ['ok','miss','ok','ok','ok']);
eq('com só 1 cor depois da falha, o custo menor é "cor errada"', voz.alignColorTokens([1,3],[1,2,3]).cells.map(c=>c.state), ['ok','bad']);
eq('alinhamento com cor errada', voz.alignColorTokens([1,4,3],[1,2,3]).cells.map(c=>c.state), ['ok','bad','ok']);
console.log(vf ? vf+' FALHA(S) nas funções de voz' : 'funções de voz: TUDO OK');
