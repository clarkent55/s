/***
 * Dutchi zShop Minigame
 *
 * Requires jQuery for DOM manipulation
 *
 ***/

/*****Variables Used******/
var timerFormatMinutesSeconds = 'dMS';
var timerFormatSeconds = 'dS';

var timerOffset = 0;

var currentProtoId = 0;
var currentAmountStock = Number.MAX_VALUE;

var auctionTimerElement,
    nextPriceTimerElement,
    auctionStockElement,
    auctionItemNameElement,
    auctionItemDescriptionElement,
    auctionItemPriceElement,
    auctionItemImageElement,
    auctionPriceBoxElement,
    auctionPriceBoxSoldOutElement,
    auctionCurrency,
    auctionAmountBadge,
    buyButton,

    /** next dutchi selectors**/
    nextAuctionTimerElement,
    nextAuctionStockElement,
    nextAuctionItemNameElement,
    nextAuctionItemDescriptionElement,
    nextAuctionImageElement,
    nextAuctionBoxElement,
    nextAuctionAmountBadge,

    /** upcoming dutchi selectors**/
    upcomingAuctionTimerElement,
    upcomingAuctionBoxElement,
    upcomingAuctionItemImageElement,
    upcomingAuctionItemDescriptionElement,
    upcomingAuctionItemNameElement,
    upcomingAuctionStockElement,
    upcomingAuctionAmountBadge,

    dutchiContainer,
    dutchiRight,
    dutchiStockBox,
//indicatos
    dutchiAnalogIndicator,
    dutchiBatteryIndicator,
    dutchiCounterIndicator
;


var countdownsInitialized = false;

/*****TIMERS******/

//Initialize countdown dutchi timer
function initCountdowns() {
    dutchiDebug('init countdowns');
    initAuctionCountdown();
    initNextAuctionCountdown();
    initUpcomingAuctionCountdown();
    initNextPriceCountdown();
    if (dutchiApi.getGlobalOptions.showDuration) {
        countdownsInitialized = true;
    }
}

function _updateCountdowns() {
    // if(countdownsInitialized) {
    if (dutchiApi.hasCurrentAuction()) {
        var currentRemainingSeconds = dutchiApi.getCurrentAuctionRemainingSeconds();
        if (currentRemainingSeconds > 0) {
            currentRemainingSeconds += timerOffset;
        }
        auctionTimerElement.countdown("change", {until: currentRemainingSeconds});
    }

    if (dutchiApi.hasNextAuction()) {
        var nextRemainingSeconds = dutchiApi.getNextAuctionRemainingSeconds();
        if (nextRemainingSeconds > 0) {
            nextRemainingSeconds += timerOffset;
        }
        nextAuctionTimerElement.countdown("change", {until: nextRemainingSeconds});
    }

    if (dutchiApi.hasUpcomingAuction()) {
        var upcomingRemainingSeconds = dutchiApi.getUpcomingAuctionRemainingSeconds();
        if (upcomingRemainingSeconds > 0) {
            upcomingRemainingSeconds += timerOffset;
        }
        upcomingAuctionTimerElement.countdown("change", {until: upcomingRemainingSeconds});
    }
    // }
}

function _updatePriceCountdown() {
    nextPriceTimerElement.countdown("change", {until: dutchiApi.getNextPriceRemainingSeconds()});
}

function initAuctionCountdown() {
    var selector = auctionTimerElement;
    if ($(selector).length) {
        dutchiDebug('initAuctionCountdown destroy');
        $(selector).countdown('destroy');
        $(selector).countdown({
            format: timerFormatMinutesSeconds,
            compact: true
        })
    }
}

function initUpcomingAuctionCountdown() {
    var selector = upcomingAuctionTimerElement;
    if ($(selector).length) {
        dutchiDebug('initUpcomingAuctionCountdown destroy');
        $(selector).countdown('destroy');
        $(selector).countdown({
            format: timerFormatMinutesSeconds,
            compact: true
        })
    }
}

function initNextAuctionCountdown() {
    var selector = nextAuctionTimerElement;
    if ($(selector).length) {
        dutchiDebug('initNextAuctionCountdown destroy');
        $(selector).countdown('destroy');
        $(selector).countdown({
            format: timerFormatMinutesSeconds,
            compact: true
        })
    }

}

