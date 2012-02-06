var Bind, cmd, dat, hashchange, html, mode, size, videos, zoomed;
dat = {
  loc: location.href,
  vmargin: 0,
  title: '',
  zoomdex: 0
};
hashchange = window.setInterval(function() {
  if (dat.loc !== location.href) {
    window.clearInterval(hashchange);
    return location.reload(false);
  }
}, 150);
window.btoa = function(s) {
  return Base64.encode(s);
};
window.atob = function(s) {
  return Base64.decode(s);
};
videos = [];
mode = {
  hi: true,
  edit: false,
  set_edit: function() {
    mode.edit = true;
    mode.hi = false;
    $('#hi').hide();
    $('#head').hide();
    $('#blank').show();
    $('#create').show();
    $('#videos').show();
    $('#title').focus();
    document.title = 'Create Video Gallery when ready';
    return true;
  },
  set_view: function() {
    mode.edit = false;
    mode.hi = false;
    $('#hi').hide();
    $('#create').hide();
    $('#blank').hide();
    $('#head').show();
    $('#videos').show();
    return true;
  }
};
size = {
  video: {
    width: 336,
    height: 189
  },
  zoomed: {
    width: 640,
    height: 360
  }
};
html = {
  video: function(v) {
    return '<div class="video"><div class="embed">' + db.data.embed[v.host_index].replace(/\{WIDTH\}/g, size.video.width).replace(/\{HEIGHT\}/g, size.video.height).replace(/\{ID\}/g, v.ID) + '</div><div class="cmd" style="visibility: hidden;">' + (" <a class='host' title='" + v.link + "' href='http://" + v.link + "'>&nbsp;" + v.host + "</a>") + ' <a class="zoom" href="javascript:;" onclick="cmd.zoom(this);">zoom</a>' + ' <a class="reload" href="javascript:;" onclick="cmd.reload(this);">reload&nbsp;</a>' + '</div></div>';
  },
  zoomed: function(v) {
    return db.data.embed[v.host_index].replace(/\{WIDTH\}/g, size.zoomed.width).replace(/\{HEIGHT\}/g, size.zoomed.height).replace(/\{ID\}/g, v.ID);
  }
};
zoomed = {
  resize: function() {
    var maxheight, maxwidth, toppadding, videoheight, videowidth, windowheight, windowwidth;
    windowheight = $(window).height();
    windowwidth = $(window).width();
    maxheight = windowheight - 200;
    maxwidth = windowwidth * 0.80;
    if (~~(maxwidth / 16) > ~~(maxheight / 9)) {
      videoheight = ~~(maxheight / 9) * 9;
      videowidth = ~~(videoheight / 9) * 16;
    } else {
      videowidth = ~~(maxwidth / 16) * 16;
      videoheight = ~~(videowidth / 16) * 9;
    }
    toppadding = ~~((windowheight - videoheight) * 0.3);
    $('#zoomed').css('width', videowidth);
    $('#zoomed_embed').css("padding-top", toppadding + 'px');
    $('#zoomed_embed').css('height', videoheight);
    $('#zoomed_embed').css('width', videowidth);
    size.zoomed.width = videowidth;
    size.zoomed.height = videoheight;
    return true;
  },
  prev: function() {
    dat.zoomdex = dat.zoomdex === 0 ? videos.length - 1 : dat.zoomdex - 1;
    $('#zoomed_embed').html(html.zoomed(videos[dat.zoomdex]));
    return true;
  },
  next: function() {
    dat.zoomdex = dat.zoomdex === videos.length - 1 ? 0 : dat.zoomdex + 1;
    $('#zoomed_embed').html(html.zoomed(videos[dat.zoomdex]));
    return true;
  },
  close: function() {
    $('#zoomed').hide();
    $('#zoomed_embed').html('');
    $('#head').show();
    $('#videos').css('marginTop', dat.vmargin);
    return true;
  }
};
cmd = {
  zoom: function(that) {
    var vid;
    vid = $(that).closest('div.video');
    zoomed.resize();
    vid.children('div.cmd').css('visibility', 'hidden');
    dat.zoomdex = $('#videos > div.video').index(vid);
    $(vid, 'div.embed').html($(vid, 'div.embed').html());
    $('#zoomed_embed').html(html.zoomed(videos[dat.zoomdex]));
    dat.vmargin = $('#videos').css('marginTop');
    $('#videos').css('marginTop', '-9990px');
    $('#head').hide();
    $('#zoomed').show();
    return true;
  },
  reload: function(that) {
    var $embed;
    $embed = $(that).closest('div.video').children('div.embed');
    $embed.html($embed.html());
    return true;
  },
  check: function(create) {
    var check_match, hashes, i, last_match, limit, msg, newtext, newvideos, nlen, title, url, urls, v, vlen, vobj, _i, _len, _len2;
    if (create == null) {
      create = false;
    }
    if (mode.hi) {
      title = $('#hi_title').val();
      urls = $('#hi_links').val();
    } else {
      title = $('#title').val();
      urls = $('#links').val();
    }
    title = $.trim(title).replace(/\s+/g, ' ').substr(0, 128) || 'untitled';
    $('#hi_title').val(title);
    $('#title').val(title);
    urls = urls.replace(/http:\/\//gi, '').split("\n");
    newtext = [];
    newvideos = [];
    last_match = -1;
    check_match = true;
    limit = false;
    vlen = videos.length;
    for (i = 0, _len = urls.length; i < _len; i++) {
      url = urls[i];
      url = $.trim(url);
      nlen = newvideos.length;
      if (url.length < 11 || url.indexOf('.') === -1 || url.indexOf('/') === -1) {
        continue;
      }
      if (url.indexOf('?') === 0) {
        url = $.trim(url.substr(1));
      }
      vobj = db.mv(db.mh(url));
      if (!vobj) {
        newtext.push('? ' + url);
        continue;
      }
      if (limit) {
        newtext.push(url);
        continue;
      }
      if (check_match && nlen < vlen && vobj.link === videos[nlen].link) {
        last_match = nlen;
      } else {
        check_match = false;
      }
      if (!limit && nlen === 64) {
        msg = 'Max 64 Videos please.';
        newtext.push('', msg, '');
        newtext.reverse().push(msg);
        newtext.reverse();
        newtext.push(vobj.link);
        limit = true;
        continue;
      }
      newtext.push(vobj.link);
      newvideos.push(vobj);
    }
    if (create) {
      if (newvideos.length > 1) {
        hashes = '';
        for (_i = 0, _len2 = newvideos.length; _i < _len2; _i++) {
          v = newvideos[_i];
          hashes += v.hash + ' ';
        }
        hashes += ' ' + title;
        window.clearInterval(hashchange);
        location.hash = 'a' + btoa(unescape(encodeURIComponent(hashes)));
        location.reload(false);
        return true;
      }
      newtext.reverse().push('Min 2 Videos please.');
      newtext.reverse();
    }
    i = last_match + 1;
    $('#videos > div.video').slice(i).empty().remove();
    while (i < newvideos.length) {
      $('#ads').before(html.video(newvideos[i]));
      i++;
    }
    videos = newvideos;
    newtext = newtext.join('\n');
    $('#hi_links').val(newtext);
    $('#links').val(newtext);
    if (mode.hi) {
      mode.set_edit();
    }
    return true;
  }
};
Bind = function() {
  $(window).bind('resize', function() {
    $('#videos').width(((window.innerWidth - 100) / 366 >> 0) * 366);
    return true;
  });
  return $('#videos').delegate('div.video', 'hover', function(e) {
    if (e.type === 'mouseenter') {
      $(this).children('div.cmd').css('visibility', 'visible');
    }
    if (e.type === 'mouseleave') {
      $(this).children('div.cmd').css('visibility', 'hidden');
    }
    return true;
  });
};
$(document).ready(function() {
  Bind();
  $(window).trigger('resize');
  (function() {
    var $ads, h, hash, i, links, pagetitle, title, vdata, ver, _len, _step;
    hash = location.href.split('#')[1] || void 0;
    if (!hash) {
      return false;
    }
    ver = hash.substr(0, 1);
    hash = hash.substr(1);
    if (!ver) {
      return false;
    }
    if (!hash) {
      return false;
    }
    try {
      hash = decodeURIComponent(escape(atob(hash)));
    } catch (error) {
      return false;
    }
    if (!hash) {
      return false;
    }
    hash = hash.split('  ');
    title = hash[1];
    hash = hash[0];
    hash = hash.split(' ');
    pagetitle = document.getElementsByTagName('title')[0];
    pagetitle.replaceChild(document.createTextNode(title), pagetitle.firstChild);
    $('#title').val(title);
    $('#t_out').append(document.createTextNode(title));
    $('#t_out').attr('href', dat.loc);
    if ((hash.length < 2) || (hash.length % 2 !== 0)) {
      return false;
    }
    links = [];
    $ads = $('#ads');
    for (i = 0, _len = hash.length, _step = 2; i < _len; i += _step) {
      h = hash[i];
      vdata = db.mv(h + ' ' + hash[i + 1]);
      if (!vdata) {
        continue;
      }
      videos.push(vdata);
      links.push(vdata.link);
      $ads.before(html.video(vdata));
    }
    $('#links').val(links.join('\n'));
    return $('#bitly').attr('href', 'https://bitly.com/?v=3&u=' + encodeURIComponent(location.href));
  })();
  if (videos.length > 0) {
    mode.set_view();
    return true;
  }
  document.title = 'create a Video Gallery';
  $('#hi').show();
  $('#hi_title').focus();
  return true;
});