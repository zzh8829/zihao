import "./common";
import Craft from "./craft";

$(function() {
  $('a[href^="#"]').on("click", function(e) {
    e.preventDefault();
    $("html, body").animate(
      { scrollTop: $($(this).attr("href")).offset().top },
      300
    );
    return false;
  });
});

let homeEnabled = true;
const homenav = $("#home-nav");
const blognav = $("#blog-nav");

if (window.location.hash) {
  homenav.hide();
} else {
  blognav.hide();
}

window.craft = new Craft($("#demo"));
window.craft.error = () => {
  homeEnabled = false;
  switchMode("blog");
  $("#demo").hide();
  $("#demo-nav").hide();
};
window.craft.run();

function switchMode(mode) {
  if (mode == "blog") {
    blognav.show();
    homenav.hide();
    $('nav > a[href="#blog"]').addClass("active");
  } else if (mode == "home" && homeEnabled) {
    blognav.hide();
    homenav.show();
    $('nav > a[href="#blog"]').removeClass("active");
  }
}

let scrolling = true;

$(window).scroll(function() {
  return (scrolling = true);
});

setInterval(function() {
  if (scrolling) {
    scrolling = false;
    if ($(window).scrollTop() > 200) {
      switchMode("blog");
    } else {
      switchMode("home");
    }
  }
}, 100);
