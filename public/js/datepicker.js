//Date Picker ABC Widget
app.controller('datePickerCtrl', function($scope, $timeout, $http, agentSdkFactory){
    
  if(!agentSdkFactory.isInit){
    agentSdkFactory.init();
    console.log("agent sdk init");
  }

    Date.prototype.toDateInputValue = (function() {
      var local = new Date(this);
      local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
      return local.toJSON().slice(0,10);
    });

    $scope.data = {
        queryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        initialDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        json: {},
        meta: {}
    };
    $scope.selectedDateObjects = {};
    $scope.vm = {
        month: '',
        day: '',
        dow: '',
        year: '2019',
        state: 'NOT SENT',
        preview_active: false,
        bubbleeditor_active: false,
        title: "Schedule Consultation",
        subtitle: "Choose a Time",
        choice: "Please Select a Time:",
        reply: "Consultation Time Selected",
        event: "Schedule Consultation",
        imageUrl: "https://messagingagentwidgets.herokuapp.com/img/icons/calendar-icon-new.png",
        ctrl: "date"
    };


    $scope.selectedJSON = {};
    $scope.selected = [];

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const maxDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const firstContains = function(value, arr){
      if(!!arr && arr.length > 0){
        for(var i = 0; i < arr.length; i++){
          if(arr[i].includes(value)){
            return i;
          }
        }
      }
      return -1;
    };


    $scope.toggleBubbleEditor = function(){
      $scope.vm.bubbleeditor_active = !$scope.vm.bubbleeditor_active;
    };

    $scope.togglePreview = function(){
      $scope.selectedDateObjects = {};
      for(var i = 0; i < $scope.selected.length; i++){
        var dateTime = moment(new Date($scope.selected[i]));
        console.log(new Date($scope.selected[i]));
        console.log(dateTime.utc().format("dddd, MMMM Do, h:mm A"));
        var date = dateTime.utc().format("dddd, MMMM Do");
        var time = dateTime.utc().format("h:mm A");
        if(!$scope.selectedDateObjects.hasOwnProperty(date)){
          $scope.selectedDateObjects[date] = [ time ];
        }else{
          $scope.selectedDateObjects[date].push(time);
        }
      }
      console.log($scope.selectedDateObjects);

      $scope.vm.preview_active = !$scope.vm.preview_active;
    };

    $scope.updateCalendar = function(){
        console.log($scope.data.queryDate);
        var date = new Date($scope.data.queryDate);
        $scope.vm.month = monthNames[date.getMonth()];
        $scope.vm.dow = dayNames[date.getDay()];
        $scope.vm.day = date.getDate();
        $scope.vm.year = date.getFullYear();
    };

    $scope.isSelected = function(dayFrom, timeString){
      var date = new Date($scope.data.queryDate);
      date.setDate(date.getDate() + dayFrom);
      var dateIso = date.toISOString().slice(0,10);

      dateIso = dateIso + timeString;
      return $scope.selected.indexOf(dateIso) > -1;
    };

    $scope.clearSelections = function(){
      $scope.selected = [];
    };

    $scope.moveQueryDate = function(num){
        var date = new Date($scope.data.queryDate);
        date.setDate(date.getDate() + num);
        if(date >= $scope.data.initialDate){
          $scope.data.queryDate = date;
          $scope.updateCalendar();      
        }
    };


    $scope.sendSC = function (){
      var scJson = {
        "type": "vertical",
        "tag": "datePicker",
        "elements": [
          {
            "type": "text",
            "text": "Select Date",
            "tag": "Title",
            "style": {
              "bold": true,
              "size": "large"
            }
          }
        ]
      };
      var dateListTemplate =[
        {
          "type": "text",
          "text": "Tuesday, February 6"
        },
        {
          "type": "horizontal",
          "elements": []
        }
      ];

      var timeButtonTemplate = 
        {
          "type": "button",
          "title": "11:30",
          "click": {
            "metadata": [
              {
                "type": "ExternalId",
                "id": "SlotIdentidier"
              },
              {
                "type": "BusinessEvent",
                "timing": {
                  "startTime": "2018-12-31T23:59:59Z",
                  "duration": 1800
                }
              }
            ],
            "actions": [
              {
                "type": "publishText",
                "text": "Technician visit: 6/2/2018 11:30 IST"
              }
            ]
          }
        };

      var meta = [
        {
          "type": "BusinessEvent",
          "timing": {
            "presentedTimezoneOffset": 0
          },
          "title": "Schedule Appointment"
        },
        {
          "type": "BusinessChatMessage",
          "receivedMessage": {
            "style": "small",
            "imageURL": "https://messagingagentwidgets.herokuapp.com/img/icons/calendar-icon-new.png",
            "subtitle": "Choose a Time",
            "title": "Schedule Appointment"
          },
          "replyMessage": {
            "style": "icon",
            "imageURL": "https://messagingagentwidgets.herokuapp.com/img/icons/calendar-icon-new.png",
            "title": "Selected Time",
            "subtitle": ""
          }
        }
      ];


      console.log(JSON.stringify($scope.selected));
      for(var i = 0; i < $scope.selected.length; i++){

        var timeButtonTemplateCopy = jQuery.extend(true, {}, timeButtonTemplate);
        var timeString = moment.utc($scope.selected[i]).format('HH:mm');

        timeButtonTemplateCopy.title = timeString;
        timeButtonTemplateCopy.click.metadata[1].timing.startTime = $scope.selected[i];
        timeButtonTemplateCopy.click.metadata[1].timing.duration = 1800;
        timeButtonTemplateCopy.click.actions[0].text = $scope.vm.event + " at " + timeString;

        var dateListTemplateCopy = jQuery.extend(true, {}, dateListTemplate);
        dateListTemplateCopy[0].text = moment($scope.selected[i]).format('dddd, MMMM DD');
        dateListTemplateCopy[1].elements.push(timeButtonTemplateCopy);

        console.log(dateListTemplateCopy[0].text);
        var dateArray = scJson.elements.map(function(element){
          if(element.text){
            return element.text;
          }else{
            return "";
          }
        });
        var dateIndex = dateArray.indexOf(dateListTemplateCopy[0].text);


        if(dateIndex > -1){
          scJson.elements[dateIndex + 1].elements.push(dateListTemplateCopy[1]);
        }else{
          scJson.elements.push(dateListTemplateCopy[0]);
          scJson.elements.push(dateListTemplateCopy[1]);
        }
      }


      console.log(JSON.parse(JSON.stringify(scJson)));
      console.log(JSON.stringify(meta));
      //console.log(""+(typeof $scope.data.json));
      agentSdkFactory.sendSC(JSON.parse(JSON.stringify(scJson)), meta);

      $scope.clearSelections();
      $scope.vm.state = 'SENT';
      $timeout(function(){
        $scope.vm.state = 'NOT SENT';
      }, 3500);

    };

    $scope.sendJSON = function(){
        if($scope.selected.length > 0){
          var messageId = uuid();
            $scope.selectedJSON = {
              "bid": "com.apple.messages.MSMessageExtensionBalloonPlugin:0000000000:com.apple.icloud.apps.messages.business.extension",
              "data": {
                "mspVersion": "1.0",
                "requestIdentifier": messageId,
                "images": [ ],
                "event": {
                  "timezoneOffset": 0,
                  "identifier": messageId,
                  "title": $scope.vm.event,
                  "timeslots": [ 
                  ]
                }
              },
              "useLiveLayout": false,
              "imageUrl": $scope.vm.imageUrl,
              "receivedMessage": {
                "style": "default",
                "title": $scope.vm.title,
                "subtitle": $scope.vm.subtitle,
                "imageIdentifier": "1"
              },
              "replyMessage": {
                "style": "small",
                "title": $scope.vm.reply,
                "imageIdentifier": "1"
              }
            };
            $scope.selectedJSON.data.event.timeslots = [];
            for(var i = 0; i < $scope.selected.length; i++){
                $scope.selectedJSON.data.event.timeslots.push({
                    "duration": 1800, 
                    "startTime": $scope.selected[i],
                    "identifier": i.toString(),
                    "event": $scope.vm.event
                });
            }
            console.log(JSON.stringify($scope.selectedJSON));
            agentSdkFactory.addConversationLine({text: 'interactive ' + JSON.stringify($scope.selectedJSON)});
            $scope.clearSelections();
            $scope.vm.state = 'SENT';
            $timeout(function(){
              $scope.vm.state = 'NOT SENT';
            }, 3500);
        }
    };

    $scope.toggleItem = function(dayFrom, timeString){

        var date = new Date($scope.data.queryDate);
        date.setDate(date.getDate() + dayFrom);
        var dateIso = date.toISOString().slice(0,10);

        dateIso = dateIso + timeString;

        if($scope.selected.indexOf(dateIso) === -1){
            $scope.selected.push(dateIso);
        }else{
            $scope.selected.splice($scope.selected.indexOf(dateIso) ,1)
        }
        console.log($scope.selected);
    };

    $scope.getDayAt = function(num){
        if(!!$scope.data.queryDate){
            var date = new Date($scope.data.queryDate);
            var day = ( date.getDate() + num) % (maxDays[date.getMonth()] + 1);
            if(day < date.getDate()) day ++;
            var dow = ( dayNames[(date.getDay() + num) % dayNames.length] );
            return {
                day: day,
                dow: dow
            };
        }else{
            return {
                day: '',
                dow: ''
            }
        }
    }

    $scope.sendMessage = function(text){
        console.log(text);
        agentSdkFactory.addConversationLine(text);
    };

    $scope.updateCalendar();

});