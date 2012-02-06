// not supported youtube video id regex due js 1.5 delimeter /(?:v\/|vi\/|watch\?v=)([a-z0-9]{11})/i


var db = {

    'data' : {
        'host'      : ['vimeo.com', 'youtube.com', 'dailymotion.com', 'veoh.com', 'videobb.com'],
        'embed'    : [
        '<object width="{WIDTH}" height="{HEIGHT}"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" />'+
        '<param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id={ID}&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1&amp;autoplay=0&amp;loop=0" />'+
        '<embed src="http://vimeo.com/moogaloop.swf?clip_id={ID}&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1&amp;autoplay=0&amp;loop=0"'+
        'type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{WIDTH}" height="{HEIGHT}"></embed></object>',
        '<object width="{WIDTH}" height="{HEIGHT}"><param name="movie" value="http://www.youtube.com/v/{ID}?version=3&amp;hl=en_US"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/{ID}?version=3&amp;hl=en_US" type="application/x-shockwave-flash" width="{WIDTH}" height="{HEIGHT}" allowscriptaccess="always" allowfullscreen="true"></embed></object>',
        '<object width="{WIDTH}" height="{HEIGHT}"><param name="movie" value="http://www.dailymotion.com/swf/video/{ID}?logo=0"></param><param name="allowFullScreen" value="true"></param><param name="allowScriptAccess" value="always"></param><param name="wmode" value="transparent"></param><embed type="application/x-shockwave-flash" src="http://www.dailymotion.com/swf/video/{ID}?logo=0" width="{WIDTH}" height="{HEIGHT}" wmode="transparent" allowfullscreen="true" allowscriptaccess="always"></embed></object>',
        '<object width="{WIDTH}" height="{HEIGHT}" id="veohFlashPlayer" name="veohFlashPlayer"><param name="movie" value="http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1330&permalinkId={ID}&player=videodetailsembedded&videoAutoPlay=0&id=anonymous"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1330&permalinkId=[ID}&player=videodetailsembedded&videoAutoPlay=0&id=anonymous" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="{WIDTH}" height="{HEIGHT}" id="veohFlashPlayerEmbed" name="veohFlashPlayerEmbed"></embed></object>',
        '<object id="player" width="{WIDTH}" height="{HEIGHT}" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ><param name="movie" value="http://videobb.com/e/{ID}" ></param><param name="allowFullScreen" value="true" ></param><param name="allowscriptaccess" value="always"></param><embed src="http://videobb.com/e/{ID}" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="{WIDTH}" height="{HEIGHT}"></embed></object>',
        
        
        ],
        'link'      : ['vimeo.com/ ','youtube.com/v/ ', 'dailymotion.com/video/ ', 'veoh.com/watch/ ', 'videobb.com/video/ ' ],
        'validator': [/^[0-9]{11}$/i , /^([a-zA-Z0-9\-\_]{11})$/i, /^([a-zA-Z0-9]{6,8})$/i, /watch\/v[0-9]{4}[a-z0-9]{12}/i, /\w{12}/i, ],
        'extractor': [function(s){var m = s.match( /[0-9]{7,}/  ); if (!m) {return false}; return ''+m;},
                      function(s){var m = s.match( /[a-zA-Z0-9\-\_]{11}/ ); if (!m) {return false}; return ''+m;},
                      function(s){var m = s.match( /video\/[a-z0-9]{6,8}/i ); if (!m) {return false}; m=''+m;return m.substring(6);},
                      function(s){var m = s.match( /watch\/v[0-9]{4}[a-z0-9]{8,12}/i ); if (!m) {return false}; m=''+m;return m.substring(7);},
                      function(s){var m = s.match( /\w{12}/i ); if (!m) {return false}; return m=''+m;},
                      
        ],
    },

    'mh' : function (link) {

        link = $.trim(link);
        link = 'http://' + link

        var url = document.createElement('a');
        url.href = link;
        var host = url.hostname.replace('www.', '')  //.toLowerCase();

        // get host index
        var host_index = -1;
        for (var i=0; i < db.data.host.length; i++) { if (host === db.data.host[i]) host_index = i; }
        if (host_index == -1) { return false;}
        
        
        // get ID
        var ID = db.data.extractor[host_index](url.pathname + url.search);
                
        if (!ID) { return false; }

        return '' + host_index + ' ' + ID;

    },

    'mv' : function(hash) {

        if (!hash) return false;
        var host_index = parseInt(hash.split(' ')[0]);
        var ID = hash.split(' ')[1];

        // TODO: validate hash
        //if !(db.validateID(host_index, ID) {return false;} // validate host_index

        return {
            'host'        : db.data.host[host_index].slice(0, -4),
            'ID'          : ID,
            'host_index'  : host_index,
            'link'        : db.data.link[host_index].replace(' ', ID),
            'hash'        : host_index.toString() + ' ' + ID,
            
        }

    },

};



/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

