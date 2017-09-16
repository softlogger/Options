$(document).ready(function () {

   // alert("WFT is going on");

    $('#ticker').focus();

    $(document).bind('keypress', function (e) {
        if (e.keyCode === 13) {
            $("#searchTickerBtn").trigger('click');
        }
    });

    loadInitial();
})

function loadInitial() {
    loadHeader();
    bindEvents();
    loadHistoricalLowPrices();
    loadExpDates();
    loadStrikes();
    loadOptionQuotes();
    loadStatementTable();
    loadToolTips();

    setEbitdaGrowthRate();
    setprojectedEbitda();
    setProjectedNumberOfShares();
    setSharePrice();
    setCallPremium();
    setLiabilityMinusCurrentAsset();
    setBuyingPrice();
    setCashFlowMultiple();
}
function loadHeader() {
    var shorty = jsonQuoteObject["shortName"];
    var bid = jsonQuoteObject["bid"];
    var ask = jsonQuoteObject["ask"];
    var regPrice = jsonQuoteObject["regularMarketPreviousClose"];
    var postMktPrice = jsonQuoteObject["postMarketPrice"];

    if (typeof postMktPrice === 'number') {
        postMktPrice = Number(postMktPrice).toFixed(2);
    }

    var headerName = "<h4><strong>" + shorty + "</strong><h4>";
    var headerLastClose = "Last Close:<strong> " + postMktPrice + "</strong>";
    var headerReg = "Regular:<strong> " + regPrice + "</strong>";
    var headerBid = "Bid:<strong> " + bid + "</strong>";
    var headerAsk = "Ask:<strong> " + ask + "</strong>";
    var headerReport = "<a href=" + decodeURIComponent(ReportUrl) + " target=_blank type=button class='btn'>10-K</a>"

    var headerString = headerName + " " + headerLastClose + " " + headerReg + " " + headerBid + " " + headerAsk + " " + headerReport;

    $('#headerId').html(headerString);
    $('#regPriceId').val(regPrice);
    $('#previousClosePriceId').val(postMktPrice);
    $("#bidId").val(bid);
    $("#askId").val(ask);
}

function bindEvents() {
    $('#projectedEbitdaGrowthCheckId').on('click', GrowthChanged);
    $('#projectedEbitdaCheckId').on('click', EbitdaChanged);
    $('#resetId').on('click', Reset);
    $('#recalculateId').on('click', Recalculate);
    $('#expDateId').on('change', expirationChanged);
    $('#strikeId').on('change', strikesChanged);
    
   
}



function loadHistoricalLowPrices() {

    $('#historicalPricessId').empty();
    $('#historicalPricessId').append('<thead><tr></thead></tr>');
    $('#historicalPricessId').append('<tbody><tr></tbody></tr>');

    for (var key in historicalPrices) {
        if (historicalPrices.hasOwnProperty(key)) {

            var priceAndDate = historicalPrices[key];
            var priceAndDateArray = priceAndDate.split(" ");
            var theDate = priceAndDateArray[1];
            var Price = Number(priceAndDateArray[0]);

            var date = new Date(theDate);
            var month = date.getMonth();
            var monthString = months(Number(month));

            $('#historicalPricessId > thead > tr').append("<th>" + monthString + " " + key + "</th>");

            $('#historicalPricessId > tbody > tr').append("<td>" + Price.toFixed(2) + "</td>");

        }

    }



}

function loadExpDates() {
    var ele = '#expDateId';
    $(ele).empty();
    for (var i = 0; i < jsonDates.length; i++) {
        $(ele).append("<option value='" + jsonDates[i] + "'>" + EpochToDate(jsonDates[i]) + "</option>")
    }
    var finalDateValue = jsonDates[jsonDates.length - 1];
    console.log(finalDateValue);
    $('#expDateId option[value=' + finalDateValue + ']').prop('selected', 'selected');

}

function expirationChanged() {
    loadStrikes();
    loadOptionQuotes();
    callPremiumChanged();
}

