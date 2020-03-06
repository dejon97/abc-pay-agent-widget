app.controller("crmCtrl", function($scope, $rootScope, $http, $cacheFactory, agentSdkFactory){
	
    if(!agentSdkFactory.isInit){
        agentSdkFactory.init();
        console.log("agent sdk init");
    }

	$scope.data = {
        accountId: '43193725',
        keys:{
            '43193725':{
                consumer_key: '825d52d3fc9e46518d85ea3317a7d26e',
                consumer_secret: '6be5e8b3fd5f35c6',
                token: '67096f98fad84fb28985755574176fed',
                token_secret: '54425d19f65fd07b'
            },
            '14279864':{
                consumer_key: '472d4e7b32ef4b5abb573d4e12420619',
                consumer_secret: '58f1a01b30798d7d',
                token: '398e2bc6020e4607915455d1c82f76f7',
                token_secret: '40d031246dedb550'
            }
        },
        customerId: '',
        accountName: 'Acme Inc.',
        contactName: '',
        description: '',
        query: '',
        cases: [],
        casesSubset: [],
        consumerIds: [],
        "callHistory": [{
            "startTime": "Thu Jun 07 2018 15:32:56 GMT-0400 (Eastern Daylight Time)", 
            "callSkill": "IVR-Default-Skill", 
            "status": "Routed to Messaging"
        }],
        defaultContactRecords:{
            accountName: 'Acme Inc.',
            contactName: 'John Smith',
            description: 'Head of transformation design at Acme Inc.',
            consumerIds: ["iOS Messages User 13636", "google-oauth2|108308539834916378321"],
            "callHistory": [{
                "startTime": "Thu Jun 07 2018 15:32:56 GMT-0400 (Eastern Daylight Time)", 
                "callSkill": "IVR-Default-Skill", 
                "status": "Routed to Messaging"
            }]
        },
        norecords: false
	};

    const channels = ['Native App', 'Apple Business Chat', 'Web Messaging', 'Google RBM'];
    const descriptions = ['CTO at Acme Inc, interested in expanding business relationship', 'Lead generated from cold call, brought into messaging',
        'Potential prospect for upcoming event, major ']
      
    const setDefaultData = () => {
        $scope.data.accountName = $scope.data.defaultContactRecords.accountName;
        //$scope.data.contactName = $scope.data.defaultContactRecords.contactName;
        $scope.data.consumerIds = $scope.data.defaultContactRecords.consumerIds;
        $scope.data.description = descriptions[Math.floor(Math.random * descriptions.length)];
        $scope.data.cases = [];
        $scope.data.consumerIds = [];
        $cacheFactory.get('$http').removeAll();
        $http({
            url: './data/sampleCases.json'+ '?hash_id=' + uuid(),
            method: 'GET',
            cache: false
        }).then(function(data){
            $scope.data.cases = data.data;
            $scope.sortCases();
        }).catch(function(err){
            console.error('error getting your own default cases');
        })
    };

    const setData = (newData) => {
        $scope.data.accountName = newData.accountName;
        $scope.data.contactName = newData.contactName;
        $scope.data.consumerIds = newData.consumerIds;
        $scope.data.description = newData.description;
    }

    $scope.toggleShow = function toggleShow($event){
        //console.log( $event.currentTarget.nextSibling.nextElementSibling);
        $($event.currentTarget.nextSibling.nextElementSibling).toggle();
    }

    $scope.getDeviceRecord = function getDeviceRecord(record){
        var retString = record.info.source;
        if(retString == 'null' || retString == null){
            if(record.consumerParticipants[0].consumerName.indexOf('+') === 0){ //is SMS hack
                retString == "Mobile SMS";
            }if(record.info.source.toLowerCase() === 'facebook'){/// is Facebook Messaging
                retString == "Facebook Messenger";
            }
        }else{
            switch(retString){
                case 'SHARK':
                    return 'Web Messaging';
                case 'APP':
                    return 'In-App Messaging';
                case 'AGENT':
                    return 'Agent Initiated Conversation';
                case 'FACEBOOK':
                    return 'Facebook Messenger';
                case 'SMS':
                    const recordSdes = record.sdes && record.sdes.events.filter( sde => sde.sdeType == "CUSTOMER_INFO" && sde.customerInfo.customerInfo.companyBranch === 'grbmIncoming').length > 0 ;
                    return recordSdes ? 'Google Rich Business Conversation' :  'SMS Conversation';
            }
        }
        return retString;
    };

    $scope.recordIcon = function recordIcon(record){
        switch(record.info.source){
            case 'SHARK':
                return 'desktop';
            case 'APP':
                return 'app';
            case 'AGENT':
                return 'agent';
            case 'FACEBOOK':
                return 'fbm';
            case 'SMS':
                const recordSdes = record.sdes && record.sdes.events.filter( sde => sde.sdeType == "CUSTOMER_INFO" && sde.customerInfo.customerInfo.companyBranch === 'grbmIncoming').length > 0 ;
                return recordSdes? 'grbm' : 'sms';
            case 'Apple Business Chat':
                return 'abc';
            default:
                return 'desktop';
        }
    };

    $scope.updateResults = function updateResults(){
        $scope.data.norecords = false;
        $scope.data.cases.length = 0;
        $scope.data.cases = [];
        $scope.data.contactName = $scope.data.query;
        $cacheFactory.get('$http').removeAll();
        $http({
            url: 'https://s3.amazonaws.com/sc-tasks/MockCrm/mock-crm-'+encodeURIComponent($scope.data.contactName.replace(/\s+/ig, '').toLowerCase())+'.json'+ '?hash_id=' + uuid(),
            method: 'GET',
            cache: false
        }).then(function(success){
                if(!!success.data.contactName){
                    setData(success.data);
                    console.log($scope.data);
                    $scope.data.consumerIds.forEach(id => {
                        if(id.length > 0){
                            var postURL = 'https://messagingfailover.herokuapp.com/helpers/msghist/' + $scope.data.accountId
                            + '/' + id + '/conversationData';
                            console.log(postURL);
                            $http({
                                url: postURL, 
                                cache: false,
                                method: 'POST',
                                data: {
                                    apiKeys: $scope.data.keys[ $scope.data.accountId.toString() ]
                                }
                            }).then(
                                    function(success){
                                        console.log(success);
                                        $scope.data.cases = _.unionBy($scope.data.cases, success.data, 'info.conversationId');
                                        $scope.data.casesSubset = $scope.data.cases;
                                        $scope.sortCases();
                                    }, function(err){
                                        console.log(err);
                                    }
                                );
                            }
                    });
                }
            }, function (err){
                console.log(err);
                $scope.data.norecords = true;
                setDefaultData();
            });
    };


	agentSdkFactory.getProperty('chatInfo.accountId', (data)=>{
        console.log(data);
        if(data == null){
            data = '43193725';
        }
        $scope.data.accountId = data;
        agentSdkFactory.getProperty('authenticatedData.customerDetails.customerId', (customerId) => {
            $scope.data.customerId = customerId ? customerId : 'iOS Messages User 13636';
            console.log(customerId);
            setTimeout( function(){
                $scope.updateResults();
            }, 2500);
        });
    });

    agentSdkFactory.getProperty('visitorInfo.visitorName', (data) =>{
        console.log(data);
        //if(!!data){  data = "John Smith";  } 
        $scope.data.query = data;
        $('#search-bar').text(data);
        $scope.updateResults();
    });

    $scope.toLocaleString = function toLocaleString(date){
        return new Date(date).toLocaleString();
    }

    $scope.sortCases = function sortCases(caseType){
        if(caseType == null || caseType.length === 0){
            $scope.data.casesSubset = $scope.data.cases;
        }else{
            $scope.data.casesSubset = 
            $scope.data.cases.filter(c => caseType === 'GRBM' ? 
            c.sdes && c.sdes.events.filter( 
                sde => sde.sdeType == "CUSTOMER_INFO" && 
                sde.customerInfo.customerInfo.companyBranch === 'grbmIncoming'
            ).length > 0 : c.info.source === caseType);
        }
    };

    $scope.updateRecord = function updateRecord(){
        if( $scope.data.consumerIds.indexOf($scope.data.customerId) === -1){
            $scope.data.consumerIds = _.union($scope.data.consumerIds, [ $scope.data.customerId ] );
        }
        const cloneData = jQuery.extend(true, {}, $scope.data);
        delete cloneData.cases;
        delete cloneData.casesSubset;
        delete cloneData.defaultContactRecords;

        var postBody = { data: cloneData };
        console.log(postBody);
        $http({url: './crm/writeUser/', method:'POST', cache:false, data: postBody}).then(function(success){
            console.log('successfully wrote user ', success);
            $scope.updateResults();
        }, function(err){
            console.log('err ', err);
        });
    }
    
	$scope.moveUp = function moveUp(index){
		$scope.data.scJSON.elements.move(index, index - 1);
	};

	$scope.moveDown = function moveDown(index){
		$scope.data.scJSON.elements.move(index, index + 1);
	};

	$scope.sendSC = function sendSC(){
		agentSdkFactory.sendSC($scope.data.scJSON);
	};

	$scope.uuid = function(){
		return uuid();
    };
});
