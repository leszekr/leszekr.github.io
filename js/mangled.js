
function log(msg){
  setStatus(msg);
  //if(window.console) console.log(msg);
}

var coords2mesh = {};
    
function stringifyArray(arr){
  var result = '[';
  for(var i in arr){
    result += arr[i]+",";
  }
  result.replace(/,^/,"");
  result += ']';
  return result;
}

var ui = {
  animating: false
};
  
var mouse = { x:0, y:0, button: false };

function fixSize(){
  plot.center.x = plot.canvas.width/2-10;
  plot.center.y = plot.canvas.height/2-30;
}

function zToColor(z){
  var r=(z+1)/2;
  var g=(z+1)/2;
  var b=0;
  return "rgba("+r+","+g+","+b+")";
}

function diff(v1,v2){
  return {
    x: v1.x-v2.x,
    y: v1.y-v2.y,
    z: v1.z-v2.z
  }
}

function crossproduct(v1,v2){
  var prod = {
    x : v1.y*v2.z-v1.z*v2.y,
    y : v1.z*v2.z-v1.x*v2.z,
    z : v1.x*v2.y-v1.y*v2.x
  }
  return prod;
}


var camera = {
  d: 14,
  phi: 3.14/2-1,
  tau: -0.2,
  
  update: function(){
    this.costau = Math.cos(this.tau);
    this.sintau = Math.sin(this.tau);
    this.cosphi = Math.cos(this.phi);
    this.sinphi = Math.sin(this.phi);
  },
  
  projection : function(x,y,z){
    this.update();
    var p1={x:-10*y/plot.density,y:-plot.zContrast*z/65,z:10*x/plot.density}
    var p2 = {
      x: p1.x*this.costau-p1.z*this.sintau,
      y: p1.y,
      z: p1.x*this.sintau+p1.z*this.costau
    }
    var p3 = {  
      x: p2.x, 
      y: p2.y*this.cosphi-p2.z*this.sinphi,
      z: p2.y*this.sinphi+p2.z*this.cosphi}
    var d = camera.d;
    return { x:plot.center.x+50*p3.x*(d/(p3.z+d)), y:plot.center.y+50*p3.y*(d/(p3.z+d)), z:z};
  }
}
  
  var plot = {
    
    zContrast: 2.5,
    density: 360,
    canvas:false,
    elevation: [],
    normal:[],
    color: [],
    ctx: false,
    busy: false,
    options: {
      wireframe: false,
      pixels: true
    },
    center: { x:400, y:300 },
    bounds: {
      north: 149.99699967956542,
      east: 46.86086226560373,
      south: 127.93645280456542,
      west: 29.68890556591633
    },
    needsRedraw: true,
    
    animate: function(){
      //camera.tau+=0.002; this.needsRedraw = true;
      if(this.needsRedraw){
        var skip = 1;
        if(this.options.wireframe||this.busy||ui.animating){
          this.wireframe(6);
        } 
        else{
          if(this.options.pixels) this.pixelate(skip);
          else this.draw(skip);
        }
      }
    },
    
    setBounds: function(bounds){
      this.bounds.north = bounds.north;
      this.bounds.east = bounds.east;
      this.bounds.south = bounds.south;
      this.bounds.west = bounds.west;
      //log("{north:"+bounds.north+", east:"+bounds.east+", south:"+bounds.south+", west:"+bounds.west+"}");
      this.span = 111/(bounds.north-bounds.south); // y-axis in km
      //log(this.zContrast);
    },
    
    wireframe:function(skip) {
      skip = skip || 4;
      var ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.strokeStyle = "#555"; 
      ctx.lineWidth = 0.5;
      for(var x=0; x<this.density; x+=skip){
        z = this.elevation[x*this.density];
        ctx.beginPath();
        var startpoint = camera.projection(x-this.density/2,0-this.density/2,0);
        ctx.moveTo(startpoint.x,startpoint.y);
        for(var y=1; y<this.density; y+=4){
          z = this.elevation[x*this.density+y];
          var p = camera.projection(x-this.density/2,y-this.density/2,0);
          if(z<=0) ctx.lineTo (p.x, p.y); 
          else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for(var x=0; x<this.density; x+=skip){
        z = this.elevation[x];
        ctx.beginPath();
        var startpoint = camera.projection(0-this.density/2,x-this.density/2,0);
        ctx.moveTo(startpoint.x,startpoint.y);
        for(var y=1; y<this.density; y+=skip){
          z = this.elevation[y*this.density+x];
          var p = camera.projection(y-this.density/2,x-this.density/2,0);
          if(z<=0) ctx.lineTo (p.x, p.y); 
          else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
      
      ctx.strokeStyle = "#130"; 
      ctx.lineWidth = 0.5;
      for(var x=0; x<this.density; x+=skip){
        z = this.elevation[x*this.density];
        ctx.beginPath();
        var startpoint = camera.projection(x-this.density/2,0-this.density/2,z);
        ctx.moveTo(startpoint.x,startpoint.y);
        for(var y=1; y<this.density; y+=skip){
          z = this.elevation[x*this.density+y];
          var p = camera.projection(x-this.density/2,y-this.density/2,z);
          ctx.lineTo (p.x, p.y); 
        }
        ctx.stroke();
      }
      for(var x=0; x<this.density; x+=skip){
        z = this.elevation[x];
        ctx.beginPath();
        var startpoint = camera.projection(0-this.density/2,x-this.density/2,z);
        ctx.moveTo(startpoint.x,startpoint.y);
        for(var y=1; y<this.density; y+=skip){
          z = this.elevation[y*this.density+x];
          var p = camera.projection(y-this.density/2,x-this.density/2,z);
          ctx.lineTo (p.x, p.y); 
        }
        ctx.stroke();
      }
      ctx2 = this.canvas.getContext('2d');
      ctx2.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx2.drawImage(this.buffer,0,0);
      this.needsRedraw = false;
    },
    
    getNormals: function(){
      var previousrow = [];
      //  $("#store").html(camera.tau);
      var forx = {init:0, cond:function(x){return x<plot.density;}, step: 1};
      var ymult = -1;
      var angle = 0;
      var alpha = 1.0;
      var lastz = 0;
      for(var x=forx.init; forx.cond(x); x+=forx.step){
        log("Calculating lighting");
        var row = [];
        for(var y=0; y<this.density; y+=1){
          var z = this.elevation[x*this.density-ymult*y];
          if(z<0) z = (this.elevation[x*this.density-ymult*(y+1)]+ this.elevation[x*this.density-ymult*(y-1)]+this.elevation[(x-1)*this.density-ymult*y]+ this.elevation[(x+1)*this.density-ymult*y])/4;
          var p = camera.projection(x-this.density/2,ymult*(this.density/2-y),z);
          row.push( p);
          lastz = z;
        }
        this.normal[x*this.density] = 0;
        for(var i=1; i<previousrow.length; i++){
          var angle0=Math.atan2(3,this.zContrast*(row[i-1].z-row[i].z+previousrow[i-1].z-previousrow[i].z));
          var angle2=Math.atan2(1,this.zContrast*(row[i].z-previousrow[i].z+row[i-1].z-previousrow[i-1].z));
          this.normal[x*this.density+i] = angle0;
          var r,g,b;
          g=Math.round((50*angle0+50*angle2)*0.95)
          r=Math.round(g*0.95);
          b=Math.round(g*0.82);
          if(row[i].z==0 && row[i-1].z==0 && previousrow[i].z==0 && previousrow[i-1].z==0) {
            r=177; g=192; b=216;
          }
          var col = "rgba("+r+","+g+","+b+","+alpha+")";
          this.color[x*this.density+i] = col;
        }
        previousrow = row;
      }
    },
    
    pixelate: function(skip){
      var skip = skip || 1
      var ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //ctx.lineWidth = 1;
      var previousrow = [];
      var forx = {init:0, cond:function(x){return x<plot.density;}, step: skip};
      var ymult = -1;
      var angle = camera.tau/3.14;
      if(angle<0.5 || angle>1.5){
        forx = {init:plot.density-1, cond:function(x){return x>=0;}, step: -skip};
      }
      log("Rendering");
      var alpha = 1.0;
      var lastz = 0;
      for(var x=forx.init; forx.cond(x); x+=forx.step){
        for(var y=0; y<this.density; y+=skip){
          var z = this.elevation[x*this.density-ymult*y];
          var p = camera.projection(x-this.density/2,ymult*(this.density/2-y),z);
          ctx.fillStyle = this.color[x*this.density+y+1];
          ctx.fillRect(p.x,p.y,3*skip,3*skip);
        }
      }
      ctx2 = this.canvas.getContext('2d');
      ctx2.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx2.drawImage(this.buffer,0,0);
      this.needsRedraw = false;
      if(skip==1) log("");

    },
    
    draw:function(skip,lines) {
      skip = skip || 1;
      var ctx = this.ctx;
      ctx.strokeStyle= "#000";
      ctx.lineWidth = 1.0;
      camera.tau = camera.tau%(2*3.1415);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //ctx.lineWidth = 1;
      var previousrow = [];
      //  $("#store").html(camera.tau);
      var r=192,g=192,b=192;
      var forx = {init:0, cond:function(x){return x<plot.density;}, step: skip};
      var ymult = -1;
      var angle = camera.tau/3.14;
      if(angle<0.5 || angle>1.5){
        forx = {init:plot.density-1, cond:function(x){return x>=0;}, step: -skip};
        //ymult = 1;
      }
      //if(angle<0.5 || angle>1.5) ymult = 1;
//      for(var x=0; x<this.density; x+=forx.step){ 
      var alpha = 1.0;
      var lastz = 0;
      for(var x=forx.init; forx.cond(x); x+=forx.step){
        //log("Rendering");
        var row = [];
        for(var y=0; y<this.density; y+=skip){
          var z = this.elevation[x*this.density-ymult*y];
          if(z<0) z = (this.elevation[x*this.density-ymult*(y+1)]+ this.elevation[x*this.density-ymult*(y-1)]+this.elevation[(x-1)*this.density-ymult*y]+ this.elevation[(x+1)*this.density-ymult*y])/4;
          var p = camera.projection(x-this.density/2,ymult*(this.density/2-y),z);
          row.push( p);
          lastz = z;
        }
        for(var i=1; i<previousrow.length; i++){
          log("Rendering");

          var col = this.color[x*this.density+i*skip];//"rgba("+r+","+g+","+b+","+alpha+")";
          ctx.fillStyle = col;
          if(lines) ctx.strokeStyle = "#666";//col;
          else ctx.strokeStyle=col;
          ctx.beginPath();
          ctx.moveTo(previousrow[i].x,previousrow[i].y);
          ctx.lineTo(previousrow[i-1].x,previousrow[i-1].y);
          ctx.lineTo(row[i-1].x,row[i-1].y);
          ctx.lineTo(row[i].x,row[i].y);
          ctx.stroke();
          ctx.fill();
          ctx.closePath();
//          previousrow[i-1]=row[i-1];
        }
//        log("x="+x+" i="+i);
        previousrow = row;
        //alpha += 1/this.density;
      }
      ctx2 = this.canvas.getContext('2d');
      ctx2.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx2.drawImage(this.buffer,0,0);
      this.needsRedraw = false;
      if(skip==1) log("");
    },

    updateElevation:function(callback){
      var self = this;
      callback = callback || function(){};
//      var url = "http://test.rybicki.cc/mangledplain/index.php?/elevation/grid/"+this.bounds.north+"/"+this.bounds.south+"/"+this.bounds.west+"/"+this.bounds.east+"/"+this.density;
      var url = "/elevation.json";
      log("Loading data");
      //log(url);
      $.getJSON(url,function(data){
        log("Loading data");
        self.elevation = data.grid;
        var holes;
        var limit = 10;
        //while(--limit && (holes = self.fixHoles())>0) log("Cleaning data: "+holes);
        self.zContrast = 0.13*self.span;
        self.getNormals();
        //console.log(self.elevation.toString());

        //log("Rendering");
        self.needsRedraw = true;
        //var response = eval(data);
        //log(data);
        callback.call();
      });
    },
    
    fixHoles: function(){
      var totalcount = 0;
      for(var x=1; x<this.density-1; x+=1){
        var row = [];
        for(var y=1; y<this.density-1; y++){
          var z = this.elevation[x*this.density+y];
          if(z<0){
            var sum = 0;
            var count = 0;
            if(this.elevation[x*this.density+(y+1)]>=0) {sum += this.elevation[x*this.density+(y+1)]; count++;}
            if(this.elevation[x*this.density+(y-1)]>=0) {sum += this.elevation[x*this.density+(y-1)]; count++;}
            if(this.elevation[(x+1)*this.density+y]>=0) {sum += this.elevation[(x+1)*this.density+y]; count++;}
            if(this.elevation[(x-1)*this.density+y]>=0) {sum += this.elevation[(x-1)*this.density+y]; count++;}
            if(count>0) this.elevation[x*this.density+y] = sum/count;
            totalcount++;
          }
        }
      }
      return totalcount;
    },

    zoomIn: function(){
      var n = this.bounds.north;
      var s = this.bounds.south;
      var ns = (n-s)/3;
      var w = this.bounds.west;
      var e = this.bounds.east;
      var we = (e-w)/3;
      this.setBounds({north:n-ns,east:w+we,south:s+ns,west:e-we});
      this.updateElevation();
//      this.needsRedraw = true;
    },
    
    init:function() {
      this.buffer = document.createElement('canvas');
      this.buffer.width = 800;
      this.buffer.height = 600;
      this.canvas = document.getElementById("canvas");
      this.ctx = this.buffer.getContext("2d");
      
      $(window).resize(fixSize);
      fixSize();
      for(var x=0; x<this.density; x++){
        for(var y=0; y<this.density; y++){
          this.elevation.push(Math.sin(5*x/this.density)*Math.cos(5*y/this.density));
        }
      }
      setInterval("plot.animate()",100);
      //this.draw();
      //log(this.elevation);
      var down = function(event){
        e = event.originalEvent;
        mouse.button = true;
        mouse.dx = 0;
        mouse.dy = 0;
        mouse.x = e.touches?e.touches[0].pageX:e.pageX; 
        mouse.y = e.touches?e.touches[0].pageY:e.pageY;
        return false;
      }
      var up = function(event){
        e = event.originalEvent;
        mouse.button = false;
        ui.animating = false;
        plot.needsRedraw = true;
        mouse.x = e.touches?e.touches[0].pageX:e.pageX; 
        mouse.y = e.touches?e.touches[0].pageY:e.pageY;
        return false;
      }
      $("canvas").mousedown(down).bind("touchstart",down);
      $("canvas").mouseup(up).bind("touchend",up);
      var move=function(event){
        e = event.originalEvent;
        if(mouse.button && Math.sqrt(mouse.dx*mouse.dx+mouse.dy*mouse.dy)>3){                         ui.animating = true;
          plot.needsRedraw = true;
          dx = mouse.x-(e.touches?e.touches[0].pageX:e.pageX);
          dy = mouse.y-(e.touches?e.touches[0].pageY:e.pageY);
          camera.tau -= 0.01*dx;
          camera.phi -= 0.01*dy;
          if(camera.tau<0) camera.tau+=6.28;
          if(camera.tau>6.28) camera.tau-=6.28;         

          if(camera.phi<0) camera.phi = 0;
          if(camera.phi>3.14/2) camera.phi = 3.14/2;
          plot.needsRedraw = true;
        }
        mouse.dx = (e.touches?e.touches[0].pageX:e.pageX)-mouse.x;
        mouse.dy = (e.touches?e.touches[0].pageY:e.pageY)-mouse.y;
        mouse.x = e.touches?e.touches[0].pageX:e.pageX; 
        mouse.y = e.touches?e.touches[0].pageY:e.pageY;
        //log(e.touches.length);
        return false;
      }
      $("canvas").mousemove(move).bind("touchmove",move);
    }
  }
  

var map = false;

var timer = false;
var elevationService = false;

var global_i;

function getElevation(){
  var bounds = map.getBounds();
  var north = bounds.getNorthEast().lng();
  var east = bounds.getNorthEast().lat();
  var south = bounds.getSouthWest().lng();
  var west = bounds.getSouthWest().lat();
  //log("NE"+north+":"+east+" SW"+south+":"+west);
  
  var swipe = east;
  var latstep = (west-east)/plot.density;
  var lngstep = (north-south)/plot.density;
  //log("NE"+latstep+" SW"+lngstep);
  // prepare locations;
  global_i=0;
  for(var x=0; x<plot.density; x++){
    var path=[];
    for(var y=0; y<plot.density; y++){
      path.push(new google.maps.LatLng(west-y*latstep, north-x*lngstep));
    }
    var xx = x*plot.density;
    //log(xx);
    
    var updateRow = function(results, status){
      if (status == google.maps.ElevationStatus.OK) {
        for(var i in results){
          if(results[i].elevation<0) results[i].elevation = 0;
          plot.elevation[global_i]=results[i].elevation/1000;
          //log(results[i].elevation/1000);
          global_i++
        }
        }
      plot.needsRedraw = true;
    
    }
    elevationService.getElevationAlongPath({path:path, samples:plot.density}, updateRow);
  }
  
}

function syncPlot(){
  var bounds = map.getBounds();
  plot.setBounds({north:bounds.getNorthEast().lng(),
    east:bounds.getNorthEast().lat(),
    south:bounds.getSouthWest().lng(),
    west:bounds.getSouthWest().lat()});
  var zoom = map.getZoom();
  //console.log(north+":"+east+":"+south+":"+west);
  //plot.zContrast = (zoom-5)*(zoom-5)*0.2+1;
  plot.busy = true;
  plot.needsRedraw = true;
  plot.updateElevation(function(){
    plot.zContrast = 0.2*plot.span;
    plot.busy=false;
    log("Rendering...");
//    plot.needsRedraw = true;
  });
}
  
function init_map() {
  var datacenter = new google.maps.LatLng(38.78911053666265,138.96672624206545);
  var myOptions = {
    zoom: 5,
    center: datacenter,
     // disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.TERRAIN
    };
  map = new google.maps.Map(document.getElementById("gmap"), myOptions);
  //  setTimeout("getElevation()",1000);
  //  setTimeout("getElevation()",2000);
}

    