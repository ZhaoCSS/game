(function () {
  // 关于
  var about = document.getElementById("about");
  about.addEventListener(
    "click",
    function () {
      about.getElementsByClassName("content")[0].style.display = "block";
    },
    false
  );
  // 菜单
  var menu = document.getElementById("menu");
  menu.addEventListener("click", function () {
    menu.getElementsByClassName("content")[0].style.display = "block";
  });
  document.body.addEventListener("click", function (e) {
    about.contains;
    if (!about.contains(e.target)) {
      about.getElementsByClassName("content")[0].style.display = "none";
    }
    if (!menu.contains(e.target)) {
      menu.getElementsByClassName("content")[0].style.display = "none";
    }
  });
})();
