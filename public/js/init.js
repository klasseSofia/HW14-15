var db;

$.ajax({
    type: 'get',
    url: '/api/products',
    dataType : 'json',
    success: function(data) {
        db = data;
        successHandler();
    },
    error:  function() {
        errorHandler();
    }
});

function successHandler() {
    addHeader();
    addCartProduct();
    updateTotal();
    addPurchaseBtn();
    buy();

    $('.item__close-button').on('click', setPopupEvents);
}

function errorHandler() {
    $('#products').html('Services unavailable');
}

function addHeader() {
    var title = db.searchVehicle,
        newHeader = $(
        '<div class="header">' + title.year + ' ' + title.make + ' ' + title.model + ' ' + title.name + ' ' +
        title.option + '</div>'
        );

    $('body').prepend(newHeader);
}

function addCartProduct() {
    var newElem;

    $.each(db.products, function (i, el) {
        newElem = $(
            '<div class="item">' +
            '<img class="item__image" src="' + el.imgUrl + '"/>' +
            '<div class="item__wrap">' +
            '<h2 class="item__header">' + el.pName + '</h2>' +
            '<div class="item__id">Product #' + el.id + '</div>' +
            '<div class="item__vehicle">Vehicle: ' +
            '<span class="item__vehicle-info">' +
                el.vehicle.year + ' ' + el.vehicle.make + ' ' + el.vehicle.model
                + ' ' + el.vehicle.name + ' ' + el.vehicle.option + '</span>' +
            '</div>' +
            '<div class="item__size">Size/ Style: ' +
            '<span class="item__size-info">' + el.sizeStyle + '</span>' +
            '</div>' +
            '<div class="item__quantity">QTY: ' +
            '<input class="item__qty-input" type="text" value="'+ el.pQuantity +'">' +
            '<span class="item__update">Update</span>' +
            '</div>' +
            '</div>' +
            '<div class="item__price-wrap"><div class="item__close-button">&times;</div>' +
            '<div class="item__price">$<span class = "item__price-value">' + el.pPrice + '</span></div>' +
            '<div class="item__total">total: $'+ el.pQuantity * el.pPrice + '</div>' +
            '</div>'
        );

        validationRender(el, newElem);
    });
}

function validationRender(el, newElems) {
    var message1 = $(
        '<div class="error-message">' +
        '<div class="error-message__text">The product out of stock</div></div>'
    ),
        message2 = $(
        '<div class="error-message">' +
        '<div class="error-message__text">Please set QTY</div></div>'
    ),
        sum = el.totalProduct.stock + el.totalProduct.sklad;

    if (el.pQuantity > sum) {
        $('#products').append(message1, newElems);
        removeErrorMessage();
    } else if (el.pQuantity == 0) {
        $('#products').append(message2, newElems);
        removeErrorMessage();
    } else {
        $('#products').append(newElems);
    }
}

function updateTotal() {
    var quantity,
        index,
        updateButton = $('.item__update');

    updateButton.on('click', function() {
        index = updateButton.index(this);
        quantity = $('.item__qty-input').eq(index).val();
        validationOfInteger(quantity, index);
    });
}

function validationOfInteger (quantity, index) {
    if (parseInt(quantity) != quantity ) {
        addErrorMessage(index, 'The number of ordered units must be an integer.');
        removeErrorMessage(index);
    } else {
        validationOfQuantity(quantity, index);
    }
}

function  validationOfQuantity(quantity, index) {
    var stock = db.products[index].totalProduct.stock,
        sklad = db.products[index].totalProduct.sklad,
        onlyStore = db.products[index].isInStoreOnly,
        sum = stock + sklad;

    if (quantity > 0 && quantity <= 99 && sum >= 99) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (quantity > 0 && sum <= 99 && quantity <= sum) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (quantity <= 0) {
        addErrorMessage(index, 'Please set QTY');
        removeErrorMessage(index);
    } else if (quantity >= 99) {
        addErrorMessage(index, 'Maximum quantity you can order 99');
        removeErrorMessage(index);
    } else if (quantity > 0 && quantity > sum && sum > 0) {
        addErrorMessage(index, 'Maximum quantity you can order is ' + sum);
        removeErrorMessage(index);
    } else if (sum === 0) {
        addErrorMessage(index, 'The product out of stock');
        removeErrorMessage(index);
    } else if (onlyStore = true && quantity <= stock) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (onlyStore = true && quantity >= stock) {
        addErrorMessage(index, 'Maximum quantity you can order ' + stock);
        removeErrorMessage(index);
    }
}

function setTotal(index, quantity) {
    var itemPrice = db.products[index].pPrice,
        total = quantity * itemPrice;

    $('.item__total').eq(index).html('total:$' + total);
}

function addErrorMessage(index, message) {
    var messageElement = $(
        '<div class="error-message">' +
        '<div class="error-message__text"></div></div>'
    );

    $('.item').eq(index).before(messageElement);
    $('.error-message__text').html(message);
    $('.item__qty-input').eq(index).css('border', '1px solid red');
    $('.item__total').eq(index).html('total:$ 0');
}

function removeErrorMessage(index) {
   setTimeout(function() {
        $('.error-message').fadeOut(1000);
        $('.error-message').remove();
        $('.item__qty-input').eq(index).css('border', '1px solid grey');
    }, 5000);
}



function setPopupEvents() {
    var elem = this;
        elem.closest('.item').remove();
        $('.popup').remove();
}

function addPurchaseBtn() {
    var byeButton = $(
        '<div class="buy">' +
        '<button class="buy__button"><span class="buy__plus">+</span> Buy</button>' +
        '</div>'
    );

    $('.btn').append(byeButton);
}

function buy() {
    var quantity,
        purchaseButton = $('.buy__button'),
        item = $('.item'),
        QTY = $('.item__qty-input');

    purchaseButton.on('click', function() {
        $.each(item, function (i, elem) {
            quantity = QTY.eq(i).val();
            validationOfInteger(quantity, i);
        });
    });
}