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

    var numOfCol = (numOfCols() - 2).toString();

    setBuyingPrice(numOfCol);
    setCashFlowMultiple(numOfCol);
    setDividendAmount();
    SetRateOfReturn();
    setMaxRateOfReturn();
    setLossRate();
}
function loadHeader() {
    var shorty = jsonQuoteObject["shortName"];
    var bid = jsonQuoteObject["bid"];
    var ask = jsonQuoteObject["ask"];
    var regPrice = jsonQuoteObject["regularMarketPrice"];
    var postMktPrice = jsonQuoteObject["postMarketPrice"];

    if (typeof postMktPrice === 'number') {
        postMktPrice = Number(postMktPrice).toFixed(2);
    }

    var headerName = "<h5><strong>" + shorty + "</strong></h5>";
    var headerLastClose = "Last Close:<strong> " + postMktPrice + "</strong>";
    var headerReg = "Regular:<strong> " + regPrice + "</strong>";
    var headerBid = "Bid:<strong> " + bid + "</strong>";
    var headerAsk = "Ask:<strong> " + ask + "</strong>";
    var headerReport = "<a href=" + decodeURIComponent(ReportUrl) + " target=_blank type=button class='btn btn-info'>10-K</a>"

    var headerString = headerName + " " + headerLastClose + " " + headerReg + " " + headerBid + " " + headerAsk + " " + headerReport;

    $('#headerId').html(headerString);
    $('#regPriceId').val(regPrice);
    $('#previousClosePriceId').val(postMktPrice);
    $("#bidId").val(bid);
    $("#askId").val(ask);
    $("#lastPriceId").val(postMktPrice);
}

function SetReturns() {

    setLossRate();
    SetRateOfReturn();
    setMaxRateOfReturn();
}

function getAverageSharePrice() {
     
    var shareBid = Number($("#bidId").val());
    var shareAsk = Number($("#askId").val());
    var avg = ((shareBid + shareAsk) / 2.0);
    if ((!(Number.isNaN(avg)) && Number > 0)) return avg;

    var regPrice = Number($("#regPriceId").val());
    if (!(Number.isNaN(regPrice) && regPrice > 0)) return regPrice;

    var lastPrice = Number($("#lastPriceId").val());
    if (!(Number.isNaN(lastPrice) && lastPrice > 0)) return lastPrice;
   
}

function getAverageCallPremium() {
    //$('#quoteTableId > tbody > tr').append("<td id='optionBid'>" + strikeDict['bid'] + "</td>");
    //$('#quoteTableId > tbody > tr').append("<td id='optionAsk'>" + strikeDict['ask'] + "</td>");
    var optionBid = Number($('#quoteTableId #optionBid').text());
    var optionAsk = Number($('#quoteTableId #optionAsk').text());
    var avg = ((optionBid + optionAsk) / 2.0);
    return avg;
}

function setLossRate() {

    var sp = getAverageSharePrice(); // Number(SharePrice());
    var colNum = (numOfCols() - 2).toString();

    var bprice = Number($('#statementTableId #Buying_Price' + colNum).text().replace(/,/g, ''));

    var totalDividendRecd = Number($('#dividendTableId #divTotalId').text().replace(/,/g, ''));

    if (Number.isNaN(totalDividendRecd)) {
        totalDividendRecd = Number(0);
    }

    var lossRate = (sp - (bprice - totalDividendRecd)) / sp;

    var lossRatePercentage = (lossRate * 100).toFixed(2);
    var toolTipExplanation = "At expiration Stock must have fallen below this rate to lose money on this transaction\n";
    var toolTip = toolTipExplanation + "Stock Price: " + sp + " Buying Price: " + bprice + " Dividends: " + totalDividendRecd;

    $('#lossRateId').text(lossRatePercentage + " %");
    $('#lossRateId').attr('title', toolTip);

}


function SetRateOfReturn() {

    var sp = getAverageSharePrice(); //Number(SharePrice());

    var cp = getAverageCallPremium(); // Number($('#optionBid').text());

    var dividend = Number($('#dividendTableId #divTotalId').text());

    if (isNaN(dividend)) {
        dividend = Number(0);
    }

    var totalReturn = cp + dividend;

    var futureEpochDate = $("#expDateId").find(":selected").val();

    var todaysEpochDate = Epoch(new Date());

    var totalNumberOfSeconds = futureEpochDate - todaysEpochDate;

    var totalNumberOfDays = (totalNumberOfSeconds / (60 * 60 * 24)) + 1; //86400 + 1

    var percentRate = (((totalReturn / sp) * (365 / totalNumberOfDays)) * 100).toFixed(2);

    var toolTipExplanation = "This is the annualized rate of return at expiration if the Calls expire worthless\n";
    var toolTip = toolTipExplanation + "Stock Price: " + sp + " Call Premium: " + cp + " Dividends: " + dividend + " Number of Days: " + Math.floor(totalNumberOfDays);

    $('#rorId').attr('title', toolTip);
    $('#rorId').text(percentRate + " %");
}


