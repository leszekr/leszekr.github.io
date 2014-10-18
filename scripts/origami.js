/* 
  Origami.js
  Raphael-based 3D library
	http://nadsumatal.github.com

  License: MIT

*/


Camera = function(viewport) {
    this.d = viewport.z;
    this.c = {
        x: 0,
        y: 0,
        z: -20
    };
    this.cull = true;

    this.setAngles = function(rX, rY) {
        this.rX = rX;
        this.rY = rY;
        this._sX = Math.sin(rX);
        this._cX = Math.cos(rX);
        this._sY = Math.sin(rY);
        this._cY = Math.cos(rY);
    }
    this.rotationX = function(v) {
        return {
            x: v.x,
            y: v.y * this._cX - v.z * this._sX,
            z: v.y * this._sX + v.z * this._cX
        };
    }
    this.rotationY = function(v) {
        return {
            x: v.x * this._cY + v.z * this._sY,
            y: v.y,
            z: -v.x * this._sY + v.z * this._cY
        };
    }
    this.antiRotationX = function(v) {
        return {
            x: v.x,
            y: v.y * this._cX + v.z * this._sX,
            z: -v.y * this._sX + v.z * this._cX
        };
    }
    this.antiRotationY = function(v) {
        return {
            x: v.x * this._cY - v.z * this._sY,
            y: v.y,
            z: v.x * this._sY + v.z * this._cY
        };
    }
    this.translation = function(v) {
        return {
            x: v.x - this.c.x,
            y: v.y - this.c.y,
            z: v.z - this.c.z
        };
    }
    this.projection = function(v0) {

        var v = this.translation(this.rotationY(this.rotationX(v0)))
        var d = this.d;
        return {
            x: (v.x) * (d / (v.z + d)),
            y: (v.y) * (d / (v.z + d)),
            z: v.z
        };
    }
    this.distance = function(v0) {
        var v = this.rotationY(this.rotationX(this.translation(v0)))
        return v.z;
    }

    this.setAngles(0, 0);
    return this;
}


Origami = function(domobjid, width, height) {
    this.paper = Raphael(domobjid, width, height).setViewBox(-width / 2, -height / 2, width, height);
    var origami = this;
    this.faces = [];

    Point = function(coords) {
        this.x = coords.x;
        this.y = coords.y;
        this.z = coords.z;
        this.__sentinel = coords.__sentinel;
        this._p = false;
    }

    Point.prototype.projection = function() {
        if (!this._p) this._p = origami.camera.projection(this);
        return this._p;
    }

    Point.prototype.update = function() {
        this._p = false;
        return this;
    }

    function xprod(v1, v2, v3) {
        var u = {
            x: v2.x - v3.x,
            y: v2.y - v3.y,
            z: v2.z - v3.z
        };
        var v = {
            x: v1.x - v3.x,
            y: v1.y - v3.y,
            z: v1.z - v3.z
        };
        return {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };
    }

    Triangle = function(a, b, c, hue, normal) {
        this.a = a;
        this.b = b;
        this.c = c;
        var A = b.x - a.x,
            B = b.y - a.y,
            C = c.x - a.x,
            D = c.y - a.y,
            E = A * (a.x + b.x) + B * (a.y + b.y),
            F = C * (a.x + c.x) + D * (a.y + c.y),
            G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
            minx, miny, minz, dx, dy, dz

        /* If the points of the triangle are collinear, then just find the
         * extremes and use the midpoint as the center of the circumcircle. */
        if (Math.abs(G) < 0.000001) {
            minx = Math.min(a.x, b.x, c.x)
            miny = Math.min(a.y, b.y, c.y)
            minz = Math.min(a.z, b.z, c.z)
            dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5
            dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5
            dz = (Math.max(a.y, b.y, c.y) - miny) * 0.5

            this.x = minx + dx
            this.y = miny + dy
            this.z = minz + dz
            this.r = dx * dx + dy * dy + dz * dz
        } else {
            this.x = (D * E - B * F) / G
            this.y = (A * F - C * E) / G
            dx = this.x - a.x
            dy = this.y - a.y
            this.r = dx * dx + dy * dy
        }

        this.hue = hue || Math.round(Math.abs(0.5 * a.x + 0.5 * a.y)) % 360 //220
        this.center = {
            x: (a.x + b.x + c.x) / 3,
            y: (a.y + b.y + c.y) / 3,
            z: (a.z + b.z + c.z) / 3
        };
        this.normal = normal || this._normal();

    }

    Triangle.prototype._normal = function() {
        var v = xprod(this.a, this.b, this.c)
        var sum = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return {
            x: v.x / sum,
            y: v.y / sum,
            z: v.z / sum
        };
        //	return normalize(xprod(this.a,this.b,this.c));
    }

    this.drawTriangle = function(t, camera) {
        var p1 = camera.projection(t.a);
        var p2 = camera.projection(t.b);
        var p3 = camera.projection(t.c);
        if (t.path) t.path.remove();
        if (origami.camera.cull && xprod(p1, p2, p3).z < 0) return false;
        var newpath = "M" + p1.x + "," + p1.y + "L" + p2.x + "," + p2.y + "L" + p3.x + "," + p3.y + "Z";

        if (newpath)
            var z = Math.abs(origami.camera.rotationY(origami.camera.rotationX(t.normal)).z);
        //  var z = Math.abs(t.normal.z);
        //      var z = Math.abs(camera.rotationY(camera.rotationX(this.normal)).z);
        //var color = "rgba("+z+","+z+","+z+",1)";
        var color = Raphael.hsl(t.hue, 40, 80 * z);
        //    var color = colorCache[Math.round(100*z)];

        //	var color = Raphael.hsl(this.hue,30,100*z);
        t.path = origami.paper.path(newpath).attr({
            fill: color,
            stroke: color
        });
        //	}
    }

    this.render = function(camera) {
        var facesinorder = this.faces.sort(function(a, b) {
            return camera.distance(b.center) - camera.distance(a.center);
        })
        for (var i in facesinorder) {
            var t = facesinorder[i];
            if (t.a) t.a.update();
            if (t.b) t.b.update();
            if (t.c) t.c.update();
        }
        for (var i in facesinorder) {
            var t = facesinorder[i];
            this.drawTriangle(t, camera);
        }
    }

    Origami.prototype.face = function(p1, p2, p3, hue) {
        var f = new Triangle(new Point(p1), new Point(p2), new Point(p3));
        f.hue = hue || 50;
        this.faces.push(f);
        return f
    }

    this.camera = new Camera({
        x: width,
        y: height,
        z: 400
    });



}