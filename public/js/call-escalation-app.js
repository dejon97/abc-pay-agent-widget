app.controller("callCtrl", function($scope, $rootScope, $http, agentSdkFactory){
	
    agentSdkFactory.init();
	$scope.data = {
        agentNumber: '',
        consumerNumber: '',
        token: '',
        liveEngagePhoneNum: ''
	};

    const channels = ['Native App', 'Apple Business Chat', 'Web Messaging', 'Google RBM'];


	$scope.vm ={
        status: 'Loading....'
    };

    $scope.makeCall = function makeCall(){
        
        $http.post('./call/makeCall', {
            to: $scope.data.consumerNumber,
            from: $scope.data.agentNumber
        }).then(function(res){
            console.log(res);
        }).catch(function(err){
            console.log(err);
        });
        
        var params = {"phoneNumber": $scope.data.consumerNumber};
    };

    $scope.stopCall = function stopCall(){
        
    };


	agentSdkFactory.bindProperty('chatTranscript.lines', (data)=>{
        console.log(data);
        for(var i = 0; i < data.newValue.length; i++){
            var matches = data.newValue[i].text.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/ig);
            if(data.newValue[i].source === 'visitor' && matches && matches.length > 0){
                $scope.data.consumerNumber = matches[0];
                console.log('regex matched ' + matches[0]);
            }
        }
    });

    agentSdkFactory.bindProperty('authenticatedData', (data)=>{
        console.log("Auth data success!", data);
        if(data.newValue.customerDetails.companyBranch){
            $scope.data.liveEngagePhoneNum = data.newValue.customerDetails.companyBranch;
        }
    });

    

	$scope.sendSC = function sendSC(){
		agentSdkFactory.sendSC($scope.data.scJSON);
	};


	$scope.uuid = function(){
		return uuid();
    };
});
