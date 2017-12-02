
$(function () {
    $("[data-fragment-url]").click(function () {
        let url = $(this).attr("data-fragment-url");
        loadFragment(url, callbackAppendToBody);
    });
});

function loadFragment(url, callback) {
    $.ajax({
        type: "GET",
        url: url,
        success: (content) => {
            callback(content);
        }
    })
}

function callbackAppendToBody(content) {
    $(document.body).append(content);
    initModals();
}

// TODO: Move in separated file
function initModals() {

    $(".radio-modal-close").click(function () {
        $(this).closest(".radio-modal").remove();
    });
    
    $(".radio-modal").click(function (e) {
        let target = $(e.target);
        let isInsideContent = target.hasClass("radio-modal-content")
            || target.parents(".radio-modal-content").length !== 0;

        if (!isInsideContent) {
            $(this).remove();
        }
    });
}
