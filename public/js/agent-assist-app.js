app.controller("agentCtrl", function ($scope, $rootScope, $http, $location, agentSdkFactory, discoveryCollections) {
    if(!agentSdkFactory.isInit){
      agentSdkFactory.init();
      console.log("agent sdk init");
    }
    $scope.rateFunction = function (rating, response) {
        response.current_rank = rating;
        console.log("You rated as " + rating);
    }
    $scope.data = {
        ratingsList: ["Irrelevant", "Poor", "Good", "Great", "Perfect"],
        visitorLines: [],
        query: '',
        currentRankedResponses: []
    }
    $scope.defaultData = [{
        title: 'What are the fees for using atm?',
        current_rank: 3,
        desc: 'There are no fees for using atm for our customers. Make use of thousands of atms in your area in the continental US without a single fee.'
    }, {
        title: 'Are there fees for requesting a replacement ATM card?',
        current_rank: 1,
        desc: 'There are no fees for replacing an ATM card that was stolen. Make use of thousands of atms in your area in the continental US without a single fee.'
    }];
    /*
      $scope.data.ratingsList = ["Irrelevant", "Poor", "Good", "Great", "Perfect"];
      $scope.data.visitorLines = [];
    $scope.data.query = "";
      $scope.data.currentRankedResponses = [];
    */


    agentSdkFactory.bindProperty('chatTranscript.lines', function (data) {
        var line = null;
        console.log(JSON.stringify(data, null, 2));
        var lineCheckIndex = data.newValue.length - 1;
        do{
          line = data.newValue[lineCheckIndex];
          lineCheckIndex --;
        }while(line.source !== 'visitor' && lineCheckIndex > -1);

        if (line.source === 'visitor') {
            console.log('line.text is ' + line.text);
            $scope.data.query = line.text;
            $("#search-bar").val($scope.data.query);
            $scope.retrieveResponses();
        }
        //}
    });

    $scope.rerank = function () {

    }

    $scope.retrieveResponses = function(){
        var queryParams = $location.search();
        console.log(queryParams);
        var req={
          method: 'POST',
          url: '/assistAPI/retrieveResponsesDiscovery',///retrieveResponsesRandR',
          headers:{
            'Content-Type': 'application/json'
          },
          data:{

            query: $scope.data.query,
            coll:  queryParams.collection || ''
           // env: discoveryCollections.watson_default.environment_id
          }
        };
        $http(req).then(function(res){
          console.log("success!!!");
          console.log("Res is ", res);
          var max = 0;
          $scope.data.currentRankedResponses = [];
          if(!res.data.discovery){ //retrieve and rank
            max = Math.min(5, res.data.docs.length);
            for(var i = 0; i < max; i++){
              $scope.data.currentRankedResponses.push({
                title: res.data.docs[i].title,
                current_rank: Math.max(2, 4 - i),
                desc: res.data.docs[i].body
              });
            } 
          }else{ //discovery
            var lastDesc = "";
            var allRes = res.data.results.filter(function(temp){
              return temp.result_metadata && temp.result_metadata.score > 4.5;
            });
            max = Math.min(5, allRes.length);
            for(var i = 0; i < max; i++){
              var result = allRes[i];
              if(result.text){
                lastDesc = result.text;
              }
              if(lastDesc){
                var calculatedScore = Math.ceil(result.result_metadata.score * 0.4);
                $scope.data.currentRankedResponses.push({
                  title: result.extracted_metadata.title,
                  current_rank: calculatedScore < Math.max(1, 4 - i) ? calculatedScore : Math.max(2, 4 - i),
                  desc: lastDesc
                });
              }
            } 
          }
            if(max == 0 && $scope.data.query.length > 0){
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 4,
                desc: "I'm sorry I don't have any information on your request."
              });
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 4,
                desc: "I'm not quite sure I understand. Can you tell me more?"
              });
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 3,
                desc: "That sounds very frustrating."
              });
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 3,
                desc: "That sounds very frustrating. What can I do to help fix the situation?"
              });
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 3,
                desc: "Allow me a few minutes to research this. I'll get back to you soon."
              });
              $scope.data.currentRankedResponses.push({
                title: "Catch All - Conversational",
                current_rank: 3,
                desc: "I need to consult with a colleague on this. I'll be back shortly."
              });
            }
         

        }, function(){
          console.error("err!!!!");
        });
      }
	    


    $scope.pushAgentLine = function (response) {
        console.log(response.desc);
        agentSdkFactory.addConversationLine({text: response.desc});
    }


});