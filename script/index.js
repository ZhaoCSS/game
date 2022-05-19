var zIndex = 1;

var levels = [
  '1_HS',
  '2_PJ',
  '3_TZ',
  '4_BQL',
  '5_JT',
  '6_MB'
];

var standalone = {
  1: '6_MB',
  8: '3_TZ',
  10: '1_HS',
  14: '4_BQL',
  17: '5_JT',
  20: '2_PJ'
};

// 获取图片集
function getImageUrls(id) {
  var imageUrls = [];
  for (var i = 0; i < 16; i++) {
    imageUrls.push('./image/' + id + '_' + (i+1) + '.jpg');
  }
  return imageUrls;
}

// 步骤三 选中节点
var cNode;

function center() {
  return [window.innerWidth / 2, window.innerHeight / 2];
}

// 随机定位集合
var positions = [];

// 随机显示
function getRandomIntInclusive(min, max) {
  return Math.random() * max + min; //含最大值，含最小值
}

// 定位已存在
function positionAlreadyExists(position) {
  // 间隔10px
  var spacing = 10;
  var xs = [];
  for (var i = 0; i < positions.length; i++) {
    // console.log(positions[i][0] - position[0]);
    if (
      Math.abs(positions[i][0] - position[0]) >= 100 ||
      Math.abs(positions[i][1] - position[1]) >= 100
    ) {
      xs.push(1);
    } else {
      xs.push(2);
    }
  }
  return xs.includes(2);
}

function randomPosition(spacing) {
  // 上间距
  var pd = 50;
  var pl = 50;
  // 最大值
  var left_max = window.innerWidth - pl * 2 - spacing;
  var top_max = window.innerHeight - pd * 2 - spacing;

  var left = getRandomIntInclusive(pl, left_max);
  var top = getRandomIntInclusive(pd, top_max);
  var position = [left, top];
  if (!positionAlreadyExists(position)) {
    positions.push(position);
    return position;
  } else {
    return randomPosition(spacing);
  }
}

function renderCd(url) {
  var cd = document.createElement("div");
  cd.className = "cd";
  // 定位
  var position = randomPosition(100);
  cd.style.left = position[0] + "px";
  cd.style.top = position[1] + "px";
  var cdFront = document.createElement("div");
  cdFront.className = "cd-face cd-front card";
  cdFront.innerHTML = `
    <div class="circle1 center"></div>
    <div class="circle2 center"></div>
    <div class="circle3 center"></div>
    <div class="circle4 center"></div>
  `;
  var cdBack = document.createElement("div");
  cdBack.className = "cd-face cd-back";
  cdBack.style.backgroundImage = "url(" + url + ")";
  cd.appendChild(cdFront);
  cd.appendChild(cdBack);
  return cd;
}
function renderCds(id) {
  var cds = document.createElement("div");
  cds.className = "cds";
  var imgs = getImageUrls(id);
  for (var i = 0; i < imgs.length; i++) {
    var cd = renderCd(imgs[i]);
    cd.setAttribute("data-index", i);
    cds.appendChild(cd);
  }
  return cds;
}

