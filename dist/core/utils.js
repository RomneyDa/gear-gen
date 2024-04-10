export function rad2deg(rad) {
    return rad * 180 / Math.PI;
}
export function deg2rad(deg) {
    return deg * Math.PI / 180;
}
export function fix2(v) {
    return Math.round(100 * v) / 100;
}
export function fix6(v) {
    return Math.round(10000000 * v) / 10000000;
}
const AM = 180 / Math.PI;
export function linearToPolar(c) {
    var x = c.x, y = c.y, r, a;
    r = Math.sqrt(x * x + y * y);
    a = Math.asin(y / r) * AM;
    if (x < 0)
        a = 180 - a;
    a = (a + 360) % 360;
    return { r, a };
}
export function polarToLinear(p) {
    var r = p.r, a = p.a, x, y;
    a = ((a + 360) % 360) / AM;
    x = Math.cos(a) * r;
    y = -Math.sin(a) * r;
    return { x, y };
}
export function downloadContent(content, filename) {
    var data = new Blob([content]);
    var a = document.createElement('a');
    a.setAttribute('href', URL.createObjectURL(data));
    a.download = filename;
    a.click();
}
