var selectedId;

function createItem(e, tags) {
  var i = e + 1;
  var type = tags[i] ? "data-type='" + tags[i] + "'" : "";
  return (
    "<div class='menu__option' data-index='" +
    i +
    "' " +
    type +
    ">" +
    "<div class='menu__option_inner'></div></div>"
  );
}

function createEnterItem() {
  return (
    '<div class="menu__option"> ' +
    '<div class="menu__option_inner menu__option_enter"></div>' +
    "</div>"
  );
}

function createItems() {
  var tags = {
    1: "1_MB",
    8: "3_TZ",
    10: "1_HS",
    14: "4_BQL",
    17: "5_JT",
    20: "2_PJ",
  };
  var tagNum = 27;
  var itemStr = "";
  for (var i = 0; i < tagNum; i++) {
    itemStr += createItem(i, tags);
  }
  $("#control .menu__wrapper").html(itemStr);
  $("#control .menu__wrapper .menu__option").bind("click", function () {
    control.update($(this).attr("data-index"));
  });
  var enter = $(createEnterItem()).bind("click", function () {
    control.enter();
  });
  $("#control .menu__wrapper").append(enter);
  return itemStr;
}

function Control() {
  var control = $(
    "<div id='control'>" +
      "<div id='control_header__input'></div>" +
      "<div id='control_content__menu'>" +
      "<div class='menu__wrapper'></div>" +
      "</div>" +
      "</div>"
  );
  $("body").append(control);
  createItems();
  this.status = 1;
  this.selectedKey;
}

Control.prototype.show = function (options) {
  options && (this.options = options);
  var t = this;
  $("#control").animate(
    { top: $(window).height() - 90 + "px" },
    300,
    function () {
      $("#control_header__input").bind("click", function () {
        t.onClickCallback();
        t.open();
      });
    }
  );
};

Control.prototype.hide = function (e) {
  var t = this;
  $("#control").animate(
    { top: $(window).height() + 3 + "px" },
    1000,
    function () {
      e && e();
      t.unbindClickCallback();
    }
  );
};

Control.prototype.open = function (e) {
  this.options && this.options.onOpen && this.options.onOpen();
  $("#control").animate({ top: $(window).height() / 2 - 217 + "px" }, 300);
};

Control.prototype.close = function (callback) {
  var t = this;
  t.hide(function () {
    callback && callback();
    t.clear();
  });
};

Control.prototype.onClickCallback = function () {
  var t = this;
  t.onKeydown();
};

Control.prototype.unbindClickCallback = function () {
  var t = this;
  t.unbindKeydown();
};

Control.prototype.update = function (e) {
  this.selectedKey = e;
  this.addEmoJi(e);
};

Control.prototype.clear = function () {
  this.update();
};

Control.prototype.addEmoJi = function (e) {
  if (e) {
    $("#control_header__input").html(
      '<span class="input_item emoji_' + e + '"></span>'
    );
  } else {
    $("#control_header__input").html("");
  }
};

Control.prototype.onKeydown = function (e) {
  var t = this;
  $("document").bind("keydown", function (e) {
    t.keydown(e);
  });
};

Control.prototype.unbindKeydown = function (e) {
  $("document").unbind("keydown");
};

Control.prototype.keydown = function (e) {
  var t = this;
  if (Number(e.keyCode) === 13) {
    t.enter();
  }
  if (Number(e.keyCode) === 8) {
    t.removeKey();
  }
};

Control.prototype.removeKey = function (e) {
  this.update();
};

Control.prototype.enter = function (e) {
  var t = this;
  if (this.selectedKey && selectedId === standalone[this.selectedKey]) {
    t.inputSuccess();
  } else {
    t.inputError();
  }
};

Control.prototype.inputSuccess = function (e) {
  var t = this;
  this.close(function () {
    t.options && t.options.onSuccess && t.options.onSuccess();
  });
};

Control.prototype.inputError = function (e) {
  $("#control_header__input")
    .addClass("animate__animated animate__shakeX")
    .bind("webkitAnimationEnd", function () {
      $(this).removeClass("animate__animated animate__shakeX");
    });
};

var zIndex = 1;

var levels = ["1_HS", "2_PJ", "3_TZ", "4_BQL", "5_JT", "6_MB"];

var standalone = {
  1: "6_MB",
  8: "3_TZ",
  10: "1_HS",
  14: "4_BQL",
  17: "5_JT",
  20: "2_PJ",
};

// 获取图片集
function getImageUrls(id) {
  var imageUrls = [];
  for (var i = 0; i < 16; i++) {
    imageUrls.push("./image/" + id + "_" + (i + 1) + ".jpg");
  }
  return imageUrls;
}

// 步骤三 选中节点
var cNode;