function initNextPriceCountdown() {
    var remainingSeconds = dutchiApi.getNextPriceRemainingSeconds();
    var selector = nextPriceTimerElement;

    if ($(selector).length) {
        dutchiDebug('initNextPriceCountdown destroy');
        $(selector).countdown('destroy');
        $(selector).countdown({
            until: remainingSeconds,
            format: timerFormatSeconds,
            compact: true,
            onExpiry: callbackHandleUpdatePrice,
            alwaysExpire: true
        })
    }
}

/***** Display functions *****/
function displayAuction(auction) {
    //$('#dutchi_auction').show();
    //$('#dutchi_auction_pause').hide();
    auctionPriceBoxElement.show();
    auctionPriceBoxSoldOutElement.hide();
    auctionItemNameElement.text(auction.getItemName());
    auctionItemDescriptionElement.html(auction.getItemDescription());
    auctionItemPriceElement.text(auction.getCurrentPrice());
    auctionItemImageElement.attr('src', auction.getItemImage());
    auctionCurrency.addClass('currency-' + auction.getPurchaseCurrency());
    auctionCurrency.attr('tooltip-content', dutchi_currencyNames[auction.getPurchaseCurrency() - 1]).tipTip({
        delay: 1000,
        defaultPosition: 'bottom',
        fadeIn: 100,
        attribute: 'tooltip-content',
        maxWidth: 300
    });

    auctionAmountBadge.hide();
    auctionAmountBadge.text('');

    if (auction.isShowAmountBadge() && auction.getDeliveryAmount() > 1) {
        auctionAmountBadge.text('x' + auction.getDeliveryAmount());
        auctionAmountBadge.show();
    } else {
        auctionAmountBadge.hide();
    }
    updateIndicator(auction);
    displayIndicator(auction);
    _updatePriceCountdown();
}

function displayNextAuction(auction) {
    if (auction instanceof DutchiAuction) {
        //nextAuctionBoxElement.show();
        var startAmountStock = auction.getStartAmountStock();

        nextAuctionStockElement.text(startAmountStock);

        if (startAmountStock === 0) {
            nextAuctionAmountBox.hide();
        } else {
            nextAuctionAmountBox.show();
        }
        nextAuctionItemNameElement.text(auction.getItemName());
        nextAuctionItemDescriptionElement.html(auction.getItemDescription());
        nextAuctionImageElement.attr('src', auction.getItemImage());

        nextAuctionAmountBadge.hide();
        nextAuctionAmountBadge.text('');

        if (auction.isShowAmountBadge() && auction.getDeliveryAmount() > 1) {
            nextAuctionAmountBadge.text('x' + auction.getDeliveryAmount());
            nextAuctionAmountBadge.show();
        } else {
            nextAuctionAmountBadge.hide();
        }
    } else {
        nextAuctionBoxElement.addClass('no-upcoming-items');
    }
}

function displayUpcomingAuction(auction) {
    if (auction instanceof DutchiAuction) {
        upcomingAuctionBoxElement.show();

        var startAmountStock = auction.getStartAmountStock();

        upcomingAuctionStockElement.text(startAmountStock);

        if (startAmountStock === 0) {
            upcomingAuctionAmountBox.hide();
        } else {
            upcomingAuctionAmountBox.show();
        }

        upcomingAuctionAmountBadge.hide();
        upcomingAuctionAmountBadge.text('');

        upcomingAuctionItemNameElement.text(auction.getItemName());
        upcomingAuctionItemDescriptionElement.html(auction.getItemDescription());
        upcomingAuctionItemImageElement.attr('src', auction.getItemImage());
        if (auction.isShowAmountBadge() && auction.getDeliveryAmount() > 1) {
            upcomingAuctionAmountBadge.text('x' + auction.getDeliveryAmount());
            upcomingAuctionAmountBadge.show();
        } else {
            upcomingAuctionAmountBadge.hide();
        }
    } else {
        upcomingAuctionBoxElement.hide();
    }

}

function displayIndicator(auction) {
    dutchiAnalogIndicator.hide();
    dutchiBatteryIndicator.hide();
    dutchiCounterIndicator.hide();

    var indicatorType = auction.getAmountIndicator();

    switch (indicatorType) {
        case 'counter':
            dutchiCounterIndicator.show();
            break;
        case 'battery':
            dutchiBatteryIndicator.show();
            break;
        case 'analog':
            dutchiAnalogIndicator.show();
    }
}

function displayPause() {
    dutchiRight.addClass('pause-auction');
    // hide all elements
}

function displayDone() {
    dutchiContainer.addClass('no-auction');
}