function strikesChanged() {
    loadOptionQuotes();
    callPremiumChanged();
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
    if (highStrike == 0) {
        $('#strikeId').val(strikes[strikes.length - 1]);
    }
    else {
        $('#strikeId').val(highStrike);
    }

}

function loadOptionQuotes() {
    console.log("in option quotes");
    var expDateVal = $('#expDateId').val();

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
    $('#quoteTableId > tbody > tr').append("<td>" + (Number(strikeDict['percentChange'])).toFixed(2) + "%</td>")
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['volume'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['openInterest'] + "</td>");
    var impVolatility = ((Number(strikeDict['impliedVolatility']) * 100).toFixed(2)) + '%';
    $('#quoteTableId > tbody > tr').append("<td>" + impVolatility + "</td>");


}

function loadStatementTable() {

    var firstArray = JsonStatementTable[JsonStatementTable.length - 1];

    $('#statementTableId').empty();

    $('#statementTableId').append('<thead></thead>');
    $('#statementTableId').append('<tbody></tbody>');

    $('#statementTableId > thead').append('<tr></tr>');

    for (var i = 0; i < firstArray.length; i++) {
        var tableHeaderColVal = firstArray[i];
        $('#statementTableId > thead > tr:last').append('<th>' + tableHeaderColVal + '</th>');
    }
    for (var j = 0; j < JsonStatementTable.length - 2; j++) {

        $('#statementTableId > tbody').append('<tr></tr>');

        var nextArray = JsonStatementTable[j + 1];
        for (var k = 0; k < nextArray.length; k++) {
            var nextId = nextArray[0] + k;
            var colVal = nextArray[k];
            var formattedVal = FormattedValue(colVal);
            $('#statementTableId tr:last').append('<td id=' + nextId + '>' + formattedVal + '</td>');
        }


    }


}

function calculateEbitdaGrowthRate() {
    var ColCount = numOfCols();
    var initialEbitdaId = getInitialEbitdaId();
    var finalEbitdaId = getFinalEbitdaId();
    var finalEbitdaSearchText = "#statementTableId " + finalEbitdaId;
    var finalEbitda = Number($(finalEbitdaSearchText).text().replace(/,/g, ''));
    var initialEbitda = Number($("#statementTableId #Ebitda1").text().replace(/,/g, ''));
    var result = CalculateGrowthRate(initialEbitda, finalEbitda, ColCount - 1);
    return result;
}

function getInitialEbitdaId() {
    return "#Ebitda1";
}

function getFinalEbitdaId() {
    var ColCount = numOfCols();
    var finalEbitdaId = "#Ebitda";

    if (ColCount > 1) {
        finalEbitdaId = finalEbitdaId + (ColCount - 1).toString();
    }
    else {
        finalEbitdaId = "#Ebitda1";
    }

    return finalEbitdaId;
}

function setEbitdaGrowthRate() {
    var result = calculateEbitdaGrowthRate();
    $('#projectedEbitdaGrowthId').val((result * 100).toFixed(2));

}

function setprojectedEbitda() {
    var finalEbitda = $("#statementTableId " + getFinalEbitdaId());

    var finalEbitdaValue = Number($(finalEbitda).text().replace(/,/g, ''));

    var result = $('#projectedEbitdaGrowthId').val();

    result = Number(result / 100);

    var projectedEbita = finalEbitdaValue * (1 + result);

    $("#projectedEbitdaId").val(FormattedValue(projectedEbita.toFixed(0)));
}

function setProjectedNumberOfShares() {
    var ColCount = numOfCols();

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
    $("#projectedNumOfSharesId").val(FormattedValue(projectedShareCount.toFixed(0)));
}

function setSharePrice() {
    $("#sharePriceId").val(SharePrice());
}

function setCallPremium() {
    $("#callPremiumId").val($('#optionBid').text());
}

function setLiabilityMinusCurrentAsset() {
    $("#lblMinusCurrAssId").val(TotalLblMinusCurrentAssets());
}

