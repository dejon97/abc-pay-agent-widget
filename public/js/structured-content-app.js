app.controller("scgenCtrl", function($scope, $rootScope, $http, agentSdkFactory){
	
    if(!agentSdkFactory.isInit){
		agentSdkFactory.init();
		console.log("agent sdk init");
	  }
	$scope.data = {
		allowedAccounts: '4319372531487311427986443193725632548132600703568669246',
		jsonId: '',
		isFB: false
	};

	$scope.vm ={
		pretty: false,
		scJSONStore: [{"id": "none", "json": { "type": "vertical", "elements": [] }}],
		selectedContent: "button",
		selectedAction: "publishText",
		selectedSavedJSON: "",
		showWarning: false,
		button: {
			type: "button",
			title: ""
		},
		qr: {
			text:'',
			option: '',
			list: []
		},
		text:{
			type: "text",
			text: "",
			style:{
				size: "medium",
				bold: false,
				italic: false,
				color: "#000000",
				background_color: "#ffffff"
			}
		},
		map: {
			type: "map",
			lo: "-73.98193359375",
			la: "40.753499070431374"
		},
		image: {
			type: "image",
			url: ""
		},
		publishText:{
			type: "publishText",
			text: ""
		},
		link:{
			uri: ""
		},
		navigate:{
			lo: "-73.98193359375",
			la: "40.753499070431374"
		}
	};


	agentSdkFactory.getProperty('chatInfo.accountId', (data)=>{
		console.log(data);
		if(allowedAccount.indexOf(data) === -1){
			$scope.vm.showWarning = true;
		}
	});

	$scope.data.scJSON = { "type": "vertical", "elements": [] };
	$scope.data.jsonId = uuid();

	$scope.file = {};
	if(!!localStorage.getItem("scJSONStore")){
		$scope.vm.scJSONStore = JSON.parse(localStorage.getItem("scJSONStore"));
	}

	$scope.navigateChanged = function navigateChanged(){
		$scope.vm.map.la = $scope.vm.navigate.la;
		$scope.vm.map.lo = $scope.vm.navigate.lo;
		//var $gmapspicker = $(document).gMapsLatLonPicker();
		//$gmapspicker.setPosition(new google.maps.LatLng($scope.vm.map.la, $scope.vm.map.lo));
	};

	$scope.mapChanged = function mapChanged(){
		$scope.vm.navigate.la = $scope.vm.map.la;
		$scope.vm.navigate.lo = $scope.vm.map.lo;

	};
	$scope.pushQuickReply = function pushQuickReply(){
		$scope.vm.qr.list.push($scope.vm.qr.option);
		$scope.vm.qr.option = '';
	}

	$scope.sendQuickReplies = function sendQuickReplies(){

		var quickRepliesJson =  {
            "type": "quickReplies",
            "itemsPerRow": 8,
            "replies": [
                
            ]
		};
		
		const exampleButton = {
			"type": "button",
			"tooltip": "quickReply",
			"title": "",
			"click": {
				"actions": [
					{
						"type": "publishText",
						"text": ""
					}
				],
				"metadata": [
					{
						"type": "ExternalId",
						"id": ""
					}
				]
			}
		};

		$scope.vm.qr.list.forEach(listItem => {
			var newButton = jQuery.extend(true, {}, exampleButton);
			newButton.title = listItem;
			newButton.tooltip = listItem;
			newButton.click.actions[0].text = listItem;
			newButton.click.metadata[0].id = "Resp-" + (1000 + Math.floor(8999 * Math.random())).toString();
			quickRepliesJson.replies.push(newButton);
		});

		agentSdkFactory.sendQuickReplies($scope.vm.qr.text, quickRepliesJson);
	};

	$scope.togglePrettyPrint = function togglePrettyPrint(){
		$scope.vm.pretty = !$scope.vm.pretty;
	};

	$scope.removeItem = function removeItem(itemIndex){
		$scope.data.scJSON.elements.splice(itemIndex, 1);
	};

	$scope.removeQRItem = function removeQRItem(qrIndex){
		$scope.vm.qr.list.splice(qrIndex, 1);
	};

	$scope.pushElement = function pushElement(){
		var selectedContent = {};
		switch($scope.vm.selectedContent){
			case 'button':
				selectedContent = {
					type: "button",
					title: $scope.vm.button.title,
					click: {
						actions: []
					}
				};
				if($scope.data.isFB){
					selectedContent.tooltip = selectedContent.title;
				}
				break;
			case 'map':
				selectedContent = {
					type: "map",
					la: parseFloat($scope.vm.map.la),
					lo: parseFloat($scope.vm.map.lo),
					click: {
						actions: []
					}
				};
				break;
			case 'image':
				selectedContent = {
					type: "image",
					url: $scope.vm.image.url,
					//caption: $scope.vm.image.caption,
					click: {
						actions: []
					}
				};
				break;
			case 'text':
				selectedContent = {
					type: "text",
					text: $scope.vm.text.text,
					style: {
						size: $scope.vm.text.style.size,
						bold: $scope.vm.text.style.bold,
						italic: $scope.vm.text.style.italic,
						color: $scope.vm.text.style.color
					}
				};
				if($scope.data.isFB){
					delete selectedContent.style;
					selectedContent.tooltip = "Text";
					selectedContent.tag = $scope.data.scJSON.elements.filter(el => el.type === "text").length > 0 ? "subtitle" : "title";
				}
				selectedContent.text["background-color"] = $scope.vm.text.style.background_color
				break;
			default:
				console.log("no selected content");
				break;
		}
		if($scope.vm.selectedContent !== 'text'){
			switch($scope.vm.selectedAction){
				case 'nav':
					selectedContent.click.actions.push({
						type: "navigate",
						lo: parseFloat($scope.vm.navigate.lo),
						la: parseFloat($scope.vm.navigate.la)
					});
					break;
				case 'link':
					var actionObject = {
						type: "link",
						uri: $scope.vm.link.uri
					};
					if($scope.data.isFB){
						actionObject.name = "URL Button Tap";
					}
					selectedContent.click.actions.push(actionObject);
					break;
				case 'publishText':
					selectedContent.click.actions.push({
						type: "publishText",
						text: $scope.vm.publishText.text
					});
					break;
				default:
					console.log("no selected action");
					break;
			}
		}
		$scope.data.scJSON.elements.push(selectedContent);
		console.log(JSON.stringify($scope.data.scJSON, null, 0));


	};
	
	const jsonRender = function jsonRender(){
		const rooEl = JsonPollock.render($scope.data.scJSON);
		document.getElementById('jsonContainer').innerHTML = '';
		document.getElementById('jsonContainer').appendChild(rooEl);
	};


	$scope.$watch('data["scJSON"]["elements"]', function(){
		const rooEl = JsonPollock.render($scope.data.scJSON);
		document.getElementById('jsonContainer').innerHTML = '';
		document.getElementById('jsonContainer').appendChild(rooEl);
		console.log('updated');
	}, true );

	$scope.moveUp = function moveUp(index){
		$scope.data.scJSON.elements.move(index, index - 1);
	};

	$scope.toggleFacebook = function toggleFacebook(bool){
		$scope.data.isFB = bool;
		$scope.resetJSON();
	}

	$scope.moveDown = function moveDown(index){
		$scope.data.scJSON.elements.move(index, index + 1);
	};

	$scope.sendSC = function sendSC(){
		if($scope.data.isFB && $scope.data.scJSON.tag !== 'generic'){
			var temp1 = {"type":"vertical","tag":"generic","elements":[]};
			temp1.elements.push($scope.data.scJSON);
			$scope.data.scJSON = temp1;
		}
		agentSdkFactory.sendSC($scope.data.scJSON);
	};

	$scope.jsonStoreNames = function(){
		return $scope.vm.scJSONStore.map(function(x){
			return x.id;
		});
	};

	$scope.setScJSON = function(){
		$scope.data.scJSON = $scope.vm.selectedSavedJSON.json;
		$scope.data.jsonId = $scope.vm.selectedSavedJSON.id;
		if($scope.data.scJSON === undefined){
			$scope.data.scJSON = { "type": "vertical", "elements": [] }
			$scope.data.jsonId = uuid();
		}
	};

	$scope.randomName = function(){
		var id = uuid();
		$scope.data.jsonId= id;
		$("#scName").val( id );
	};

	$scope.saveLocal = function(){
		if(!localStorage.getItem("scJSONStore")){
			localStorage.setItem("scJSONStore", [
			{
				"id": "none",
				"json": { 
					"type": "vertical", 
					"elements": [] 
				}
			}
			]);
		}
		if($scope.data.scJSON !== undefined){
			var seen = false;
			for(var i = 0; i < $scope.vm.scJSONStore.length; i++){
				if($scope.vm.scJSONStore[i].id === $scope.data.jsonId){
					$scope.vm.scJSONStore[i] = jQuery.extend(true, {}, 
					{
						"id": $scope.data.jsonId,
						"json": $scope.data.scJSON
					});
					seen = true;
				}
			}
			if(!seen){
				$scope.vm.scJSONStore.push(jQuery.extend(true, {}, {
					"id": $scope.data.jsonId,
					"json": $scope.data.scJSON
				}));
			}

			localStorage.setItem("scJSONStore", JSON.stringify($scope.vm.scJSONStore, null, 0));
		}
	};

	$scope.resetJSON = function(){
		$scope.data.scJSON = { "type": "vertical", "elements": [] };
		$scope.data.jsonId = uuid();
	
		$scope.file = {};
		if(!!localStorage.getItem("scJSONStore")){
			$scope.vm.scJSONStore = JSON.parse(localStorage.getItem("scJSONStore"));
		}
	};

	$scope.deleteLocal = function(){

	}

	$scope.downloadFiles = function(){
		var fileName = $scope.data.jsonId + "_sc.json";
		var fileToSave = new Blob([JSON.stringify($scope.data.scJSON, null, 0)], {
		    type: 'application/json',
		    name: fileName
		});
		saveAs(fileToSave, fileName);
	};
});