function displayOutOfStock() {
    auctionPriceBoxElement.hide();
    auctionPriceBoxSoldOutElement.show();
    if (countUpStock) {
        countUpStock.stop();
    }
    dutchiApi.getCurrentAuction().setIndicatorLevel(0);
    updateIndicator(dutchiApi.getCurrentAuction());
    dutchiStockBox.addClass('none-left');
}

function updatePriceField(price) {
    auctionItemPriceElement.text(price);
}

var countUpStock = false;

function updateItemStockField(auction) {
    var stock = auction.getCurrentIndicatorLevel();

    if (dutchiApi.getState() === dutchiApi.getDutchiStateNames().DUTCHI_STATE_SOLD_OUT) {
        if (countUpStock) {
            countUpStock.stop();
        }
        dutchiStockBox.addClass('none-left');
        auctionStockElement.text('0');
        return;
    }

    if (currentProtoId === dutchiApi.getCurrentAuction().getPrototypeId() && currentAmountStock > stock) {

        if (stock > 0 && stock < auctionStockElement.text()) {
            countUpStock = new countUp('dutchi_stock', auctionStockElement.text(), stock, 0, dutchiApi.getGlobalOptions().refreshInterval, {
                useEasing: false,
                useGrouping: true,
                separator: '',
                decimal: '',
                prefix: '',
                suffix: ''
            });
            countUpStock.start();
            currentAmountStock = stock;
        } else {
            if (countUpStock) {
                countUpStock.stop();
            }
            auctionStockElement.text(stock);
        }
    }
    if (stock <= 9) {
        dutchiStockBox.addClass('none-left');
    }
    // auctionStockElement.text(stock);

}

function updateBatteryIndicator(auction) {
    batteryMeter(100 - auction.getCurrentIndicatorLevel(), auction.getZoneA(), auction.getZoneB(), "#dutchi_battery_indicator");
}

function updateAnalogIndicator(auction) {
    analogMeter(auction.getCurrentIndicatorLevel(), auction.getZoneA(), auction.getZoneB());
}

function updateIndicator(auction) {
    var indicatorType = auction.getAmountIndicator();

    switch (indicatorType) {
        case 'counter':
            updateItemStockField(auction);
            break;
        case 'battery':
            updateBatteryIndicator(auction);
            break;
        case 'analog':
            updateAnalogIndicator(auction);
    }
}

/*****Subscribers*****/
function registerEventHandlers() {
    dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_AUCTION_UPDATED, callbackHandleUpdateAmount);
    dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_PAUSE_AUCTION, callbackHandleAuctionPause);
    dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_AUCTION_CHANGED, callbackHandleAuctionChanged);
    dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_AUCTION_SOLD_OUT, callbackHandleOutOfStock);
    dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_AUCTION_DONE, callbackHandleDone);
    // dutchiApi.addEventHandler(dutchiApi.getGlobalEventKeys().DUTCHI_EVENT_AUCTION_PRICE_UPDATED, callbackHandleUpdatePrice);

    buyButton.off().on('click', handlePurchase);

    upcomingAuctionBoxElement.hover(
        function () {
            $("#dutchi_next_auction_item_description").show();
        }
    );
}

function handlePurchase(e) {
    buyButton.off();
    var $button = buyButton;
    dutchiDebug('buy button clicked');
    //replaceButton(buttonStates.spinnerButton);
    dutchiApi.handlePurchase(callbackAfterPurchase, currentProtoId, auctionItemPriceElement.text());
}

function callbackAfterPurchase(success, balances) {
    var $button = buyButton;

    // let the user see the outcome of the purchase (checkmark or cross button) before sold-out/pause/done state change
    setPreventStateChange(true);

    $button.removeClass('spinning-loader');
    if (success) {
        $button.addClass('active');
        $button.addClass('bubble');
        updateBalances(balances);
    } else {
        $button.addClass('purchase-error');
        $button.addClass('bubble');
    }

    setTimeout(function () {
        setPreventStateChange(false);
    }, 1000);

    setTimeout(function () {
        dutchiDebug('buy button listener added');
        //$('#buyButton').off().on('click', handlePurchase);
        //replaceButton(buttonStates.buyButton);
        $button.text(dutchi_buyButtonText);
        $button.removeClass('active');
        $button.removeClass('bubble');
        $button.removeClass('purchase-error');
        buyButton.blur();
        buyButton.off().on('click', handlePurchase);
        //initState();
    }, dutchiApi.getGlobalOptions().buttonDisplayDuration * 0);
}

