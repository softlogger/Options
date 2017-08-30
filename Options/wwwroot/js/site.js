// Write your Javascript 
function theButt(e) {
    alert($('#strike').val());
    alert($("#finalDate").val());
}

$(document).ready(function () {

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
   
})



//$(document).ready(function () {
            //    $('.vote-up').click(function (e) {
            //        e.preventDefault();
            //        var id = $(this).data('productid')
            //        $.post('/Home/Vote', { id: id }, function (data) {
            //            $('#surveyWidget').html(data);
            //        })
            //    })
            //})