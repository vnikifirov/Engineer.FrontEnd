$(function() {
    // Cash the DOM
    var $orders = $("#orders");

    // GET: Get a list of orders from the server controller
    $.ajax({
        type: "GET",
        url: "/api/get-orders",
        dataType: "json",
        success: function(response) {
            // Insert all of retriaved ellements from server into ul list 
            $.each(response, function(index, item) {
                $orders.append(`<li>Name: ${item.name}, Drink: ${item.drink} </li>`);
            });
        }
    });
});