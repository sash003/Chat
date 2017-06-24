"use strict";

$(document).ready(function() {
  var messages = $("#messages"),
    message_txt = $("#message_text"),
    audio = $("#audio")[0],
    start,
    favicon = $('link[rel="shortcut icon"]'),
    file,
    weelEvt = /Firefox/i.test(navigator.userAgent)
      ? "DOMMouseScroll"
      : "mousewheel",
    destination = {};
  window.destination = destination; // кому будем отсылать

  // всё начинается отсюда
  $("#message_btn").click(function(e) {
    preventdefault(e);
    $("#fileImg").css("boxShadow", "none");
    var text = $("#message_text").val().trim();
    var name = $("#nick").text().trim();
    var time = getUTC();
    if ((!text && !$("#file").val()) || !name) return;
    if ($("#file").val()) {
      var files = $("#file")[0].files[0],
        parts = files.name.split("."),
        ext = parts.pop();
      ext = ext.toLowerCase();

      if (
        !/(jpg|jpeg|png|gif|bmp|docx|doc|rtf|fb2|xml|pdf|rar|zip|txt|djvu|psd|mp3)$/i.test(
          ext
        ) ||
        files.size > 10 * 1024 * 1024
      ) {
        $("#fileImg").css("boxShadow", "0 0 2px red");
        $("#file").val("");
        return;
      }

      var data = new FormData($("form").get(0));
      data.delete("nick");
      data.delete("message_text");
      data.append("func", "uploadFile");
      $.ajax({
        url: "/",
        type: "POST",
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function(res) {
          setTimeout(function(){
          file = res;
          // Ну вот кроме этого нет смысла и комментировать тут по сути ничего для тебя.. socket.send отсылает сообщение, пробовал объект не хочет принимать на сервере. поэтому JSON.stringify
          
            socket.send(
              JSON.stringify({
                message: text,
                name: name,
                time: time,
                file: file,
                destination: window.destination
              })
            );
          }, 11);
        }
      });
    } else {
      file = "";
      socket.send(
        JSON.stringify({
          message: text,
          name: name,
          time: time,
          file: file,
          destination: window.destination
        })
      );
    }
    message_txt.val("");
    $("#file").val("");
    message_txt.focus();
    window.destination = destination = {};
    $('#Annulment').hide();
  });

  // а это ловит сообщение, которое отослал нам сервер
  socket.onmessage = function(data) {
    data = JSON.parse(data.data);
    // если был прислан айди, значит это новое соединение и нужно отослать свой логин в базе (см index.php 51)
    if (data.id) {
      socket.send(JSON.stringify({ id: data.id, myId: id }));
    }else if(data.online){
      $('#users ul li').each(function(){
        if($(this).attr('data-id') == data.online){
          if(!/online/.test($(this).html())){
            $(this).append("<img src='/template/images/online.png'/>"); 
          }
        }
      });
    }else if(data.left){
      $('#users ul li').each(function(){
        if($(this).attr('data-id') == data.left){
          $(this).find("img").remove(); 
        }
      });
    }else {
      msg(data.name, data.message, data.time);
    }
  };

  // вставка словленного сообщения в хтмл
  function msg(nick, message, time) {
    if (nick == $("#nick").text().trim()) {
      start = '<li class="msg" style="margin-left: 5%;">';
    } else {
      start = '<li class="msg">';
      audio.play();
      favicon.attr("href", "/template/images/message.png");
    }
    var m =
      start +
      '<a class="nick">' +
      nick +
      "</a><br>" +
      message +
      "<span class='time'>" +
      getRightTime(time) +
      "</span>" +
      "</li>";
    var last = $(m);
    last.appendTo("#messages");
    // если вверх не крутили чтото не искали
    if (last.offset().top < window.innerHeight) {
      $("#messWrap").stop().animate(
        {
          scrollTop: $("#messages").height()
        },
        333
      );
    }
    setTimeout(setFrames, 333);
  }

  // в бд лежат милисекунды по UTC
  $(".time").each(function() {
    var time = parseInt($(this).text()),
      rightTime = getRightTime(time);
    if (/\d{13}/.test(time)) {
      $(this).text(rightTime);
    }
  });

  // Смена иконки при заходе на страницу с непрочитанным сообщением
  $(document).on("mouseover keydown", function() {
    if (favicon.attr("href") == "/template/images/message.png") {
      favicon.attr("href", "/template/images/favicon.png");
    }
  });

  // подгрузка предыдущих сообщений
  $("#top").click(function() {
    var firstId = $(".msg").first().attr("id");
    if (firstId > 1) {
      $.ajax({
        url: "/",
        type: "POST",
        data: {
          func: "getPrev",
          id: firstId
        },
        success: function(res) {
          var lis = $(res);
          lis.prependTo("#messages").fadeOut(0).fadeIn(555);
          $(".time").each(function() {
            var time = parseInt($(this).text()),
              rightTime = getRightTime(time);
            if (/\d{13}/.test(time)) {
              $(this).text(rightTime);
            }
          });
          setTimeout(setFrames, 333);
        }
      });
    }
  });

  //  KEYDOWN отправка
  $(window).on("keydown", function(e) {
    if (e.ctrlKey && e.which == 13) {
      $("#message_btn").trigger("click");
    }
  });

  // Editor
  $("body").on("click", ".code", function() {
    var id = $(this).attr("data-rel");
    addEditor("[" + id + "]", "[\\" + id + "]");
  });
  $("body").on("click", "#users ul li", function() {
    var nick = $(this).text();
    addEditor("[NICK]" + nick + "[\\NICK], ");
    destination[nick] = $(this).attr("data-id");
    window.destination = destination;
    $('#Annulment').show();
  });
  $('#Annulment').on('click', function(){
    var text = message_txt.val();
    text = text.replace(/\[NICK\]([\S\s]*?)\[\\NICK\], /gi, '');
    message_txt.val(text);
    window.destination = destination = {};
    $(this).hide();
    message_txt.focus();
  });

  // скролл вниз при загрузке
  $(window).on("load", function() {
    $("#messWrap").stop().animate(
      {
        scrollTop: $("#messages").height()
      },
      777
    );
  });

  // расчёт высоты окна с сообщениями
  $("#messWrap").css(
    "height",
    window.innerHeight -
      parseInt($("#form").css("height")) -
      parseInt($("#chat").css("marginTop")) * 4 +
      "px"
  );

  // открытие картинок
  $("body").on("click", ".attachImg, .gif", function() {
    var src = $(this).attr("src");
    $("#wrapImg img").attr("src", src);
    setTimeout(setWidth, 11);
    $("#wrapImg").show();
  });

  // скрытие картинок
  $(document).on('mousedown', function(e) {
    e = e || window.event;
    if ($("#wrapImg").is(e.target)) {
      $("#wrapImg").hide();
    }
  });
  $(document).on("keydown", function(e) {
    if (e.which == 27){
      if($("#wrapImg").css("display") == "block"){
        $("#wrapImg").hide();
      }
      if(message_txt.is(':focus')){
        message_txt.val('');
        window.destination = destination = {};
      }
    }
  });

  // там чёто не получается по-хорошему выставить скрепку
  var ua = detect.parse(navigator.userAgent);
  if (ua.browser.family == "Firefox") {
    $("#fileImg").css("bottom", "-16px");
  }

  // выставляю ютубовские фреймы, ширину 80% и высоту вполовину ширины
  setFrames();
  $(window).on("resize", setFrames);
  message_txt.focus();

  // масштабирование открытой картинки 
  $("#wrapImg").on(weelEvt, function(e) {
    preventdefault(e);
    var evt = e.originalEvent ? e.originalEvent : e,
      delta = evt.detail ? evt.detail * -40 : evt.wheelDelta;

    if (delta > 0) {
      resize("+");
    }
    if (delta < 0) {
      resize("-");
    }
  });

  /*Функции*/
  function resize(direction) {
    var style = $("#wrapImg img").attr("style"),
      newTransform = style.replace(/(scale.)(\d(\.\d)?)/, function(
        match,
        value,
        value2
      ) {
        var n = parseFloat(value2),
          nn;
        if (direction === "+") {
          nn = n + 0.1;
          if (nn < 1.7) {
            return value + nn.toFixed(1);
          }
        }
        if (direction === "-") {
          nn = n - 0.1;
          if (nn > 0.5) {
            return value + nn.toFixed(1);
          }
        }
        return value + n;
      });
    $("#wrapImg img").attr("style", newTransform);
  }

  function setWidth() {
    var imW = parseInt($("#wrapImg img").css("width")),
      imH = parseInt($("#wrapImg img").css("height")),
      blW = parseInt($("#wrapImg").css("width")),
      blH = parseInt($("#wrapImg").css("height")),
      padd;

    $("#wrapImg").css({
      paddingTop: 0
    });

    if (imW > imH) {
      $("#wrapImg img").css({
        width: "90%",
        height: "auto"
      });
      padd =
        (parseInt($("#wrapImg").css("height")) -
          parseInt($("#wrapImg img").css("height"))) /
        2;
      $("#wrapImg img").css({
        top: padd + "px"
      });
    } else {
      $("#wrapImg img").css({
        height: "90%",
        width: "auto"
      });
      padd =
        (parseInt($("#wrapImg").css("height")) -
          parseInt($("#wrapImg img").css("height"))) /
        2;
      $("#wrapImg img").css({
        top: padd + "px"
      });
    }
  }

  function safe(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function preventdefault(e) {
    e = e || window.event;
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  }

  function getUTC() {
    var date = new Date(),
      ms = date.getTime();
    return ms;
  }

  function getRightTime(ms) {
    var date = new Date(),
      difference = date.getTimezoneOffset() / 60000,
      msn = ms + difference,
      date = new Date(msn),
      day = String(date.getDate()),
      month = String(date.getMonth() + 1);
    if (day.length < 2) {
      day = "0" + day;
    }
    if (month.length < 2) {
      month = "0" + month;
    }
    date =
      day +
      "." +
      month +
      "." +
      date.getFullYear() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes();
    return date;
  }

  function setFrames() {
    $("iframe").each(function() {
      $(this).css({ display: "block", margin: "auto" });
      $(this).attr({ width: "80%" });
      var height = $(this).width() / 2;
      $(this).attr({ height: height });
    });
    $(".mp3 object").each(function() {
      $(this).attr({ width: "50%" });
      if ($("body").width() < 600) {
        $(this).css({ height: "33px" });
      }
    });
  }
});
