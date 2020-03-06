app.controller("authPay", function($scope, $rootScope, $http, $location, $timeout, $interval, agentSdkFactory) {
   if (!agentSdkFactory.isInit) {
       agentSdkFactory.init();
       ("agent sdk init");
   }

   const nonce = () => {
       var text = "";
       const length = 8;
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
       for(var i = 0; i < length; i++) {
           text += possible.charAt(Math.floor(Math.random() * possible.length));
       }
       return text;
   };

   $scope.vm = {
       auth:{
           submittable: true,
           result: 'Authentication results will be shown here when available...',
           completed: false
       },
       applePay:{
           submittable: true,
           result: 'Apple pay results will be shown here when available...'
       },
       richLink:{
           title: '',
           link: '',
           imageurl: '',
           result: ''
       }
   };

   $scope.data = {
       convId: '',
       accountId: ''
   };

   $scope.retrieveOG = function(){
       $http({
           method: 'POST',
           //url: './apayAuth/richLinkOg',
           url: './richlink/richLinkOg',
           headers: {
               'Content-Type': 'application/json'
           },
           data: {
               link: $scope.vm.richLink.link
           }
       }).then(function(success){
           $scope.vm.richLink.title = success.data.title;
           $scope.vm.richLink.imageurl = success.data.imageurl;
       });
   };

   $scope.sendRichLinks = function(){
       var richLinkJson = {"type":"vertical","tag":"richLink","elements":[{"type":"image","url":""},{"type":"button","title":"","click":{"actions":[{"type":"link","uri":""}]}}]};

       richLinkJson.elements[0].url = $scope.vm.richLink.imageurl;
       richLinkJson.elements[1].title =  $scope.vm.richLink.title;
       richLinkJson.elements[1].click.actions[0].uri = $scope.vm.richLink.link;

       agentSdkFactory.sendSC(richLinkJson, []);
       $scope.vm.richLink.result = 'Rich Link bubble sent to visitor';
   }

   $scope.sendApplePay = function(){
       var payJson = {"type":"vertical","tag":"payment","elements":[{"type":"text","text":"Apple Pay Request"}]};
       
       var paymentGatewayUrl = 'https://8e4e5d03.ngrok.io/apay/paymentGateway';
       
       // if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
       //     console.log('This device supports Apple Pay.');
       // }else{
       //     console.log('This device DOES NOT Apple Pay.');
       // }

       // $http({
       //     method: 'GET',
       //     url: 'https://messagingagentwidgets.herokuapp.com/apayAuth/' + $scope.data.accountId + '/' + $scope.data.convId + '/clientToken'
       // }).then(function(success){
       //     console.log(success);
       //     braintree.client.create({
       //         authorization: success.data.token,
       //     }, function (err, clientInstance) {
       //         if (err) {
       //             console.error('Error creating clientInstance:', err);
       //             return;
       //         }
       //         console.log(clientInstance);
       //         braintree.applePay.create({
       //             client: clientInstance
       //         }, function (applePayErr, applePayInstance) {
       //             if (applePayErr) {
       //                 console.error('Error creating applePayInstance:', applePayErr);
       //                 return;
       //             }


       $http({
           method: 'POST',
           url: 'https://8e4e5d03.ngrok.io/apay/paymentSession'
       }).then(function(success) {
           console.log('success ' + success);

           var merchSessionData = success.data;
           const merchantSessionId = 'To-add';//clientInstance._configuration.analyticsMetadata.sessionId;
           const merchantId = '';
           const paymentIdentifier = uuid();

           var payMeta = [{"type":"BusinessChatMessage","receivedMessage":{"style":"icon","subtitle":"Complete Purchase: iCloud Upgrade","title":"2TB Tier","imageURL":"https://chrisjamestest.neocities.org/img/lplogo.png"}},{"type":"ConnectorPaymentRequest","apple":{"data":{"version":"1.0","payment":{"paymentRequest":{"applePay":{"merchantIdentifier":"merchant.com.navomi.abc","merchantCapabilities":["supports3DS","supportsCredit","supportsDebit"],"supportedNetworks":["amex","visa","mastercard"]},"lineItems":[{"label":"iCloud Subscript 2TB at 9.99/month","amount":"9.99","type":"pending"}],"total":{"label":"iCloud Subscript 2TB at 9.99/month","amount":"9.99","type":"pending"},"countryCode":"US","currencyCode":"USD","supportedCountries":["US","GB","IE"],"shippingMethods":[{"label":"Free Shipping","detail":"Arrives in 5 to 7 days","amount":"0.00","identifier":"FreeShip"}]},"endpoints":{"paymentGatewayUrl":paymentGatewayUrl,"fallbackUrl":paymentGatewayUrl},"merchantSession":{"epochTimestamp":new Date().getTime(),"expiresAt":new Date().getTime()+86400000,"merchantSessionIdentifier":merchantSessionId,"nonce":'',"merchantIdentifier":"merchant.com.example.abcdemo","displayName":"Foo Bar","signature":"MIIBCgKCAQEAwRHSQCu5ZhGVKYRZwbziP3OyCdTOr3AOnWbOSKoZ+ulRZloYXignbv7OpQno54P2xvKJFbN4jPQC+2ad9pR5DbYVmQZON1haZaEWTrEpTGhWdsQjZL8fVUcqrMnc5sEsvCxtybi8ymo+bGihTmgsAyz2VeO3HI7ChBoQNcf3lXdcxTQ8bVVl9jSpY0RSH6G4zgwBDaHIsxl/pr787grkOnWBed9fVNHrickojJZIiahoH5tSCekF1KU6lRbeT9ot/fKfrh6O5+eCgCCDB5y2M/LgyFstcHNy/xjj87UQskwRsvPWXgrwNQ62Ep6FKFb7hsPPArlzHXIcshuE1kx8IQIDAQAB","initiative":"messaging","initiativeContext":paymentGatewayUrl,"signedFields":["merchantIdentifier","merchantSessionIdentifier","initiative","initiativeContext","displayName","nonce"]}},"requestIdentifier":paymentIdentifier}}}];
           
           payMeta[1].apple.data.requestIdentifier = paymentIdentifier;
           payMeta[1].apple.data.payment.merchantSession = merchSessionData;

           $scope.vm.applePay.completed = false;
           agentSdkFactory.sendSC(payJson, payMeta);
       });


       //         });
       //     });
       //});

   };  



   $scope.sendAuth = function(){
       var authJson = {"type":"vertical","tag":"authentication","elements":[{"type":"text","text":"Authentication Request"}]};
       var authMeta =[{"type":"BusinessChatMessage","receivedMessage":{"title":"Tap here to sign in","subtitle":"Thank you","imageURL":"https://s3.amazonaws.com/sc-tasks/Assets/misc/lplogo.png","style":"small"},"replyMessage":{"title":"Successfully signed in!","subtitle":"Thank you","imageURL":"https://s3.amazonaws.com/sc-tasks/Assets/misc/lplogo.png","style":"small"}},{"type":"ConnectorAuthenticationRequest","requestIdentifier":""}];
       authMeta[1].requestIdentifier = uuid();
       agentSdkFactory.sendSC(authJson, authMeta);
       $scope.vm.auth.result = 'Authentication bubble sent to visitor';
       $scope.vm.auth.completed = false;
       $timeout(()=>{
           $scope.vm.auth.result = 'Waiting on authentication result... ';
       }, 2250);
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

   $interval( ()=>{
       if($scope.data.accountId && $scope.data.convId){
           if(!$scope.vm.auth.completed){
               $http({
                   method: 'GET',
                   //url: './apayAuth/' + $scope.data.accountId + '/' + $scope.data.convId + '/auth'
                   url: './auth/' + $scope.data.accountId + '/' + $scope.data.convId + '/auth'
               }).then(function(resp){
                   //console.log(resp);
                   if(resp.data.success){
                       $scope.vm.auth.completed = true;
                       $scope.vm.auth.result = 'Authentication completed! ' + JSON.stringify(resp.data.token);
                   }
               }); 
           }
       }
   }, 2000);
});