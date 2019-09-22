import "./common";
import Craft from "./craft-gl";
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

const homenav = $("#home-nav");
const blognav = $("#blog-nav");

let homeEnabled = true;

if (!window.WEBGL.isWebGLAvailable()) {
  homeEnabled = false;
  $("#craft").hide();
  $("#craft-nav").hide();
  switchMode("blog");
} else {
  $(() => {
    window.craft = new Craft($("#craft-gl"));
    window.craft.error = e => {
      console.log("Craft crashed :(", e);
      homeEnabled = false;
      $("#craft").hide();
      $("#craft-nav").hide();
      switchMode("blog");
    };
    window.craft.run();
    CraftUI("craft-ui");
  });
  switchMode("home");
}

if (window.location.hash) {
  switchMode("blog");
} else {
  switchMode("home");
}

function switchMode(mode) {
  if (!homeEnabled) {
    mode = "blog";
  }

  if (mode == "blog") {
    blognav.css("display", "flex");
    homenav.hide();
    $('nav > a[href="#blog"]').addClass("active");
  } else if (mode == "home") {
    homenav.css("display", "flex");
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