function setMaxRateOfReturn() {
    var sp = getAverageSharePrice(); //Number(SharePrice());
    var strikeVal = Number($('#strikeId').val());
    var diff = Math.abs(sp - strikeVal);

    if (strikeVal < sp) {
        diff = -(diff);
    }

    var cp = getAverageCallPremium(); // Number($('#optionBid').text());

    var dividend = Number($('#dividendTableId #divTotalId').text());

    if (isNaN(dividend)) {
        dividend = Number(0);
    }

    var totalReturn = cp + dividend + diff;

    var futureEpochDate = $("#expDateId").find(":selected").val();

    var todaysEpochDate = Epoch(new Date());

    var totalNumberOfSeconds = futureEpochDate - todaysEpochDate;

    var totalNumberOfDays = (totalNumberOfSeconds / (60 * 60 * 24)) + 1; //86400 + 1

    var percentRate = (((totalReturn / sp) * (365 / totalNumberOfDays)) * 100).toFixed(2);

    var toolTipExplanation = "This is the maximum annualized rate of return at expiration if the Stock is trading above strike price and called(sold)\n";
    var toolTip = toolTipExplanation + "Stock Price: " + sp + " Call Premium: " + cp + " Dividends: " + dividend + " Diff in Strike and Stock Price: " + diff.toFixed(2) + " Number of Days: " + Math.floor(totalNumberOfDays);

    $('#maxRateId').attr('title', toolTip);
    $('#maxRateId').text(percentRate + " %");
}


function setDividendAmount() {

    var hasValue = jsonDividendString["HasValue"];

    if (hasValue === true) {

        var divExDate = jsonDividendString["Date"];
        var divAmount = jsonDividendString["Value"];


        var numOfNinetyDayPeriods = getNumberOfNinetyDayPeriods(divExDate);

        var divTotalAmount = (divAmount * numOfNinetyDayPeriods).toFixed(2);

        $('#dividendTableId #divExDateId').text(divExDate);
        $('#dividendTableId #divAmountId').text(divAmount);
        $('#dividendTableId #divPeriodId').text(numOfNinetyDayPeriods);
        $('#dividendTableId #divTotalId').text(divTotalAmount);
    }
    else {
        $('#dividendTableId #divExDateId').text("N/A");
        $('#dividendTableId #divAmountId').text("N/A");
        $('#dividendTableId #divPeriodId').text("N/A");
        $('#dividendTableId #divTotalId').text("N/A");
    }

}

function getNumberOfNinetyDayPeriods(startDate) {
    var startDate = new Date(startDate);
    var startDateEpoch = Epoch(startDate);
    var endDateEpoch = Number($("#expDateId").find(":selected").val());

    var diffInDays = ((endDateEpoch - startDateEpoch) / (60 * 60 * 24)) + 1;

    if (diffInDays < 90) return 0;

    var numOfPeriods = Math.floor(diffInDays / 90);

    return numOfPeriods;
}

function bindEvents() {
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
    setDividendAmount();

    SetReturns();

}

function strikesChanged() {
    loadOptionQuotes();
    callPremiumChanged();
    setDividendAmount();

    SetReturns();

}