function callbackHandleUpdateAmount() {
    if (currentProtoId === dutchiApi.getCurrentAuction().getPrototypeId()) {
        updateIndicator(dutchiApi.getCurrentAuction());
    }
}

function callbackHandleOutOfStock() {
    var waitForTimer = setInterval(function () {
        if (!preventStateChange) {
            dutchiDebug('clearInterval callbackHandleOutOfStock');
            clearInterval(waitForTimer);
            setOutOfStockState();
        }
    }, 1000);
}

// called by event EVENT_AUCTION_UPDATED e.g. when price or amount changes but the auctions stays the same
function callbackHandleUpdatePrice() {
    dutchiDebug('callback handle update dutchi');
    currentPrice = dutchiApi.calculateCurrentPrice();
    if (currentPrice > 0) {
        updatePriceField(currentPrice);
        _updatePriceCountdown();
    }
}

// called by event EVENT_AUCTION_ENDED when an auchtion ends. show pause screen
function callbackHandleAuctionPause() {
    var waitForTimer = setInterval(function () {
        var seconds = 0;
        if (countdownsInitialized) {
            seconds = $.countdown.periodsToSeconds(auctionTimerElement.countdown('getTimes'));
        }
        if (seconds === 0 && !preventStateChange) {
            dutchiDebug('clearInterval callbackHandleAuctionPause');
            clearInterval(waitForTimer);
            initState();
        }
    }, 1000);
}

// update display dutchi data
// set flag that it's ready
function callbackHandleAuctionChanged() {
    var waitForTimer = setInterval(function () {
        currentAmountStock = Number.MAX_VALUE;
        var seconds = 0;
        if (countdownsInitialized) {
            seconds = $.countdown.periodsToSeconds(nextAuctionTimerElement.countdown('getTimes'));
        }
        if (seconds === 0 && !preventStateChange || dutchiApi.getCurrentAuctionRemainingSeconds() > 0) {
            dutchiDebug('clearInterval callbackHandleAuctionChanged');
            clearInterval(waitForTimer);
            updateProtoAndPrice();
            auctionStockElement.text(dutchiApi.getCurrentAuction().getCurrentIndicatorLevel());
            initState();
        }
    }, 1000);
}

function callbackHandleDone() {
    var waitForTimer = setInterval(function () {
        var seconds = 0;
        if (countdownsInitialized) {
            seconds = $.countdown.periodsToSeconds(auctionTimerElement.countdown('getTimes'));
        }
        if ((seconds === 0 && !preventStateChange) || !dutchiApi.getGlobalOptions().running) {
            dutchiDebug('clearInterval callbackHandleDone');
            clearInterval(waitForTimer);
            initState();
        }
    }, 1000);
}

// set the protoId and price the user currently sees (might change in dutchiApi before user sees the change)
function updateProtoAndPrice() {
    currentProtoId = dutchiApi.getCurrentAuction().getPrototypeId();
    currentPrice = dutchiApi.getCurrentAuction().getCurrentPrice();
}

/*****STATES*******/

function setRunningState() {
    resetState();
    currentPrice = dutchiApi.calculateCurrentPrice();
    _updatePriceCountdown();
    displayAuction(dutchiApi.getCurrentAuction());
    displayNextAuction(dutchiApi.getNextAuction());
    displayUpcomingAuction(dutchiApi.getUpcomingAuction());
}

function setPauseState() {
    resetState();
    displayNextAuction(dutchiApi.getNextAuction());
    displayUpcomingAuction(dutchiApi.getUpcomingAuction());
    displayPause();
}

function setOutOfStockState() {
    resetState();
    displayAuction(dutchiApi.getCurrentAuction());
    displayNextAuction(dutchiApi.getNextAuction());
    displayUpcomingAuction(dutchiApi.getUpcomingAuction());
    displayOutOfStock();
}

function setDoneState() {
    resetState();
    displayDone();
}

function resetState() {
    // hideAllElements();
    removeSpecialClasses();
}

function removeSpecialClasses() {
    dutchiRight.removeClass('pause-auction');
    dutchiContainer.removeClass('no-auction');
    dutchiStockBox.removeClass('none-left');
    nextAuctionBoxElement.removeClass('no-upcoming-items');
    auctionCurrency.removeClass('currency-1');
    auctionCurrency.removeClass('currency-2');
}

function setPreventStateChange(value) {
    dutchiDebug('preventStateChange = ' + value);
    preventStateChange = value;
}

