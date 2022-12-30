 `$ npm install --save file-mime-types`

### Description

Read on the browser request stream and returns the mime-type, possible extensions and the size of an uploaded file.

When uploading a file from a client, the request should have a `"Content-type": "multipart/form-data"` header.

### Usage Example

**html form**
```
// index.html

<form 
    action="/upload" <!-- route -->
    enctype="multipart/form-data" <!-- important -->
    method="POST">
    <input type="file" name="fileUploaded">
    <button type="submit">Upload</button>
 </form>
```

**nodejs server**
```
const http = require('http');
const mimeAndType = require('file-mime-types');
const fs = require('fs');

http.createServer((req, res) => {
  if(req.url === '/upload') {
    req.once('data', (chunk) => {
      console.log(mimeAndType(req, chunk));
    });
  }
  res.setHeader('Content-type', 'text/html');

  fs.readFile(`${__dirname}/index.html`, 'utf8', (err, data) => {
    res.write(data);
    res.end();
  });
  
}).listen(3000);

// examples : 
// { mime: 'text/css', ext: [ 'css' ], byteLength: '72450' }
// { mime: 'application/vnd.debian.binary-package', ext: [ 'deb' ], byteLength: '34493720' }
```

The ext property of the result is an array of possible extensions.

An empty array means that no extension was found, this may happen if the mime type is application/octet-stream.

The mime-to-ext.json file contains a list of mime-types and the matching file extensions.

```
{
  "application/atom+xml":"atom",
  "application/json":["json","map","topojson"],
  "application/ld+json":"jsonld",
  "application/rss+xml":"rss",
  "application/vnd.geo+json":"geojson",
  "application/xml":["rdf","xml"],
  "application/javascript":"js",
  "application/manifest+json":"webmanifest",
  "application/x-web-app-manifest+json":"webapp",
  "text/cache-manifest":"appcache",
  "audio/midi":["mid","midi","kar"],
  "audio/mp4":["aac","f4a","f4b","m4a"],
  "audio/mpeg":"mp3",
  "audio/ogg":["oga","ogg","opus"],
  "audio/x-realaudio":"ra",
  "audio/x-wav":"wav",
  "image/bmp":"bmp",
  "image/gif":"gif",
  "image/jpeg":["jpeg","jpg"],
  "image/jxr":["jxr","hdp","wdp"],
  "image/png":"png",
  "image/svg+xml":["svg","svgz"],
  "image/tiff":["tif","tiff"],
  "image/vnd.wap.wbmp":"wbmp",
  "image/webp":"webp",
  "image/x-jng":"jng",
  "video/3gpp":["3gp","3gpp"],
  "video/mp4":["f4p","f4v","m4v","mp4"],
  "video/mpeg":["mpeg","mpg"],
  "video/ogg":"ogv",
  "video/quicktime":"mov",
  "video/webm":"webm",
  "video/x-flv":"flv",
  "video/x-mng":"mng",
  "video/x-ms-asf":["asf","asx"],
  "video/x-ms-wmv":"wmv",
  "video/x-msvideo":"avi",
  "image/x-icon":["cur","ico"],
  "application/msword":"doc",
  "application/vnd.ms-excel":"xls",
  "application/vnd.ms-powerpoint":"ppt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":"pptx",
  "application/vnd.debian.binary-package": "deb",
  "application/font-woff":"woff",
  "application/font-woff2":"woff2",
  "application/vnd.ms-fontobject":"eot",
  "application/x-font-ttf":["ttc", "ttf"],
  "font/opentype":"otf",
  "application/java-archive":["ear","jar","war"],
  "application/mac-binhex40":"hqx",
  "application/octet-stream":["bin","deb","dll","dmg","img","iso","msi","msm","msp","safariextz"],
  "application/pdf":"pdf",
  "application/postscript":["ai","eps","ps"],
  "application/rtf":"rtf",
  "application/vnd.google-earth.kml+xml":"kml",
  "application/vnd.google-earth.kmz":"kmz",
  "application/vnd.wap.wmlc":"wmlc",
  "application/x-7z-compressed":"7z",
  "application/x-bb-appworld":"bbaw",
  "application/x-bittorrent":"torrent",
  "application/x-chrome-extension":"crx",
  "application/x-cocoa":"cco",
  "application/x-java-archive-diff":"jardiff",
  "application/x-java-jnlp-file":"jnlp",
  "application/x-makeself":"run",
  "application/x-cd-image": "iso",
  "application/x-opera-extension":"oex",
  "application/x-perl":["pl","pm"],
  "application/x-pilot":["pdb","prc"],
  "application/x-rar-compressed":"rar",
  "application/x-redhat-package-manager":"rpm",
  "application/x-sea":"sea",
  "application/x-shockwave-flash":"swf",
  "application/x-stuffit":"sit",
  "application/x-tcl":["tcl","tk"],
  "application/x-x509-ca-cert":["crt","der","pem"],
  "application/x-xpinstall":"xpi",
  "application/x-ms-dos-executable":"exe",
  "application/xhtml+xml":"xhtml",
  "application/xslt+xml":"xsl",
  "application/zip":"zip",
  "text/css":"css",
  "text/csv":"csv",
  "text/html":["htm","html","shtml"],
  "text/markdown":"md",
  "text/mathml":"mml",
  "text/plain":"txt",
  "text/vcard":["vcard","vcf"],
  "text/vnd.rim.location.xloc":"xloc",
  "text/vnd.sun.j2me.app-descriptor":"jad",
  "text/vnd.wap.wml":"wml",
  "text/vtt":"vtt",
  "text/x-component":"htc",
  "application/x-desktop": "desktop",
  "text/x-markdown": "md",
  "text/vnd.trolltech.linguist": "ts",
  "image/vnd.microsoft.icon": "ico",
  "application/x-java-archive": "jar",
  "application/x-sharedlib": "so"
}
```