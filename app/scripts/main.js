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



  $image.cropper({
    crop: function(data) {
      $('#sx').val(Math.round(data.x));
      $('#sy').val(Math.round(data.y));
      $('#sh').val(Math.round(data.height));
      $('#sw').val(Math.round(data.width));

      var canvas = $image.cropper('getCroppedCanvas');
      var url = canvas.toDataURL(filetype);

      $('#download').attr({
        href: url,
        download: filename
      });

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
