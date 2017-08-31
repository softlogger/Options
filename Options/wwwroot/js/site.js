// Write your Javascript 

$(document).ready(function () {

    $(alert("wtf"));

    $('#ticker').focus();

    $(document).bind('keypress', function (e) {
        if (e.keyCode == 13) {
            $("#searchButton").trigger('click');
        }
    });

    //$("#searchButton").on("click", function (e) {
    //    //e.preventDefault();
    //    var tickerName = $("#ticker").val();
    //    //alert(tickerName);
    //    // $("#result").load('/Home/ExpVC', { tickerName: tickerName });
    //    $.get('Home/Temp', { tickerName: tickerName });
    //});
})

function searchTicker() {
    var ticker = $("#ticker").val();
    //alert(tickerName);
    // $("#result").load('/Home/ExpVC', { tickerName: tickerName });
    $.get('Home/Temp', { ticker: ticker }, function (data) {
        $('#displayId').html(data);
    });
    loadExpDates();
  //  $.get('Home/Temp', { tickerName: tickerName });
}

function loadExpDates() {
    var ele = '#expDateId';
    //1503619200,1518739200,1547769600
    console.log(jsonDates);
    $(ele).empty();
    for (var i = 0; i < jsonDates.length; i++) {
        $(ele).append("<option value='" + jsonDates[i] + "'>" + EpochToDate(jsonDates[i]) + "</option>")
    }
    var finalDateValue = jsonDates[jsonDates.length - 1];
    console.log(finalDateValue);
    $('#expDateId option[value=' + finalDateValue + ']').prop('selected', 'selected');
    loadStrikes();
}

function loadStrikes() {
    var initial = true;
    var ele = '#strikeId';
    var selectedDate = $("#expDateId").find(":selected").val();
    var strikes = jsonStrikes[selectedDate];
    alert(strikes);
    $(ele).empty();
    for (var i = 0; i < strikes.length; i++) {
        $(ele).append("<option value='" + strikes[i] + "'>" + strikes[i] + "</option>")
    }
    
    $("#shortNameId").html("<h4>" + jsonQuoteObject["shortName"] + "</h4>");
}


function theButt(e) {
    alert(e);
    alert($('#strike').val());
    alert($("#finalDate").val());
}

function Testy(dates) {
    alert("InTesty");
    //$('#hatch ul').append('<li><a href="#" data-maker="'+json.Hatch[index].maker+'" data-price="'+json.Hatch[index].price+'">'+json.Hatch[index].name+'</a></li>');
    $('#expDateId').empty();
    for (var i = 0; i < dates.length; i++) {
        $('#expDateId').append("<option value='" + dates[i] + "'>" + EpochToDate(dates[i]) + "</option>");
    }

}

function Epoch(date) {
    return Math.round(new Date(date).getTime() / 1000.0);
}

function EpochToDate(epoch) {
    return new Date(epoch * 1000).toLocaleString();
}

function UpdateStrikes() {
    var expDate = $('#expDateId').val();
    alert(expDate);
    var strikes = strks[expDate];
    console.log(strikes);
    $('#strikeId').empty();
    for (var i = 0; i < strikes.length; i++) {
        $('#strikeId').append("<option value='" + strikes[i] + "'>" + strikes[i] + "</option>");
    }

}

function updateCall() {
    alert('IN update call');
}

function backup() {


    $('#ticker').focus();

    $("#strike").on("change", function (e) {
        var id = $(this).find(":selected").val();
        alert(id);
    });

    $("#finalDate").on("change", function (e) {
        e.preventDefault();
        alert($(this).find(":selected").val());
        alert($(this).find(":selected").text());
    });

    $(".theButton").on("click", function (e) {
        // e.preventDefault();
        //  alert($("#strike").find(":selected").val());
        alert(dates);
        alert('wtf');
        var date = $("#finalDate").find(":selected").text();
        alert(date);
        // $("#tempLoad").load('static/roothtmlpage.html');
        // $("#tempLoad").load('/Home/ExpVC');
    });



    $(document).bind('keypress', function (e) {
        if (e.keyCode == 13) {
            $("#searchButton").trigger('click');
        }
    });


    $('.vote-up').click(function (e) {

        e.preventDefault();
        var id = $(this).data('productid')
        $.post('/Home/Vote', { id: id }, function (data) {
            $('#surveyWidget').html(data);
        })
    })

    //$('#searchButton').click(function (e) {
    //    e.preventDefault();
    //    var tickerName = $("#ticker").val();
    //    $.post('/Home/ExpVC', { tickerName: tickerName }, function (data) {
    //        alert(data);
    //        $("#expirationWidget").html(data);
    //    });
    //})


    $("#searchButton").on("click", function (e) {
        //e.preventDefault();
        var tickerName = $("#ticker").val();
        //alert(tickerName);
        // $("#result").load('/Home/ExpVC', { tickerName: tickerName });
        $.get('Home/ExpVC', { tickerName: tickerName }, function (data) {

            $('#expirationWidget').html(data);
        });
    });

}



//$(document).ready(function () {
            //    $('.vote-up').click(function (e) {
            //        e.preventDefault();
            //        var id = $(this).data('productid')
            //        $.post('/Home/Vote', { id: id }, function (data) {
            //            $('#surveyWidget').html(data);
            //        })
            //    })
            //})