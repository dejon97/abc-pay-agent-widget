//pure js / jquery
function openNav() {
    var navWidth = $("#sideNav").css('width', '180px');
}

function closeNav() {
    var navWidth = $("#sideNav").css('width', '0px');
}

function toggleNav(){
    var navWidth = $("#sideNav").css('width');
    console.log(navWidth);
    if (navWidth === "0px"){
        openNav();
    }else{
        closeNav();
    }
}

var demoEnvironments = ['43193725', '14279864', '26007035', '42902308', '41687912', '21540593','37653987'];
var setConsumerProfile = function(gender){

    $.get('/consumerProfile/consumerProfile/' + (gender ? gender : ''), function(data){
        data = JSON.parse(data);
        var consumerProfileObject = {
            avatarUrl: data.results[0].picture.medium,
            email: data.results[0].email,
            firstName: data.results[0].name.first.charAt(0).toUpperCase() + data.results[0].name.first.substr(1),
            lastName: data.results[0].name.last.charAt(0).toUpperCase() + data.results[0].name.last.substr(1)
        };
        $('#response').html(JSON.stringify(consumerProfileObject, null, 2));
        console.log(consumerProfileObject);
        lpTag.agentSDK.setConsumerProfile(consumerProfileObject, function(res){
            console.log('set consumer profile success ', res);
            $('#response').html($('#response').text() + '<br><br>set consumer profile success ');
        }, function(err){
            console.log('set consumer profile error ', err);
            $('#response').html($('#response').text() + '<br><br>set consumer profile error ');
        });
    });
};

(function(){
    console.log('MultiWidget init');
    lpTag.agentSDK.init();
    setTimeout(function(){
        lpTag.agentSDK.get('chatInfo.accountId', function(accountData){
            console.log('retrieved accountData ' + accountData);
            if(demoEnvironments.indexOf(accountData) > -1){
                lpTag.agentSDK.get('visitorInfo.visitorName', function(data){
                    if(data.toLowerCase() === 'visitor'){
                        setConsumerProfile();
                    }else{
                        console.log('Did not automatically set consumer profile ');
                    }
                }, function(err){ 
                    console.log('could not set the consumer profile automatically') 
                });
            }else{
                console.log('Did not automatically set consumer profile ');
            }
        });
        lpTag.agentSDK.bind('chatTranscript.lines', (data)=>{
            if(data.newValue){
                // console.log(data.newValue);
            }
        }, (err)=>{
            if(err){
                console.log('Error - Transcripts info', err);
            }
        });
    }, 2000);
})();