import template from './template.json';
import getCity from './getCity';

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
    const spec_controls = d.getElementById('spec_block');
    const messages = d.getElementById('messages');
    const controls_container = d.getElementById('controls');
    const geo = d.getElementById('geo');

    let timerID = null,
        media = null,
        chunks = [],
        mediaType = null;    

    function showErrCoords() {
        d.body.insertAdjacentHTML('afterbegin', template.modal); // Рендер моадльного окна
        // localStorage['geo']
    }

    const setCity = async data => { localStorage['geo'] = await getCity(data); geo.innerText = localStorage['geo']; }
    
    // Проверка записи о городе
    if (!localStorage['geo']) navigator.geolocation.getCurrentPosition(setCity, err => geo.innerText = err.message);
    else geo.innerText = localStorage['geo'];

    function renderBlock(type = null, obj = null) {
        const li = d.createElement('li');
        if (type === null && obj === null) { // Текст
            const p = d.createElement('p');
            p.innerText = input.value;
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

    function sending() {
        if (input.value !== '') {
            if (localStorage['geo']) renderBlock();
            else showErrCoords();
            input.value = '';
        }
    }

    submitBtn.addEventListener('click', sending);
    d.addEventListener('keydown', key => {
        if (key.code === 'Enter' && !submitBtn.disabled && !input.disabled) {
            key.preventDefault();
            sending();
        }
    });

    input.addEventListener('input', () => submitBtn.disabled = input.value === '');

    function spec_controlsScript(status) {
        media.stop();
        input.disabled = false;
        submitBtn.disabled = input.value === '';
        spec_controls.classList.add('hide'); // Скрыть блок спец управления
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
        spec_controls.classList.remove('hide'); // Показать блок основного управления

        let video;
        if (status) {
            video = d.createElement('video');
            video.id='preview';
            video.style = 'position:absolute;right:80px;bottom:165px;';
            video.muted = true;
            video.autoplay = true;
        }

        navigator.mediaDevices.getUserMedia({ 
            audio: {
                'channelCount': 2,
                'echoCancellation': true,
                'noiseSuppression': true,
                'frameRate': 48000
            },
            video: status
        })
        .then(stream => {
            mediaType = status;
            chunks = [];
            media = new MediaRecorder(stream);
            media.addEventListener('start', () => {
                if (status) {
                    video.srcObject = stream;
                    controls_container.insertAdjacentElement('afterbegin', video);
                }
                // Счёт времени записи
                timerID = setInterval(() => {
                    let minutesVal = parseInt(time.children[0].innerText),
                        secondsVal = parseInt(time.children[1].innerText);
                    if (secondsVal === 60) { minutesVal++; secondsVal = 0; };
                    if (minutesVal === 60) media.stop();
                    secondsVal++;
                    time.innerHTML = `<span id="minutes">${minutesVal < 10 ? '0' + minutesVal : minutesVal
                    }</span>:<span id="seconds">${secondsVal < 10 ? '0' + secondsVal : secondsVal}</span>`;
                }, 1000);
            });
            media.addEventListener('dataavailable', el => chunks.push(el.data));
            media.addEventListener('stop', () => {
                d.getElementById('preview') && d.getElementById('preview').remove();
                stream.getTracks().forEach(track => track.stop());
            });
            media.start(10);
        })
        .catch(console.error);
    }

    acceptBtn.addEventListener('click', () => spec_controlsScript(true));
    deniedBtn.addEventListener('click', () => spec_controlsScript(false));

    audioBtn.addEventListener('click', () => controlsScript(false));
    videoBtn.addEventListener('click', () => controlsScript(true));

}