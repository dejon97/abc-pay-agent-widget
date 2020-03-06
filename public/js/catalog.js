/* jslint node: true */
/* jslint esversion: 6 */

app.controller('catalogCtrl', function ($scope, $http, $window, $timeout, agentSdkFactory) {

	//visualization of data on page for list picker
	$scope.vm = {
		results: [],
		data: [],
		vertical: "products",
		section: "",
		applePay: {
			submittable: true,
			result: 'Apple pay results will be shown here when available...'
		}
	};

	$scope.scJson = [];

	if (!agentSdkFactory.isInit) {
		agentSdkFactory.init();
		console.log("agent sdk init on catalog");
	}

	// retrieve account id
	agentSdkFactory.getProperty('chatInfo.accountId', (accountId) => {
		console.log('entering "getProperty"');
		console.log('account id: ' + accountId);
		var config = 'config/' + accountId + '.json';
		$http.get(config).then(function (resp) {
			// load config into scope
			$scope.vm.data = resp.data;
		}).then(function () {
			if ($scope.vm.data.catalog.source !== "config") {
				// get product catalog from api
				$http.post('./catalog/getCatalog').then(function (resp) {
					var data = resp.data;
					// transform data
					// TODO: ADD MAPPING TO CONFIG TO ALLOW USE OF OTHER APIS
					data.catalog = data.phones;
					delete data.phones;
					var item;
					for (i = 0; i < data.catalog.items; i++) {
						item = data.catalog.items[i];
						data.catalog.items[i].price = item.dollars + "." + item.cents;
						delete data.catalog.items[i].dollars;
						delete data.catalog.items[i].cents;
						data.catalog.items[i].options.push(item.color, item.memory);
						delete data.catalog.items[i].color;
						delete data.catalog.items[i].memory;
					}
					// append catalog data
					$scope.vm.data.catalog.items = data.catalog;
				});
			}
			console.log('config:');
			console.log($scope.vm.data);

			/*
			// build buttons based on config
			var button, buttonHTML, btnCompiled;
			var btnContainer = document.getElementById('buttonContainer');
			console.log(btnContainer);
			for (b = 0; b < $scope.vm.data.widgetButtons.length; b++) {
				button = $scope.vm.data.widgetButtons[b];
				console.log(button);
				buttonHTML = '<li class="index-pill"><a href="#" ng-click="sendContent(' + button.action + ')">' + button.name + '</a></li>';
				console.log(buttonHTML);
				// btnCompiled=$compile(buttonHTML);
				console.log(btnCompiled);
				// btnContainer.appendChild(node);
				// btnContainer.append($compile(buttonHTML)($scope));
				btnContainer.appendChild(btnCompiled);
			}
			*/

		}).then(function (resp) {
			console.log(resp);
		}).catch(function (err) {
			console.log(err);
		});
	});

	$scope.makeBubble = function (content) {
		console.log(content);
		// reset vm results object
		$scope.vm.results = [];
		// configuration of the interactive bubble
		$scope.bubble = content.bubble;
		if (content.items.length > 0) {
			for (var i = 0; i < content.items.length; i++) {
				console.log(content.items[i]);
				var item = {
					name: content.items[i].name,
					image: content.items[i].image,
					desc: content.items[i].desc,
					meta: [],
					price: content.items[i].price
				};
				$scope.vm.results.push(item);
			}
		} else {
			console.log("No results");
		}
	};

	$scope.sendContent = function (contentType) {
		if (contentType == "applePay") {
			$scope.sendApplePay();
		} else {
			$scope.vm.vertical = contentType;
			// LISTPICKER WITH SECTIONS
			if (contentType.split("|").indexOf("section") >= 0) {
				var sectionType = contentType.split("|")[1];
				$scope.vm.numSections = $scope.vm.data.sections[sectionType].length;
				$scope.vm.section = sectionType;
				console.log('section detected: ' + sectionType);
				// loop through the sections
				for (s = 0; s < $scope.vm.numSections; s++) {
					$scope.vm.vertical = $scope.vm.data.sections[sectionType][s];
					console.log($scope.vm.vertical);
					$scope.makeBubble($scope.vm.data[$scope.vm.vertical]);
					$scope.buildSC();
				}
			} else if (contentType.split("|").indexOf("options") >= 0) {
				// LISTPICKER WITH OPTIONS
				var selection = contentType.split("|")[1];
				$scope.vm.vertical = 'options';
				console.log('option selected: ' + selection);
				$scope.bubble = $scope.vm.data.options.bubble;
				var options = $scope.vm.data.catalog.items[selection].options;
				console.log(options.length + ' options: ');
				console.log(options);
				// loop through the options
				for (o = 0; o < options.length; o++) {
					$scope.vm.results = [];
					console.log('option ' + o + ' - ' + options[o].name + ':');
					// $scope.vm.vertical = options[o];
					$scope.makeBubble(options[o]);
					$scope.buildSC();
				}
				console.log($scope.vm.data.sections.options);
				// If additional sections are defined for options, add them
				if ($scope.vm.data.sections.hasOwnProperty('options')) {
					var sectionType = 'options';
					$scope.vm.numSections = $scope.vm.data.sections[sectionType].length;
					$scope.vm.section = sectionType;
					console.log('section detected: options');
					// loop through sections
					for (s = 0; s < $scope.vm.numSections; s++) {
						$scope.vm.vertical = $scope.vm.data.sections[sectionType][s];
						console.log($scope.vm.vertical);
						$scope.makeBubble($scope.vm.data[$scope.vm.vertical]);
						$scope.buildSC();
					}
				}
			} else {
				// NORMAL LISTPICKER
				$scope.vm.vertical = contentType;
				$scope.vm.numSections = 1;
				console.log($scope.vm.vertical);
				console.log($scope.vm.data);
				$scope.makeBubble($scope.vm.data[contentType]);
				$scope.buildSC();
			}
			$scope.vm.tsSection = Date.now();
			$scope.sendSC();
		}
	};

	$scope.buildSC = function () {
		var scJson = {
			"type": "vertical",
			"elements": [{
				"type": "text",
				"text": $scope.bubble.receivedMessage.title
			}]
		};

		var listElement = {
			"type": "horizontal",
			"elements": [{
				"type": "image",
				"url": ""
			},
			{
				"type": "vertical",
				"elements": [{
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

		// loop through results and append to structured content object
		var resLength = $scope.vm.results.length;
		for (var i = 0; i < resLength; i++) {
			var currentListElement = jQuery.extend(true, {}, listElement);
			currentListElement.elements[1].elements[0].text = $scope.vm.results[i].name;
			currentListElement.elements[1].elements[1].text = $scope.vm.results[i].desc || "";
			if ($scope.vm.results[i].image == "") {
				currentListElement.elements.splice(0, 1);
			} else {
				currentListElement.elements[0].url = $scope.vm.results[i].image;
			}
			scJson.elements.push(currentListElement);
		}

		$scope.scJson.push(scJson);

	};

	$scope.sendSC = function () {

		var scJson = {
			"type": "vertical",
			"tag": "list",
			"elements": []
		}

		console.log(JSON.stringify(scJson));
		scJson.elements = $scope.scJson;
		console.log($scope.vm.vertical);
		if ($scope.vm.section !== "") {
			$scope.vm.vertical = $scope.vm.section;
		}

		var meta = [{
			"type": "BusinessChatMessage",
			"multipleSelection": $scope.vm.data[$scope.vm.vertical].bubble.multipleSelection,
			"receivedMessage": {
				"style": "small",
				"subtitle": $scope.vm.data[$scope.vm.vertical].bubble.receivedMessage.subtitle,
				"title": $scope.vm.data[$scope.vm.vertical].bubble.receivedMessage.title,
				"imageURL": $scope.vm.data[$scope.vm.vertical].bubble.receivedMessage.image
			},
			"replyMessage": {
				"style": "large",
				"subtitle": $scope.vm.data[$scope.vm.vertical].bubble.replyMessage.subtitle,
				"title": $scope.vm.data[$scope.vm.vertical].bubble.replyMessage.title,
				"imageURL": $scope.vm.data[$scope.vm.vertical].bubble.replyMessage.image
			}
		}];

		console.log(meta);
		agentSdkFactory.sendSC(JSON.parse(JSON.stringify(scJson)), meta);

		$scope.scJson = [];
		$scope.vm.section = "";

	};

	$scope.sendApplePay = function () {
		var payJson = {
			"type": "vertical",
			"tag": "payment",
			"elements": [{
				"type": "text",
				"text": "Apple Pay Request"
			}]
		};
		var paymentGatewayUrl = 'https://messagingagentwidgets.herokuapp.com/apay/paymentGateway';

		$http({
			method: 'POST',
			url: 'https://messagingagentwidgets.herokuapp.com/apay/paymentSession'
		}).then(function (success) {
			var merchSessionData = success.data;
			const merchantSessionId = 'To-add';//clientInstance._configuration.analyticsMetadata.sessionId;
			const merchantId = '';
			const paymentIdentifier = uuid();
			var payMeta = [
				{
					"type": "BusinessChatMessage",
					"receivedMessage": {
						"style": "icon",
						"subtitle": "Complete Purchase: iPhone Upgrade",
						"title": "iPhone XR 64GB",
						"imageURL": "https://static-assets.fs.liveperson.com/ABC/images/iphone-xr.png"
					}
				},
				{
					"type": "ConnectorPaymentRequest",
					"apple": {
						"data": {
							"version": "1.0",
							"payment": {
								"paymentRequest": {
									"applePay": {
										"merchantIdentifier": "merchant.com.example.abcdemo",
										"merchantCapabilities": [
											"supports3DS",
											"supportsCredit",
											"supportsDebit"
										],
										"supportedNetworks": [
											"amex",
											"visa",
											"mastercard"
										]
									},
									"lineItems": [
										{
											"label": "iPhone XR 64GB Blue",
											"amount": "749.00",
											"type": "pending"
										},
										{
											"label": "Clear Case",
											"amount": "34.00",
											"type": "pending"
										},
										{
											"label": "International Roaming (monthly)",
											"amount": "29.00",
											"type": "pending"
										},
										{
											"label": "Extended Warranty (monthly)",
											"amount": "12.00",
											"type": "pending"
										}
									],
									"total": {
										"label": "Order Total",
										"amount": "815.00",
										"type": "pending"
									},
									"countryCode": "US",
									"currencyCode": "USD",
									"supportedCountries": [
										"US",
										"GB",
										"IE"
									],
									"shippingMethods": [
										{
											"label": "Free Shipping",
											"detail": "Arrives in 5 to 7 days",
											"amount": "0.00",
											"identifier": "FreeShip"
										}
									]
								},
								"endpoints": {
									"paymentGatewayUrl": paymentGatewayUrl,
									"fallbackUrl": paymentGatewayUrl
								},
								"merchantSession": {
									"epochTimestamp": new Date().getTime(),
									"expiresAt": new Date().getTime() + 86400000,
									"merchantSessionIdentifier": merchantSessionId,
									"nonce": "",
									"merchantIdentifier": "merchant.com.example.abcdemo",
									"displayName": "Foo Bar",
									"signature": "MIIBCgKCAQEAwRHSQCu5ZhGVKYRZwbziP3OyCdTOr3AOnWbOSKoZ+ulRZloYXignbv7OpQno54P2xvKJFbN4jPQC+2ad9pR5DbYVmQZON1haZaEWTrEpTGhWdsQjZL8fVUcqrMnc5sEsvCxtybi8ymo+bGihTmgsAyz2VeO3HI7ChBoQNcf3lXdcxTQ8bVVl9jSpY0RSH6G4zgwBDaHIsxl/pr787grkOnWBed9fVNHrickojJZIiahoH5tSCekF1KU6lRbeT9ot/fKfrh6O5+eCgCCDB5y2M/LgyFstcHNy/xjj87UQskwRsvPWXgrwNQ62Ep6FKFb7hsPPArlzHXIcshuE1kx8IQIDAQAB",
									"initiative": "messaging",
									"initiativeContext": paymentGatewayUrl,
									"signedFields": [
										"merchantIdentifier",
										"merchantSessionIdentifier",
										"initiative",
										"initiativeContext",
										"displayName",
										"nonce"
									]
								}
							},
							"requestIdentifier": paymentIdentifier
						}
					}
				}
			];
			payMeta[1].apple.data.requestIdentifier = paymentIdentifier;
			payMeta[1].apple.data.payment.merchantSession = merchSessionData;
			$scope.vm.applePay.completed = false;
			agentSdkFactory.sendSC(payJson, payMeta);
		});
	}

	lpTag.agentSDK.bind('chatTranscript.lines', (data) => {
		/*
		// TODO: VALIDATION
		var numAnswers = 0;
		if (data.newValue.length > 0 && data.newValue[data.newValue.length - 1].source == "visitor") {
			console.log('visitor transcript lines:');
			for (v = 0; v < data.newValue.length; v++) {
				if ($scope.vm.tsSection && data.newValue[v].source == "visitor" && data.newValue[v].time > $scope.vm.tsSection) {
					console.log(data.newValue[v]);
					numAnswers++;
				}
			}
			if (numAnswers >= $scope.vm.numSections) {
				console.log('got all the answers i need');
			} else {
				lpTag.agentSDK.command(
					lpTag.agentSDK.cmdNames.write, {
						text: 'Please answer all the questions'
					}
				);
			}
		}
		*/

		var isSingleLine = (data.newValue.length == 1);
		var isVisitorLine = (data.newValue[0].source == "visitor");
		var isSelection = (data.newValue[0].text.indexOf('User selected:') >= 0);
		if (isSingleLine && isVisitorLine && isSelection) {
			var selection = data.newValue[0].text.replace("User selected: ", "");
			// TODO: BUILD CART

			// IF PRODUCT HAS OPTIONS, SEND THEM
			for (c = 0; c < $scope.vm.data.catalog.items.length; c++) {
				if ($scope.vm.data.catalog.items[c].name == selection) {
					$scope.sendContent('options|' + c);
					break;
				}
			}

		}
	}, (err) => {
		if (err) {
			console.log('Error - Transcripts info', err);
		}
	});

});

$(function () {
	console.log('Page loaded');
});