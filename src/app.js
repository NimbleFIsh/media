import template from './template.json';
import getCity from './getCity';
import validator from './validator';

if (!navigator.geolocation) alert('Ваш браузер не поддерживает геолокацию!'); // Проверка поддержки геолокации
else {
  const d = document;
  d.body.insertAdjacentHTML('afterbegin', template.base); // Рендер базовой структуры

  const acceptBtn = d.getElementById('accept');
  const time = d.getElementById('time');
  const deniedBtn = d.getElementById('denied');
  const audioBtn = d.getElementById('control_audio');
  const videoBtn = d.getElementById('control_video');
  const input = d.getElementsByTagName('input')[0];
  const submitBtn = d.getElementsByTagName('button')[0];
  const controls = d.getElementById('standart');
  const specControls = d.getElementById('spec_block');
  const messages = d.getElementById('messages');
  const controlsContainer = d.getElementById('controls');
  const geo = d.getElementById('geo');

  let timerID = null;
  let media = null;
  let chunks = [];
  let mediaType = null;
  let city;

  const setCity = async (data) => {
    const res = await getCity(data);
    if (res === false) return false;
    city = res;
    geo.innerHTML = `<div id="city">${res}</div><div id="coords">[ ${
      data.coords.latitude}, ${data.coords.longitude} ]</div>`;
  }

  function renderBlock(type = null, obj = null) {
    const li = d.createElement('li');
    if (type === null && obj === null) { // Текст
      const p = d.createElement('p');
      p.innerText = input.value;
      input.value = '';
      li.appendChild(p);
      const timestamp = document.createElement('div');
      const date = new Date();
      timestamp.classList.add('timestamp');
      timestamp.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      li.appendChild(timestamp);
    } else if (type) { // Видео
      const video = d.createElement('video');
      video.src = obj;
      video.controls = true;
      li.appendChild(video);
      const timestamp = document.createElement('div');
      const date = new Date();
      timestamp.classList.add('timestamp');
      timestamp.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      li.appendChild(timestamp);
    } else {
      const audio = d.createElement('audio');
      audio.src = obj;
      audio.controls = true;
      li.appendChild(audio);
      const timestamp = document.createElement('div');
      const date = new Date();
      timestamp.classList.add('timestamp');
      timestamp.innerText = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      li.appendChild(timestamp);
    }
    messages.insertAdjacentElement('afterbegin', li);
  }

  function showErrCoords() {
    d.body.insertAdjacentHTML('afterbegin', template.modal); // Рендер моадльного окна
    const modalDenied = d.getElementById('modal_denied');
    const modalSuccess = d.getElementById('modal_success');
    const modal = d.getElementById('modal');
    const modalInput = d.querySelector('#modal input');

    modalInput.addEventListener('focus', (e) => e.target.classList.remove('err'));
    modalInput.addEventListener('blur', (e) => !validator(e.target.value) && e.target.classList.add('err'));

    modalDenied.addEventListener('click', () => modal.remove());

    modalSuccess.addEventListener('click', async () => {
      const result = validator(modalInput.value);
      const status = await setCity(result);
      if (result !== false && status !== false) {
        setCity(result);
        renderBlock();
        modal.remove();
      } else modalInput.classList.add('err');
    });
  }

  navigator.geolocation.getCurrentPosition((data) => setCity(data, true), () => geo.innerText = 'User denied geolocation');

  function sending() {
    if (input.value !== '') { city ? renderBlock() : showErrCoords(); }
  }

  submitBtn.addEventListener('click', sending);
  d.addEventListener('keydown', (key) => {
    if (key.code === 'Enter' && !submitBtn.disabled && !input.disabled) {
      key.preventDefault();
      sending();
    }
  });

  input.addEventListener('input', () => submitBtn.disabled = input.value === '');

  function specControlsScript(status) {
    media.stop();
    input.disabled = false;
    submitBtn.disabled = input.value === '';
    specControls.classList.add('hide'); // Скрыть блок спец управления
    controls.classList.remove('hide'); // Показать блок основного управления
    clearInterval(timerID);
    timerID = null;
    time.innerHTML = '<span id="minutes">00</span>:<span id="seconds">00</span>';
    if (status) {
      const blob = new Blob(chunks);
      renderBlock(mediaType, URL.createObjectURL(blob));
    } else chunks = [];
  }

  function controlsScript(status) {
    input.disabled = true;
    submitBtn.disabled = true;
    controls.classList.add('hide'); // Скрыть блок спец управления
    specControls.classList.remove('hide'); // Показать блок основного управления

    let video;
    if (status) {
      video = d.createElement('video');
      video.id = 'preview';
      video.style = 'position:absolute;right:80px;bottom:165px;';
      video.muted = true;
      video.autoplay = true;
    }

    navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true,
        frameRate: 48000,
      },
      video: status,
    })
      .then((stream) => {
        mediaType = status;
        chunks = [];
        media = new MediaRecorder(stream);
        media.addEventListener('start', () => {
          if (status) {
            video.srcObject = stream;
            controlsContainer.insertAdjacentElement('afterbegin', video);
          }
          // Счёт времени записи
          timerID = setInterval(() => {
            let minutesVal = parseInt(time.children[0].innerText);
            let secondsVal = parseInt(time.children[1].innerText);
            if (secondsVal === 60) { minutesVal += 1; secondsVal = 0; }
            if (minutesVal === 60) media.stop();
            secondsVal += 1;
            time.innerHTML = `<span id="minutes">${minutesVal < 10 ? `0${minutesVal}` : minutesVal
            }</span>:<span id="seconds">${secondsVal < 10 ? `0${secondsVal}` : secondsVal}</span>`;
          }, 1000);
        });
        media.addEventListener('dataavailable', (el) => chunks.push(el.data));
        media.addEventListener('stop', () => {
          d.getElementById('preview') && d.getElementById('preview').remove();
          stream.getTracks().forEach((track) => track.stop());
        });
        media.start(10);
      })
      .catch(console.error);
  }

  acceptBtn.addEventListener('click', () => specControlsScript(true));
  deniedBtn.addEventListener('click', () => specControlsScript(false));

  audioBtn.addEventListener('click', () => controlsScript(false));
  videoBtn.addEventListener('click', () => controlsScript(true));
}
