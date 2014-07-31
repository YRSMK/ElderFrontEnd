$(document).ready(
    $.getJSON('/api/getfiles/dropbox', function(data) {
        $.each(data, function(key, val) {
            if (data[":status"] == "failed") {} else {
                $("#db_sign_in").hide()
                $("#images").append("<div><img src='" + val["url"] + "'/></div>")
            };
        })
        $('.images').slick({
            dots: true,
            infinite: true,
            speed: 500,
            fade: true,
            slide: '> div',
            cssEase: 'linear'
        });

    })
);