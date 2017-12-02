$.fn.initModal = function () {

    $(this).find(".radio-modal-close").click(function () {
        $(this).closest(".radio-modal").dismissModal();
    });

    let modal = $(this).hasClass("radio-modal") ? $(this) : $(this).find(".radio-modal");
    modal.click(function (e) {
        let target = $(e.target);
        let isInsideContent = target.hasClass("radio-modal-content")
            || target.parents(".radio-modal-content").length !== 0;

        if (!isInsideContent) {
            $(this).dismissModal();
        }
    });

    return this;
};

$.fn.showModal = function () {
    if ($(this).hasClass("radio-modal")) {
        $(this).addClassForAnimation("radio-modal-show-anim");
    }
    return this;
};

$.fn.dismissModal = function () {
    if ($(this).hasClass("radio-modal")) {
        $(this).addClassForAnimation("radio-modal-hide-anim", () => {
            $(this).remove();
        });
    }
    return this;
};
