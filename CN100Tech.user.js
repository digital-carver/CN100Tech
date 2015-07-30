// ==UserScript==
// @name        CN100Tech
// @namespace   abiteasier.in
// @description Buy 100 tech in the recommended increments, with one click
// @include     http://www.cybernations.net/technology_purchase.asp?Nation_ID=*
// @version     0.1
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @require     http://code.jquery.com/jquery-1.11.3.min.js
// ==/UserScript==

var valid_tech_values = ['0.00', '4.50', '14.50', '24.50', '29.50', '39.50', '49.50', '59.50', '69.50', '74.50', '84.50', '94.50', '100.00'];
var purchase_increments = ['4.5', '10', '10', '5', '10', '10', '10', '10', '5', '10', '10', '5.5'];

// The <p> that contains the Purchase Tech button
var purchase_button_container = $('#table13 >tbody > tr > td:nth-child(3) > p[align="center"]');

var cur_tech = get_cur_tech();
if (parseFloat(cur_tech) >= 100) {
    GM_deleteValue('autobuying_going_on');
    show_user_msg('(Autobuy disabled since you already have at least 100 tech)', '#f95d02');
    return;
}

if (GM_getValue('autobuying_going_on') === true) {
    show_user_msg('Autobuy is going on, just let the code finish doing its thing...', '#008060');
    buy_next_chunk(cur_tech);
    return;
}

GM_addStyle("                                     \
        .GreasyButtons {                          \
            background-color: #008060 !important; \
        }                                         \
        ");

// Create a new button for Auto-buy, based on existing Purchase button
var autobuy_button_container = purchase_button_container.clone();
var autobuy_button = autobuy_button_container.find('input.Buttons');
autobuy_button.attr('value', 'Auto-buy to 100 tech in increments').attr('type', 'button');
autobuy_button.attr('class', 'GreasyButtons');

purchase_button_container.after(autobuy_button_container);
autobuy_button.click(buy_em_all);

function buy_em_all() {
    autobuy_button_container.hide();
    show_user_msg('Autobuy has started, just let the code finish doing its thing...', '#008060');
    cur_tech = get_cur_tech();

    var n = valid_tech_values.indexOf(cur_tech);
    console.log("Found cur_tech to be ", cur_tech, " and index as ", n);
    if (n < 0) {
        var next_tech_jump = valid_tech_values.filter(
                function(el, i, arr) {
                    return (parseFloat(el) > parseFloat(cur_tech))
                })[0];
        console.log('next_tech_jump is ', next_tech_jump);
        var question = 'You currently have ' + cur_tech + ' technology which is not among the standard increments. ' + 
                        + 'The script will first buy tech to bring this to '
                        + next_tech_jump + ' and then continue in the standard way.\n'
                        + 'Press OK if this is what you want.\n" 
                        + 'Press Cancel if you want to deal with things manually.\n";
        if (confirm(question)) {
            var to_buy = (parseFloat(el) - parseFloat(cur_tech)).toFixed(1).replace(/\.0$/);
            make_purchase(to_buy);
        }
        else {
            autobuy_button_container.show();
            $("#greasy_msg").remove();
            return;
        }
    }

    GM_setValue('autobuying_going_on', true);
    buy_next_chunk(cur_tech);
}


function buy_next_chunk(cur_tech_value) {
    var n           = valid_tech_values.indexOf(cur_tech_value);
    var to_buy      = purchase_increments[n];

    console.log('Found to_buy to be ', to_buy);
    make_purchase(to_buy);
}

function make_purchase(to_buy) {
    $('select[name="newpurchase"]').val(to_buy);
    purchase_button_container.find('input.Buttons').click();
}

function get_cur_tech() {
    // Get current tech value
    // What's with ID+nth-child specification on table17 you ask?
    // Why, there are _two_ #table17's, with same attributes but different content!
    return $('#table17:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(2)').text().trim();
}

function show_user_msg(msg_text, msg_color) {
    var msg_html = '<p color="' + msg_color + '" align="center" id="#greasy_msg">' + msg_text + '</p>';
    var info_p = $(msg_html);
    purchase_button_container.after(info_p);
    return;
}

