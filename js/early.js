/* the app icon chosen in the app (theme colour + symbol), set before anything else so an install picks it up */
try{var n=localStorage.getItem("tracktor-icon");if(n&&/^[a-z0-9-]+$/.test(n)){var q=function(r){return document.querySelector('link[rel="'+r+'"]')};
q("manifest").href="icons/"+n+".json?v=1";q("apple-touch-icon").href="icons/"+n+"-a.png?v=1";var f=q("icon");f.href="icons/"+n+".webp?v=1";f.type="image/webp"}}catch(e){}