function setBuyingPrice() {
    $("#buyingPriceId").val(BuyingPrice());
}

function setCashFlowMultiple() {
    $("#cashFlowMultipleId").val(CashFlowMultiple());
}

function loadToolTips() {
    var bp = buyingPriceFormula();
    var cf = cashFlowFormula();

    $('#buyingPriceFormulaId').prop('title', bp);
    $('#cashFlowFormulaId').prop('title', cf);
    $('#growthRateId').prop('title', "((final/initial) raised to (1 / num of periods)) - 1) .. Note - num of periods = 3");
    $('#projectedEbitdaFormulaId').prop('title', "Displayed growth rate times last reported Ebitda");
    $('#projectedNumOfSharesFormulaId').prop('title', "Calculate growth rate per year over year changes in shares count and multiply that growth rate times last reported shares count");

}

function EpoctoLocaleString(date) {
    var date = new Date(date * 1000);
    return date.toLocaleString();
}

function Reset() {
    Unfreeze();
    setEbitdaGrowthRate();
    setprojectedEbitda();
    setProjectedNumberOfShares();
    setSharePrice();
    setCallPremium();
    setLiabilityMinusCurrentAsset();
    setBuyingPrice();
    setCashFlowMultiple();
   
}

function Unfreeze() {
    $('#projectedEbitdaGrowthCheckId').prop('checked', false);
    $('#projectedEbitdaCheckId').prop('checked', false)
    $('#projectedNumOfSharesCheckId').prop('checked', false)
    $('#sharePriceCheckId').prop('checked', false)
    $('#callPremiumCheckId').prop('checked', false)
    $('#lblMinusCurrAssCheckId').prop('checked', false)
}


function FormattedValue(colVal) {

    if (typeof Number(colVal) === 'number' && isFinite(colVal)) {
        return (Number(colVal)).toLocaleString();
    }

    else return colVal;
}

function numOfCols() {
    return $('#statementTableId').find('tr')[0].cells.length;
}

function CalculateGrowthRate(initial, final, periods) {
    if (initial < 0 || final < 0) return 0.10;

    var exp = 1 / periods;
    var fraction = final / initial;
    var result = (Math.pow(fraction, exp)) - 1;
    return result;

}



function SharePrice() {
    return $('#askId').val();
}







function TotalLblMinusCurrentAssets() {

    var colCount = numOfCols();
    var LblMinusAssId = '#statementTableId #Total_Lbs_Minus_Assets' + (colCount - 1).toString();
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
    var bprice = Number(BuyingPrice());
    var projEbitda = Number($("#projectedEbitdaId").val().replace(/,/g, ''));
    var projNumOfShares = Number($('#projectedNumOfSharesId').val().replace(/,/g, ''));

    var result = bprice / (projEbitda / projNumOfShares);

    return result.toFixed(3);

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
    window.location.href = url;
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

function EbitdaChanged() {
    if ($('#projectedEbitdaCheckId').is(':checked')) {
        $('#projectedEbitdaGrowthCheckId').prop('checked', false)
    }
}

function GrowthChanged() {
    if ($('#projectedEbitdaGrowthCheckId').is(':checked')) {
        $('#projectedEbitdaCheckId').prop('checked', false)

    }
}

function buyingPriceFormula() {
    return "(Stock Price - Call Premium) + ((Lib - Assts) / Projected num of shares)";
}

function cashFlowFormula() {

    return "Buying Price / (Projected EBITDA/Projected Num of Shares)";
}


function callPremiumChanged() {
    setCallPremium();
    setBuyingPrice();
    setCashFlowMultiple();
}

function Recalculate() {
    setBuyingPrice();
    setCashFlowMultiple();
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


    $("#searchButton").on("click", function (e) {
        var tickerName = $("#ticker").val();
        $.get('Home/ExpVC', { tickerName: tickerName }, function (data) {
            $('#expirationWidget').html(data);
        });
    });

}

