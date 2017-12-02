function initModals(element) {
    element = element === undefined ? $(document.body) : $(element);

    element.find(".radio-modal-close").click(function () {
        $(this).closest(".radio-modal").remove();
    });

    let modal = element.hasClass("radio-modal") ? element : element.find(".radio-modal");
    modal.click(function (e) {
        let target = $(e.target);
        let isInsideContent = target.hasClass("radio-modal-content")
            || target.parents(".radio-modal-content").length !== 0;

        if (!isInsideContent) {
            $(this).remove();
        }
    });
}