function loadStrikes() {
    var initial = true;
    var ele = '#strikeId';
    var selectedDate = $("#expDateId").find(":selected").val();
    var strikes = jsonStrikes[selectedDate];
    $(ele).empty();
    var quote = getAverageSharePrice();  //SharePrice();
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
    //$('#quoteTableId > thead > tr').append("<th>" + "Last Trade" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Last Price" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Bid" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Ask" + "</th>");
    //$('#quoteTableId > thead > tr').append("<th>" + "Change" + "</th>");
    //$('#quoteTableId > thead > tr').append("<th>" + "% Change" + "</th>");
    //$('#quoteTableId > thead > tr').append("<th>" + "Volume" + "</th>");
    //$('#quoteTableId > thead > tr').append("<th>" + "Open Int" + "</th>");
    $('#quoteTableId > thead > tr').append("<th>" + "Imp Volatility" + "</th>");

    //$('#quoteTableId > tbody > tr').append("<td>" + EpoctoLocaleString(strikeDict['lastTradeDate']) + "</td>");
    $('#quoteTableId > tbody > tr').append("<td>" + strikeDict['lastPrice'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td id='optionBid'>" + strikeDict['bid'] + "</td>");
    $('#quoteTableId > tbody > tr').append("<td id='optionAsk'>" + strikeDict['ask'] + "</td>");
    //$('#quoteTableId > tbody > tr').append("<td>" + Number(strikeDict['change']).toFixed(2) + "</td>"); //percentChange
    //$('#quoteTableId > tbody > tr').append("<td>" + (Number(strikeDict['percentChange'])).toFixed(2) + "%</td>")
    //$('#quoteTableId > tbody > tr').append("<td>" + strikeDict['volume'] + "</td>");
    //$('#quoteTableId > tbody > tr').append("<td>" + strikeDict['openInterest'] + "</td>");
    var impVolatility = ((Number(strikeDict['impliedVolatility']) * 100).toFixed(2)) + '%';
    $('#quoteTableId > tbody > tr').append("<td>" + impVolatility + "</td>");


}

function loadStatementTable() {

    var headerDates = JsonStatementTable[JsonStatementTable.length - 1];
    var editableColumnIndex = headerDates.length - 2;

    var editableRowNames = ['Ebitda', 'Total_Liabilities', 'Current_Assets','Weighted_Avg_Diluted_Shares', 'Buying_Price'];

    $('#statementTableId').empty();

    $('#statementTableId').append('<thead></thead>');
    $('#statementTableId').append('<tbody></tbody>');

    $('#statementTableId > thead').append('<tr></tr>');

    for (var i = 0; i < headerDates.length; i++) {
        var tableHeaderColVal = headerDates[i];
        $('#statementTableId > thead > tr:last').append('<th>' + tableHeaderColVal + '</th>');

    }

    for (var j = 1; j < JsonStatementTable.length - 1; j++) {

        $('#statementTableId > tbody').append('<tr></tr>');

        var nextArray = JsonStatementTable[j];
        for (var k = 0; k < nextArray.length; k++) {
            var nextId = nextArray[0] + k;
            var colVal = nextArray[k];
            var rowName = nextArray[0];
            var formattedVal = FormattedValue(colVal);
            // $('#statementTableId tr:last').append('<td id=' + nextId + '>' + formattedVal + '</td>');

            $('#statementTableId tr:last').append('<td id=' + nextId + ' data-val=' + formattedVal + '>' + formattedVal + '</td>');

            if (colVal == "Buying_Price") {
                $('#statementTableId  tr:last').attr('title', buyingPriceFormula());
            }
            if (colVal == "Cash_Flow_Multiple") {
                $('#statementTableId  tr:last').attr('title', cashFlowFormula());
            }

            if (k === editableColumnIndex && rowName === "Buying_Price")
            {
                var sp = getAverageSharePrice();
                var cp = getAverageCallPremium();

                var titleString = "Buying Price: " + sp + " less Call Premium:  " + cp + "\nCall Premium is average of bid and ask. Share price is either -  average of Bid and Ask or Regular Price or Last Price based on available data";
                $('#statementTableId  tr:last td:last').prop('title', titleString);
            }

            //if (k === editableColumnIndex && editableRowNames.includes(rowName)) {

            //    $('#statementTableId  tr:last td:last').attr('contenteditable', true);
            //    $('#statementTableId  tr:last td:last').css('background-color', 'cyan');
            //}


        }


    }

    //  $('#statementTableId td:nth-child(n+5').attr('contenteditable', 'true');
    //$('#statementTableId td:nth-child(5)').attr('contenteditable', 'true');
}

function GetNextYearFor(year) {
    var thisYearDate = new Date(year);
    var nextYearDate = new Date(thisYearDate.getFullYear() + 1, thisYearDate.getMonth(), thisYearDate.getDate());
    return nextYearDate.getFullYear() + "-" + nextYearDate.getMonth() + "-" + nextYearDate.getDate()
}

function getProjectedValuefor(nextArray) {
    var arrayLength = nextArray.length;
    var initalValue = Number(nextArray[1]);
    var finalValue = Number(nextArray[arrayLength - 1]);
    if (initalValue === finalValue) return 1;
    var growthRate = CalculateGrowthRate(initalValue, finalValue, arrayLength - 1);
    return (finalValue + (growthRate * finalValue));
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




function setBuyingPrice(num) {

    var buyingString = "#statementTableId #Buying_Price" + num;

    $(buyingString).text(BuyingPrice());
}

function setCashFlowMultiple(num) {

    var cashFlowMultipleString = "#statementTableId #Cash_Flow_Multiple" + num;

    $(cashFlowMultipleString).text(CashFlowMultiple(num));
}

function loadToolTips() {
    var bp = buyingPriceFormula();
    var cf = cashFlowFormula();

    $('#buyingPriceFormulaId').prop('title', bp);
    $('#cashFlowFormulaId').prop('title', cf);
    $('#growthRateId').prop('title', "((final/initial) raised to (1 / num of periods)) - 1) .. Note - num of periods = 3");
    $('#projectedEbitdaFormulaId').prop('title', "Displayed growth rate times last reported Ebitda");
    $('#projectedNumOfSharesFormulaId').prop('title', "Calculate growth rate per year over year changes in shares count and multiply that growth rate times last reported shares count");
    var prices = getBuyingPriceTitleString();
    $('#statementTableId #Buying_Price0').prop('title', prices);
}

function EpoctoLocaleString(date) {
    var date = new Date(date * 1000);
    return date.toLocaleString();
}

function getBuyingPriceTitleString() {
    var buyingPriceTitleString = "";
    for (var prop in historicalPrices) {
        if (historicalPrices.hasOwnProperty(prop)) {
            var yearString = "Year: " + prop + " Low price and Date: " + historicalPrices[prop] + "\n";
            buyingPriceTitleString += yearString;
        }
    }
    return buyingPriceTitleString;
}

function Reset() {


    var colNum = (numOfCols() - 2).toString();

    for (var i = 1; i < 10; i++) {
        var tdObject = '#statementTableId tr:eq(' + i + ') td:eq(' + colNum + ')';
        var td = $(tdObject)
        var tdVal = td.attr('data-val');
        td.text(tdVal);
    }
    setBuyingPrice(colNum);
    setCashFlowMultiple(colNum);
    setDividendAmount();
    SetRateOfReturn();
    
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





function SharePrice() {
    //return $('#askId').val();
    var sharePrice = Number($('#askId').val());
    var lastPrice = Number($("#lastPriceId").val());

    var sp = sharePrice === 0 ? lastPrice : sharePrice;
    return sp;
}


function TotalLblMinusCurrentAssets() {


    var colCount = (numOfCols() - 2).toString();

    var totLibString = '#statementTableId #Total_Liabilities' + colCount;

    var totalLib = Number($(totLibString).text().replace(/,/g, ''));

    var currentAssetsString = '#statementTableId #Current_Assets' + colCount;

    var currentAssets = Number($(currentAssetsString).text().replace(/,/g, ''));

    var totalLibMinusCurrAssets = (totalLib - currentAssets).toLocaleString();

    return totalLibMinusCurrAssets;



}

function BuyingPrice() {

    var sp = getAverageSharePrice(); //SharePrice();

    var cp = getAverageCallPremium(); //Number($('#optionBid').text());


    var result = sp - cp;

    return result.toFixed(2);
}

function CashFlowMultiple(colNumber) {
    var bprice = Number($('#statementTableId #Buying_Price' + colNumber).text().replace(/,/g, ''));
    var projEbitda = Number($('#statementTableId #Ebitda' + colNumber).text().replace(/,/g, ''));
    var projNumOfShares = Number($('#statementTableId #Weighted_Avg_Diluted_Shares' + colNumber).text().replace(/,/g, ''));
    var crntAssetsMinusLbl = Number($('#statementTableId #Total_Lbs_Minus_Assets' + colNumber).text().replace(/,/g, ''));
    var crntAssetsMinusLblOverNumOfShares = crntAssetsMinusLbl / projNumOfShares;
    var result = (bprice + crntAssetsMinusLblOverNumOfShares) / (projEbitda / projNumOfShares);

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
    return "Stock Price - Call Premium";
}

function cashFlowFormula() {

    return "(Buying Price + (Current Assets - Minus Liab / Proj Num of Shares)) / (Projected EBITDA/Proj Num of Shares)";
}


function callPremiumChanged() {
    var colNum = (numOfCols() - 2).toString();
    //setCallPremium();
    setBuyingPrice(colNum);
    setCashFlowMultiple(colNum);
}

function Recalculate() {
    var colNum = (numOfCols() - 2).toString();
    setTotalLibMinusCurrentAssets();


   // setBuyingPrice(colNum);
    setCashFlowMultiple(colNum);
   // setDividendAmount();
    SetRateOfReturn();
    
}

function setTotalLibMinusCurrentAssets() {
    var colNum = (numOfCols() - 2).toString();

    var totalLibMinuCurrentAssets = TotalLblMinusCurrentAssets();
    $('#statementTableId #Total_Lbs_Minus_Assets' + colNum).text(totalLibMinuCurrentAssets);
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
        alert(dates);
        alert('wtf');
        var date = $("#finalDate").find(":selected").text();
        alert(date);
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

