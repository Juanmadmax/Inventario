var C="inv-v1",F=["./","index.html","manifest.json","https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js","https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}))});
self.addEventListener("fetch",function(e){var u=e.request.url;if(e.request.method!=="GET"||!(u.indexOf(self.location.origin)===0||u.indexOf("cdnjs")>-1))return;
e.respondWith(fetch(e.request).then(function(r){var x=r.clone();caches.open(C).then(function(c){c.put(e.request,x)});return r}).catch(function(){return caches.match(e.request)}))});