function center() {
  return [window.innerWidth / 2, window.innerHeight / 2];
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
// 随机定位
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
// 渲染单张开片
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
// 渲染多张卡片
function renderCds(id) {
  positions = [];
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

var control;

// 返回
var Back = (function () {
  var backs = [];
  var ui;

  function back() {
    var t = this;
    ui = $(
      '<div id="back" class="action" style="display: none"><span>back</span></div'
    ).bind("click", function () {
      if (backs.length > 0) {
        t.carry();
      } else {
        $(this).hide();
      }
    });
    $(".actions").append(ui);
  }

  return (
    (back.prototype = {
      constructor: back,
      add: function (e) {
        backs.push(e);
        ui.show();
      },
      carry: function (e) {
        if (backs[backs.length - 1]) {
          backs[backs.length - 1]();
          backs = backs.slice(0, backs.length - 1);
        }
        if (backs.length === 0) {
          ui.hide();
        } else {
          ui.show();
        }
      },
      hide: function () {
        ui.hide();
      },
      clear: function () {
        backs = [];
      }
    }),
    back
  );
})();
(function () {
  var step1 = $(".step_one"),
    step2 = $(".step_two"),
    step3 = $(".step_three");

  control = new Control();
  back = new Back();
  // 返回
  var backFns = [];
  // 选中关卡id
  // 记录选择卡片选择位置
  var save_position_x, save_position_y;
  // 创建关卡
  function createLevels() {
    // 点击关卡
    for (var i = 0; i < levels.length; i++) {
      var levelItem = $("<li data-step=1 id='" + levels[i] + "'></li>");
      levelItem
        .html(
          '<div class="card"><div class="circle1 center"></div><div class="circle2 center"></div><div class="circle3 center"></div><div class="circle4 center"></div><div class="description"><p>L</p><p>E</p><p>V</p><p>E</p><p>L</p><p>' +
            (i + 1) +
            "</p></div></div>"
        )
        .click(function (e) {
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
        });
      step2.find(".levels").append(levelItem);
    }
  }
  // 启动 游戏
  $("#start").click(function () {
    $("#start .card")
      .addClass("animate__animated animate__rotateOut")
      .on("webkitAnimationEnd", function () {
        $(this).removeClass("animate__animated animate__rotateOut");
        step1.hide(0, function () {
          step2Fn();
        });
      });
  });

  // 步骤二
  function step2Fn() {
    createLevels();
    step2.stop().fadeIn("slow");
  }

  // 步骤二结束
  function step2AnimationEnd(itemNode) {
    var n = $(itemNode).addClass("magictime vanishOut");
    step2
      .addClass("animate__animated animate__fadeOut")
      .bind("webkitAnimationEnd", function () {
        n.removeClass("magictime vanishOut");
        $(this).removeClass("animate__animated animate__fadeOut")
          .unbind("webkitAnimationEnd")
          .hide(0, function () {
            var id = n.parent().attr("id");
            step3Fn(id);
            back.add(function () {
              step3
                .addClass("animate__animated animate__fadeOut")
                .bind("webkitAnimationEnd", function () {
                  var t = $(this)
                  t.hide(0, function () {
                    // 清空已存在定位
                    positions = [];
                    t.html("").removeClass("animate__animated animate__fadeOut").unbind("webkitAnimationEnd");
                    step2.show();
                  });
                });
            });
          });
      });
  }
  // 步骤三
  function step3Fn(id) {
    selectedId = id;
    step3.show();
    $(".step_three .cds").remove();
    var cds = renderCds(id);
    step3.append(cds);
    $(cds)
      .addClass("animate__animated animate__fadeIn")
      .bind("webkitAnimationEnd", function () {
        $(this)
          .removeClass("animate__animated animate__fadeIn")
          .unbind("webkitAnimationEnd");
      })
      .find(".cd")
      .click(function (e) {
        var cd = getCdNode(e.target);
        if (!cd) return;
        save_position_x = $(cd).position().left;
        save_position_y = $(cd).position().top;
        var cPosition = center();
        $(cd)
          .css({
            width: "300px",
            height: "300px",
            borderRadius: 0,
            left: cPosition[0] - 150 + "px",
            top: cPosition[1] - 150 + "px",
            transform: `rotateY(180deg)`,
            zIndex: zIndex,
          })
          .siblings()
          .addClass("animate__animated animate__fadeOut")
          .bind("webkitAnimationEnd", function () {
            $(this)
              .hide()
              .removeClass("animate__animated animate__fadeOut")
              .unbind("webkitAnimationEnd");
          });
        zIndex++;
        cNode = cd;
        // 输入框弹出1
        control.show({
          onOpen: function () {
            step3.hide();
            back.add(function () {
              control.show();
              setTimeout(function () {
                step3.stop().fadeIn('slow');
              }, 500);
            });
          },
          onSuccess: function () {
            step3.hide(0, function () {
              window.img3d.setTo(selectedId);
            });
            back.add(function () {
              back.clear();
              $("#img").stop().fadeOut("slow", function () {
                step2.show();
              });
            });
          },
        });
        // 添加返回
        back.add(function () {
          control.close();
          $(cd)
          .css({
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            left: save_position_x + "px",
            top: save_position_y + "px",
            transform: `rotateY(0deg)`,
            zIndex: undefined,
          })
          .siblings()
          .addClass("animate__animated animate__fadeIn")
          .show()
          .bind("webkitAnimationEnd", function () {
            $(this)
              .removeClass("animate__animated animate__fadeIn")
              .unbind("webkitAnimationEnd");
          });
        });
      });
  }
  window.img3d.init();
})();
