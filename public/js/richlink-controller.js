app.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', {
    "preview": "Preview",
    "invalidUrl":"Invalid Url",
    "required":"url is required",
    "clickHere":"Click here",
    "sendSc":"SEND SC"
  });
  $translateProvider.useUrlLoader('/translate');
  $translateProvider.preferredLanguage('en');
  $translateProvider.useSanitizeValueStrategy('escape');
}]);

app.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    autoDismiss: false,
    containerId: 'toast-container',
    maxOpened: 0,    
    newestOnTop: true,
    positionClass: 'toast-top-left',
    preventDuplicates: false,
    preventOpenDuplicates: false,
    target: 'body'
  });
});

// https://github.com/Foxandxss/angular-toastr

app.controller('richLinkCtrl', function($q, $translate, $rootScope, $scope, toastr, $http, $location, agentSdkFactory) {
  if(!agentSdkFactory.isInit){
    agentSdkFactory.init();
    console.log("agent sdk init");
  }
  
  function is_url(str) {
    var re = /[a-z]+|[-._~:/?#\[\]@!$&'()*+,;=`.]+/g;
    return re.test(str);
  }

  var lang = $location.search().lang ? $location.search().lang : 'en';
  var img = $location.search().img && is_url($location.search().img) ? $location.search().img : '';
  var test = $location.search().test && $location.search().test == 'true' ? true : false;
  var addSource = $location.search().source && $location.search().source == 'true' ? true : false;
  var addConvoId = $location.search().convoid && $location.search().convoid == 'true' ? true : false;
  var passParams = $location.search().rlparams ? $location.search().rlparams : '';
  var noIcon = $location.search().noicon && $location.search().noicon == 'true' ? true : false;

  $translate.use(lang);

  //$mdThemingProvider.theme("error-toast");
  //console.log($translate);

  $scope.vm = {};
  $scope.data = {
    url: ''
  };
  $scope.vm.currentPath = "/";
  $scope.structuredContent = '';
  $scope.loading = false;
  $scope.error = {
      required: false
  };
  //$scope.ready = test;
  $scope.isABC = false;
  $scope.source = '';

  var addOrReplaceParam = function(url, param, value) {
    if (passParams!=''){
      url += (url.indexOf('?')>=0 ? '&' : '?') + passParams;
      console.log(url);
      passParams = '';
    }
    if(!value || !addSource) {
      return url;
    }
    param = encodeURIComponent(param);
    var r = "([&?]|&amp;)" + param + "\\b(?:=(?:[^&#]*))*";
    var a = document.createElement('a');
    var regex = new RegExp(r);
    var str = param + (value ? "=" + encodeURIComponent(value) : ""); 
    a.href = url;
    var q = a.search.replace(regex, "$1"+str);
    if (q === a.search) {
       a.search += (a.search ? "&" : "") + str;
    } else {
       a.search = q;
    }
    console.log(a.href);
    return a.href;
  };

  function checkImg(url,contentType) {
    contentType = contentType ? contentType : '';
    if(url.startsWith('http://')) {
      url = url.replace('http','https');
    }
    if($scope.isABC) {
      var supportedImgTypes = /.*\.((jpg|jpeg|png)|((jpg|jpeg|png)\?.*))$/;
      var supportedContentTypes = /.*image\/((jpg|jpeg|png)|((jpg|jpeg|png)\?.*))$/;
      if(!url.match(supportedImgTypes) && !contentType.match(supportedContentTypes)) {
        return $q(function(resolve) {
          resolve(img);
        });
      }
    }

    return $q.when(fetch(url, {
      method: 'head',
      mode: 'no-cors'
    }).then(function(data) {
      console.log(data);
      return url;
    }).catch(function(err) {
      console.error(err);
      return img;
    }));
  }

  function absolute(base, relative) {
    if (relative.startsWith('//')) {
      return 'https://' + relative; 

    } else if(relative.startsWith('/')) {
      return base + relative;
    } else if(!relative.startsWith('http')) {
      return base + '/' + relative;
    } else {
      return relative;
    }
  }

  function checkAccess(content) {
    var accessRegex = '\w*(content blocked|access denied)\w*';
    var contentBlockedRegex = '\w*(content blocked)\w*';
    var accessDeniedRegex = '\w*(access denied)\w*';
    if(content.toLowerCase().match(contentBlockedRegex)) {
      toastr.error('URL Blocked by LP: Please request whitelist', 'Error');
    } 
    if(content.toLowerCase().match(accessDeniedRegex)) {
      toastr.error('Ping Blocked by Client Site: Please request whitelist', 'Error');
    }
    return content.toLowerCase().match(accessRegex);
  }


  $scope.addToolTip = function(button) {
    //data-toggle="tooltip" data-placement="right" title="Tooltip on right"
    button.setAttribute('data-toggle','tooltip');
    button.setAttribute('data-placement','right');
    button.setAttribute('title', addOrReplaceParam($scope.data.url,'source',$scope.source));
  };

  $scope.renderSC = function(structuredContent) {
    var rooEl = '';
      try {
        rooEl = JsonPollock.render(structuredContent);
        var container = document.getElementById('container');
        container.replaceChild(rooEl, container.firstChild);
        $scope.structuredContent = structuredContent;
        $scope.loading = false;
        $scope.addToolTip(container.querySelector('.lp-json-pollock-element-button'));
      } catch(e) {
        console.error(e);
        $scope.loading = false;
        //$scope.showToast(e.message);
        toastr.error(e.message, 'Error');
      }
  };

  $scope.sendSC = function () {
    console.log($scope.structuredContent);
    
    agentSdkFactory.sendStructuredContent($scope.structuredContent, null, function(err) {
      if(err) {
        console.error(err);
        toastr.error('Send SC Error: ' +  err, 'Error');
      }
    });
  };

  $scope.scrape = function(err, url) {
    console.log(url);
    console.log(err);
    if(!err.url && !err.required) {
      $scope.loading = true;
      //$scope.structuredContent = '';
      url = addOrReplaceParam(url, 'source', $scope.source);
      url = addOrReplaceParam(url, 'convoid', $scope.convoId);
      $scope.data.url = url;
      var params = {
        url: url
      };

      $http.get('/richlink/scrapeOg', 
        {
          params: params
        }).
        then(function(response) {
          $scope.currentProduct = response.data;
          var data = response.data.ogTags ? response.data.ogTags : [];
          //$scope.recommendedProducts = response.data.relatedItems;
          console.log(data.ogTags);
          var title = '';
          var structuredContent = {
            type: 'vertical',
            tag: 'richLink',
            elements: []
          };
          var imgSet = false;
          var contentType = false;
          var elements = [];
          data.forEach(element => {
            var property = element.property.toLowerCase();
            switch(property) {
              case 'og:image':
                elements[0] = {
                  type: 'image',
                  url: element.content
                };
                if(element.contentType) {
                  contentType = element.contentType;
                }
                imgSet = true;
                break;
              case 'og:title':
                title = element.content;
                // elements[1] = {
                //   type: 'text',
                //   text: element.content,
                //   style: {
                //     bold: true,
                //     italic: false,
                //     color: "#000000"
                //   }
                // };
                break;
              case 'og:description':
                // elements[2] = {
                //   type: 'text',
                //   text: element.content
                // };
                break;
              case 'favicon':
                if(!elements[0] && !noIcon) {
                  elements[0] = {
                    type: 'image',
                    url: absolute(new URL(url).origin, element.content)
                  };
                  imgSet = true;
                }
                break;
              case 'title':
                if(!elements[1] && !checkAccess(element.content) && title=='') {
                  title = element.content;
                  // elements[1] = {
                  //   type: 'text',
                  //   text: element.content,
                  //   style: {
                  //     bold: true,
                  //     italic: false,
                  //     color: "#000000"
                  //   }
                  // };
                }
                break;
              case 'description':
                // if(!elements[2]) {
                //   elements[2] = {
                //     type: 'text',
                //     text: element.content
                //   };
                // }
                break;
            }
          });
          if(!imgSet) {
            if(img) {
              elements[0] = {
                type: 'image',
                url: img
              };
            }
            elements.forEach(element => {
              structuredContent.elements.push(element);
            });
            
            structuredContent.elements.push({
              type: 'button',
              title: title ? title : $translate.getTranslationTable().clickHere,
              click: {
                actions: [
                  {
                    type: 'link',
                    uri : addOrReplaceParam(url,'source',$scope.source)
                  }
                ]
              }
            });
  
            $scope.renderSC(structuredContent);
          } else {
            checkImg(absolute(new URL(url).origin, elements[0].url), contentType).then(function(validatedUrl) {
              if(!validatedUrl) {
                delete elements[0];
              } else {
                elements[0] = {
                  type: 'image',
                  url: validatedUrl
                };
              }
              elements.forEach(element => {
                structuredContent.elements.push(element);
              });
    
              structuredContent.elements.push({
                type: 'button',
                title: title ? title : $translate.getTranslationTable().clickHere,
                click: {
                  actions: [
                    {
                      type: 'link',
                      uri : addOrReplaceParam(url,'source',$scope.source)
                    }
                  ]
                }
              });
    
              $scope.renderSC(structuredContent);
            });
            
          } 

        }, function(err){
          console.error(err);
          $scope.loading = false;
          var status = err.data && err.data.status ? err.data.status : 500;
          var errorMessage = err.data && err.data.message ? 'Error: ' + err.data.message : err.data && err.data.code ? 'Error: ' + err.data.code : 'Preview error';
          if ((status >= 400 && status < 500) || errorMessage == 'Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            errorMessage = 'URL blocked by LP: please request whitelist';
            var structuredContent = {
              type: 'vertical',
              tag: 'richLink',
              elements: []
            };
            structuredContent.elements.push({
              type: 'button',
              title: $translate.getTranslationTable().clickHere,
              click: {
                actions: [
                  {
                    type: 'link',
                    uri : addOrReplaceParam(url,'source',$scope.source)
                  }
                ]
              }
            });
            $scope.renderSC(structuredContent);
          }
          $scope.structuredContent = '';
          //$scope.renderSC(structuredContent);
          //$scope.showToast(errorMessage);
          toastr.error(errorMessage, 'Error');
        });
    } else if (err.required) {
      $scope.error.required = true;
    }
  };

});