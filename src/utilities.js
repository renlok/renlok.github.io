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

const $ = (cssQuery) => document.querySelector(cssQuery);