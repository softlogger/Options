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

    //ReportUrl


    var headerName = "<h4><strong>" + shorty + "</strong><h4>";
    var headerLastClose = "Last Close:<strong> " + postMktPrice + "</strong>";
    var headerReg = "Regular:<strong> " + regPrice + "</strong>";
    var headerBid = "Bid:<strong> " + bid + "</strong>";
    var headerAsk = "Ask:<strong> " + ask + "</strong>";


    var headerReport = "<a href=" + decodeURIComponent(ReportUrl) + " target=_blank>10-K</a>"

    var headerString = headerName + " " + headerLastClose + " " + headerReg + " " + headerBid + " " + headerAsk + " " + headerReport;

    $('#headerId').html(headerString);

    //  alert(shorty);
    //$("#shortNameId").html("<h4>" + shorty  + "</h4>");
    $('#regPriceId').val(regPrice);
    $('#previousClosePriceId').val(postMktPrice);
    $("#bidId").val(bid);
    $("#askId").val(ask);





    loadExpDates();


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
Inc State "income_statement"
Revenue - totalrevenue
Ebit - totaloperatingincome
Int exp - totalinterestincome
Wt avg diluted shares - weightedavedilutedsharesos

Bal Sheet balance_sheet
Total Liab - totalliabilities
Total curr assets - totalcurrentassets

Cash Flow cash_flow
Depreciation - depreciationexpense

Self Calc


Reported Calc calculations
{
      "tag": "freecashflow",
      "value": 474483805.1
    },
{
      "tag": "ebit",
      "value": 1135210000
    },
    {
      "tag": "depreciationandamortization",
      "value": 290914000
    },
    {
      "tag": "ebitda",
      "value": 1426124000
    },
