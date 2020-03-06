app.controller("fileTransferCtrl", function($scope, $rootScope, $http, $interval, $timeout, $location, agentSdkFactory){
    if(!agentSdkFactory.isInit){
        agentSdkFactory.init();
        console.log("agent sdk init");
    }

	$scope.data = {
        norecords: false,
        accountId: 'test',
        rtSessionId: 'test',
        formLink: 'No Link Available',
        fileName: 'No file selected yet',
        fileLinks:{
            consumer: [],
            agent: []
        } ,
        from: ''
    };
    
    $scope.dropzoneConfig = {
        parallelUploads: 1, 
        maxFileSize: 30
    };

    $scope.fileChanged = function(){
        console.log( $("#inputFile").val() );
    }

    $scope.fileName = function(element) {
        $scope.$apply(function($scope) {
           $scope.data.fileName = element.files[0].name;
        });
     };

    agentSdkFactory.getProperty('visitorInfo.visitorName', (data) =>{
        console.log(data);
        if(!!data) data = "John Smith";
        $scope.data.query = data;
        $scope.updateResults();
    });

    agentSdkFactory.getProperty('chatInfo.accountId', data => {
        $scope.data.accountId = data;
    });

    agentSdkFactory.getProperty('chatInfo.rtSessionId', data => {
        $scope.data.rtSessionId = data;
    });

    $scope.generateForm = function (){
        $http.get(`/fileTransfer/generateVisitorPage/${$scope.data.accountId}/${$scope.data.rtSessionId}`).then(function(data){
            console.log(data);
            const formLink = `${window.location.href}/${data.data['@href']}`;
            agentSdkFactory.addConversationLine({text: formLink}, ()=> {
                console.log('send complete!');
            });
            $scope.data.formLink = formLink;
        }, function(err){
            console.log(err);
        });
    }

	$scope.sendSC = function sendSC(){
		agentSdkFactory.sendSC($scope.data.scJSON);
	};

	$scope.uuid = function(){
		return uuid();
    };

    $interval(function(){
        $http.get(`/fileTransfer/files/${$scope.data.accountId}/${$scope.data.rtSessionId}?hash_id=${uuid()}`).then(function(data){
            console.log(data);
            if(data.data.allKeys){
                $scope.data.fileLinks.agent = data.data.allKeys.filter(function(key){
                    return key.Key.indexOf('fromAgent') > -1;
                }).map(function(key){
                    return data.data._aws + encodeURIComponent(key.Key);
                });

                $scope.data.fileLinks.consumer = data.data.allKeys.filter(function(key){
                    return key.Key.indexOf('fromConsumer') > -1;
                }).map(function(key){
                    return data.data._aws + encodeURIComponent(key.Key);
                });
            }
        });
    }, 5000);

    var urlSplit = $location.absUrl().split('/');
    if(urlSplit.length >= 7){
        $scope.data.accountId = urlSplit[5];
        $scope.data.rtSessionId = urlSplit[6];
        console.log('Visitor - retrieved values ' + $scope.data.accountId + ', ' + $scope.data.rtSessionId);
    }
    var fileKey = $location.search().fileKey;
    if(fileKey){
        $timeout(function(){
            agentSdkFactory.addConversationLine({text: 'Please see the attached file link: ' + fileKey}, ()=> {
                console.log('send complete!');
            });
        }, 2000);
    }
});
