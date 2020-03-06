var app = angular.module("switcher-app", ['xeditable', 'pascalprecht.translate', 'toastr']);
agentSdkFactory.$inject = ['$window'];
lpAuthentication.$inject = ['$window'];
app.factory('agentSdkFactory', agentSdkFactory);
app.factory('lpAuthentication', lpAuthentication);
app.factory('discoveryCollections', discoveryCollections);
const base_url = 'https://liveengage-abc-dist.herokuapp.com';

app.directive('starRating', starRating);
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);
app.config(['$httpProvider', function($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }
}]);
app.run(['editableOptions', function(editableOptions) {
    editableOptions.theme = 'default'; // bootstrap3 theme. Can be also 'bs2', 'default'
}]);

function starRating() {
    //star rating directive
    return {
        restrict: 'EA',
        template:
            '<ul class="star-rating">' +
            '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
            '    <i class="fa fa-star"></i>' + // or &#9733
            '  </li>' +
            '</ul>',
        scope: {
            ratingValue: '=ngModel',
            max: '=?',
            onRatingSelect: '&?'
        },
        link: function (scope, element, attributes) {
            if (scope.max == undefined) {
                scope.max = 4;
            }
            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function (index) {
                if (scope.readonly == undefined || scope.readonly === false) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelect({
                        rating: index + 1
                    });
                }
            };
            scope.$watch('ratingValue', function (oldValue, newValue) {
                if (newValue || newValue === 0) {
                    updateStars();
                }
            });
        }
    }
}

function discoveryCollections() {
    return {
        watson_default: {
            collection_id: 'news',
            environment_id: 'system'
        }
    };
}

app.directive('prodPreview', function () {
    var directive = {};
    directive.restrict = 'E';
    directive.scope = false;
    directive.template = '<div ng-show=vm.preview_active class=modal id=myModal ng-cloak><div class=modal-content><div id=content><div class=panel-header>' +
        '<div ng-click=togglePreview() style=cursor:pointer;padding:5px;text-align:center><img src=./img/icons/arrow.png style="height: 15px; width: auto;"></div><hr class=modal-hr>' +
        '<div class=modal-panel-title-group><h4 class=modal-panel-title>{{vm.title}}</h4>' +
        '<div class=modal-panel-desc>{{vm.subtitle}}</div></div><hr class=modal-hr></div></div><div id=panel-body>' +
        '<div id=panel-body-desc><div class=modal-panel-body-desc>{{vm.choice}}</div></div><hr class=underline>' +
        '<ul class=modal-options><li ng-repeat="item in selected" class=modal-panel-option><div class=modal-panel-option-text>{{vm.ctrl == "list" ? item.title : item}}</div><hr ng-show=!$last class=segment></li></ul><hr class=modal-hr></div></div></div>';
    return directive;
});

app.directive('authWindow', function () {
    var directive = {};
    directive.restrict = 'E';
    directive.scope = false;
    directive.template = '<div></div>';
    return directive;
});

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);


app.directive("filesInput", function () {
    return {
        require: "ngModel",
        transclude: true,
        scope: false,
        link: function postLink(scope, elem, attrs, ngModel) {
            elem.on("change", function (e) {
                var files = elem[0].files;
                try {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        scope.$apply(function () {
                            scope.data.scJSON = JSON.parse(reader.result);
                        });
                        console.log(scope.data.scJSON);
                    };
                    scope.data.scJSON = scope.data.scJSON;

                    reader.readAsText(files["0"]);
                } catch (e) {
                    console.log('upload err', e);
                }
            })
        }
    }
});

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};


var uuid = function uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};

