
$.fn.animationEnd = function (callback) {
    $(this).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", callback);
};
