$(function () {

    $('#favorite-add').on('submit', function(e) {
        e.preventDefault();

        $(".btn-favorite-add").addClass("btn-readonly");

        let form = $(e.target);
        let data = form.find(":input").serializeArray();
        $.ajax({
            url: form.attr('action'),
            method: form.attr('method'),
            data: data,
            success() {
                console.info("Success");
            },
            complete() {
                let currentData = form.find(":input").serializeArray();
                // We must make sure that the form didn't change
                if (JSON.stringify(data)=== JSON.stringify(currentData)) {
                    $(".btn-favorite-add").removeClass("btn-readonly");
                }
            }
        });
    });

});