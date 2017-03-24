import craft from "./craft"

$(function() {
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 300);
        return false;
    });
});

let homeEnabled = true;
var homenav = $('#home-nav');
var blognav = $('#blog-nav');

if(window.location.hash) {
    homenav.hide();
} else {
    blognav.hide();
}

craft();

function switchMode(mode) {
  if(mode == 'blog') {
    blognav.show();
    homenav.hide();
  } else if (mode == 'home' && homeEnabled) {
    blognav.hide();
    homenav.show();
  }
}

var scrolling = true;

$(window).scroll(function () {
  return scrolling = true;
});

setInterval(function () {
  if (scrolling) {
    scrolling = false;
    if ($(window).scrollTop() > 200) {
      switchMode('blog')
    } else {
      switchMode('home')
    }
  }
}, 100);
