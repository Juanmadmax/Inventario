var KEY = 'CAMBIA-ESTA-CLAVE';
var HEAD = ['Código','Nombre','Precio','Stock','Stock mínimo','Costo'];
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function cats_(){return SpreadsheetApp.getActive().getSheets().filter(function(s){return s.getRange(1,1).getValue()==='Código';});}
function sheet_(n){var ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(n);if(!s){s=ss.insertSheet(n);s.appendRow(HEAD);s.setFrozenRows(1);s.getRange(1,1,1,6).setFontWeight('bold');}return s;}
function find_(code){var l=cats_();for(var i=0;i<l.length;i++){var v=l[i].getDataRange().getValues();for(var r=1;r<v.length;r++){if(String(v[r][0])===String(code))return {s:l[i],row:r+1,v:v[r]};}}return null;}
function doGet(e){
  if(e.parameter.k!==KEY)return out_({error:'clave'});
  var items=[];
  var cats=cats_().map(function(s){var n=s.getName();s.getDataRange().getValues().slice(1).forEach(function(v){if(v[0]!=='')items.push({code:String(v[0]),name:v[1],price:+v[2],qty:+v[3],min:+v[4],cost:+v[5],cat:n});});return n;});
  return out_({cats:cats,items:items});
}
function doPost(e){
  var b=JSON.parse(e.postData.contents);
  if(b.k!==KEY)return out_({error:'clave'});
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var ss=SpreadsheetApp.getActive(),log=ss.getSheetByName('Movimientos');
    if(!log){log=ss.insertSheet('Movimientos');log.appendRow(['Fecha','Código','Cambio','ID']);}
    var n=log.getLastRow(),done=n>1?log.getRange(2,4,n-1,1).getValues().map(function(r){return r[0];}):[];
    b.ops.forEach(function(o){
      if(o.t==='cat')sheet_(o.name);
      else if(o.t==='dcat'){var s=ss.getSheetByName(o.name);if(s&&s.getLastRow()<=1&&cats_().length>1)ss.deleteSheet(s);}
      else if(o.t==='add'&&!find_(o.item.code)){var i=o.item;sheet_(i.cat).appendRow([i.code,i.name,i.price,i.qty,i.min,i.cost]);}
      else if(o.t==='del'){var f=find_(o.code);if(f)f.s.deleteRow(f.row);}
      else if(o.t==='mov'&&done.indexOf(o.id)<0){var g=find_(o.code);if(g){g.s.getRange(g.row,4).setValue(Math.max(0,Number(g.v[3])+o.d));log.appendRow([new Date(),o.code,o.d,o.id]);done.push(o.id);}}
    });
    return out_({ok:true});
  }finally{lock.releaseLock();}
}
