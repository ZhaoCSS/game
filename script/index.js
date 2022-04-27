var imgs = ["./image/1.jpg"];

var cNode;

// 图片容器
var cds = document.querySelectorAll(".cds")[0];

// 输入控制器
var control = document.getElementById('control');

// 输入框
var input = document.getElementById('control_header__input');

function center() {
    return [window.innerWidth / 2, window.innerHeight / 2];
}
function randomPosition() {
    return [window.innerWidth / 2, window.innerHeight / 2];
}
function renderCd(url) {
    var cd = document.createElement("div");
    cd.className = "cd";
    // 定位
    var position = randomPosition();
    cd.style.left = position[0] + "px";
    cd.style.top = position[1] + "px";
    var cdFront = document.createElement("div");
    cdFront.className = "cd-face cd-front";
    var cdBack = document.createElement("div");
    cdBack.className = "cd-face cd-back";
    cdBack.style.backgroundImage = "url(" + url + ")";
    cd.appendChild(cdFront);
    cd.appendChild(cdBack);
    // 旋转
    cd.addEventListener("click", function (e) {
        cNode = cd;
        step1();
    });
    return cd;
}
function renderCds() {
    for (var i = 0; i < imgs.length; i++) {
        cds.appendChild(renderCd(imgs[i]));
        cds.classList.add("showCds");
    }
}

// step 展示
function step1() {
    // 光碟
    cNode.classList.add("active");
    var cPosition = center();
    cNode.style.left = cPosition[0] + "px";
    cNode.style.top = cPosition[1] + "px";
    control.classList.add('control_stop_one');
}
// step 输入
function step2() {
    input.classList.add('focus');
    control.classList.add('control_stop_two');
    cds.classList.remove('showCds');
    cds.classList.add('hideCds')
}
// step 全部展示
function step3() { }

renderCds();

// 控制器输入框
input.addEventListener('click', function () {
    step2();
});