app.controller('authCtrl', function ($scope, $http, $timeout, $location, agentSdkFactory) {
    $scope.sessionId = '';
    $scope.accountId = '';
    $scope.visitorId = '';

    $scope.vm = {
        UserFirstName: '',
        UserLastName: '',
        AccountNumber: '',
        Timestamp: '',
        OpaqueUserId: '',
        AppleID: '',
        SessionId: '',
        UDID: '',
        OSVersion: ''
    };

    const sendChallengeUrlBuilder = function () {
        var urlAttachments = "";

        switch ($scope.accountId) {
            case "78100234": //T-Mobile
                urlAttachments = "backgroundcolor1:999b9e,backgroundcolor2:ed008c,logourl:https://caoioswidget.devscribble.com/images/TMobileLogo.png";
                break;

            case "67505867": //Home Depot
                urlAttachments = "backgroundcolor1:ffffff,backgroundcolor2:ff6501,logourl:https://caoioswidget.devscribble.com/images/THDLogo.jpg";
                break;

            case "20225467": //Sky
                urlAttachments = "backgroundcolor1:ffffff,backgroundcolor2:d64f9c,logourl:https://caoioswidget.devscribble.com/images/SkyLogo.jpg";
                break;

            case "33581682": //Vodafone
                urlAttachments = "backgroundcolor1:ffffff,backgroundcolor2:fa0300,logourl:https://caoioswidget.devscribble.com/images/VodafoneLogo.jpg";
                break;

            case "77195711": //Lowes
                urlAttachments = "backgroundcolor1:ffffff,backgroundcolor2:004890,logourl:https://caoioswidget.devscribble.com/images/LowesLogo.jpg";
                break;

            default:
                urlAttachments = "backgroundcolor1:ffffff,backgroundcolor2:136DFB,logourl:https://liveengage-abc.herokuapp.com/img/icon-logo.png";
                break;
        }

        return 'https://imessagetest.com/authentication?' + urlAttachments + ',SessionID:' + $scope.sessionId + ',OpaqueUserId' + $scope.visitorId;
    };

    agentSdkFactory.getProperty('chatInfo.rtSessionId', (sessionId) => {
        console.log('Received chat session id: ' + sessionId);
        agentSdkFactory.getProperty('chatInfo.accountId', (accountId) => {
            console.log('Received account id: ' + accountId);
            $scope.accountId = accountId;
            $scope.sessionId = accountId + '-' + sessionId;
            agentSdkFactory.getProperty('authenticatedData', (authData) => {
                console.log('Received consumer id: ' + authData.customerDetails.customerId);
                $scope.visitorId = authData.customerDetails.customerId;

                /*
                $scope.vm.AccountNumber = $scope.accountId;
                $scope.vm.SessionId = $scope.sessionId;
                $scope.vm.OpaqueUserId = $scope.visitorId;
                */
            });
        });
    });

    $scope.formatDate = function (date) {
        var timestamp = new Date(date).toLocaleString();
        return timestamp == null || timestamp === 'Invalid Date' ? '' : timestamp;
    };

    $scope.sendChallenge = function () {
        var iMessageAuth = {
            "appId": 1263174302, "appName": "", "URL": sendChallengeUrlBuilder(),
            "bid": "com.apple.messages.MSMessageExtensionBalloonPlugin:7A76CR8BD8:com.liveperson.abcpoc.ABC-POC.ABC-POC-iMessageExtension",
            "sessionIdentifier": "", "receivedMessage": {
                "title": "Identity Verification", "subtitle": "", "secondarySubtitle": "",
                "tertiarySubtitle": "", "imageTitle": "", "imageSubtitle": ""
            },
            "imageUrl": base_url + "/img/icons/auth-background.png",
            "useLiveLayout": false
        };

        var authMessage = { text: 'interactive ' + JSON.stringify(iMessageAuth) };
        console.log(JSON.stringify(authMessage));
        agentSdkFactory.addConversationLine(authMessage);
    };

    $scope.loadAuthInfoBySessionId = function () {
        $http.get('https://caoiosauth.devscribble.com/api/auth?sessionId=' + $scope.sessionId).then(function (data) {
            console.log('Result from loadAuthInfoBySessionId ' + JSON.stringify(data));
            $scope.vm = data.data;
        });
    };

    $scope.sendChallengeAsWebPage = function () {
        var authMessage = { text: 'https://caoioschallenge.devscribble.com/challenge?SessionID=' + $scope.sessionId };
        console.log(JSON.stringify(authMessage));
        agentSdkFactory.addConversationLine(authMessage);
    };
});


