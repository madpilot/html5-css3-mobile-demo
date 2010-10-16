if(navigator && navigator.platform && navigator.platform.match(/^(iPad$)$/)) {
  var jQT = $.jQTouch({
    icon: '/images/icon.png',
    fullScreen: true,
    fixedViewport: true,
    useFastTouch: true
  });
}

var current = 0;
var scroller = null;
var scrollOptions = {
  hScrollBar: false
};

function goTo(index) {
  var last = parseInt(current);
  current = parseInt(index);
  var articles = $('section.touch>article');
  
  articles.each(function(i, e) {
    $(e).addClass('page-' + i);
  });
  
  if(current < 0) {
    current = 0;
  }
  
  if(current > articles.length - 1) {
    current = articles.length - 1;
  }

  if(last == current) {
    return;
  }

  if(scroller) {
    scroller.destroy(false);
  }
  // Only ever have the current, the previous and the next screen visible otherwise is runs REALLY slowly.
  
  var currentArticle = articles.get(current);
  
  if(last < current) {
    for(var i = last + 1; i <= current; i++) {
      $(articles.get(i)).css('display', 'block')
        .css('-webkit-animation-name', 'slideinfromright')
        .css('-webkit-transform', 'translate3d(0,0,0) rotate(0) scale(1)')
        .css('-webkit-animation-timing-function', 'ease-in-out')
        .css('-webkit-animation-duration', '350ms');
    }
  } else if(last > current) {
    for(var i = last; i >= current + 1; i--) {
      $(articles.get(i)).css('display', 'block')
        .css('-webkit-animation-name', 'slideouttoright')
        .css('-webkit-transform', 'translate3d(100%,0,0) rotate(0) scale(1)')
        .css('-webkit-animation-timing-function', 'ease-in-out')
        .css('-webkit-animation-duration', '350ms');
    }
  }

  scroller = new iScroll(currentArticle);
  scroller.swipe = swipe;

  articles.each(function(i, el) {
    if(last > current && i == current) {
      $(el).css('-webkit-animation-name', 'fadein')
        .css('opacity', 1)
        .css('-webkit-animation-timing-function', 'ease-in-out')
        .css('-webkit-animation-duration', '350ms');
    } else if(last < current && i == last) {
      $(el).css('-webkit-animation-name', 'fadeout')
        .css('opacity', 0)
        .css('-webkit-animation-timing-function', 'ease-in-out')
        .css('-webkit-animation-duration', '350ms');
    } else if((last < current && i > last && i < current) || (last > current && i < last && i > current)) {
      $(el).css('opacity', 0);
    }
  });

  $(currentArticle).find('a').unbind('click').bind('click', function(e) {
    e.preventDefault();
    findPage(this);
  });
}
			
function swipe(e, p) {
  e.preventDefault();
  e.stopPropagation();
  
  if(Math.abs(p.deltaX) > Math.abs(p.deltaY)) {
    if(p.direction == 'left') {
      goTo(current + 1);
    } else {
      goTo(current - 1);
    }
  }
}

function baseURL(url) {
  parts = url.split('/')
  base = [];
  base.push(parts.shift());
  base.push(parts.shift());
  base.push(parts.shift());
  return base.join('/');
}

function findPage(linkTag) {
  // Step 1 if this is not a local link, window.location outta here.
  var href = $(linkTag).attr('href');

  if(href.indexOf('http') > -1 && baseURL(href) != baseURL(window.location.href)) {
    window.location = href;
    return;
  }

  // Step 2: 
  //  a) If the link has a rel page, find the page based on the corresponding rev
  //  b) If there is a #, try to find the element that it refers to (By ID), then find the index of the page it belongs to and just scroll to that
  //  c) Try to work work the target page by URL matching
  var target = null;
  if($(linkTag).attr('rel').length > 0) {
    target = $('article[rev=' + $(linkTag).attr('rel') + ']');
    if(target.length > 0) {
      target = target.get(0);
    }
  }

  if(target == null) {
    if(href.indexOf('#') > -1) {
      var id = href.split('#').pop();
      if((el = $('#' + id)).length > 0) {
        target = el.parent('article').get(0);
      }
    }
  }

  if(target == null) {
    menu = $('body>nav menu a[href=' + href + ']');
    if(menu.length > 0) {
      target = $('article[rev=' + $(menu.get(0)).attr('rel') + ']');
      if(target.length > 0) {
        target = target.get(0);
      }
    }
  }

  if(target == null) {
    window.location = href;
    return;
  }
  
  // Finally find the corresponding page and just move to that
  var articles = $('article');
  for(i in articles) {
    if(articles[i] == target) {
      goTo(i);
      return;
    }
  }
}

$(document).ready(function($) {
  var currentArticle = $('section>article:first-child').get(0);
  $(currentArticle).show();
  scroller = new iScroll(currentArticle);
  scroller.swipe = swipe;

  $(currentArticle).find('a').unbind('click').bind('click', function(e) {
    e.preventDefault();
    findPage(this);
  });
});

document.documentElement.addEventListener('touchmove', function(e) {
  e.preventDefault();
});
