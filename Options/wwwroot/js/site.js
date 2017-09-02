// Write your Javascript 

$(document).ready(function () {

    // alert("In site.js");

    $('#ticker').focus();

    $(document).bind('keypress', function (e) {
        if (e.keyCode === 13) {
            $("#searchTickerBtn").trigger('click');
        }
    });

    var shorty = jsonQuoteObject["shortName"];
    var bid = jsonQuoteObject["bid"];
    var ask = jsonQuoteObject["ask"];
    //  alert(shorty);
    $("#shortNameId").html("<h4>" + shorty + "</h4>");
    $("#bidAskId").html("<h6> Bid: " + bid + "          Ask: " + ask + " </h6>");
   

    loadExpDates();
    //$("#searchButton").on("click", function (e) {
    //    //e.preventDefault();
    //    var tickerName = $("#ticker").val();
    //    //alert(tickerName);
    //    // $("#result").load('/Home/ExpVC', { tickerName: tickerName });
    //    $.get('Home/Temp', { tickerName: tickerName });
    //});
})
function loadExpDates() {
    var ele = '#expDateId';
    //1503619200,1518739200,1547769600
    console.log(jsonDates);
    console.log(jsonDates[0]);
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
    $(ele).empty();
    var quote = jsonQuoteObject['bid'];
    for (var i = 0; i < strikes.length; i++) {
        $(ele).append("<option value='" + strikes[i] + "'>" + strikes[i] + "</option>");
    }

    var highStrike = 0;
    for (var i = 0; i < strikes.length; i++) {
        if (strikes[i] > quote) {
            highStrike = strikes[i];
            break;
        }
    }
    //$('#strikeId option[value=' + highStrike + ']').prop('selected', 'selected');
    $('#strikeId').val(highStrike);
    loadOptionQuotes();
}

/*
    <td > Last Trade</td >
    <td>Last Price</td>
    <td>Bid</td>
    <td>Ask</td>
    <td>Change</td>
    <td>Volume</td>
    <td>Open Int</td>
        <td>Imp Vltylty</td>
*/

function loadOptionQuotes() {
    console.log("in option quotes");
    var expDateVal = $('#expDateId').val();

    //For text values: ('#expDateId option:selected').text()

    var expDict = jsonContainer[expDateVal];
    var strikeVal = $('#strikeId').val();
    var strikeDict = expDict[strikeVal];

    $('#quoteTableId').empty();
    $('#quoteTableId').append('<thead><tr></thead></tr>');
    $('#quoteTableId').append('<tbody><tr></tbody></tr>');
    $('#quoteTableId > thead > tr').append("<td>" + "Last Trade" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Last Price" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Bid" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Ask" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Change" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Volume" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Open Int" + "</td>");
    $('#quoteTableId > thead > tr').append("<td>" + "Imp Volatility" + "</td>");

    $('#quoteTableId > tbody > tr').append("<td>" + EpochToDate(strikeDict['lastTradeDate']) + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['lastPrice'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['bid'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['ask'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['change'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['volume'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['openInterest'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['impliedVolatility']  + "</td>");

    console.log('outta option quotes');
}

function searchTicker() {
    console.log("In search ticker");
    var tickerName = $("#ticker").val();
    console.log(tickerName);
    console.log(window.location.origin);
    console.log(window.location.href);
    var isHome = window.location.href.includes('Home');
    var url = "";
    if (isHome === true) {
        url = 'Analysis?tickerName=' + tickerName;
    }
    else {
        url = 'Home/Analysis?tickerName=' + tickerName;
    }

    console.log(url);

    window.location.href = url;
    //$(location).removeAttr('href');
    //$(location).attr('href', url);
    //$.get('Home/Analysis', { tickerName: tickerName });
    //$.get('Home/Temp', { ticker: ticker }, function (data) {
    //    $('#displayId').html(data);
    //});
    //loadExpDates();
    //  $.get('Home/Temp', { tickerName: tickerName });
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