$(function() {
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 300);
        return false;
    });
});

var homenav = $('#home-nav');
var blognav = $('#blog-nav');

if(homenav.length) {
    if(window.location.hash) {
        homenav.hide();
    } else {
        blognav.hide();
    }

    var scrolling = true;

    $(window).scroll(function () {
      return scrolling = true;
    });

    setInterval(function () {
      if (scrolling) {
        scrolling = false;
        if ($(window).scrollTop() > 200) {
          homenav.hide();
          blognav.show();
        } else {
          blognav.hide();
          homenav.show();
        }
      }
    }, 100);
}
