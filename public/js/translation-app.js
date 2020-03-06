app.controller("translationCtrl", function($scope, $rootScope, $http,  $timeout, $location, agentSdkFactory){
    if(!agentSdkFactory.isInit){
        agentSdkFactory.init();
        console.log("agent sdk init");
    }

    $scope.data = {
        norecords: false,
        lines: [],
        test_lines: [{
            by: "Chris",
            text: "This is test 1",
            source: 'agent',
            time: 1537283411673
        },{
            by: "Visitor",
            text: "What does that mean",
            source: 'visitor',
            time: 1537283410000
        },{
            by: "Chris",
            text: "This is test 2",
            source: 'agent',
            time: 1537280001673
        },{
            by: "Visitor",
            text: "??? Im so confused..",
            source: 'visitor',
            time: 1530003411673
        }]
    };
    
    $scope.addLines = function(lines){
        $scope.data.lines.length = 0;
        for(var i = 0; i < lines.length; i++){
            var line = lines[i];

            console.log(line);
            $scope.data.lines.push({
                by: line.by,
                source: line.source,
                time: line.time,
                text: line.text
            });
            console.log($scope.data.lines);
        }
    };

    //init
    const PROD = true;
    if(PROD){
        agentSdkFactory.bindProperty('chatTranscript.lines', function(data){
            //console.log(data.newValue);
            $scope.addLines(data.newValue);
            //$scope.data.lines = $scope.data.lines.concat(data.newValue);
        });
    }
    else{
        //$scope.data.lines = $scope.data.lines.concat($scope.data.test_lines);
        $scope.addLines($scope.data.test_lines);
    }
});