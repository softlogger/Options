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
    var regPrice = jsonQuoteObject["regularMarketPreviousClose"];
    var postMktPrice = jsonQuoteObject["postMarketPrice"];




    //  alert(shorty);
    $("#shortNameId").html("<h4>" + shorty + "</h4>");
    $('#pricesId').html("<h6>Last Close: " + regPrice + "        Post Market: " + postMktPrice + " </h6>");
    $("#bidAskId").html("<h6> Bid: " + bid + "          Ask: " + ask + " </h6>");





    loadExpDates();
    //$("#searchButton").on("click", function (e) {
    //    //e.preventDefault();
    //    var tickerName = $("#ticker").val();
    //    //alert(tickerName);
    //    // $("#result").load('/Home/ExpVC', { tickerName: tickerName });
    //    $.get('Home/Temp', { tickerName: tickerName });
    //});

    var obj = jsonStatements["2016"];
    var inc_statement = obj["income_statement"];
    var opr_rev = inc_statement["operatingrevenue"];
    var grs_prft = inc_statement["totalgrossprofit"];
    var end_date = inc_statement["end_date"];

    $("#statementId").html("<h6> Opr Rev: " + opr_rev + " Gross Profit: " + grs_prft + "End Date: " + end_date + " </h6>");

    var obj2 = jsonStatements["2015"];
    var inc_statement2 = obj2["income_statement"];
    var opr_rev2 = inc_statement2["operatingrevenue"];
    var grs_prft2 = inc_statement2["totalgrossprofit"];
    var end_date2 = inc_statement2["end_date"];

    $("#statementId").html("<h6> Opr Rev: " + opr_rev2 + " Gross Profit: " + grs_prft2 + "End Date: " + end_date2 + " </h6>");
})


/*

{"2016":{"income_statement":"{\"operatingrevenue\":\"12215757000.0\",\"totalrevenue\":\"12215757000.0\",
\"operatingcostofrevenue\":\"7639407000.0\",\"totalcostofrevenue\":\"7639407000.0\",\"totalgrossprofit\":
\"4576350000.0\",\"sgaexpense\":\"3441140000.0\",



*/


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
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['impliedVolatility'] + "</td>");

    console.log('outta option quotes');

    loadHistoricalLowPrices();
}

function loadHistoricalLowPrices() {
    //historicalPricessId
    //var historicalPricesDict = 

    $('#historicalPricessId').empty();
    $('#historicalPricessId').append('<thead><tr></thead></tr>');
    $('#historicalPricessId').append('<tbody><tr></tbody></tr>');

    for (var key in historicalPrices) {
        if (historicalPrices.hasOwnProperty(key)) {
            $('#historicalPricessId > thead > tr').append("<td>" + key + "</td>");

            $('#historicalPricessId > tbody > tr').append("<td>" + historicalPrices[key] + "</td>");
        }

    }


    loadStatements();
}

function loadStatements() {
    var fiscalYear = jsonFiscalYears;

    $("#fiscalYearsId").empty;

    $('#fiscalYearsId').empty();
    $('#fiscalYearsId').append('<thead><tr></thead></tr>');
    $('#fiscalYearsId > thead > tr').append("<td>" + "" + "</td>");
    $('#fiscalYearsId').append('<tbody><tr></tbody></tr>');
    $('#fiscalYearsId > tbody > tr').append("<td>" + "" + "</td>");

    for (var key in fiscalYear) {
        if (fiscalYear.hasOwnProperty(key)) {
            $('#fiscalYearsId > thead > tr').append("<td>" + key + "</td>");

            $('#fiscalYearsId > tbody > tr').append("<td>" + fiscalYear[key] + "</td>");
        }

    }


   
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