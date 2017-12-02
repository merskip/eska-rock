
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
    let element = $.parseHTML(content);
    $(document.body).append(element);
    $(element).initModal().showModal();
}
