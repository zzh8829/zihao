import * as Sentry from '@sentry/browser';

Sentry.init({ dsn: 'https://e7cdad7d71814f71b317fe387e00b938@sentry.io/1757753' });

$(() => {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  $('nav > a[href="' + pathname + '"]').addClass("active");
});
