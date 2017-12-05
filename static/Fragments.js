
$(function () {
    $("[data-fragment-url]").click(function () {
        $(this).disableUserInteraction();

        let url = $(this).attr("data-fragment-url");
        loadFragment(url, callbackAppendToBody, () => {

            $(this).enableUserInteraction();
        });
    });
});

function loadFragment(url, successCallback, completeCallback) {
    $.ajax({
        type: "GET",
        url: url
    }).done(successCallback).always(completeCallback)
}

function callbackAppendToBody(content) {
    let element = $.parseHTML(content, document, true);
    $(document.body).append(element);
    $(element)
        .initDropdownMenu()
        .initModal().showModal();
}
