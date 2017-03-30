// nothing

$(() => {
  for(let code of $('code')) {
    if($(code).text().startsWith('output:')) {
      $(code).css('background-color','#EEE');
    }
  }
})
