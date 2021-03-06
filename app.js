import './style.scss';

'use strict';

if (process.env.NODE_ENV === 'production') {
    console.log('FlipCounterJs production mode.');
}

let document = window.document;
let defaults = {
    step: 1,
    speed: 0,
    minDigits: 4,
    start: 0,
    size: 'sm',
    mode: 'up'
};
let extend = function (target, defaults) {
    for (let p in defaults) {
        if ((!target.hasOwnProperty(p)))
            target[p] = defaults[p];
    }
    return target;
};

export default class FlipCounterJs {
    constructor(element, options) {
        this.element = element;
        if (!options) {
            options = {};
        }
        this.options = extend(options, defaults);
        this.counter = this.options.start;
        this.init();
        if (this.options.speed > 0) {
            if (this.options.speed < 500) {
                this.options.speed = 500;
                console.log('[FlipCounterJs] The speed can\'t be quicker than 500ms, it\'s automatically adjusted.');
            }
            (function (self) {
                var timer = setInterval(function () {
                    self.update(self.options.step)
                }, self.options.speed);
                self.fcTimer = timer;
            })(this);
        }
    }

    init() {
        let container = this.element;
        let fc = document.createElement('div');
        fc.classList.add('fc');
        fc.classList.add('fc-size-' + this.options.size);
        container.innerHTML = '';
        container.appendChild(fc);
        this.numberArray = numberToArray(this.counter);
        this.numberArray = fillingZeros(this.options.minDigits, this.numberArray);
        let i;
        let html = '';
        for (i = 0; i < this.numberArray.length; i++) {
            let value = this.numberArray[i];
            html += createDigitCardContainer(value, value);
        }

        fc.innerHTML = html;
    }

    update(value) {
        var mode = this.options.mode === 'down';
        if (mode && this.counter == 0) {
            clearInterval(fcTimer);
            return;
        }

        let val = value;
        if (!val || isNaN(val)) {
            val = this.options.step;
        }
        let newCounter;
        if (mode) {
            newCounter = parseInt(this.counter) - parseInt(val) >= 0 ? parseInt(this.counter) - parseInt(val) : 0;
        } else {
            newCounter = parseInt(this.counter) + parseInt(val);
        }

        let newNumberArray = numberToArray(newCounter);
        newNumberArray = fillingZeros(this.options.minDigits, newNumberArray);
        let oldNumberArray = this.numberArray;
        let fc = this.element.getElementsByClassName('fc')[0];
        let i = newNumberArray.length - 1;
        while (i >= 0) {

            if (i > oldNumberArray.length - 1) {
                let v = newNumberArray[i];
                fc.innerHTML += createDigitCardContainer(v, v);
            } else if (newNumberArray[i] != oldNumberArray[i]) {
                let dcc = fc.getElementsByClassName('dcc')[i];
                let newFront = dcc.querySelector('.front .digit');
                let oldBack = dcc.querySelector('.back .digit');
                newFront.innerHTML = newNumberArray[i];
                let newBack = dcc.querySelector('.perspective-wrapper .switchover .back .digit');
                let oldFront = dcc.querySelector('.perspective-wrapper .switchover .front .digit');
                newBack.innerHTML = newNumberArray[i];
                dcc.classList.add('animate');
                (function (i, fc, dcc) {
                    setTimeout(function () {
                        fc.replaceChild(parseDom(createDigitCardContainer(newNumberArray[i], newNumberArray[i])), dcc);
                    }, 400)
                })(i, fc, dcc);
            }
            i--;
        }
        this.counter = newCounter;
        this.numberArray = newNumberArray;
    }
}

function numberToArray(number) {
    if (isNaN(number)) {
        return []
    }
    return number.toString().split('').reverse();
}

function createDigitCardContainer(oldVal, newVal) {
    return '<div class="dcc">\n' +
        '        <div class="tile front"><span class="digit">' + newVal + '</span></div>\n' +
        '        <div class="hinge"></div>\n' +
        '        <div class="tile back"><span class="digit">' + oldVal + '</span></div>\n' +
        '        <div class="perspective-wrapper">\n' +
        '            <div class="switchover">\n' +
        '                <div class="tile front"><span class="digit">' + oldVal + '</span></div>\n' +
        '                <div class="tile back"><span class="digit">' + newVal + '</span></div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>';
}

function parseDom(html) {
    let temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.childNodes[0];
}

function fillingZeros(minDigits, numberArray) {
    let diff = minDigits - numberArray.length;
    while (diff > 0) {
        numberArray.push('0');
        diff--;
    }
    return numberArray;
}

(window => {
    let elements = window.document.querySelectorAll('[data-flip-counter-js]');
    for (let el of elements) {
        let options = {};
        for (let key of Object.keys(defaults)) {
            var attrName = 'data-fc-' + key;
            if (el.hasAttribute(attrName)) {
                options[key] = el.getAttribute(attrName);
            }
        }
        new FlipCounterJs(el, options);
    }
})(window);