$(function () {

    let favoriteControl = $("#favorite-control");

    favoriteControl.click(function(e) {
        if (favoriteControl.has("favorite-add")) {
            $(".btn-favorite-add").addClass("btn-readonly");

            $.ajax({
                method: "POST",
                url: "api/favorites",
                data: {
                    songTitle: favoriteControl.attr("data-song-title")
                },
                success(response) {
                    console.log(response);
                    let id = response['_id'];
                    debugger;
                    console.info("Success");
                },
                complete() {
                    // let currentData = form.find(":input").serializeArray();
                    // // We must make sure that the form didn't change
                    // if (JSON.stringify(data) === JSON.stringify(currentData)) {
                    //     $(".btn-favorite-add").removeClass("btn-readonly");
                    // }
                }
            });
        }
    });

});