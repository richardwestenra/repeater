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

  var $document = $(document),
    $image = $('.cropper').find('img'),
    $values = $('#values'),
    $download = $('#download'),
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    $fileinput = $('#fileinput'),
    filename = $image.attr('src').split('/').pop(),
    filetype = 'image/' + filename.split('.').pop();



  // Draw repeating img tile on canvas bg
  function drawPattern(img) {
    canvas.height = $document.height();
    canvas.width = $document.width();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ctx.createPattern(img, 'repeat');
    ctx.beginPath();
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fill();
  }


  // Redraw pattern on window resize
  $(window).on('resize',function(){
    drawPattern( $image.cropper('getCroppedCanvas') );
  });


  // Initialise image cropper
  $image.cropper({
    crop: function(data) {
      // Show crop data on page
      $values
        .find('#sx').text(Math.round(data.x)+'px').end()
        .find('#sy').text(Math.round(data.y)+'px').end()
        .find('#sh').text(Math.round(data.height)+'px').end()
        .find('#sw').text(Math.round(data.width)+'px').end()
        .find('#sr').html(Math.round(data.rotate*10)/10+'&deg;');

      // Get cropped image
      var cropCanvas = $image.cropper('getCroppedCanvas');

      // Update download link only on click, to reduce DOM ops/memory leaks
      $download.on('click',function(){
        var url = cropCanvas.toDataURL(filetype, 1);
        $(this).attr({ href: url, download: filename });
      });

      drawPattern(cropCanvas);
    }
  });

  // Add extra crop controls
  $('#cropControls').find('button').on('click',function(){
    var action = $(this).data('action'),
      value = +$(this).data('value');
    $image.cropper(action,value);
  });

  // Add button to show/hide crop window for more screen real estate, if needed
  $('#toggle').on('click',function(){
    var $icon = $(this).find('i');
    var $container = $(this).parents('.cropper');
    var visible = $icon.hasClass('icon-left');
    if (visible) {
      $container.animate({'left': -$container.outerWidth()});
      $icon.removeClass().addClass('icon-right');
    } else {
      $container.animate({'left': 0});
      $icon.removeClass().addClass('icon-left');
    }
  });



  // Import/upload images
  var URL = window.URL || window.webkitURL;

  if (URL) {
    $fileinput.on('change',function() {
      var files = this.files,
        file;

      if (files && files.length) {
        file = files[0];
        filetype = file.type;
        filename = file.name;

        if (/^image\/\w+$/.test(filetype)) {
          var blobURL = URL.createObjectURL(file);
          $image.one('built.cropper', function () {
            URL.revokeObjectURL(blobURL); // Revoke when load complete
          }).cropper('reset', true).cropper('replace', blobURL);
          $fileinput.val('');

        } else {
          alert('Please choose an image file.');
        }
      }
    });
  } else {
    $fileinput.on('click',function(e){
      e.preventDefault();
      alert('The features required to make this work aren\'t supported in your browser :(. Try Chrome, maybe?');
    });
  }








  //--- Reformat counter share number ---//
  
  $('.social-likes').socialLikes().on('counter.social-likes', function(event, service, number) {
    if(number > 0){
      $('.social-likes__counter_'+service).text( si(number) );
    }
  });


});