ebitda/revenue
{
      "tag": "ebitdamargin",
      "value": 0.116745
    },


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
    $('#quoteTableId > thead > tr').append("<th>" + "Last Trade" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Last Price" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Bid" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Ask" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Change" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "% Change" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Volume" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Open Int" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Imp Volatility" + "</th>");

    $('#quoteTableId > tbody > tr').append("<td>" + EpoctoLocaleString(strikeDict['lastTradeDate']) + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['lastPrice'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td id='optionBid'>" + strikeDict['bid'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['ask'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + Number(strikeDict['change']).toFixed(2) + "</td>"); //percentChange
    $('#quoteTableId > tbody > tr').append("<td>" + (Number(strikeDict['percentChange']) / 100).toFixed(2) + "%</td>")
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['volume'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['openInterest'] + "</td>");
    var impVolatility = ((Number(strikeDict['impliedVolatility']) * 100).toFixed(2)) + '%';
    $('#quoteTableId > tbody > tr').append("<td>" + impVolatility + "</td>");

    console.log('outta option quotes');

    loadHistoricalLowPrices();
}

function EpoctoLocaleString(date) {
    var date = new Date(date * 1000);
    return date.toLocaleString();
}

function loadHistoricalLowPrices() {
    //historicalPricessId
    //var historicalPricesDict = 

    $('#historicalPricessId').empty();
    $('#historicalPricessId').append('<thead><tr></thead></tr>');
    $('#historicalPricessId').append('<tbody><tr></tbody></tr>');

    for (var key in historicalPrices) {
        if (historicalPrices.hasOwnProperty(key)) {

            //2014
            //54.96 2014-06-30

            var priceAndDate = historicalPrices[key];
            var priceAndDateArray = priceAndDate.split(" ");
            var theDate = priceAndDateArray[1];
            var Price = Number(priceAndDateArray[0]);

            var date = new Date(theDate);
            var month = date.getMonth() + 1;

            //$('#historicalPricessId > thead > tr').append("<th>" + key + "</th>");

            //$('#historicalPricessId > tbody > tr').append("<td>" + historicalPrices[key] + "</td>");

            $('#historicalPricessId > thead > tr').append("<th>" + month + " / " + key + "</th>");

            $('#historicalPricessId > tbody > tr').append("<td>" + Price.toFixed(2) + "</td>");

        }

    }


    loadStatementTable();
}





function loadStatementTable() {

    var firstArray = JsonStatementTable[0];

    $('#statementTableId').empty();

    $('#statementTableId').append('<thead></thead>');
    $('#statementTableId').append('<tbody></tbody>');

    $('#statementTableId > thead').append('<tr></tr>');

    for (var i = 0; i < firstArray.length; i++) {
        var tableHeaderColVal = firstArray[i];
        $('#statementTableId > thead > tr:last').append('<th>' + tableHeaderColVal + '</th>');
    }
    for (var j = 0; j < JsonStatementTable.length - 1; j++) {

        $('#statementTableId > tbody').append('<tr></tr>');

        var nextArray = JsonStatementTable[j + 1];
        for (var k = 0; k < nextArray.length; k++) {
            var nextId = nextArray[0] + k;
            var colVal = nextArray[k];
            var formattedVal = FormattedValue(colVal);
            $('#statementTableId tr:last').append('<td id=' + nextId + '>' + formattedVal + '</td>');
        }


    }

    CalculateBuyPrice();
}

function FormattedValue(colVal) {

    if (typeof Number(colVal) === 'number' && isFinite(colVal)) {
        return (Number(colVal)).toLocaleString();
    }


    else return colVal;
}

function numOfCols()
{
    return $('#statementTableId').find('tr')[0].cells.length;
}

function CalculateBuyPrice() {

    var ColCount = numOfCols();
    var finalEbitdaId = "#Ebitda";

    if (ColCount > 1)
    {
        finalEbitdaId = finalEbitdaId + (ColCount - 1).toString();
    }
    else {
        finalEbitdaId = "#Ebitda1";
    }

    var finalEbitdaSearchText = "#statementTableId " + finalEbitdaId;
    //var finalEbitda = Number($(finalEbitdaSearchText).text().replace(/,/g, ''));
    var finalEbitda = Number($(finalEbitdaSearchText).text().replace(/,/g, ''));
    var initialEbitda = Number($("#statementTableId #Ebitda1").text().replace(/,/g, ''));
    var result = CalculateGrowthRate(initialEbitda, finalEbitda, ColCount - 1);
    $('#projectedEbitdaGrowthId').val((result * 100).toFixed(2) + " %");

    var projectedEbita = finalEbitda * (1 + result);

    $("#projectedEbitdaId").val(FormattedValue(projectedEbita.toFixed(0)));

    //Weighted_Avg_Diluted Shares

    var finalShareCount = "#statementTableId #Weighted_Avg_Diluted_Shares";

    if (ColCount > 1) {
        finalShareCount = finalShareCount + (ColCount - 1).toString();
    }
    else {
        finalShareCount = finalShareCount + (1).toString();
    }

    var finalWtdShareCount = Number($(finalShareCount).text().replace(/,/g, ''));
    var initialWtdShareCount = Number($('#statementTableId #Weighted_Avg_Diluted_Shares1').text().replace(/,/g, ''));

    var shareCountGrowthRate = CalculateGrowthRate(initialWtdShareCount, finalWtdShareCount, ColCount - 1);

    var projectedShareCount = finalWtdShareCount * (1 + shareCountGrowthRate);

    //var shareGrowthRate = 
    $("#projectedNumOfSharesId").val(FormattedValue(projectedShareCount.toFixed(0)));
    $("#sharePriceId").val(SharePrice());
    $("#callPremiumId").val($('#optionBid').text());
    $("#lblMinusCurrAssId").val(TotalLblMinusCurrentAssets());
    $("#buyingPriceId").val(BuyingPrice());
    $("#cashFlowMultipleId").val(CashFlowMultiple());
}

function CalculateGrowthRate(initial, final, periods) {
    var exp = 1 / periods;
    var fraction = final / initial;
    var result = (Math.pow(fraction, exp)) - 1;
    return result;
}


function ProjectEbitda() {
    return $("#projectedEbitdaId").val();
}

function ProjectNumOfShares() {
    return $('#projectedNumOfSharesId').val();
}

function SharePrice() {
    return $('#askId').val();
}

function CallPremiumId() {
    return Number($('#callPremiumId').text());
}

function TotalLiabiliy() {
    return 4103378000.0;
}

function CurrentAssets() {
    return 3591901000.0;
}

function TotalLblMinusCurrentAssets() {

    var colCount = numOfCols();
    var LblMinusAssId = '#statementTableId #Weighted_Avg_Diluted_Shares' + (colCount - 1).toString();
    return (Number($(LblMinusAssId).text().replace(/,/g, ''))).toLocaleString();
   
}

function BuyingPrice() {
    var sp = Number($('#sharePriceId').val()); 
    var cp = Number($('#callPremiumId').val());
    var lblminusass = Number($('#lblMinusCurrAssId').val().replace(/,/g, ''));
    var numOfShares = Number($('#projectedNumOfSharesId').val().replace(/,/g, ''));

    return (((sp - cp) + ((lblminusass) / numOfShares))).toFixed(2);
}

function CashFlowMultiple() {
    var bprice = BuyingPrice();
    var projEbitda = Number($("#projectedEbitdaId").val().replace(/,/g, ''));
    var projNumOfShares = Number($('#projectedNumOfSharesId').val().replace(/,/g, ''));

    var result =  Number(bprice) / (projEbitda / ProjectNumOfShares);

    return result.toFixed(2);

    //var cfm = ((BuyingPrice() / Number($("#projectedEbitdaId").val().replace(/,/g, ''))) / (Number($('#projectedNumOfSharesId').val().replace(/,/g, ''))));
    //return cfm.toFixed(2);
    
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
    //return new Date(epoch * 1000).toLocaleString();

    //Fri, 15 Sep 2017 00:00:00 GMT
    var dt = new Date(epoch * 1000);
    var day = dt.getUTCDate();
    var month = dt.getUTCMonth();
    var year = dt.getUTCFullYear();

    var monthString = months(month);
    var fullDateString = monthString + " " + day + ", " + year;
    return fullDateString;
}

function months(index) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[index];
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