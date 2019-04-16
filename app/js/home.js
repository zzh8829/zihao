import "./common";
import Craft from './craft-gl';
import CraftUI from "./craft-ui";

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

$(() => {
  window.craft = new Craft($("#craft-gl"));
  window.craft.error = () => {
    console.log('Craft crashed :(');
    homeEnabled = false;
    switchMode("blog");
    $("#craft").hide();
    $("#craft-nav").hide();
  };
  window.craft.run()
  CraftUI('craft-ui')
});

function switchMode(mode) {
  if (mode == "blog") {
    blognav.css('display', 'flex');
    homenav.hide();
    $('nav > a[href="#blog"]').addClass("active");
  } else if (mode == "home" && homeEnabled) {
    homenav.css('display', 'flex');
    blognav.hide();
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
