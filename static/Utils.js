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
