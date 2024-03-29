$.fn.initDropdownMenu = function () {

    $(this).find(".radio-dropdown-btn").click(function () {
        let menu = $(this).parent().find(".radio-dropdown-menu");
        menu.toggleDropdownMenu(this);
    });

    return this;
};

$.fn.toggleDropdownMenu = function (btn) {
    if (this.is(":visible")) {
        this.hideDropdownMenu();
    }
    else {
        this.showDropdownMenu(btn);
    }
    $.clearTextSelection();
};

$.fn.showDropdownMenu = function (btn) {
    $.hideAllDropdownMenu();

    this.css({
            left: btn.offsetLeft - this.innerWidth() + btn.clientWidth,
            top: btn.offsetTop + btn.clientHeight
        }).show();
    
    $(window).bind("click", dismissDropdownMenu);
};

function dismissDropdownMenu(e) {
    let target = $(e.target);
    let isDropdownButton = target.hasClass("radio-dropdown-btn");
    let isDropdownMenu = target.closest(".radio-dropdown-menu").length !== 0;
    let isDropdownItem = target.closest(".radio-dropdown-menu > li").length !== 0;

    if (isDropdownItem || !(isDropdownButton || isDropdownMenu)) {
        $(".radio-dropdown-menu:visible").hideDropdownMenu();
    }
}

$.hideAllDropdownMenu = function () {
    $(".radio-dropdown-menu:visible").hideDropdownMenu();
};

$.fn.hideDropdownMenu = function () {
    this.hide();
    $(window).unbind("click", dismissDropdownMenu);
};
