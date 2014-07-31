$(document).ready(function() {
    updateDB();
    updateChart();
});

function updateDB() {
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
};

var chart_data = [];

function updateChart() {
    $.getJSON("/api/temp", function(data) {
        $("#chartContainer").removeClass("chartContainer")
        log = "";
        if (data.length > 0) {
            $.each(data, function(key, val) {
                chart_data.push({
                    time: val[":date"]["^t"] * 1000,
                    value: val[":reading"]
                });

            });
            temp_holder = [];

            Morris.Area({
                element: 'chartContainer',
                data: chart_data,
                xkey: 'time',
                ykeys: ['value'],
                labels: ['Temperture'],
                hoverCallback: function(index, options, default_content, row) {
                    return default_content.replace(row["value"], row["value"] + "°C");
                },
                hideHover: 'auto',
                lineWidth: 1,
                pointSize: 5,
                lineColors: ['#4a8bc2'],
                fillOpacity: 0.5,
                smooth: true
            });
        } else {
            $("#no-sales-alert").show();
        };
    });
};