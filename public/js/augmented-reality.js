(function(){
  var notifyWhenDone = function(err) {
      if (err) {
          console.log('AR: '+err);
      }
      console.log('AR: function ended');
  };

  var cmdName = "Send File";
  var url = './fender_stratocaster.usdz';
  // var xhr = new XMLHttpRequest();
  // xhr.open('GET', url, true);
  // xhr.responseType = 'blob';
  // xhr.onload = function (ev) { 
  //   console.log('AR: '+this.status);
  //     if (this.status === 200) {
  //         var file = this.response;
  //         var name = url.split('\\').pop().split('/').pop();
  //         console.log('AR: sending file');
  //         lpTag.agentSDK.command(cmdName, {file: file, name: name}, notifyWhenDone);
  //     }
  // };
  // xhr.send();

  fetch(url)
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => {
      // Here's where you get access to the blob
      // And you can use it for whatever you want
      // Like calling ref().put(blob)
      console.log(blob);
      var file = blob;
      var name = url.split('\\').pop().split('/').pop();
      console.log('AR: '+name);
      console.log('AR: sending file');
      lpTag.agentSDK.command(cmdName, {file: file, name: name}, notifyWhenDone);
  });

}());