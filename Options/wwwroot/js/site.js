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

    //var originalColor = "rgb(0,0,0,0)";
    //var existingCallColsColored = [];
    //var existingPutColsColored = [];

    loadHeader();
    bindEvents();
    //loadHistoricalLowPrices();
    loadCallOption();
    loadPutOption();
    loadStatementTable();
    loadToolTips();

    //var numOfCol = colNumberForCallCalculations();// (numOfCols() - 2).toString();
    //setBuyingPrice(numOfCol);
    //setCashFlowMultiple(numOfCol);

    updateCallCalculations();

    ////var numOfCol = putColumnIndex();

    UpdatePutCalculations();


    setDividendAmount();

    SetCallReturns();
    SetPutReturns();

    bindColorCallEvents();
}

//function bindMouseEvents() {
//    var putColNum = putColNum();
//    var callColNum = callColNum();


//}

function loadCallOption() {
    loadExpDates();
    loadStrikes();
    loadOptionQuotes();
}

function loadPutOption() {
    loadPutExpDates();
    loadPutStrikes();
    loadPutOptionQuotes();
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

    var headerName = "<h6><strong>" + shorty + "</strong></h6>";
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

    $('#shortNameId').text(shorty);
    $('#regPriceId').text(regPrice);
    $('#previousClosePriceId').text(postMktPrice);
    $("#bidId").text(bid);
    $("#askId").text(ask);
    $("#lastPriceId").text(postMktPrice);


}

function SetCallReturns() {

    setLossRate();
    SetRateOfReturn();
    setMaxRateOfReturn();
}

function SetPutReturns() {
    setPutLossRate();
    setPutMaxRateOfReturn();
}

