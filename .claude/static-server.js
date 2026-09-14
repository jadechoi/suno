const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};
http.createServer((req,res)=>{
  const p=path.join(root,decodeURIComponent(req.url.split('?')[0])==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p,(err,data)=>{
    if(err){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});
    res.end(data);
  });
}).listen(8931,()=>console.log('serving '+root+' on :8931'));
