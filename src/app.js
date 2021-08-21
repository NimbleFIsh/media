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

    const setCity = async data => localStorage['geo'] = await getCity(data); // Запись города

    function showErrCoords() {

    }

    // Проверка записи о городе
    if (!localStorage['geo']) navigator.geolocation.getCurrentPosition(setCity, err => console.error(err.message));

    function sending() {
        if (input.value !== '') {
            if (localStorage['geo']) {
                console.log('Sending...');
            } else showErrCoords();
        }
    }

    submitBtn.addEventListener('click', sending);
    d.addEventListener('keydown', key => {
        if (key.code === 'Enter') {
            key.preventDefault();
            sending();
        }
    });

    input.addEventListener('input', () => submitBtn.disabled = input.value === '');

    function hideSpecControls() {
        
    }

    function showControls() {
        
    }

    function hideControls() {
        
    }

    function showSpecContols() {
        
    }


    acceptBtn.addEventListener('click', click => {
        hideSpecControls();
        showControls();
    });

    deniedBtn.addEventListener('click', click => {
        hideSpecControls();
        showControls();
    });



    audioBtn.addEventListener('click', click => {
        hideControls();
        showSpecContols();
    });

    videoBtn.addEventListener('click', click => {
        hideControls();
        showSpecContols();
    });

}