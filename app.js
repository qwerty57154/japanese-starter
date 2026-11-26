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

function home() {
  if (hasSpeech) window.speechSynthesis.cancel();
  const completed = Object.keys(saved.done).length;
  const next = lessons.findIndex((_, index) => !(index in saved.done));
  render(`<section class="hero"><div class="companions" aria-hidden="true"><span>🐱</span><span>🐰</span><span>🦊</span></div><h1>每天 10 分鐘，學一點日文</h1>
    <p>認識平假名，練一句生活日文，再用小測驗檢查自己記住了多少。</p>
    <p>已完成 ${completed}／${lessons.length} 課</p><progress aria-label="課程完成進度" value="${completed}" max="${lessons.length}"></progress>
    <button class="primary" id="start">${next < 0 ? '重溫第一課' : '開始第 ' + (next + 1) + ' 課'}</button></section>
    <h2>平假名入門</h2><div class="lessons">${lessons.map((lesson, index) =>
    `<button class="lesson" data-lesson="${index}"><span class="lesson-animal" aria-hidden="true">${mascots[index]}</span><small>第 ${index + 1} 課 ${index in saved.done ? '・已完成' : ''}</small><span lang="ja">${lesson.kana}</span><small>${lesson.meaning}</small></button>`).join('')}</div>`);
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
  const [picture, reminder] = card ? memory[index][step] : [mascots[index], lesson.tip];
  render(`<section class="panel"><h1>第 ${index + 1} 課 · ${card ? '假名卡片' : '生活用語'}</h1>
    <progress aria-label="本課學習進度" value="${step + 1}" max="${lesson.cards.length + 1}"></progress>
    <div class="study-stage"><div class="study-animal" aria-hidden="true">${mascots[index]}</div><div class="kana" lang="ja">${text}</div></div><p><strong>${card ? card.sound : lesson.reading}</strong></p>
    <p>${card ? '聽一次，跟念兩次，再試著看著假名自己念。' : lesson.meaning}</p>
    <aside class="memory-tip"><span class="memory-picture" aria-hidden="true">${picture}</span><div><h2>${card ? '記憶小叮嚀' : '開口小叮嚀'}</h2><p>${reminder}</p></div></aside>
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
    ...cards.map((card, position) => ({
      id: index + '-kana-' + card.letter, correct: card.letter, sound: card.sound,
      audio: position % 2 === 0,
      options: shuffle([card.letter, ...shuffle(cards.filter(other => other !== card)).slice(0, 2).map(other => other.letter)])
    })),
    {id: index + '-phrase', phrase: lesson.phrase, correct: lesson.meaning,
      options: shuffle([lesson.meaning, ...shuffle(lessons.filter(other => other !== lesson)).slice(0, 2).map(other => other.meaning)])}
  ];
}

function quiz(questions, lessonIndex, position = 0, score = 0) {
  if (hasSpeech) window.speechSynthesis.cancel();
  const question = questions[position];
  const review = lessonIndex === null;
  if (!question) {
    if (!review) { saved.done[lessonIndex] = score; store(); }
    render(`<section class="panel"><div class="result-animal" aria-hidden="true">${review ? '🐾' : mascots[lessonIndex]}</div><h1>${review ? '複習完成' : '本課完成'}</h1><p>答對 ${score}／${questions.length} 題</p>
      <div class="row"><button class="primary" id="back">回首頁</button><button id="again">${review ? '再看錯題' : '再練一次'}</button></div></section>`);
    document.querySelector('#back').onclick = home;
    document.querySelector('#again').onclick = () => review ? reviewWrong() : quiz(makeQuestions(lessonIndex), lessonIndex);
    return;
  }
  const listen = question.audio && hasSpeech;
  const prompt = question.phrase ? `<span lang="ja">${question.phrase}</span> 是什麼意思？`
    : listen ? '聽發音，選出對應的假名。' : `哪個假名念作 <strong>${question.sound}</strong>？`;
  render(`<section class="panel"><h1>${review ? '錯題複習' : '小測驗'} · ${position + 1}／${questions.length}</h1>
    <p>${prompt}</p>${listen ? '<div class="row"><button id="play">播放題目</button><button id="hint">看拼音提示</button></div><p id="audio" role="status"></p>' : ''}
    <div class="options">${question.options.map((option, index) => `<button data-answer="${index}" ${question.phrase ? '' : 'lang="ja"'}>${option}</button>`).join('')}</div>
    <p class="feedback" id="feedback" role="status"></p><button class="primary" id="continue" hidden>繼續</button></section>`);
  if (listen) {
    document.querySelector('#play').onclick = () => speak(question.correct, document.querySelector('#audio'));
    document.querySelector('#hint').onclick = () => { document.querySelector('#audio').textContent = '拼音：' + question.sound; };
  }
  const answers = screen.querySelectorAll('[data-answer]');
  answers.forEach(button => button.onclick = () => {
    const correct = question.options[Number(button.dataset.answer)] === question.correct;
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
  });
}

function reviewWrong() {
  const questions = Object.values(saved.wrong);
  if (questions.length) quiz(shuffle(questions), null);
  else render('<section class="panel"><h1>錯題複習</h1><p>目前沒有待複習的題目。</p></section>');
}

document.querySelector('#home').onclick = home;
document.querySelector('#review').onclick = reviewWrong;
home();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);