//lightweight encapsulation of authentication flows
function lpAuthentication() {
    var getAuthenticationStatus = function () {
        return false;
    };

    var authenticate = function () {
        //todo - complete authentication flow lightweight
    };

    return {
        getAuthenticationStatus: getAuthenticationStatus,
        authenticate: authenticate
    };
}

//factory encapsulation of LivePerson Agent Workspace Widget SDK
function agentSdkFactory($window) {
    var isInit = false;

    var init = function () {
        window.lpTag.agentSDK.init();
        isInit = true;
    };
    var addConversationLine = function (content, callback) {
        window.lpTag.agentSDK.command(window.lpTag.agentSDK.cmdNames.write, content, callback);
    };
    var sendStructuredContent = function (json, metadata) {
        var cmdName = window.lpTag.agentSDK.cmdNames.writeSC;
        var data = {
            json: json,
            metadata: metadata
        };
        window.lpTag.agentSDK.command(cmdName, data, function (err) {
            console.log('Error sending SC ', err);
        });
    };
    var onVisitorBlur = function (callback) {
        window.lpTag.agentSDK.onVisitorBlurred(callback);
    };
    var onVisitorFocus = function (callback) {
        window.lpTag.agentSDK.onVisitorFocused(callback);
    };
    var getProperty = function getProperty(propName, callback) {
        setTimeout(() => {
            window.lpTag.agentSDK.get(propName, function (data) {
                console.log('retrieved property ' + propName + ' || ' + data);
                callback(data);
            }, function (err) {
                console.log('Failed to retrieve ' + propName);
                //getProperty(propName, callback)
            });
        }, 500);
    };
    var bindProperty = function bindProperty(propName, callback) {
        setTimeout(() => {
            window.lpTag.agentSDK.bind(propName, function (data) {
                console.log('bound to property ' + propName + ' || ' + data);
                callback(data);
            }, function (err) {
                console.log('Failed to retrieve ' + propName);
                //getProperty(propName, callback)
            });
        }, 500);
    };

    var sendSC = function sendSC(json, metadata, callback) {
        var cmdName = "Write StructuredContent"; //window.lpTag.agentSDK.cmdNames.writeSC;
        var data = {
            json: json,
            metadata: metadata
        };
        console.log('SC Data is ' + JSON.stringify(data));
        window.lpTag.agentSDK.command(cmdName, data, function (err) {
            if (err) {
                console.log('Error sending SC ', err);
                callback && callback(err);
            }
            console.log('Completed SC Send')
        });
    };

    var sendQuickReplies = function sendQuickReplies(text, quickReplies){
        var cmdName = window.lpTag.agentSDK.cmdNames.write;
        var data = {
            text: text,
            quickReplies: quickReplies
        };
        console.log('Send Data is ' + JSON.stringify(data));
        data = JSON.parse(JSON.stringify(data));
        window.lpTag.agentSDK.command(cmdName, data, function (err) {
            if (err) {
                console.log('Error sending quickReplies ', err);
            }
            console.log('Completed quickReplies Send')
        });
    }
    return {
        init: init,
        isInit: isInit,
        addConversationLine: addConversationLine,
        sendStructuredContent: sendStructuredContent,
        onVisitorBlur: onVisitorBlur,
        onVisitorFocus: onVisitorFocus,
        getProperty: getProperty,
        bindProperty: bindProperty,
        sendSC: sendSC,
        sendQuickReplies: sendQuickReplies
    };
}
