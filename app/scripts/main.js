// jshint devel:true
// jshint undef:false, unused:false

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


  //--- Cropper ---//

  // function getDimensions(){
  //   // get input vars
  //   var cropHeight = document.getElementById('sw').value,
  //       cropWidth = document.getElementById('sh').value,
  //       cropX = document.getElementById('sx').value,
  //       cropY = document.getElementById('sy').value;
  //   return {
  //     x: cropX,
  //     y: cropY,
  //     h: cropHeight,
  //     w: cropWidth
  //   };
  // }

  // via http://stackoverflow.com/questions/12728188/cropping-images-in-the-browser-before-the-upload
  // function drawCroppedImage(img, canvas, d, imgType) {
  //   // trim the canvas
  //   // canvas.width = d.w;
  //   // canvas.height = d.h;
    
  //   // draw the image with offset
  //   var ctx = document.getElementById('canvas').getContext('2d');
  //   ctx.drawImage(img, d.x, d.y, d.w, d.h, 0, 0, d.w, d.h);
    
  //   // output the base64 of the cropped image
  //   var url = canvas.toDataURL(imgType);
  //   $('#output').html($('<a>',{
  //     'class':'download',
  //     href:url,
  //     target: '_blank',
  //     text:'Download'
  //   }));
  //   $('body').css({'background-image':'url('+url+')'});
  // }

  // function loadImage(e) {
  //   //Retrieve the first (and only!) File from the FileList object
  //   var f = e.target.files[0];

  //   if (f) {
  //     var reader = new FileReader();
  //     reader.onload = function() { 
  //       var img = new Image();
  //       img.onload = function() {
                
  //           drawCroppedImage(img, document.getElementById('canvas'), getDimensions(), f.type);

  //           $('.cropper').html(img).find('img').cropper({
  //             crop: function(data) {
  //               $('#sx').val(Math.round(data.x));
  //               $('#sy').val(Math.round(data.y));
  //               $('#sh').val(Math.round(data.height));
  //               $('#sw').val(Math.round(data.width));

  //               drawCroppedImage(img, document.getElementById('canvas'), getDimensions(), f.type);
  //             }
  //           });

  //       };
  //       img.src = event.target.result;
  //     };
  //     reader.readAsDataURL(f);
  //   } else { 
  //     alert('Failed to load image :(');
  //   }
  // }

  // $('#fileinput').on('change', loadImage);

 var $image = $('.cropper > img'),
  filetype = 'image/jpeg',
  img = new Image();
  img.src = $image.attr('src');


  $image.cropper({
    crop: function(data) {
      $('#sx').val(Math.round(data.x));
      $('#sy').val(Math.round(data.y));
      $('#sh').val(Math.round(data.height));
      $('#sw').val(Math.round(data.width));

      var canvas = $image.cropper('getCroppedCanvas');
      var url = canvas.toDataURL(filetype);

      $('#output').html($('<a>',{
        'class':'download',
        href:url,
        target: '_blank',
        text:'Download'
      }));
      $('body').css({'background-image':'url('+url+')'});
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
        img = new Image();
        img.src = $image.attr('src');

        if (/^image\/\w+$/.test(file.type)) {
          blobURL = URL.createObjectURL(file);
          $image.one('built.cropper', function () {
            URL.revokeObjectURL(blobURL); // Revoke when load complete
          }).cropper('reset', true).cropper('replace', blobURL);
          $inputImage.val('');
        } else {
          showMessage('Please choose an image file.');
        }
      }
    });
  } else {
    $inputImage.parent().remove();
  }






  //--- Cropper.js ---//

  // $('.cropper').find('img').cropper({
  //   preview: '.preview',
  //   crop: function(data) {
  //     $('#sx').val(Math.round(data.x));
  //     $('#sy').val(Math.round(data.y));
  //     $('#sh').val(Math.round(data.height));
  //     $('#sw').val(Math.round(data.width));
  //   }
  //   // aspectRatio: NaN,
  //   // autoCropArea: 0.65,
  //   // strict: false,
  //   // guides: false,
  //   // highlight: false,
  //   // dragCrop: false,
  //   // movable: false,
  //   // resizable: false
  // });


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