function initState(initial) {
    var state = dutchiApi.getState();
    dutchiDebug('STATE: ' + state);
    switch (state) {
        case 'DUTCHI_STATE_PAUSE':
            setPauseState();
            break;
        case 'DUTCHI_STATE_SOLD_OUT':
            setOutOfStockState();
            break;
        case 'DUTCHI_STATE_RUNNING':
            if (initial) {
                updateProtoAndPrice();
            }
            setRunningState();
            break;
        case 'DUTCHI_STATE_DONE':
            setDoneState();
            break;
    }
    if (state !== 'DUTCHI_STATE_DONE') {
        _updateCountdowns();
    }
}

/**
 * Update the balances via ajax
 * @author timo.huber
 * @returns {boolean}
 */
function updateBalances(balances) {
    for (var k in balances) {
        var newValue = balances[k],
            balanceEl = $('#balances' + k),
            onComplete = (zs.data.useCurrencyFormatter) ? function () {
                formatCurrency(balanceEl);
            } : function () {
            };

        if (!balanceEl.length) {
            continue;
        }
        $('#balances' + k).attr('data-currency', newValue);

        var currentVal = parseInt(balanceEl.text());
        var cU = new countUp('balances' + k, currentVal, newValue, 0, 3, {
            useEasing: true,
            useGrouping: true,
            separator: '',
            decimal: '',
            prefix: '',
            suffix: ''
        });
        cU.start(onComplete);
    }
}

function initAmountStockElement() {
    if (dutchiApi.hasCurrentAuction()) {
        currentAmountStock = dutchiApi.getCurrentAuction().getCurrentIndicatorLevel();
        auctionStockElement.text(currentAmountStock);
    }
}

/******DOCUMENT READY ******/
$(document).ready(function () {
    auctionTimerElement = $("#dutchi_auction_timer");
    nextPriceTimerElement = $("#dutchi_next_price_timer");
    auctionStockElement = $('#dutchi_stock');
    auctionItemNameElement = $('#dutchi_auction_item_name');
    auctionItemDescriptionElement = $('#dutchi_auction_item_description');
    auctionItemPriceElement = $('#dutchi_auction_price');
    auctionItemImageElement = $('#dutchi_auction_item_image');
    auctionPriceBoxElement = $('#dutchi_price_box');
    auctionPriceBoxSoldOutElement = $('#dutchi_price_box_sold_out');
    auctionCurrency = $('#dutchi_auction_currency');
    auctionAmountBadge = $('#dutchi_auction_amount_badge');
    buyButton = $('#dutchi_auction_buy_button');

    /** next dutchi selectors**/
    nextAuctionTimerElement = $('#dutchi_next_auction_timer');
    nextAuctionStockElement = $('#dutchi_next_auction_stock');
    nextAuctionItemNameElement = $('#dutchi_next_auction_item_name');
    nextAuctionItemDescriptionElement = $('#dutchi_next_auction_item_description');
    nextAuctionImageElement = $('#dutchi_next_auction_item_image');
    nextAuctionBoxElement = $('#dutchi_next_auction');
    nextAuctionAmountBadge = $('#dutchi_next_auction_amount_badge');
    nextAuctionAmountBox = $('#dutchi_box_next_amount');

    /** upcoming dutchi selectors**/
    upcomingAuctionTimerElement = $('#dutchi_upcoming_auction_timer');
    upcomingAuctionBoxElement = $('#dutchi_upcoming_auction');
    upcomingAuctionItemImageElement = $('#dutchi_upcoming_auction_item_image');
    upcomingAuctionItemDescriptionElement = $('#dutchi_upcoming_auction_item_description');
    upcomingAuctionItemNameElement = $('#dutchi_upcoming_auction_item_name');
    upcomingAuctionStockElement = $('#dutchi_upcoming_auction_stock');
    upcomingAuctionAmountBadge = $('#dutchi_upcoming_auction_amount_badge');
    upcomingAuctionAmountBox = $('#dutchi_box_upcoming_amount');

    dutchiContainer = $('#dutchiContainer');
    dutchiRight = $('#dutchi_right');
    dutchiStockBox = $('#dutchi_box_stock');

    dutchiAnalogIndicator = $('#dutchi_analog_indicator');
    dutchiBatteryIndicator = $('#dutchi_battery_indicator');
    dutchiCounterIndicator = $('#dutchi_stock');

    initCountdowns();
    registerEventHandlers();
    initAmountStockElement();
    initState(true);
});