(function () {
  var step1 = document.getElementsByClassName("step_one")[0];
  var step2 = document.getElementsByClassName("step_two")[0];
  var step3 = document.getElementsByClassName("step_three")[0];
  var start = document.getElementById("start");

  // 选中关卡id
  var selectedId;
  // 创建关卡
  function createLevels() {
      var levelsDom = step2.querySelector('.levels');
        // 点击关卡
      for (var i = 0; i < levels.length; i++) {
        var levelItem = document.createElement('li');
        levelItem.setAttribute("data-step", 1);
        levelItem.setAttribute("id", levels[i]);
        levelItem.innerHTML = '<div class="card"><div class="circle1 center"></div><div class="circle2 center"></div><div class="circle3 center"></div><div class="circle4 center"></div><div class="description"><p>L</p><p>E</p><p>V</p><p>E</p><p>L</p><p>'+ (i + 1) +'</p></div></div>';
        levelItem.addEventListener(
          "click",
          function (e) {
            console.log(1223123);
            if (e.target.nodeName.toLocaleUpperCase() === "P") {
              step2AnimationEnd(e.target.parentNode.parentNode);
            }
            if (
              e.target.className === "description" ||
              e.target.className === "circle4 center" ||
              e.target.className === "circle3 center" ||
              e.target.className === "circle2 center" ||
              e.target.className === "circle1 center"
            ) {
              step2AnimationEnd(e.target.parentNode);
            }
          },
          false
        );
        levelsDom.appendChild(levelItem);
      }
  }

  // 启动 游戏
  start.addEventListener(
    "click",
    function () {
      step1.classList.add("animate__animated", "animate__fadeOut");
      var card = start.getElementsByClassName("card")[0];
      card.classList.add("animate__animated", "animate__rotateOut");
      function startAnimationEnd() {
        step1.style.display = "none";
        step1.classList.remove("animate__animated", "animate__fadeOut");
        step1.classList.remove();
        card.classList.remove("animate__animated", "animate__rotateOut");
        start.removeEventListener("webkitAnimationEnd", startAnimationEnd);
        // 开启 关卡选择
        step2Fn();
      }
      start.addEventListener("webkitAnimationEnd", startAnimationEnd);
    },
    false
  );

  // 步骤二
  function step2Fn() {
    createLevels();
    step2.style.display = "block";
    // step1.classList.add("animate__animated");
    // step1.classList.add("animate__fadeIn");
  }

  // 步骤二结束
  function step2AnimationEnd(itemNode) {
    itemNode.classList.add("magictime", "vanishOut");
    step2.classList.add("animate__animated", "animate__fadeOut");
    step2.addEventListener("webkitAnimationEnd", liAnimationEnd);
    function liAnimationEnd() {
      step2.removeEventListener("webkitAnimationEnd", liAnimationEnd);
      step2.style.display = "none";
      step2.classList.remove("animate__animated", "animate__fadeOut");
      var id = itemNode.parentNode.getAttribute('id');
      step3Fn(id);
    }

    // header fadeOut
    // var header = step2.querySelectorAll(".header")[0];
    // header.classList.add("animate__animated", "animate__fadeOut");
  }

  // 获取cd节点
  function getCdNode(node) {
    if (node.className === "cd-face cd-front card") {
      return node.parentNode;
    }
    if (
      node.className === "circle4 center" ||
      node.className === "circle3 center" ||
      node.className === "circle2 center" ||
      node.className === "circle1 center"
    ) {
      return node.parentNode.parentNode;
    }
  }
  // 步骤三
  function step3Fn(id) {
    selectedId = id;
    step3.style.display = "block";
    var cds = renderCds(id);
    cds.classList.add("animate__animated", "animate__fadeIn");
    step3.appendChild(cds);
    var cdNodes = cds.querySelectorAll(".cd");
    for (var i = 0; i < cdNodes.length; i++) {
      // 旋转
      cdNodes[i].addEventListener("click", function (e) {
        var cd = getCdNode(e.target);
        if (!cd) return;
        var ind = Number(cd.getAttribute("data-index"));
        cNode = cd;
        cNode.classList.add("active");
        var cPosition = center();
        cNode.style.left = cPosition[0] - 150 + "px";
        cNode.style.top = cPosition[1] - 150 + "px";
        cNode.style.transform = `rotateY(180deg)`;
        cNode.style.zIndex = zIndex;
        zIndex++;
        for (var j = 0; j < cdNodes.length; j++) {
          if (ind !== j) {
            cdNodes[j].classList.add("animate__animated", "animate__fadeOut");
          }
        }
        function cdNodesAnimationEnd() {
          for (var j = 0; j < cdNodes.length; j++) {
            if (ind !== j) {
              cdNodes[j].classList.remove(
                "animate__animated",
                "animate__fadeOut"
              );
              cdNodes[j].style.display = "none";
            }
          }
          if (ind === 0) {
            cdNodes[1].removeEventListener(
              "webkitAnimationEnd",
              cdNodesAnimationEnd
            );
          }
          cdNodes[0].removeEventListener(
            "webkitAnimationEnd",
            cdNodesAnimationEnd
          );
          // 露出输入框
          control.classList.add("animate__animated", "animate__stepOne");
        }
        if (ind === 0) {
          cdNodes[1].addEventListener(
            "webkitAnimationEnd",
            cdNodesAnimationEnd
          );
        }
        cdNodes[0].addEventListener("webkitAnimationEnd", cdNodesAnimationEnd);
      });
    }
  }

  // 输入控制器
  var control = document.getElementById("control");
  // 输入框
  var input = document.getElementById("control_header__input");
  // 输入框是否激活
  var isActiveInput = false;
  // 输入key
  var inputKeys = [];
  // 添加emoji
  function addEmoJi(keys) {
    var items = "";
    console.log(keys);
    for (var i = 0; i < keys.length; i++) {
      items += '<span class="input_item emoji_' + keys[i] + '"></span>';
    }
    input.innerHTML = items;
  }
  // 输入key 更新
  function inputKesUpdate(keys) {
    addEmoJi(keys);
  }
  // 添加inputKey
  function addInputkey(key) {
    inputKeys.push(key);
    inputKesUpdate(inputKeys);
  }
  // 删除inputkey
  function removeInputKey() {
    inputKeys.pop();
    inputKesUpdate(inputKeys);
  }
  // 控制器输入框
  input.addEventListener(
    "click",
    function () {
      // 是否动画中
      if (control.getAnimations().length !== 0) return;
      // 激活输入框
      if (isActiveInput) return;
      isActiveInput = true;
      // 弹出输入框
      input.classList.add("focus");
      step3.classList.add("animate__animated", "animate__fadeOutUp");
      // cNode.classList.add("animate__animated", "animate__fadeOutUp");
      control.classList.add("animate__animated", "animate__stepTwo");
      function fadeIn() {
        cNode.style.display = "none";
      }
      if (cNode) {
        cNode.addEventListener("webkitAnimationEnd", fadeIn);
      }

      var menuOptions = document.getElementById("control-content__menu");
      menuOptions.addEventListener(
        "click",
        function (e) {
          if (!isActiveInput) return;
          var selectedNode;
          if (e.target.className === "menu_option") {
            selectedNode = e.target;
          }
          if (e.target.className === "menu__option_inner") {
            selectedNode = e.target.parentNode;
          }
          if (selectedNode) {
            addInputkey(selectedNode.getAttribute("data-index"));
          }
        },
        false
      );
      var enter = document.querySelector(".menu__option_enter");
      function enterFn () {
        if (!isActiveInput) return;
        if (inputKeys.length > 0 && selectedId === standalone[inputKeys[0]]) {
          inputSuccess();
        } else {
          inputError();
        }
      }
      enter.addEventListener("click", enterFn);
      // 键盘监听
      function keydown(e) {
        if (Number(e.keyCode) === 13) {
          enterFn();
        }
        if (Number(e.keyCode) === 8) {
          removeInputKey();
        }
      }
      document.addEventListener("keydown", keydown);
    },
    false
  );
  // 输入正确
  function inputSuccess() {
    // 展示图片
    control.classList.add("animate__animated", "animate__backOutDown");
  }
  // 输入错误
  function inputError() {
    input.classList.add("animate__animated", "animate__shakeX");
  }
  input.addEventListener("webkitAnimationEnd", function (e) {
    input.classList.remove("animate__animated", "animate__" + e.animationName);
  });
  control.addEventListener("webkitAnimationEnd", function (e) {
    if (e.animationName === 'stepOne') {
      control.style.top = 'calc(100% - 90px)';
    }
    if (e.animationName === 'stepTwo') {
      control.style.top = 'calc(50% - 217px)';
    }
    if (e.animationName == 'backOutDown') {
      control.style.top = 'calc(100% + 3px)';
      // 关闭
      isActiveInput = false;
      // 展示 images;
      window.img3d.init(document.getElementById('img'), getImageUrls(selectedId));
    }
    control.classList.remove("animate__animated", "animate__" + e.animationName);
  });
})();
