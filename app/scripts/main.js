// jshint devel:true

$(function(){
	'use strict';



  //--- Helper functions ---//

  // Round to the nearest 2 large digits (e.g. 12345 => 12000)
  function roundLarge(x) {
    for(var i=1000000; i>=10; i=i/10){
      if (x>(i*10)) {
        return Math.round(x/i)*i;
      }
    }
    return Math.round(x);
  }
  // Round to SI prefixes
  function si(x) {
    var n = { 'M': 1000000, 'K': 1000};
    for(var key in n){
      if (x>n[key]) {
        return roundLarge(x) / n[key] + key;
      }
    }
    return Math.round(x);
  }



  //--- Config vars ---//

  var $image = $('.cropper').find('img'),
    filename = $image.attr('src').split('/').pop(),
    filetype = 'image/' + filename.split('.').pop();



  //--- Cropper ---//
  function drawPattern(img) {
    var canvas = document.getElementById('canvas');

    canvas.height = $(document).height();
    canvas.width = $(document).width();

    // default params:
    // size = size || {};
    // var sx = size.sx || 0;
    // var sy = size.sy || 0;
    // var sWidth = size.sWidth || img.width;
    // var sHeight = size.sHeight || img.height;
    // var dx = 0;//size.dx || 0;
    // var dy = 0;//size.dy || 0;
    // var dWidth = 500;//size.dWidth || img.width;
    // var dHeight = 500;//size.dHeight || img.height;

    // var tempCanvas = document.createElement('canvas'),
    // tCtx = tempCanvas.getContext('2d');

    // tempCanvas.width = size.sWidth;
    // tempCanvas.height = size.sHeight;
    // tCtx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    // use getContext to use the canvas for drawing
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ctx.createPattern(img, 'repeat');

    ctx.beginPath();
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fill();

  }


  $image.cropper({
    crop: function(data) {
      $('#sx').val(Math.round(data.x));
      $('#sy').val(Math.round(data.y));
      $('#sh').val(Math.round(data.height));
      $('#sw').val(Math.round(data.width));

      var cropCanvas = $image.cropper('getCroppedCanvas');
      var url = cropCanvas.toDataURL(filetype);

      $('#download').attr({
        href: url,
        download: filename
      });

      // var cd = $image.cropper('getCanvasData');
      // var cbd = $image.cropper('getCropBoxData');
      // var size = {
      //   sx: cbd.left,
      //   sy: cbd.top,
      //   sWidth: cbd.width,
      //   sHeight: cbd.height,
      //   dx: data.left,
      //   dy: data.top,
      //   dWidth: data.width,
      //   dHeight: data.height
      // };
      // $('#cd').text('getCanvasData: { left:'+cd.left+', top:'+cd.top+', width:'+cd.width+', height:'+cd.height+'}');
      // $('#cbd').text('getCropBoxData: { left:'+cbd.left+', top:'+cbd.top+', width:'+cbd.width+', height:'+cbd.height+'}');
      drawPattern(cropCanvas);
      // $('body').css({'background-image':'url('+url+')'});
    }
  });



  // Import image
  var $inputImage = $('#fileinput'),
    URL = window.URL || window.webkitURL,
    blobURL;

  

  if (URL) {
    $inputImage.on('change', function() {
      var files = this.files,
        file;

      if (files && files.length) {
        file = files[0];

        filetype = file.type;
        filename = file.name;


        if (/^image\/\w+$/.test(file.type)) {
          blobURL = URL.createObjectURL(file);
          $image.one('built.cropper', function () {
            URL.revokeObjectURL(blobURL); // Revoke when load complete
          }).cropper('reset', true).cropper('replace', blobURL);
          $inputImage.val('');

        } else {
          alert('Please choose an image file.');
        }
      }
    });
  } else {
    $inputImage.parent().remove();
  }








  //--- Reformat counter share number ---//
  
  $('.social-likes').socialLikes().on('counter.social-likes', function(event, service, number) {
    if(number > 0){
      $('.social-likes__counter_'+service).text( si(number) );
    }
  });


});



//--- Add Linkedin to Social Likes ---//

var socialLikesButtons = { // must be global because plugin requires it
  linkedin: {
    counterUrl: 'http://www.linkedin.com/countserv/count/share?url={url}',
    counter: function(jsonUrl, deferred) {
      'use strict';
      var options = socialLikesButtons.linkedin;
      if (!options._) {
        options._ = {};
        if (!window.IN) {
          window.IN = {Tags: {}};
        }
        window.IN.Tags.Share = {
          handleCount: function(params) {
            var jsonUrl = options.counterUrl.replace(/{url}/g, encodeURIComponent(params.url));
            options._[jsonUrl].resolve(params.count);
          }
        };
      }
      options._[jsonUrl] = deferred;
      $.getScript(jsonUrl)
      .fail(deferred.reject);
    },
    popupUrl: 'http://www.linkedin.com/shareArticle?mini=false&url={url}&title={title}',
    popupWidth: 650,
    popupHeight: 500
  }
};
