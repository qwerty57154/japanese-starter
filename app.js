const lessons = [
  ['あいうえお','a i u e o','ありがとう','謝謝','arigatō','對店員可以說「ありがとうございます」，語氣更禮貌。'],
  ['かきくけこ','ka ki ku ke ko','こんにちは','你好','konnichiwa','白天打招呼時使用。最後的「は」在這句念 wa。'],
  ['さしすせそ','sa shi su se so','すみません','不好意思','sumimasen','在餐廳想請店員過來時，可以先說這句。'],
  ['たちつてと','ta chi tsu te to','これをください','請給我這個','kore o kudasai','指著菜單或商品時可以說這句。「を」在這裡念 o。'],
  ['なにぬねの','na ni nu ne no','いくらですか','多少錢？','ikura desu ka','看到想買的商品，就可以用這句問價錢。'],
  ['はひふへほ','ha hi fu he ho','トイレはどこですか','洗手間在哪裡？','toire wa doko desu ka','「トイレ」是片假名，可以先把整句當作常用句記起來。'],
  ['まみむめも','ma mi mu me mo','おみずをください','請給我水','omizu o kudasai','用餐時可以用這句請店員給你水。'],
  ['やゆよ','ya yu yo','おはようございます','早安','ohayō gozaimasu','早上向旅館人員打招呼時，可以用這句。'],
  ['らりるれろ','ra ri ru re ro','おかいけいをおねがいします','麻煩結帳','okaikei o onegai shimasu','用餐完畢後要結帳時可以說這句。'],
  ['わをん','wa o n','またあいましょう','下次見','mata aimashō','「ん」是鼻音，通常接在其他假名後面。']
].map(([kana, roman, phrase, meaning, reading, tip]) => ({
  kana, phrase, meaning, reading, tip,
  cards: [...kana].map((letter, i) => ({letter, sound: roman.split(' ')[i]}))
}));

const storageKey = 'japanese-starter-v1';
let saved = {done: {}, wrong: {}};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || saved; } catch {}
const screen = document.querySelector('#screen');
const hasSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function store() {
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch {}
}

