$(() => {
  const pathname = window.location.pathname.replace(/\/+$/, "")
  $('nav > a[href="'+pathname+'"]').addClass('active');
})
