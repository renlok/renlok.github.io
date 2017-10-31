function RNG(chance) {
    const rnd = Math.random() * 100;
    return (rnd < chance);
}

function cloneJsonObject(object) {
    return JSON.parse(JSON.stringify(object));
}
function randomArrayElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}
function flash(element) {
    let op = 1;  // initial opacity
    let fadeOut = true;
    let timer = setInterval(function () {
        if (op <= 0.1) {
            fadeOut = false;
        }
        if (op >= 1 && !fadeOut) {
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        if (fadeOut) {
            op -= op * 0.1;
        } else {
            op += op * 0.1;
        }
    }, 10);
}

const $ = (cssQuery) => document.querySelector(cssQuery);