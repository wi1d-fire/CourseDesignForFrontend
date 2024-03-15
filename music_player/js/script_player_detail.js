(function(global, $){
  'use strict';
  
  // 检测移动设备并在根元素上添加类名
  var userAgent      = global.navigator.userAgent.toLowerCase();
  var mobile_devices = ['iphone', 'ipad', 'android'];
  var document       = global.document;
  var html           = document.documentElement;

  for ( var d, i=0, l=mobile_devices.length; i<l; ++i ) {
    d = mobile_devices[i];
      if ( userAgent.indexOf(d) > -1 ) {
      html.classList.add('mobile');
      break;
    }
  }
  
  // 创建动画时间线并定义初始动画
  var tl = new TimelineMax({paused: true});
  tl.from('.album-cover', 360, { rotate: -720, ease: Power0.easeIn });

  // 定义摇摆效果函数
  function wiggle(selector, duration){
    $(selector).each(function() {
      wiggleProp(this, 'scale', 0.45, duration);
      wiggleProp(this, 'rotation', -2, 2);
      // wiggleProp(this, 'x', -3, 3);
      wiggleProp(this, 'y', -3, 3);
    });
  }

  // 停止摇摆效果
  function wiggleStop(selector) {
    TweenMax.killTweensOf(selector);
    TweenMax.staggerTo(selector,0.2,{scale:1},0.05);
  }

  // 定义摇摆属性函数
  function wiggleProp(element, prop, min, max, duration) {
    var duration = duration || Math.random() * (0.1 - 0.2) + 0.1;
    var tweenProps = {
      ease: Power1.easeInOut,
      onComplete: wiggleProp,
      onCompleteParams: [element, prop, min, max]
    };
    tweenProps[prop] = Math.random() * (max - min) + min;
    TweenMax.to(element, duration, tweenProps);
  }

  // --------------------------------------------------------------------------------

  // 获取各个元素的 jQuery 对象
  var $body           = $('body'),
      $container      = $('.album-container'),
      $playlist       = $('.playlist-container', $container),
      $playlist_items = $('.item', $playlist),
      $cover          = $('.album-cover', $container),
      $buttons        = $('.button', $container),
      audio;

  // 给按钮绑定点击事件处理程序
  $.each($buttons, function(i) {
    var $button = $buttons.eq(i);
    $button.on('click', $.proxy(buttonControl, $button));
  });

  // 按钮点击事件处理程序
  function buttonControl(e) {
    var is_play = this.hasClass('is-play');
    if ( is_play ) {
      $cover.addClass('is-play').removeClass('is-pause');
      $playlist.addClass('is-close');
      $body.addClass('is-play');
      wiggle('.album-control .button', 1);
      tl.play();
    } else {
      $cover.addClass('is-pause').removeClass('is-play');
      $playlist.removeClass('is-close');
      $body.removeClass('is-play');
      wiggleStop('.album-control .button');
      tl.pause();
    }
    this.siblings('.is-pre').removeClass('is-pre');
    this.addClass('is-pre');
    audio.playPause();
  }

  // --------------------------------------------------------------------------------

  /////////////
  // 音频控制
  /////////////

  audiojs.events.ready(function() {
    
    var path = 'https://cdn.rawgit.com/yamoo9/yamoo9.github.io/master/sef/media/source/';

    var as = audiojs.createAll({
      // 当音轨结束时，播放下一曲
      trackEnded: function() {
        var next = $playlist_items.filter('.is-play').next();
        if (!next.length) { next = $playlist_items.first(); }
        next.addClass('is-play').siblings().removeClass('is-play');
        audio.load( path + next.find('a').attr('href') );
        audio.play();
      }
    });

    // 加载第一首音轨
    audio           = as[0];
    var first       = $playlist_items.first();
    var first_track = path + first.find('a').attr('href');

    first.addClass('is-play');
    audio.load(first_track);

    // 绑定音轨点击事件
    $.each($playlist_items, function(i) {
      var $item_button = $playlist_items.eq(i).find('a');
      $item_button.on('click', $.proxy(playAudio, $item_button));
    });

    function playAudio(e) {
      e.preventDefault();
      var parent = this.parent();
      parent.addClass('is-play').siblings('.is-play').removeClass('is-play');
      audio.load( path + this.attr('href') );
      // audio.play();
    }

  });

})(window, window.jQuery, window.audiojs);