function speak(text, status) {
  if (!hasSpeech) {
    status.textContent = '這個瀏覽器無法播放日文語音。';
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = synth.getVoices().find(item => /^ja([-_]|$)/i.test(item.lang));
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  if (voice) utterance.voice = voice;
  utterance.rate = 0.8;
  status.textContent = '';
  utterance.onerror = event => {
    if (!['interrupted', 'canceled'].includes(event.error)) {
      status.textContent = '無法播放日文語音。可確認裝置有日文語音，或改做看字題。';
    }
  };
  synth.speak(utterance);
}

function render(html) {
  screen.innerHTML = html;
  const heading = screen.querySelector('h1');
  heading.tabIndex = -1;
  heading.focus({preventScroll:true});
  window.scrollTo(0, 0);
}

const seal = '<img class="seal" src="seal.webp" width="144" height="144" alt="海豹小助教">';

function resources() {
  render(`<section class="panel">${seal}<h1>學習資源</h1>
    <h2>⚡50音怎麼背比較快?!</h2>
    <p>影片來源：吳氏日本語：奇跡的な速攻法</p>
    <p>看完影片後，回到卡片練習。先遮住拼音，自己試念，再按「聽發音」確認。</p>
    <ul><li><a href="https://www.youtube.com/shorts/b69m9uAhLiI" target="_blank" rel="noopener noreferrer">在 YouTube 觀看原影片</a></li>
    <li><a href="https://www.youtube.com/watch?v=DvjltwT2H2g&amp;list=PLhGTbECrW2wSAWsVPTwGCJFWTV2W8pPKm" target="_blank" rel="noopener noreferrer">影片說明欄的詳細教學</a></li>
    <li><a href="https://www.wusjp.com/日文五十音學習/" target="_blank" rel="noopener noreferrer">假名字源（作者的文字說明）</a></li>
    <li><a href="https://www.wusjp.com/" target="_blank" rel="noopener noreferrer">吳氏日文官網</a></li></ul>
    </section>`);
}

function home() {
  if (hasSpeech) window.speechSynthesis.cancel();
  const completed = Object.keys(saved.done).length;
  const next = lessons.findIndex((_, index) => !(index in saved.done));
  render(`<section class="hero"><div class="seal-welcome">${seal}<p>我是小海豹，今天一起學一句日文吧！</p></div><h1>每天 10 分鐘，學一點日文</h1>
    <p>認識平假名，練一句生活日文，再用小測驗檢查自己記住了多少。</p>
    <p>已完成 ${completed}／${lessons.length} 課</p><progress aria-label="課程完成進度" value="${completed}" max="${lessons.length}"></progress>
    <button class="primary" id="start">${next < 0 ? '重溫第一課' : '開始第 ' + (next + 1) + ' 課'}</button></section>
    <h2>第一章｜平假名</h2><div class="lessons">${lessons.map((lesson, index) =>
    `<button class="lesson" data-lesson="${index}"><small>第 ${index + 1} 課 ${index in saved.done ? '・已完成' : ''}</small><span lang="ja">${lesson.kana}</span><small>${lesson.meaning}</small></button>`).join('')}</div>
    <section class="panel chapter-review"><h2>第一章總複習</h2><p>${completed ? '從已完成的課程隨機抽題，每次最多 15 題。' : '完成任一課後，就能從學過的內容抽題。'}</p>
    <button class="primary" id="mixed" ${completed ? '' : 'disabled'}>開始總複習</button></section>`);
  document.querySelector('#mixed').onclick = reviewMixed;
  document.querySelector('#start').onclick = () => study(Math.max(0, next));
  screen.querySelectorAll('[data-lesson]').forEach(button => {
    button.onclick = () => study(Number(button.dataset.lesson));
  });
}

function study(index, step = 0) {
  if (hasSpeech) window.speechSynthesis.cancel();
  const lesson = lessons[index];
  const card = lesson.cards[step];
  const text = card ? card.letter : lesson.phrase;
  const origin = kanaOrigins[index].split(' ')[step];
  render(`<section class="panel"><h1>第 ${index + 1} 課 · ${card ? '假名卡片' : '生活用語'}</h1>
    <progress aria-label="本課學習進度" value="${step + 1}" max="${lesson.cards.length + 1}"></progress>
    <div class="study-stage">${seal}<div class="kana" lang="ja">${text}</div></div><p><strong>${card ? card.sound : lesson.reading}</strong></p>
    <p>${card ? '聽一次，跟念兩次，再試著看著假名自己念。' : lesson.meaning}</p>
    <aside class="memory-tip"><div><h2>${card ? '海豹小叮嚀｜字源' : '開口小叮嚀'}</h2>
      <p>${card ? `<strong>${origin} → <span lang="ja">${card.letter}</span></strong>` : lesson.tip}</p></div></aside>
    <div class="row"><button id="listen">聽發音</button>
    ${step ? '<button id="previous">上一張</button>' : ''}
    <button class="primary" id="next">${card ? '下一張' : '開始小測驗'}</button></div>
    <p class="feedback" id="audio" role="status"></p></section>`);
  document.querySelector('#listen').onclick = () => speak(text, document.querySelector('#audio'));
  const previous = document.querySelector('#previous');
  if (previous) previous.onclick = () => study(index, step - 1);
  document.querySelector('#next').onclick = () => card ? study(index, step + 1) : quiz(makeQuestions(index), index);
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function makeQuestions(index) {
  const lesson = lessons[index];
  const cards = shuffle(lesson.cards);
  return [
    ...[true, false].flatMap(audio => shuffle(cards).map(card => ({
      id: index + (audio ? '-listen-' : '-identify-') + card.letter,
      correct: card.letter, sound: card.sound, audio,
      options: shuffle([card.letter, ...shuffle(cards.filter(other => other !== card)).slice(0, 2).map(other => other.letter)])
    }))),
    ...shuffle(cards).map(card => ({
      id: index + '-dictation-' + card.letter, correct: card.letter,
      sound: card.sound, audio: true, writing: true
    })),
    {id: index + '-phrase', phrase: lesson.phrase, correct: lesson.meaning,
      options: shuffle([lesson.meaning, ...shuffle(lessons.filter(other => other !== lesson)).slice(0, 2).map(other => other.meaning)])}
  ];
}

function quiz(questions, lessonIndex, position = 0, score = 0) {
  if (hasSpeech) window.speechSynthesis.cancel();
  const question = questions[position];
  const wrongReview = lessonIndex === null;
  const mixed = lessonIndex === 'mixed';
  const review = wrongReview || mixed;
  const title = mixed ? '總複習' : wrongReview ? '錯題複習' : '小測驗';
  if (!question) {
    if (!review) { saved.done[lessonIndex] = score; store(); }
    render(`<section class="panel">${seal}<h1>${review ? '複習完成' : '本課完成'}</h1><p>答對 ${score}／${questions.length} 題</p>
      <div class="row"><button class="primary" id="back">回首頁</button><button id="again">${mixed ? '重新抽題' : wrongReview ? '再看錯題' : '再練一次'}</button></div></section>`);
    document.querySelector('#back').onclick = home;
    document.querySelector('#again').onclick = () => mixed ? reviewMixed() : wrongReview ? reviewWrong() : quiz(makeQuestions(lessonIndex), lessonIndex);
    return;
  }
  const listen = question.audio && hasSpeech;
  const prompt = question.phrase ? `<span lang="ja">${question.phrase}</span> 是什麼意思？`
    : question.writing && listen ? '播放發音，用手指在方格寫出假名，再對照正解。'
    : listen ? '聽發音，選出對應的假名。' : `哪個假名念作 <strong>${question.sound}</strong>？`;
  render(`<section class="panel"><h1>${title} · ${position + 1}／${questions.length}</h1>
    <p class="question-kind">${question.phrase ? '生活用語' : question.writing ? '聽音手寫' : listen ? '聽音辨認' : '看拼音指認'}</p><p>${prompt}</p>${listen ? '<div class="row"><button id="play">播放題目</button><button id="hint">看拼音提示</button></div><p id="audio" role="status"></p>' : ''}
    ${question.writing ? `<canvas id="writing-pad" width="240" height="240" aria-label="假名手寫格"></canvas>
      <div class="row"><button id="erase">清除重寫</button><button class="primary" id="check-writing" disabled>看正解</button></div>
      <p id="solution" hidden></p><div class="row" id="self-check" hidden><button id="right-writing">我寫對了</button><button id="wrong-writing">需要再練</button></div>`
    : `<div class="options">${question.options.map((option, index) => `<button data-answer="${index}" ${question.phrase ? '' : 'lang="ja"'}>${option}</button>`).join('')}</div>`}
    <p class="feedback" id="feedback" role="status"></p><button class="primary" id="continue" hidden>繼續</button></section>`);
  if (listen) {
    document.querySelector('#play').onclick = () => speak(question.correct, document.querySelector('#audio'));
    document.querySelector('#hint').onclick = () => { document.querySelector('#audio').textContent = '拼音：' + question.sound; };
  }
  const answers = screen.querySelectorAll('[data-answer]');
  function answerQuestion(correct) {
    if (!correct) saved.wrong[question.id] = question;
    else if (review) delete saved.wrong[question.id];
    store();
    answers.forEach(answer => { answer.disabled = true; });
    document.querySelector('#feedback').textContent = correct ? '答對了！' :
      '正解是 ' + question.correct + (question.sound ? '（' + question.sound + '）' : '') + '。已收進錯題。';
    const next = document.querySelector('#continue');
    next.hidden = false;
    next.textContent = position + 1 === questions.length ? '看結果' : '下一題';
    next.onclick = () => quiz(questions, lessonIndex, position + 1, score + Number(correct));
    next.focus();
  }
  answers.forEach(button => button.onclick = () =>
    answerQuestion(question.options[Number(button.dataset.answer)] === question.correct));
  if (question.writing) setupWriting(question, answerQuestion);
}

function setupWriting(question, submit) {
  const pad = document.querySelector('#writing-pad');
  const ctx = pad.getContext('2d');
  const check = document.querySelector('#check-writing');
  const erase = document.querySelector('#erase');
  const controls = document.querySelector('#self-check');
  const solution = document.querySelector('#solution');
  let pointer = null;
  ctx.strokeStyle = '#493255';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function point(event) {
    const bounds = pad.getBoundingClientRect();
    return [(event.clientX - bounds.left) * pad.width / bounds.width,
      (event.clientY - bounds.top) * pad.height / bounds.height];
  }

  pad.onpointerdown = event => {
    if (pointer !== null || !solution.hidden || event.button !== 0) return;
    pointer = event.pointerId;
    pad.setPointerCapture(pointer);
    const [x, y] = point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + .1, y);
    ctx.stroke();
    check.disabled = false;
  };
  pad.onpointermove = event => {
    if (event.pointerId !== pointer) return;
    ctx.lineTo(...point(event));
    ctx.stroke();
  };
  pad.onlostpointercapture = () => { pointer = null; };
  erase.onclick = () => {
    ctx.clearRect(0, 0, pad.width, pad.height);
    check.disabled = true;
  };
  check.onclick = () => {
    solution.textContent = '正解：' + question.correct + '（' + question.sound + '）。請對照字形，自行判斷。';
    solution.hidden = false;
    controls.hidden = false;
    check.disabled = true;
    erase.disabled = true;
    document.querySelector('#right-writing').focus();
  };
  document.querySelector('#right-writing').onclick = () => {
    controls.hidden = true;
    submit(true);
  };
  document.querySelector('#wrong-writing').onclick = () => {
    controls.hidden = true;
    submit(false);
  };
}

function reviewMixed() {
  const completed = lessons.flatMap((_, index) => index in saved.done ? makeQuestions(index) : []);
  quiz(shuffle(completed).slice(0, 15), 'mixed');
}

function reviewWrong() {
  const questions = Object.values(saved.wrong);
  if (questions.length) quiz(shuffle(questions), null);
  else render('<section class="panel"><h1>錯題複習</h1><p>目前沒有待複習的題目。</p></section>');
}

document.querySelector('#home').onclick = home;
document.querySelector('#resources').onclick = resources;
document.querySelector('#review').onclick = reviewWrong;
home();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);
