//JS for evaluating pixel errors, same as stand alone pixel parser tool
function magic(queryString){
    queryString = queryString.toLowerCase();
    queryString = queryString.replace(/&amp;/gi,'&');
    pixelArray = queryString.split("&");
    var subTotal = 0;
    var badSubtotal = false;
    var pixelDict = new Array();
    var itemList = "";
    var qtyBadChars = "";
    var itemBadChars = "";
    var amountBadChars = "";
    var amtBadChars = "";
    var tagType = "";
    var warnings = {};

    // returns 'img' not sure what this is for yet
    for(i = 0; i < pixelArray.length; i++){
        usingX = pixelArray[i].match(/(dcntx)|(amtx)|(itemx)|(qtyx)/gi);
            if(usingX !== null){
                warnings += '<br/>Warning: found bad parameter: ' + usingX;
            }
        var t = pixelArray[i].split("=");
        pixelDict[t[0].toUpperCase()] = t[1];
    }


    if(pixelDict["AMOUNT"] !== undefined){
        amountBadChars = pixelDict["AMOUNT"].match(/[^0-9\.]/g);
            if(amountBadChars !== null){
                warnings += '<br/>Warning: Illegal characters found in AMOUNT: ' + amountBadChars;
                badSubtotal = true;
            }

            if( ! $.isNumeric(pixelDict["AMOUNT"])) {
                warnings += '<br/>Warning: AMOUNT is not a numeric value: ' + pixelDict["AMOUNT"];
                badSubtotal = true;
            }

        tagType = "simple";
        itemList = itemList + '<span class="params">AMOUNT</span>: ' + pixelDict["AMOUNT"]+'<br/>';
        subTotal = subTotal + Math.round(parseFloat(pixelDict["AMOUNT"])* 100) / 100;
    }

    if(pixelDict["CONTAINERTAGID"] !== undefined){
        itemList = itemList + '<span class="params">CONTAINERTAGID</span>: ' + pixelDict["CONTAINERTAGID"]+'<br/>';
    }

        //if(pixelDict["COUPON"] === undefined){
            //warnings += '<br/>Warning: COUPON is missing.';
        //};

        if(pixelDict["COUPON"] !== undefined){
            itemList = itemList + '<span class="params">COUPON</span>: ' + pixelDict["COUPON"]+'<br/>';
        }

        if(pixelDict["CURRENCY"] !== undefined){
            itemList = itemList + '<span class="params">CURRENCY</span>: ' + pixelDict["CURRENCY"]+'<br/>';
        }

        if(pixelDict["DISCOUNT"] !== undefined){
            itemList = itemList + '<span class="params">DISCOUNT</span>: ' + pixelDict["DISCOUNT"]+'<br/>';
            subTotal = subTotal - Math.round(parseFloat(Math.abs(pixelDict["DISCOUNT"])) * 100) / 100;
        }

        if("METHOD" in pixelDict){
            itemList = itemList + '<span class="params">METHOD</span>: ' + pixelDict["METHOD"]+'<br/>';
                if(!pixelDict["METHOD"]){
                    warnings += '<br/>Warning: METHOD value is not defined'
                }
                else if(pixelDict["METHOD"].toLowerCase() != 'img' && pixelDict["METHOD"].toLowerCase() != 's2s'){
                    warnings += '<br/>Warning: METHOD value is not IMG or S2S'
                }
                else if(pixelDict['METHOD'].toLowerCase()=='s2s'){
                    if(!(pixelDict["SIGNATURE"] && pixelDict["CJEVENT"])){
                        warnings += '<br/>Warning: METHOD is S2S but CJEVENT and/or SIGNATURE parameters are missing'
                    }
                }
        }

        if(pixelDict["CHANNEL"] !== undefined){
            itemList = itemList + '<span class="params">CHANNEL</span>: ' + pixelDict["CHANNEL"]+'<br/>';
        }

        if(pixelDict["CHANNEL_TS"] !== undefined){
            itemList = itemList + '<span class="params">CHANNEL_TS</span>: ' + pixelDict["CHANNEL_TS"]+'<br/>';
        }

        if("SIGNATURE" in pixelDict){
            itemList = itemList + '<span class="params">SIGNATURE</span>: ' + pixelDict["SIGNATURE"]+'<br/>';
                if(!pixelDict["SIGNATURE"]){
                    warnings += '<br/>Warning: SIGNATURE value is not defined'
                }
        }

        if("CJEVENT" in pixelDict){
            itemList = itemList + '<span class="params">CJEVENT</span>: ' + pixelDict["CJEVENT"]+'<br/>';
                if(!pixelDict["CJEVENT"]){
                    warnings += '<br/>Warning: CJEVENT value is not defined'
                }
        }

    //Warnings for Channel and Channel_TS
    master: {
        if(!("CHANNEL" in pixelDict) && !("CHANNEL_TS" in pixelDict)){
            break master;
        }

        if(!("CHANNEL" in pixelDict)) {
            warnings += '<br/>Warning: CHANNEL is missing';
        }
        else if(!(pixelDict["CHANNEL"].toLowerCase() === "cj" ||
            pixelDict["CHANNEL"].toLowerCase() === "direct" ||
            pixelDict["CHANNEL"].toLowerCase() === "affiliate_other" ||
            pixelDict["CHANNEL"].toLowerCase() === "display" ||
            pixelDict["CHANNEL"].toLowerCase() === "social" ||
            pixelDict["CHANNEL"].toLowerCase() === "search" ||
            pixelDict["CHANNEL"].toLowerCase() === "email" ||
            pixelDict["CHANNEL"].toLowerCase() === "other") &&
                ("CHANNEL" in pixelDict)) {
                    warnings += '<br/>Warning: CHANNEL parameter included with unrecognized value'
                }
        if(!("CHANNEL_TS" in pixelDict)) {
            warnings += '<br/>Warning: CHANNEL_TS is missing';
        }
        else if(!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(pixelDict["CHANNEL_TS"])) {
            warnings += '<br/>Warning: CHANNEL_TS is not using the proper format'
        }

    }

    //Conditional logic to determine whether SIMPLE or ADVANCED query string
    //if(pixelDict["ITEM1"] || pixelDict["AMT1"] || pixelDict["QTY1"] || pixelDict["DCNT1"]) {

    itemList = itemList;
    var skuGroupCreated=false;
        for(var n = 1; n < 100 + 1; n++){
            skuGroupCreated=false;
                if(pixelDict["ITEM"+n] !== undefined){
                    if(tagType === "simple"){
                        warnings += '<br/>Warning: tag has both AMOUNT and ITEM params';
                        warnings += '<br/>The subtotal will not be calculated for this reason.';
                        badSubtotal = true;
                    }

                    itemBadChars = pixelDict["ITEM"+n].match(/[^0-9A-Z\-_]/gi);
                        if(itemBadChars !== null){
                            warnings += '<br/>Warning: Illegal characters found in ITEM'+n+': ' + itemBadChars;
                        }
                        if(!skuGroupCreated){
                            itemList = itemList + '<br/>'+ '<span class="params_head">SKU GROUP NUMBER: '+n +'</span><br/>'+ '<span class="params">ITEM'+'</span>: ' + pixelDict["ITEM"+n]+'<br/>';
                            skuGroupCreated=true;
                        }

                }
                if(pixelDict["AMT"+n]){
                    if(!skuGroupCreated){
                        itemList = itemList + '<br/>'+ '<span class="params_head">SKU GROUP NUMBER: '+n +'</span><br/>';
                        skuGroupCreated=true;
                    }
                    itemList = itemList+'<span class="params">AMT'+'</span>: ' + pixelDict["AMT"+n] +'<br/>'
                    tempamt = Math.round( parseFloat(pixelDict["AMT"+n]) * 100) / 100;
                    amtBadChars = pixelDict["AMT"+n].match(/[^0-9\.]/g);
                        if(amtBadChars !== null){
                            warnings += '<br/>Warning: Illegal characters found in AMT'+n+': ' + amtBadChars;
                            badSubtotal = true;
                        }

                        // if( ! $.isNumeric(pixelDict["AMT"+n])) {
                        //     warnings += '<br/>Warning: AMT'+n+' is not a numeric value: ' + pixelDict["AMT"+n];
                        //     badSubtotal = true;
                        // }
                }

                if(pixelDict["QTY"+n]){
                    if(!skuGroupCreated){
                        itemList = itemList + '<br/>'+'<span class="params_head">SKU GROUP NUMBER: '+n +'</span><br/>';
                        skuGroupCreated=true;
                    }
                    itemList=itemList+ '<span class="params">QTY'+'</span>: ' + pixelDict["QTY"+n] +'<br/>'
                    qtyBadChars = pixelDict["QTY"+n].match(/[^0-9]/g);

                    if(qtyBadChars !== null){
                        warnings += '<br/>Warning: Illegal characters found in QTY'+n+': ' + qtyBadChars;
                        badSubtotal = true;
                    }
                    tempqty = Math.round( parseFloat(pixelDict["QTY"+n]) * 100) / 100;
                    subTotal = subTotal + (tempamt * tempqty) ;
                }

                if(pixelDict["DCNT"+n]){
                    if(pixelDict["DCNT"+n] !== undefined){
                        if(!skuGroupCreated){
                            itemList = itemList + '<br/>'+'<span class="params_head">SKU GROUP NUMBER: '+n +'</span><br/>';
                            skuGroupCreated=true;
                        }
                    itemList = itemList + '<span class="params">DCNT</span>: ' + pixelDict["DCNT"+n]+'<br/>';
                    subTotal = subTotal - Math.round(Math.abs(parseFloat(pixelDict["DCNT"+n])) * 100) / 100;
                    }
                }
        }

        if(badSubtotal === true){
            warnings += '<br>Warning: Fields used in the order subtotal generated errors. The subtotal may be incorrect.';
        }
            warnings += "<br/><br/></div><br/><br/>";
                if(warnings === "<div class='warnings'><br/><br/></div><br/><br/>"){
                    warnings = "";
                }
            subTotal = Math.round(subTotal * 100) / 100;
            // $("warning").append('<br>' + warnings +'<strong>SUBTOTAL: ' + subTotal + '</strong><br/><br/>' + '<span class="params">CID</span>: ' + pixelDict["CID"] + '<br/>' + '<span class="params">TYPE</span>: ' + pixelDict["TYPE"] + '<br/>' + '<span class="params">OID</span>: '+ pixelDict["OID"] + '<br/>' + itemList + '</div></div>');
                // if( $( "#output_area" ).is( ":hidden" ) ) {
                //     $( "#output_area" ).toggle( "slide","500" );
                // }

//JS for Query String Row
    // $("a[id^=show_]").click(function(event) {
    //     $("#extra_" + $(this).attr('id').substr(5)).slideToggle("slow");
    //     event.preventDefault();
    // })
    // if (warnings != "") {
    //   $('#queryString').addClass("danger");
    //   $('#queryString > td.cie1').html(realName + ':<br>' + today);
    //   document.getElementById('extra_1').innerHTML = warnings;
    //   s1="1";
    // }
    // else {
    //   $('#queryString > td.tableValue').html('No errors');
    //   $('#queryString').addClass("warning");
    //   $('#queryString > td.cie1').html(realName + ':<br>' + today);
    //   s1="0";
    // }
    console.log(warnings);
}
magic('QTY1=1&CID=1532457&AMT1=2**2.40&TYPE=404664&ITEM1=0025359068&CURRENCY=USD&OID=6141768135&COUPON=AUGUST30&METHOD=IMG');
