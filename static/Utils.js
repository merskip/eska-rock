$.fn.addClassForAnimation = function (className, onComplete) {
    $(this).addClass(className).animationEnd(() => {
        $(this).removeClass(className);

        if (onComplete !== undefined) {
            onComplete();
        }
    });
};

$.fn.animationEnd = function (callback) {
    $(this).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", callback);
};

$.fn.disableUserInteraction = function () {
    $(this).css("pointer-events", "none");
};

$.fn.enableUserInteraction = function () {
    $(this).css("pointer-events", "");
};