function setPutLossRate() {
    //get todays Price
    //get buying Price
    //cal % diff
    var colIndex = putColumnIndex();
    var sharePrice = getAverageSharePrice();

    var putBuyingPriceId = "#statementTableId #Buying_Price" + colIndex;
    var buyingPriceAmount = $(putBuyingPriceId).text();

    var diff = (((sharePrice - buyingPriceAmount) / sharePrice) * 100).toFixed(2);
    $("#putLossRateId").text(diff + ' %');

    var titleString = "Share Price: " + sharePrice + "\n" + "Put Premium: " + getAveragePutPremium() + "\n" + "Buying Price: " + buyingPriceAmount;
    $("#putLossRateId").prop('title', titleString);


}
function setPutMaxRateOfReturn() {
    var colIndex = putColumnIndex();
    var putBuyingPriceId = "#statementTableId #Buying_Price" + colIndex;
    var buyingPriceAmount = $(putBuyingPriceId).text();

    var putPremAmount = getAveragePutPremium();

    var futureEpochDate = $("#putExpDateId").find(":selected").val();

    var todaysEpochDate = Epoch(new Date());

    var totalNumberOfSeconds = futureEpochDate - todaysEpochDate;

    var totalNumberOfDays = (totalNumberOfSeconds / (60 * 60 * 24)) + 1; //86400 + 1

    var percentRate = (((putPremAmount / buyingPriceAmount) * (365 / totalNumberOfDays)) * 100).toFixed(2);

    $("#putMaxRateId").text(percentRate + ' %');

    var titleString = "Share Price: " + getAverageSharePrice() + "\nPut Premium: "
        + putPremAmount + "\nBuying Price: " + buyingPriceAmount + "\nNum of days: " + Math.floor(totalNumberOfDays);
    $("#putMaxRateId").prop('title', titleString);
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

function colNumberForCallCalculations() {
    var colNum = (numOfCols() - 2 - Number(numOfYearsProjected));
    return colNum;
}

function setLossRate() {

    var sp = getAverageSharePrice(); // Number(SharePrice());
    var colNum = callColumnIndex(); //  colNumberForCallCalculations() //(numOfCols() - 2).toString();

    var bprice = Number($('#statementTableId #Buying_Price' + colNum).text().replace(/,/g, ''));

    var totalDividendRecd = Number($('#dividendTableId #divTotalId').text().replace(/,/g, ''));

    if (Number.isNaN(totalDividendRecd)) {
        totalDividendRecd = Number(0);
    }

    var lossRate = (sp - (bprice - totalDividendRecd)) / sp;

    var lossRatePercentage = (lossRate * 100).toFixed(2);

    var toolTip = "Stock Price: " + sp + "\nCall Premium: " + getAverageCallPremium() + "\nDividends: " + totalDividendRecd + "\nBuying Price: " + bprice;

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

    var toolTip = "Stock Price: " + sp + "\nCall Premium: " + cp + "\nDividends: " + dividend + "\nNumber of Days: " + Math.floor(totalNumberOfDays);

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

    var toolTip = "Stock Price: " + sp + "\nCall Premium: " + cp + "\nDividends: " + dividend + "\nStrike: " + strikeVal + "\nNumber of Days: " + Math.floor(totalNumberOfDays);

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
    ////$('#resetId').on('click', Reset);
    ////$('#recalculateId').on('click', Recalculate);
    $('#expDateId').on('change', expirationChanged);
    $('#strikeId').on('change', strikesChanged);
    $('#putExpDateId').on('change', putExpirationChanged);
    $('#putStrikeId').on('change', putStrikesChanged);


}

function bindColorCallEvents()
{
    var callIndexNum = callColumnIndex();
    
    var thId = getTHIdFor(callIndexNum);
    var tdId = getTDIdFor(callIndexNum);

    $(thId).on("mouseenter", turnOnCallColors);
    $(thId).on("mouseleave", turnOffCallColors);

   // $(tdId).on("mouseenter", turnOnCallColors);
   // $(tdId).on("mouseleave", turnOffCallColors);

    var putIndexNum = putColumnIndex();
    thId = getTHIdFor(putIndexNum);
    tdId = getTDIdFor(putIndexNum);

    $(thId).on("mouseenter", turnOnPutColors);
    $(thId).on("mouseleave", turnOffPutColors);

  //  $(tdId).on("mouseenter", turnOnPutColors);
  //  $(tdId).on("mouseleave", turnOffPutColors);
}

function turnOnPutColors() {
    turnOffPutColors();
    highLightPutColoumns(newPutColsColored, "yellow");
    existingPutColsColored = newPutColsColored;
}

function turnOffPutColors() {
    highLightPutColoumns(existingPutColsColored, originalColor);
}

function turnOnCallColors()
{
    highLightCallColoumns(existingCallColsColored, "cyan");
}

function turnOffCallColors()
{
    highLightCallColoumns(existingCallColsColored, originalColor);
}

////function loadHistoricalLowPrices() {

////    $('#historicalPricessId').empty();
////    $('#historicalPricessId').append('<thead><tr></thead></tr>');
////    $('#historicalPricessId').append('<tbody><tr></tbody></tr>');

////    for (var key in historicalPrices) {
////        if (historicalPrices.hasOwnProperty(key)) {

////            var priceAndDate = historicalPrices[key];
////            var priceAndDateArray = priceAndDate.split(" ");
////            var theDate = priceAndDateArray[1];
////            var Price = Number(priceAndDateArray[0]);

////            var date = new Date(theDate);
////            var month = date.getMonth();
////            var monthString = months(Number(month));

////            $('#historicalPricessId > thead > tr').append("<th>" + monthString + " " + key + "</th>");

////            $('#historicalPricessId > tbody > tr').append("<td>" + Price.toFixed(2) + "</td>");

////        }

////    }



////}


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

function loadPutExpDates() {
    var ele = '#putExpDateId';
    $(ele).empty();
    for (var i = 0; i < jsonDates.length; i++) {
        $(ele).append("<option value='" + jsonDates[i] + "'>" + EpochToDate(jsonDates[i]) + "</option>")
    }
    var finalDateValue = jsonDates[jsonDates.length - 1];
    console.log(finalDateValue);
    $('#putExpDateId option[value=' + finalDateValue + ']').prop('selected', 'selected');

}

function expirationChanged() {
    loadStrikes();
    loadOptionQuotes();
    setDividendAmount();
    callPremiumChanged();
    SetCallReturns();


}

function strikesChanged() {
    loadOptionQuotes();
    setDividendAmount();
    callPremiumChanged();
    SetCallReturns();
}

function putExpirationChanged() {
    loadPutStrikes();
    loadPutOptionQuotes();
    UpdatePutCalculations();
}

function callColumnIndex() {
    return $("#statementTableId tr th").length - 2;
}

function updateCallCalculations() {
    var expDate = Date(); //EpochToDate(getCallExpirationDate());
    var sourceIndex = getColWithinNumberOfDays(expDate, 32);
    var destIndex = callColumnIndex();
    let Colls = [];

    if (sourceIndex > 0) {
        copyColumnData(sourceIndex, destIndex);
        Colls.push(sourceIndex, destIndex);
    }
    else {
        var todaysDate = getTodaysDate();
        var Columns = getColoumnsOnEitherSideOfDate(todaysDate);
        copyAverageValuesForCalculations(Columns.First, Columns.Second, destIndex);
        Colls.push(Columns.First, Columns.Second, destIndex);
        
    }

    setDerivedValuesForCallAndPutCalculations(destIndex);

    setBuyingPrice(destIndex);
    setCashFlowMultiple(destIndex);
    existingCallColsColored = Colls;
}

function getTHIdFor(colNum) {
    var thId = "#statementTableId > thead > tr > th:eq(" + Number(colNum) + ")";
    return thId;
}
function getTDIdFor(colNum) {
    var tdId = "#statementTableId > tbody > tr > td:nth-child(" + Number(colNum + 1) + ")";
    return tdId;
}



function highLightCallColoumns(Colls, color) {
    colorColumns(Colls, color);
}

function highLightPutColoumns(Colls, color) {
    colorColumns(existingPutColsColored, originalColor);
    colorColumns(Colls, color);
    existingPutColsColored = Colls;
}

function colorColumns(Colls, color) {
for (var col in Colls) {
        if (Colls.hasOwnProperty(col)) {
            var colThId = getTHIdFor(Colls[col]);
            $(colThId).css('background-color', color);

            var coltdId = getTDIdFor(Colls[col]);
            $(coltdId).css('background-color', color);
        }
    }
}


function setDerivedValuesForCallAndPutCalculations(colIndex) {
    var callColIndex = colIndex; //callColumnIndex();

    //Set Ebitda Per Revenue
    var ebitdaPerRevId = "#statementTableId #Ebitda_Per_Revenue" + callColIndex;
    var ebitdaPerRevString = $(ebitdaPerRevId).text();
    var ebitdaPerRevNum = Number(ebitdaPerRevString.replace(/,/g, ''));

    var total_RevId = "#statementTableId #Total_Revenue" + callColIndex;
    var total_RevString = $(total_RevId).text();
    var totalRevNum = Number(total_RevString.replace(/,/g, ''));

    var ebitda = (ebitdaPerRevNum * totalRevNum).toFixed(0);
    var ebitdaId = "#statementTableId #Ebitda" + callColIndex;
    $(ebitdaId).text(FormattedValue(ebitda));

    //Set Total_Liabilities    Current_Assets    Total_Lbs_Minus_Assets

    var currentAssetsId = "#statementTableId #Current_Assets" + callColIndex;
    var currentAssetsString = $(currentAssetsId).text();
    var currentAssetsNum = Number(currentAssetsString.replace(/,/g, ''));

    var totalLiabilitiesId = "#statementTableId #Total_Liabilities" + callColIndex;
    var totalLiabilitiesString = $(totalLiabilitiesId).text();
    var totalLiabilitiesNum = Number(totalLiabilitiesString.replace(/,/g, ''));

    var totalLibMinusAssets = totalLiabilitiesNum - currentAssetsNum;


    var totalLibsMinusAssetsId = "#statementTableId #Total_Lbs_Minus_Assets" + callColIndex;
    $(totalLibsMinusAssetsId).text(FormattedValue(totalLibMinusAssets));
}

function UpdatePutCalculations() {
    var expDate = EpochToDate(getPutExpirationDate());
    let Colls = [];
    UpdatePutHeaderDate(expDate);

    var sourceColNum = getColWithinNumberOfDays(expDate, 32);
    var destColNum = putColumnIndex();
    if (sourceColNum > 0) {
        copyColumnData(sourceColNum, destColNum);
        Colls.push(sourceColNum, destColNum);
    }
    else {
        var ColumnsIndexes = getColoumnsOnEitherSideOfDate(expDate);
        copyAverageValuesForCalculations(ColumnsIndexes.First, ColumnsIndexes.Second, destColNum);
        Colls.push(ColumnsIndexes.First, ColumnsIndexes.Second, destColNum);
    }

    setDerivedValuesForCallAndPutCalculations(destColNum);
    setPutBuyingPrice(destColNum);
    setCashFlowMultiple(destColNum);
    SetPutReturns();
    newPutColsColored = Colls;
}

function UpdatePutHeaderDate(expDate) {
    var putColumnDateIndex = putColumnIndex();
    var putColumnDateId = '#statementTableId tr:first th:eq(' + putColumnDateIndex + ')';

    $(putColumnDateId).text(expDate);
}

function putColumnIndex() {
    return $("#statementTableId tr th").length - 1;
}

function copyColumnData(sourceColNum, destinationColNum) {
    //var destinationColNum = putColumnIndex();

    var colNames = getColumnNames();

    for (var cname in colNames) {
        if (colNames.hasOwnProperty(cname)) {
            var destId = "#" + colNames[cname] + destinationColNum;
            var sourceId = "#" + colNames[cname] + sourceColNum;

            $(destId).text($(sourceId).text());
        }
    }
}



function getRowNamesForOptionsProjectionCalculations() {
    var rowNames = ['Total_Revenue', 'Ebitda_Per_Revenue', 'Total_Liabilities', 'Current_Assets', 'Weighted_Avg_Diluted_Shares'];
    return rowNames;
}

function copyAverageValuesForCalculations(firstCol, secondCol, colmIndex) {


    var startDateQString = "#statementTableId > thead > tr > th:eq(" + firstCol + ")";
    var startDateString = $(startDateQString).text();
    var startDateEp = Epoch(startDateString);

    var endDateQString = "#statementTableId > thead > tr > th:eq(" + secondCol + ")";
    var endDateString = $(endDateQString).text();
    var endDateEp = Epoch(endDateString);

    var callDateStringId = "#statementTableId > thead > tr > th:eq(" + colmIndex + ")";
    var callDateString = $(callDateStringId).text();
    var callDateEp = Epoch(callDateString);

    var rowNamesForProjection = getRowNamesForOptionsProjectionCalculations();

    var numOfDaysSinceStartDate = diffInNumberOfDays(startDateString, callDateString);

    for (var rowName in rowNamesForProjection) {
        if (rowNamesForProjection.hasOwnProperty(rowName)) {

            var beginAmt = getCellValue(rowNamesForProjection[rowName], firstCol);
            var endAmt = getCellValue(rowNamesForProjection[rowName], secondCol);
            var amtPerDay = getValueForPeriod(beginAmt, endAmt, numOfDaysSinceStartDate);

            setCalculatedValues(rowNamesForProjection[rowName], colmIndex, amtPerDay);
        }
    }
}

function getCellValue(rowName, colNumber) {
    var cellId = "#statementTableId #" + rowName + colNumber;
    var cellVal = $(cellId).text();
    return Number(cellVal.replace(/,/g, ''));
}



function setCalculatedValues(rowName, colNum, cellValue) {
    if (rowName != "Ebitda_Per_Revenue") {
        cellValue = FormattedValue(cellValue.toFixed(0));
    }
    else if (rowName == "Ebitda_Per_Revenue") {
        cellValue = FormattedValue(cellValue.toFixed(3));
    }
    var cellId = "#statementTableId #" + rowName + colNum;
    $(cellId).text(cellValue);
}

function getValueForPeriod(startAmount, endAmount, numOfDays) {
    var perDay = (Math.abs(startAmount - endAmount)) / 365;

    if (startAmount >= endAmount) //values going down
    {
        return (startAmount - (perDay * numOfDays));
    }
    else //values going up
    {
        return (startAmount + (perDay * numOfDays));
    }
}

function getTodaysDate() {
    return new Date();
}

function getColoumnsOnEitherSideOfDate(date) {
    var expDate = Epoch(date); //Number(getCallExpirationDate());
    var headerDates = getHeaderDatesRow();

    var Columns = {};
    Columns.First = -1;
    Columns.Second = -1;

    for (var cindex = 0; cindex < headerDates.length; cindex++) {

        var epochNum = Epoch(headerDates[cindex]);
        if (Number.isNaN(epochNum)) continue;
        var epochNum2 = Epoch(headerDates[cindex + 1]);
        if ((epochNum <= expDate) && (expDate <= epochNum2)) {
            Columns.First = cindex;
            Columns.Second = cindex + 1;

            return Columns;
        }
    }


    return Columns;
}

function getColoumnsOnEitherSideOfCallPutDate() {
    var putDate = getPutExpirationDate();
}


function putStrikesChanged() {
    loadPutOptionQuotes();
    //callPremiumChanged();
    //setDividendAmount();

    //SetReturns();
    UpdatePutCalculations();
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

function loadPutStrikes() {
    var initial = true;
    var ele = '#putStrikeId';
    var selectedDate = $("#putExpDateId").find(":selected").val();
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
        $('#putStrikeId').val(strikes[strikes.length - 1]);
    }
    else {
        $('#putStrikeId').val(highStrike);
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


function loadPutOptionQuotes() {
    console.log("in option quotes");
    var expDateVal = $('#putExpDateId').val();

    var expDict = jsonPutContainer[expDateVal];
    var strikeVal = $('#putStrikeId').val();
    var strikeDict = expDict[strikeVal];

    $('#putQuoteTableId').empty();
    $('#putQuoteTableId').append('<thead><tr></thead></tr>');
    $('#putQuoteTableId').append('<tbody><tr></tbody></tr>');
    //$('#putQuoteTableId > thead > tr').append("<th>" + "Last Trade" + "</th>");
    $('#putQuoteTableId > thead > tr').append("<th>" + "Last Price" + "</th>");
    $('#putQuoteTableId > thead > tr').append("<th>" + "Bid" + "</th>");
    $('#putQuoteTableId > thead > tr').append("<th>" + "Ask" + "</th>");
    //$('#putQuoteTableId > thead > tr').append("<th>" + "Change" + "</th>");
    //$('#putQuoteTableId > thead > tr').append("<th>" + "% Change" + "</th>");
    //$('#putQuoteTableId > thead > tr').append("<th>" + "Volume" + "</th>");
    //$('#putQuoteTableId > thead > tr').append("<th>" + "Open Int" + "</th>");
    $('#putQuoteTableId > thead > tr').append("<th>" + "Imp Volatility" + "</th>");

    //$('#putQuoteTableId > tbody > tr').append("<td>" + EpoctoLocaleString(strikeDict['lastTradeDate']) + "</td>");
    $('#putQuoteTableId > tbody > tr').append("<td>" + strikeDict['lastPrice'] + "</td>");
    $('#putQuoteTableId > tbody > tr').append("<td id='optionBid'>" + strikeDict['bid'] + "</td>");
    $('#putQuoteTableId > tbody > tr').append("<td id='optionAsk'>" + strikeDict['ask'] + "</td>");
    //$('#putQuoteTableId > tbody > tr').append("<td>" + Number(strikeDict['change']).toFixed(2) + "</td>"); //percentChange
    //$('#putQuoteTableId > tbody > tr').append("<td>" + (Number(strikeDict['percentChange'])).toFixed(2) + "%</td>")
    //$('#putQuoteTableId > tbody > tr').append("<td>" + strikeDict['volume'] + "</td>");
    //$('#putQuoteTableId > tbody > tr').append("<td>" + strikeDict['openInterest'] + "</td>");
    var impVolatility = ((Number(strikeDict['impliedVolatility']) * 100).toFixed(2)) + '%';
    $('#putQuoteTableId > tbody > tr').append("<td>" + impVolatility + "</td>");
}


function getHeaderDatesRow() {
    var headerDates = JsonStatementTable[JsonStatementTable.length - 1];
    return headerDates;
}

function loadStatementTable() {

    var headerDates = getHeaderDatesRow();


    $('#statementTableId').empty();
    $('#statementTableId').append('<thead></thead>');
    $('#statementTableId').append('<tbody></tbody>');

    $('#statementTableId > thead').append('<tr></tr>');

    for (var i = 0; i < headerDates.length; i++) {
        var tableHeaderColVal = headerDates[i];
        $('#statementTableId > thead > tr:last').append('<th>' + tableHeaderColVal + '</th>');

    }

    var callExpirationDate = Epoch(Date.now()); //getCallExpirationDate();
    var formattedCallExpirationDate = EpochToDate(callExpirationDate);

    $('#statementTableId > thead > tr:last').append('<th>' + formattedCallExpirationDate + '</th>');

    var putExpirationDate = getPutExpirationDate();
    var formattedPutExpDate = EpochToDate(putExpirationDate);

    $('#statementTableId > thead > tr:last').append('<th>' + formattedPutExpDate + '</th>');

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




        }
        nextId = rowName + (k);
        $('#statementTableId tr:last').append('<td id=' + nextId + ' data-val=CallDateDataVal>' + "N/A" + '</td>');
        nextId = rowName + (k + 1);
        $('#statementTableId tr:last').append('<td id=' + nextId + ' data-val=PutDateDataVal>' + "N/A" + '</td>');

    }

    //  $('#statementTableId td:nth-child(n+5').attr('contenteditable', 'true');
    //$('#statementTableId td:nth-child(5)').attr('contenteditable', 'true');
}

function getColumnNames() {
    var colNames = [];
    for (var j = 1; j < JsonStatementTable.length - 1; j++) {
        var rowArray = JsonStatementTable[j];
        colNames.push(rowArray[0]);
    }
    return colNames;
}



function getColWithinNumberOfDays(expDateString, numOfDays) {

    //var expDateString = expDate;
    var headerDates = getHeaderDatesRow();

    var colNumberMatch = 0;

    for (var dateProp in headerDates) {
        if (headerDates.hasOwnProperty(dateProp)) {
            var hdDate = headerDates[dateProp];
            if (isDiffInDateWithinNumberOfDays(hdDate, expDateString, numOfDays)) return colNumberMatch;
            colNumberMatch++;
            if (colNumberMatch >= callColumnIndex()) return 0;
        }
    }

    return 0;

}

function isDiffInDateWithinNumberOfDays(date1, date2, numOfDays) {


    var diff = diffInNumberOfDays(date1, date2);

    return (diff <= numOfDays);
}

function diffInNumberOfDays(date1, date2) {
    var date1Seconds = new Date(date1);
    var date2Seconds = new Date(date2);

    var epochDate1 = Epoch(date1Seconds);
    var epochDate2 = Epoch(date2Seconds);

    var diff = Math.abs(epochDate1 - epochDate2);
    var numOfDays = diff / (24 * 60 * 60);

    return numOfDays;
}



function getCallExpirationDate() {
    var selectedDate = $("#expDateId").find(":selected").val();
    return selectedDate;
}

function getPutExpirationDate() {
    var selectedDate = $("#putExpDateId").find(":selected").val();
    return selectedDate;
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

function setPutBuyingPrice(colNum) {
    var putBuyingPriceId = "#statementTableId #Buying_Price" + colNum;

    var putStrikePrice = getPutStrikePrice();

    var putPremium = getAveragePutPremium();

    var bp = putStrikePrice - putPremium;

    $(putBuyingPriceId).text(bp.toFixed(2));

    $(putBuyingPriceId).attr("title", "Put Strike Price - Put Premium");
}

function getPutStrikePrice() {
    var putStrike = $('#putStrikeId').val();
    return Number(putStrike);
}

function getAveragePutPremium() {
    //$('#quoteTableId > tbody > tr').append("<td id='optionBid'>" + strikeDict['bid'] + "</td>");
    //$('#quoteTableId > tbody > tr').append("<td id='optionAsk'>" + strikeDict['ask'] + "</td>");
    var optionBid = Number($('#putQuoteTableId #optionBid').text());
    var optionAsk = Number($('#putQuoteTableId #optionAsk').text());
    var avg = ((optionBid + optionAsk) / 2.0);
    return avg;
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


    var colNum = colNumberForCallCalculations() //(numOfCols() - 2).toString();

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
    var colNum = colNumberForCallCalculations() //(numOfCols() - 2).toString();
    //setCallPremium();
    //setBuyingPrice(colNum);
    //setCashFlowMultiple(colNum);

    setBuyingPrice(callColumnIndex());
    setCashFlowMultiple(callColumnIndex());
}

function Recalculate() {
    var colNum = colNumberForCallCalculations() //(numOfCols() - 2).toString();
    setTotalLibMinusCurrentAssets();


    // setBuyingPrice(colNum);
    setCashFlowMultiple(colNum);
    // setDividendAmount();
    SetRateOfReturn();

}

function setTotalLibMinusCurrentAssets() {
    var colNum = colNumberForCallCalculations() //(numOfCols() - 2).toString();

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

