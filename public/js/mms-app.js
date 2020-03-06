var qualifications = {};
var transcript = [];
var numAttachments = 0;
var viewingDetails = false;
var notificationHandler = function(data){
    $("#sdkStatus").html(JSON.stringify(data, null, 2));
};

var preview = function(previewString, num){
    previewObj = JSON.parse(decodeURIComponent(previewString));
    if($('#previewContainer'+num).is(':empty')){
        if(previewObj.format.match(/(gif|jpg|jpeg|png)$/ig)){
            $('#previewContainer'+num).html('<img src="'+previewObj.href+'" width="100%;">');
        }else{
            $('#previewContainer'+num).html('No Preview Available');
        }
    }else{
        $('#previewContainer'+num).html('');
    }
};

var updateTranscript = function updateTranscript(){
    transcript = _.orderBy(transcript, ['time'], ['asc']);
}

$('.detailsButton').on('click', function(){
    viewingDetails = !viewingDetails;
    if(viewingDetails){
        $("#arrow").attr('src', './img/right_arrow.png');
        $(".detailsContainer").show();
    }else{
        $("#arrow").attr('src', './img/up_arrow.png');
        $(".detailsContainer").hide();
    }
});

lpTag.agentSDK.init({notificationCallback: notificationHandler});
lpTag.agentSDK.bind('chatInfo', function(data){
    console.log("Success!", data);
    if(data.newValue.accountId){
        $("#accountNum").html("Config. for Account <span class='right-align'>" + data.newValue.accountId + "</span>");
    }
}, function(err){
    if(err){
        console.log("Error - Account Number", err);
    }
});

lpTag.agentSDK.bind('visitorInfo', function(data){
    console.log("Success!", data);
    if(data.newValue.visitorName){
        qualifications['from'] = data.newValue.visitorName;
        $("#consumerNum").html("Consumer SMS Number <span class='right-align'>" +  data.newValue.visitorName + "</span>");
    }
}, function(err){
    if(err){
        console.log("Error - Visit info", err);
    }
});

lpTag.agentSDK.bind('authenticatedData', (data)=>{
    console.log("Success!", data);
    if(data.newValue.customerDetails.companyBranch){
        qualifications['to'] = data.newValue.customerDetails.companyBranch;
        $("#smsNum").html("Agent SMS Number<span class='right-align'>" + data.newValue.customerDetails.companyBranch + "</span>");
    }
}, (err)=>{
    if(err){
        console.log("Error - Auth Data info", err);
    }
});

lpTag.agentSDK.bind('chatTranscript.lines', (data)=>{
    console.log("Success!", data);
    if(data.newValue){
        transcript = transcript.concat(data.newValue);
        updateTranscript();
    }
}, (err)=>{
    if(err){
        console.log("Error - Transcripts info", err);
    }
});
var PRODUCTION = true;
var socket;

(function(){
    setTimeout(()=>{
        socket = io(PRODUCTION ? 'https://messagingagentwidgets.herokuapp.com/' : "http://localhost:3000/");
        socket.on('connect', function(){
            $('.readyNotification').html('<img src="./img/check_mark.png">&nbsp;&nbsp;Connected to Twilio Service');
            socket.on('mmsEvent', function(evt){
                console.log('received mms event ' + JSON.stringify(evt));
                if(evt.from === qualifications.from && evt.to === qualifications.to){
                    if(Array.isArray(evt.mms)){
                        evt.mms.forEach(function(mmsTempObj){
                            numAttachments ++;
                            var mmsObject = JSON.parse(mmsTempObj);
                            console.log(JSON.stringify(mmsObject) + JSON.stringify(evt));
                            $('#mmsContainer').append(
                                '<div class="mmsEntry">'+
                                    '<span style="font-family:font128091;">Time:&emsp;</span>' + (new Date(parseInt(evt.time))).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +', '+
                                                            (new Date(parseInt(evt.time))).toLocaleTimeString()+ '<br>'+
                                    '<span style="font-family:font128091;">Type&emsp;</span>   ' + mmsObject.format + '<br>'+
                                    '<div class="mmsButtonsContainer">'+
                                        '<a style="max-width:48%;padding-right:2%;" target="_blank" href="' + 
                                                            mmsObject.href + '"><img style="max-width:50%"  src="./img/link_button.png"></a>'+
                                        '<a style="cursor:pointer;max-width:48%;padding-left:2%;" onclick="preview(\''
                                                            + encodeURIComponent(JSON.stringify(mmsObject)) +'\', '+numAttachments+')"><img style="max-width:50%"  src="./img/preview_button.png"></a> '+
                                    '</div>'+
                                    '<div id="previewContainer'+numAttachments+'"></div>'+
                                '</div>');
                                transcript.push({ "by": evt.from, "source": "visitor", time: evt.time, "type": "link", "text": mmsObject.href });
                            updateTranscript();
                        });
                    }else{
                        numAttachments ++;
                        var mmsObject = JSON.parse(evt.mms);
                        console.log(JSON.stringify(mmsObject) + JSON.stringify(evt));
                        $('#mmsContainer').append(
                            '<div class="mmsEntry">'+
                                '<span style="font-family:font128091;">Time:&emsp;</span>' + (new Date(parseInt(evt.time))).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +', '+
                                                        (new Date(parseInt(evt.time))).toLocaleTimeString()+ '<br>'+
                                '<span style="font-family:font128091;">Type&emsp;</span>   ' + mmsObject.format + '<br>'+
                                '<div class="mmsButtonsContainer">'+
                                    '<a style="max-width:50%"  target="_blank" href="' + 
                                                        mmsObject.href + '"><img style="max-width:48%;padding-right:2%;"  src="./img/link_button.png"></a>'+
                                    '<a style="cursor:pointer;max-width:47%;" onclick="preview(\''
                                                        + encodeURIComponent(JSON.stringify(mmsObject)) +'\', '+numAttachments+')"><img style="max-width:48%;padding-left:2%;"  src="./img/preview_button.png"></a> '+
                                '</div>'+
                                '<div id="previewContainer'+numAttachments+'"></div>'+
                            '</div>');
                            transcript.push({ "by": evt.from, "source": "visitor", time: evt.time, "type": "link", "text": mmsObject.href });
                        updateTranscript();
                    }
                }
            });
        });
    }, 3000);
})();