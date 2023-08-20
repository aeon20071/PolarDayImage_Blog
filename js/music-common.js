var audio = document.getElementById('myAudio');
var currentTime = $(".mplayer_curtime");
var durationTime = $(".mplayer_durtime");
var circle = $('.m-circle .a')[0];
var circumference = 2 * Math.PI * 160;
var timer;
function play() {
  if (audio.paused) {
    audio.play();
    $('.music-box').addClass('mplaying');
    // 计时器实时更新进度
    timer = setInterval(() => {
      if (audio.ended) {
        // 音频播放结束
        $('.music-box').removeClass('mplaying');
        currentTime.text("00:00");
        circle.setAttribute(
          'stroke-dasharray', '0 999'
        );
      } else {
        currentTime.text(formatTime(audio.currentTime));
        durationTime.text(formatTime(audio.duration));
        var step = circumference / audio.duration;
        var timeDisplay = Math.floor(audio.currentTime);
        circle.setAttribute(
            'stroke-dasharray',
            '' + timeDisplay * step + ' ' + circumference
          );
      }
    }, 100);
  } else {
    audio.pause();
    $('.music-box').removeClass('mplaying');
  }
}

// 格式化时间
function formatTime(time) {
  console.log(time)
  // 取整
  time = ~~time;
  var formatTime;
  if (time < 10) {
    formatTime = '00:0' + time;
  } else if (time < 60) {
    formatTime = '00:' + time;
  } else {
    var m = ~~(time / 60);
    if (m < 10) {
      m = '0' + m;
    }
    var s = time % 60;
    if (s < 10) {
      s = '0' + s;
    }
    formatTime = m + ':' + s;
  }
  return formatTime;
}