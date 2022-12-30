const fs = require('fs');

const MIME_EXT = JSON.parse(fs.readFileSync(`${__dirname}/mime-to-ext.json`, 'utf8'));  
const ISO8859_1 = JSON.parse(fs.readFileSync(`${__dirname}/iso-sign.json`));

const filterOctetStream = function(chunk) {
  let extensions = [];
  Object.keys(ISO8859_1).forEach(ext => {
    let isoHeaders = ISO8859_1[ext]['signatures'];
    isoHeaders.forEach(header => {
      let isoSign = Buffer.from(header).toString('latin1');
      if(chunk.slice(0, 300).toString('latin1').includes(isoSign)) {
        extensions.push(ext);
      }
    });
  });
  return extensions;
}

module.exports = function(req, chunk) {

  if(!Buffer.isBuffer(chunk) || (typeof req !== 'object') || !req.headers['content-type']) {
    return null;
  }

  let byteLength = req.headers['content-length'];
  let contentType = req.headers['content-type'];
  let metaData = chunk.toString('utf8');

  if(!contentType.includes('multipart/form-data')) {
    return null;
  }
  
  let mime = metaData.split('\r').slice(0, 3)[2].split(':')[1].replace(' ', '');

  let ext = [];

  if(MIME_EXT[mime] && mime !== 'application/octet-stream') {
    Array.isArray(MIME_EXT[mime]) ? ext = MIME_EXT[mime] : ext.push(MIME_EXT[mime]); 
  } else {
    ext = filterOctetStream(chunk);
  }

  return {mime, ext, byteLength};
}