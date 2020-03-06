app.controller('listPickerCtrl', function($scope, $http, $window, $timeout, agentSdkFactory){
	if(!agentSdkFactory.isInit){
    agentSdkFactory.init();
    console.log("agent sdk init");
	}
	const retailMiscJsonURL = 'https://s3.amazonaws.com/sc-tasks/Assets/retailMisc.json';
	
	$scope.data = {
		convId: '',
		accountId: ''
	};	

	$scope.data = {
		query: '',
		fullList: [ ],
		selectedList: [], //list of selected values
		json: {},
		meta: {},
		retailMiscNew: {
			name: '',
			image: '',
			desc: '',
			meta: '',
			price: 0	
		},
		retailManual: {},
		travel: [
			{
				name: 'New York (LGA) to Chicago (ORD)',
				image: 'https://a.travel-assets.com/dynamic_destination_images/c/178248.jpg',
				desc: 'Round Trip from $118, Nov 16 - Nov 30',
				meta: ['travel'],
				price: 118.00	
			},
			{
				name: 'Newark (EWR) to Cancun (CUN)',
				image: 'https://a.travel-assets.com/dynamic_destination_images/c/179995.jpg',
				desc: 'Round Trip from $209, Oct 2 - Oct 18',
				meta: ['travel']	,
				price: 209	
			},
			{
				name: 'Newark (EWR) to Las Vegas (LAS)',
				image: 'https://a.travel-assets.com/dynamic_destination_images/c/178276.jpg',
				desc: 'Round Trip from $233, Nov 4 - Nov 14',
				meta: ['travel'],
				price: 233
			},
			{
				name: 'New York (LGA) to Miami (MIA)',
				image: 'https://a.travel-assets.com/dynamic_destination_images/c/178286.jpg',
				desc: 'Round Trip from $263, Aug 16 - Nov 29',
				meta: ['travel']	,
				price: 263
			},
			{
				name: 'New York (JFK) to Santiago (STI)',
				image: 'https://a.travel-assets.com/dynamic_destination_images/c/3283.jpg',
				desc: 'Round Trip from $356, Nov 22 - Dec 13',
				meta: ['travel']	,
				price: 356.00	
			}
		],
		automotive: [
			{
				name: '2015 Honda Odyssey EX FWD',
				image: '	https://s3.amazonaws.com/sc-tasks/Assets/Automotive/2015+Honda+Odyssey+EX+FWD+1.jpeg',
				desc: '$17,499 · Location: Atlanta, GA · Mileage: 19,999 miles',
				meta: ['automotive', 'honda', 'cars','used','grey','v6']	,
				price: 17499
			},
			{
				name: '2015 Honda Odyssey Touring Elite FWD',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Automotive/2015+Honda+Odyssey+Touring+Elite+FWD+1.jpeg',
				desc: '$22,999 · Location:	Norcross, GA · Mileage:	51,943 miles',
				meta: ['automotive', 'honda', 'cars','used','White Diamond Pearl','v6', 'elite'],
				price: 22999 
			},
			{
				name: '2015 Honda Odyssey EX-L FWD',
				image: '	https://s3.amazonaws.com/sc-tasks/Assets/Automotive/2015+Honda+Odyssey+EX-L+FWD+1.jpeg',
				desc: '$18,930 · Location:	Buford, GA · Mileage:	36,347 miles',
				meta: ['automotive', 'honda', 'cars','used','Black','v6', '6 speed automatic'],
				price: 18930	
			}
		],
		insurance: [
			{
				name: 'Collision Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "Collision coverage helps pay to repair or replace your vehicle if it collides with another vehicle or object.",
				meta: ['insurance'],
				price: 36.99
			},{
				name: 'Comprehensive Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "Comprehensive insurance helps pay to repair or replace your vehicle if it's damaged by something besides a collision",
				meta: ['insurance'],
				price: 56.99
			},{
				name: 'Liability Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "Liability coverage pays another party's medical expenses, vehicle repairs, and property damage",
				meta: ['insurance'],
				price: 46.99
			},{
				name: 'Car Rental and Travel Expense Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "Rental car reimbursement pays the cost of renting a replacement vehicle while your car is in the shop.",
				meta: ['car rent', 'insurance', 'replacement'],
				price: 16.99
			},{
				name: 'Emergency Roadside Service Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "Breaking down is never fun. Emergency road service can help you get moving again, fast.",
				meta: ['insurance', 'break down', 'aaa'],
				price: 24.99
			},{
				name: 'Rideshare Driver Coverage',
				image: 'https://www.pacificunified.com/wp-content/uploads/2013/02/autoinsurance-icon3.png',
				desc: "If you drive for rideshare companies like Uber or Lyft, we offer competitively-priced Rideshare Driver Coverage",
				meta: ['insurance', 'car', 'uber', 'lyft'],
				price: 43.99
			}
		],
		banking: [
			{
				name: 'Complete Checking',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Bank/checking-total.png',//.replace('http', 'https'),
				desc: "Manage your bank account online, and access one of our ten thousand ATMs",
				meta: ['checking', 'basic', 'banking'],
				price: 6.99
			},{
				name: 'Premier Advantage Checking',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Bank/checking-plus.png',
				desc: "Get the basics and then some, and earn interest with our advantage plan",
				meta: ['checking', 'premier', 'advantage', 'banking'],
				price: 12.99
			},{
				name: 'Diamond Club Checking',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Bank/checking-premier.png',
				desc: "Earn interest and enjoy bonuses with our diamond checking account",
				meta: ['checking', 'premier', 'diamond', 'platinum', 'banking'],
				price: 19.99
			},{
				name: 'Student Jump-start Checking',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Bank/checking-student.png',
				desc: "Choose from high school or college checking",
				meta: ['checking', 'student', 'high school', 'college', 'banking'],
				price: 2.99
			}
		],
		wireless: [
			{
				name: 'Jetpack 4G LTE Mobile Hotspot AC791L',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/Mifi+Device+1.png',//.replace('http', 'https'),
				desc: "Bring fast, secure Wi–Fi across town or around the world | From $99",
				meta: ['wireless', 'basic', 'mifi', 'internet', 'wifi'],
				price: 99.99
			},
			{
				name: 'Jetpack® MiFi® 7730L',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/Mifi+Device+2.png',//.replace('http', 'https'),
				desc: "Searching for a WiFi hotspot on the go is a breeze with this device | From $99",
				meta: ['wireless', 'basic', 'mifi', 'internet', 'wifi'],
				price: 99.99
			},
			{
				name: 'Verizon Ellipsis Jetpack MHS900L',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/Mifi+Device+3.png',//.replace('http', 'https'),
				desc: "This is the perfect pocket-sized partner for Internet on the go | From $29",
				meta: ['wireless', 'basic', 'mifi', 'internet', 'wifi'],
				price: 29.99
			},
			{
				name: 'iPhone X',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/iphone+x.jpg',//.replace('http', 'https'),
				desc: "iPhone X",
				meta: ['wireless', 'phone', 'ios'],
				price: 499.99
			},
			{
				name: 'Samsung Galaxy S9 Plus',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/Galaxy+S9+plus.jpg',
				desc: "Samsung Galaxy S9 Plus",
				meta: ['wireless', 'phone', 'android'],
				price: 599.99
			},{
				name: 'Google Pixel 2',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/Wireless/Google+pixel+2.jpg',
				desc: "Google Pixel 2",
				meta: ['wireless', 'phone', 'android', 'google'],
				price: 299.99
			}

		],
		software: [
			{
				name: 'iCloud 50 GB at $0.99/month',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/TechSupport/icloud1.png',//.replace('http', 'https'),
				desc: "Expand your iCloud storage for $0.99/month ",
				meta: ['software', 'subscription', 'cloud', 'storage', 'ios', 'apple'],
				price: 0.99
			},
			{
				name: 'iCloud 200 GB at $2.99/month',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/TechSupport/icloud2.png',
				desc: "Expand your iCloud storage for $2.99/month ",
				meta: ['software', 'subscription', 'cloud', 'storage', 'ios', 'apple'],
				price: 2.99
			},
			{
				name: 'iCloud 2TB at $9.99/month',
				image: 'https://s3.amazonaws.com/sc-tasks/Assets/TechSupport/icloud3.png',//.replace('http', 'https'),
				desc: "Expand your iCloud storage for $9.99/month ",
				meta: ['software', 'subscription', 'cloud', 'storage', 'ios', 'apple'],
				price: 9.99
			}

		]
	};

	//configuration of the interactive bubble
	$scope.bubble = {
		retail: {
			receivedMessage:{
				title: "Choose from the best selection of fashionable exclusives",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Product Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		retailManual: {
			receivedMessage:{
				title: "Choose from one of our available products",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Product Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		banking: {
			receivedMessage:{
				title: "Choose a Checking Plan that fits your needs",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Checking Plan Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		travel: {
			receivedMessage:{
				title: "Select from our exclusive flight deals",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Flight Deal Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		automotive: {
			receivedMessage:{
				title: "Select from our selection of vehicles near you",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Vehicle Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		insurance: {
			receivedMessage:{
				title: "Please select your preferred auto plans",
				subtitle: "Please select from the below list"
			},
			replyMessage:{
				title: "Auto Insurance Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		wireless: {
			receivedMessage:{
				title: "Please select your preferred device",
				subtitle: "Please select from the below devices"
			},
			replyMessage:{
				title: "Device Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		},
		software: {
			receivedMessage:{
				title: "Please select your preferred plan",
				subtitle: "Please select from the below plans"
			},
			replyMessage:{
				title: "Plan Selected",
				subtitle: ""
			},
			multipleSelection: true,
			imageUrl: "https://liveengage-abc.herokuapp.com/img/routing/routing_lstpkr_wdgt.png"
		}
	};


	//visualization of data on page for list picker
	$scope.vm = {
		results: [],
		vertical: 'retail',
    bubbleeditor_active: false
	};


	//toggles the bubble configuration screen
    $scope.toggleBubbleEditor = function(){
      $scope.vm.bubbleeditor_active = !$scope.vm.bubbleeditor_active;
      //console.log($scope.vm.bubbleeditor_active);
    };

    //select all items in list of results
    $scope.selectAll = function(){
      for(var i = 0; i < $scope.vm.results.length; i ++){
        $scope.vm.results[i].selected = true;
        $scope.updateSelection($scope.vm.results[i]);
      }
    };

    $scope.updateCatalog = function(){
			$scope.deselectAll();
			
			switch($scope.vm.vertical){
				case 'retail':
				onChangeSearchQuery('navy pinstripe suit');
					break;
				case 'retailManual':
				onChangeSearchQuery('health');
					break;
				default:
				onChangeSearchQuery($scope.vm.vertical);
					break;
			}

    	$scope.updateResults();
    }

		$scope.submitNewItem = function(){
			$scope.data.retailMiscNew.meta = typeof $scope.data.retailMiscNew.meta === 'string' ? $scope.data.retailMiscNew.meta.replace(/\s/g, '').split(',') :$scope.data.retailMiscNew.meta;
			
			$http({url: retailMiscJsonURL + '?hash_id=' + uuid(), method: 'GET', cache: false}).then(function(d){
				var retailMiscJson = d.data;
				retailMiscJson.push($scope.data.retailMiscNew);

				$http.post('./listPicker/submitItem', {data: retailMiscJson, url: retailMiscJsonURL.split('/').slice(4).join('/')}).then(function(resp){
					console.log(resp);
					$window.location.reload();
				}).catch(function(err){
					console.log(err);
				});
			});

			
		};

    $scope.deselectAll = function(){
      for(var i = 0; i < $scope.vm.results.length; i ++){
        $scope.vm.results[i].selected = false;
        $scope.updateSelection($scope.vm.results[i]);
      }
    };

    $scope.updateSelection = function(item){
        if(!item.selected){
            item.selected = false;
            $scope.data.selectedList = $scope.data.selectedList.filter(x => x.name !== item.name);
        }
        else if($scope.data.selectedList.filter(x => x.name === item.name).length === 0){
            item.selected = true;
            $scope.data.selectedList.push(item);
        }
        console.log('Selected list is ', $scope.data.selectedList);
		};
		
		

	$scope.updateResults = function(){
		if($scope.data.query.length > 0){

			$scope.vm.results = jQuery.extend(true, [], $scope.selected);
			switch($scope.vm.vertical){
				case 'banking':
				case 'insurance':
				case 'travel':
			  case 'retailManual':
			  case 'automotive':
				case 'wireless':
				case 'software':
		            for(var i = 0; i < $scope.data[$scope.vm.vertical].length; i++){
		                var regexp = new RegExp($scope.data.query, "gi");
		                if(($scope.data[$scope.vm.vertical][i].name.match(regexp) || 
		                	($scope.data[$scope.vm.vertical][i].hasOwnProperty('meta') && 
		                	$scope.data[$scope.vm.vertical][i].meta.includes($scope.data.query))) && 
		                	$scope.vm.results.filter(x => x.name === $scope.data[$scope.vm.vertical][i].name).length === 0){
		                    $scope.vm.results.push($scope.data[$scope.vm.vertical][i]);
		                }
		            }
					break;
				case 'retail':
					var dataUrl = "./product/"; //add your data url here e.g. google.com/data.json
					dataUrl += encodeURI($scope.data.query);
					console.log('searcing ' + dataUrl);
					$http.get(dataUrl+ '?hash_id=' + uuid()).then(function(resp){
						//formatted data accepting array of values that at least contains name, image, and list of meta values
						//console.log(resp);
						var data = JSON.parse(resp.data);
						if(data.productCategoryFacetedSearch.productCategory.childProducts && data.productCategoryFacetedSearch.productCategory.childProducts.length > 0){
							var productResults = data.productCategoryFacetedSearch.productCategory.childProducts;
							for(var i = 0; i < productResults.length; i++){
								var price = 12;
								try{
									price = parseInt(productResults[i].price.currentMinPrice);
								}catch(e){
									
								}
								var product = {
									name: productResults[i].name,
									image: productResults[i].quicklookImage.path,//.replace('http', 'https'),
									desc: "Purchase for as low as $" + productResults[i].price.currentMinPrice + " | Only at Banana Republic",
									meta: [],
									price: price
								};
								$scope.vm.results.push(product);
							}
						}else{
				        	console.log("No results");
				        }
					}, function(err){
						console.log('error with get ' + dataUrl + '\n' + JSON.stringify(err));
					});
					break;
				default:
					break;

			}

		}else{
    		console.log("Query is empty");
			$scope.vm.results = jQuery.extend(true, [], $scope.data.selectedList);
        }
	};

	
	$scope.sendMessage = function(){
		if($scope.data.selectedList.length > 0){

			var interactiveJson = {
			  "bid": "com.apple.messages.MSMessageExtensionBalloonPlugin:0000000000:com.apple.icloud.apps.messages.business.extension",
			  "data": {
			    "mspVersion": "1.0",
			    "requestIdentifier": "D332fdsfKQ3vx",
			    "images": [ ],
			    "listPicker": {
			      "sections": [
			        {
			          "items": [ ],
			          "title": "",
			          "order": 0
			        }
			      ],
					"multipleSelection": $scope.bubble[$scope.vm.vertical].multipleSelection
					//"multipleSelection": true
			    }
			  },
			  "receivedMessage": {
			    "style": "default",
			    "imageIdentifier": "0",
			    "title": $scope.bubble[$scope.vm.vertical].receivedMessage.title,
			    "subtitle": $scope.bubble[$scope.vm.vertical].receivedMessage.subtitle,
			    "secondarySubtitle": "",
			    "tertiarySubtitle": "",
			    "imageTitle": "",
			    "imageSubtitle": ""
			  },
			  "replyMessage": {
			    "style": "large",
			    "title": $scope.bubble[$scope.vm.vertical].replyMessage.title,
			    "subtitle": $scope.bubble[$scope.vm.vertical].replyMessage.subtitle,
			    "imageTitle": "",
			    "imageSubtitle": "",
			    "secondarySubtitle": "",
			    "tertiarySubtitle": "",
			    "imageIdentifier": "0"
			  },
			  "imageUrl": $scope.bubble[$scope.vm.vertical].imageUrl,
			  "useLiveLayout": false
			};
			for(var i = 0; i < $scope.data.selectedList.length; i++){
				interactiveJson.data.listPicker.sections[0].items.push({
					"style": "default",
					"title": $scope.data.selectedList[i].name,
					"subtitle": $scope.data.selectedList[i].desc || "",
					"order": i,
					"identifier": i.toString(),
					"imageIdentifier": "0"
				});
			}
			agentSdkFactory.addConversationLine({ text: 'interactive ' + JSON.stringify(interactiveJson)});
		}
	};

	$scope.sendSC = function(){
		var scJson = {
		  "type": "vertical",
		  "tag": "list",
		  "elements": [
		    {
		      "type": "vertical",
		      "elements": [
		      	{"type":"text","text":""}
		        
		      ]
		    }
		  ]
		};

		var listElement = 
        {
          "type": "horizontal",
          "elements": [
            {
              "type": "image",
              "url": ""
            },
            {
              "type": "vertical",
              "elements": [
                {
                  "type": "text",
                  "tag": "title",
                  "text": ""
                },
                {
                  "type": "text",
                  "tag": "subtitle",
                  "text": ""
                }
              ]
            }
          ]
        };


		for(var i = 0; i < $scope.data.selectedList.length; i++){
			var currentListElement = jQuery.extend(true, {}, listElement);
			currentListElement.elements[1].elements[0].text = $scope.data.selectedList[i].name;
			currentListElement.elements[1].elements[1].text = $scope.data.selectedList[i].desc || "";
			currentListElement.elements[0].url = $scope.data.selectedList[i].image;
			scJson.elements[0].elements.push(currentListElement);
		}

		var meta = [
		  {
		    "type": "BusinessChatMessage",
			 "multipleSelection": $scope.bubble[$scope.vm.vertical].multipleSelection,
			 //"multipleSelection": true,
		    "receivedMessage": {
		      "style": "icon",
		      "subtitle": $scope.bubble[$scope.vm.vertical].receivedMessage.subtitle,
		      "title": $scope.bubble[$scope.vm.vertical].receivedMessage.title,
		      "imageURL": $scope.bubble[$scope.vm.vertical].imageUrl
		    }
		  }
		];
		
		console.log(scJson);
		console.log(meta);
		agentSdkFactory.sendSC(JSON.parse(JSON.stringify(scJson)), meta);
	};


	$scope.sendPayBubble = function(){
		var payJson = {"type":"vertical","tag":"payment","elements":[{"type":"text","text":"Apple Pay Request"}]};
		//var paymentGatewayUrl = 'https://messagingagentwidgets.herokuapp.com/apayAuth/paymentGateway';
		var paymentGatewayUrl = 'https://messagingagentwidgets.herokuapp.com/apay/paymentGateway';
		if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
			console.log('This device supports Apple Pay.');
		}else{
			console.log('This device DOES NOT Apple Pay.');
		}

		var lineItems = [];
		var subtotal = 0;
		var tax = 0.085;
		var shipping = 0;

		for(var i = 0; i < $scope.data.selectedList.length; i++){
			lineItems.push({
				label: $scope.data.selectedList[i].name,
				amount: $scope.data.selectedList[i].price.toFixed(2).toString(), 
				type: "pending"
			});
			subtotal += $scope.data.selectedList[i].price;
		}

		var tax = subtotal * tax;
		lineItems.push({
			label: "Tax",
			amount: tax.toFixed(2).toString(), 
			type: "pending"
		});
		var total = ((subtotal + tax) + shipping).toFixed(2);

		$http({
			method: 'GET',
			url: 'https://messagingagentwidgets.herokuapp.com/apay/' + $scope.data.accountId + '/' + $scope.data.convId + '/clientToken' + '?hash_id=' + uuid(),
		}).then(function(success){
				console.log(success);
				braintree.client.create({
						authorization: success.data.token,
				}, function (err, clientInstance) {
						if (err) {
								console.error('Error creating clientInstance:', err);
								return;
						}
						console.log(clientInstance);
						braintree.applePay.create({
								client: clientInstance
						}, function (applePayErr, applePayInstance) {
								if (applePayErr) {
										console.error('Error creating applePayInstance:', applePayErr);
										return;
								}

								$http({
										method: 'POST',
										url: 'https://messagingagentwidgets.herokuapp.com/apay/paymentSession' + '?hash_id=' + uuid()
								}).then(function(success){
										
										var merchSessionData = success.data;

										// Set up Apple Pay buttons
										console.log(applePayInstance);

										//console.log(session);
										const merchantSessionId = clientInstance._configuration.analyticsMetadata.sessionId;
										const merchantId = applePayInstance.merchantIdentifier;
										const paymentIdentifier = uuid();

										var payMeta = [{"type":"BusinessChatMessage","receivedMessage":{"style":"icon","subtitle":"Buy now for $" + total,"title":"Complete your order","imageURL":"https://chrisjamestest.neocities.org/img/lplogo.png"}},{"type":"ConnectorPaymentRequest","apple":{"data":{"version":"1.0","payment":{"paymentRequest":{"applePay":{"merchantIdentifier":"merchant.com.example.abcdemo","merchantCapabilities":["supports3DS","supportsCredit","supportsDebit"],"supportedNetworks":["amex","visa","mastercard"]},"lineItems":[{"label":"iPhone","amount":"1","type":"pending"}],"total":{"label":"Your Order","amount":"1","type":"pending"},"countryCode":"US",
										"currencyCode":"USD",
										"supportedCountries":["US","GB","IE"],"shippingMethods":[{"label":"Free Shipping","detail":"Arrives in 5 to 7 days","amount":"0.00","identifier":"FreeShip"}]},"endpoints":{"paymentGatewayUrl":paymentGatewayUrl,"fallbackUrl":paymentGatewayUrl},"merchantSession":{"epochTimestamp":new Date().getTime(),"expiresAt":new Date().getTime()+86400000,"merchantSessionIdentifier":merchantSessionId,"nonce":"","merchantIdentifier":"merchant.com.example.abcdemo","displayName":"Foo Bar","signature":"MIIBCgKCAQEAwRHSQCu5ZhGVKYRZwbziP3OyCdTOr3AOnWbOSKoZ+ulRZloYXignbv7OpQno54P2xvKJFbN4jPQC+2ad9pR5DbYVmQZON1haZaEWTrEpTGhWdsQjZL8fVUcqrMnc5sEsvCxtybi8ymo+bGihTmgsAyz2VeO3HI7ChBoQNcf3lXdcxTQ8bVVl9jSpY0RSH6G4zgwBDaHIsxl/pr787grkOnWBed9fVNHrickojJZIiahoH5tSCekF1KU6lRbeT9ot/fKfrh6O5+eCgCCDB5y2M/LgyFstcHNy/xjj87UQskwRsvPWXgrwNQ62Ep6FKFb7hsPPArlzHXIcshuE1kx8IQIDAQAB","initiative":"messaging","initiativeContext":paymentGatewayUrl,"signedFields":["merchantIdentifier","merchantSessionIdentifier","initiative","initiativeContext","displayName","nonce"]}},"requestIdentifier":paymentIdentifier}}}];
										payMeta[1].apple.data.requestIdentifier = paymentIdentifier;
										payMeta[1].apple.data.payment.paymentRequest.lineItems = lineItems;
										payMeta[1].apple.data.payment.paymentRequest.total.amount = total;
										payMeta[1].apple.data.payment.merchantSession = merchSessionData;
										agentSdkFactory.sendSC(payJson, payMeta);
								});

						});
				});
		});



	};



	agentSdkFactory.getProperty('chatInfo.rtSessionId', (data) =>{
		//get user name, bubble up their messages to top
		$scope.data.convId = data;
	}, err => {
			console.log(err);
	});

	agentSdkFactory.getProperty('chatInfo.accountId', (data) =>{
			//get user name, bubble up their messages to top
			$scope.data.accountId = data;
	}, err => {
			console.log(err);
	});

	var onChangeSearchQuery = function(query){
		$('#search-bar .search-bar-main').val(query);
		$scope.data.query = query;
		$scope.updateResults();
	}

	setTimeout(function(){
		onChangeSearchQuery('navy pinstripe suit');
		$http.get(retailMiscJsonURL + '?hash_id=' + uuid()).then(function(resp){
			$scope.data.retailManual = resp.data;
			console.log($scope.data.retailManual);
		});
	}, 150);
});


$(function(){
	console.log('Page loaded');
});