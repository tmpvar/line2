if (typeof require !== 'undefined') {
  var Vec2 = require('vec2');
  var segseg = require('segseg');
}

var isArray = function (a) {
  return Object.prototype.toString.call(a) === "[object Array]";
};

var defined = function(a) {
  return typeof a !== 'undefined';
};

var definedOr = function(a, defaultValue) {
  return defined(a) ? a : defaultValue;
};

var finite = function(a) {
  return a !== Infinity && a !== -Infinity;
};

function Line2(slope, yintercept, x2, y2) {

  if (!(this instanceof Line2)) {
    return new Line2(slope, yintercept, x2, y2);
  }

  if (defined(x2) && defined(y2)) {
    return Line2.fromPoints(slope, yintercept, x2, y2);

  } else {
    if (defined(slope)) {
      this.slope(slope);
    }

    if (defined(yintercept)) {
      this.yintercept(yintercept);
    }
  }
}

Line2.prototype.yintercept = function(val) {

  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._yintercept = val;
  }
  return definedOr(this._yintercept, null);
}

Line2.prototype.xintercept = function(val) {

  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._xintercept = val;
  }
  return definedOr(this._xintercept, null);
}

Line2.prototype.slope = function(val) {
  if (defined(val)) {
    if (finite(val)) {
      val = Vec2.clean(val);
    }

    this._slope = val;
  }
  return definedOr(this._slope, null);
};

Line2.prototype.intersectSegment = function(x1, y1, x2, y2) {

  var dx = x2 - x1;
  var dy = y2 - y1;
  var lx1, ly1, lx2, ly2;
  var horizontal = this.isHorizontal();
  var vertical = this.isVertical();

  // vertical
  if (dx === 0) {
    if (vertical) {
      return x1 === this.xintercept();
    }

  // horizontal
  } else if (dy === 0) {
    // parallel
    if (horizontal) {
      return y1 === this.yintercept();
    }

  // diagonal
  } else {
    if (dy/dx === this.slope()) {
      return y1 === this.slope() * x1 + this.yintercept()
    }
  }

  if (x1 > x2) {
    lx1 = x2-10;
    lx2 = x1+10;
  } else {
    lx1 = x1-10;
    lx2 = x2+10;
  }

  var isect;
  if (this.isHorizontal()) {
    y = this.yintercept();
    isect = segseg(lx1, y, lx2, y, x1, y1, x2, y2);
  } else if (this.isVertical()) {
    if (y1 > y2) {
      ly1 = y2-10;
      ly2 = y1+10;
    } else {
      ly1 = y1-10;
      ly2 = y2+10;
    }
    var x = this.xintercept();

    isect = segseg(x, ly1, x, ly2, x1, y1, x2, y2);
  } else {
    ly1 = this.slope() * lx1 + this.yintercept();
    ly2 = this.slope() * lx2 + this.yintercept();
    isect = segseg(lx1, ly1, lx2, ly2, x1, y1, x2, y2);
  }

  if (isect && isect !== true) {
    return Vec2.fromArray(isect);
  }

  return isect;
};

Line2.prototype.createPerpendicular = function(vec) {
  if (this.isVertical()) {
    return new Line2(0, vec.y);
  } else if (this.isHorizontal()) {
    var l = new Line2();
    l.xintercept(vec.x);
    l.slope(Infinity);
    return l;
  } else {
    var perpSlope = -1/this.slope();
    return new Line2(perpSlope, vec.y - perpSlope * vec.x);
  }
};

Line2.prototype.intersectCircle = function(vec, radius) {

  var closest = this.closestPointTo(vec);
  var l2 = closest.subtract(vec, true).lengthSquared();
  var r2 = radius*radius;

  if (l2 > r2) {
    return [];
  } else if (l2 < r2) {
    var v1, v2, equal = closest.equal(vec);

    if (equal && this.isHorizontal()) {
      v1 = vec.add(new Vec2(radius, 0), true);
      v2 = vec.add(new Vec2(-radius, 0), true);
    } else if (equal && this.isVertical()) {
      v1 = vec.add(new Vec2(0, radius), true);
      v2 = vec.add(new Vec2(0, -radius), true);
    } else {

      // TODO: what happens when y-intercept is null?
      var x0 = 0;
      var y0 = this.yintercept();

      // TODO: use lines relative to the circle
      var x1 = -5000;
      var y1 = this.solveForY(x1);
      var x2 = 5000;
      var y2 = this.solveForY(x2);
      var r = radius;

      var dx = x2 - x1;
      var dy = y2 - y1;
      var dr = Math.sqrt(dx*dx + dy*dy);

      var D = x1*y2 - x2*y1;
      var sgn = (dy < 0) ? -1 : 1;

      var discriminant = Math.sqrt(r*r * dr * dr - D*D);
      v1 = new Vec2(
        (D * dy + (-dx) * discriminant) / (dr * dr),
        (-D * dx - Math.abs(dy) * discriminant) / (dr * dr)
      );

      v2 = Vec2(
        (D * dy - (-dx) * discriminant) / (dr * dr),
        (-D * dx + Math.abs(dy) * discriminant) / (dr * dr)
      );
    }

    return [v1, v2];
  } else if (r2 === l2) {
    return [closest];
  }
};

/*Line2.prototype.intersectCircle = function(vec, radius) {

  var closest = this.closestPointTo(vec);
  var l2 = closest.subtract(vec, true).lengthSquared();
  var r2 = radius*radius;

  if (l2 > r2) {
    return [];
  }

  if (l2 < r2) {
    var v1, v2, equal = closest.equal(vec);

    if (equal && this.isHorizontal()) {
      v1 = vec.add(new Vec2(radius, 0), true);
      v2 = vec.add(new Vec2(-radius, 0), true);
    } else if (equal && this.isVertical()) {
      v1 = vec.add(new Vec2(0, radius), true);
      v2 = vec.add(new Vec2(0, -radius), true);
    } else {

      / *
        o line:   y = mx + b
        o circle: (x - h)^2 + (y - k)^2 = r^2
          (x - h)^2 + (mx + b - k)^2 = r^2
        o solve for knowns
          B = b-k;
        o expand
          (x - h)*(x - h) + (mx + B)*(mx + B) = r^2
        o foil
          (x^2 - xh - xh + h^2) + (2mx^2 + mxB + mxB + B^2) = r^2
        o reduce
          (x^2 - 2xh + h^2) + (2mx^2 + 2mxB + B^2) = r^2
        o reduce
          (- 2xh + h^2) + (2mxB + B^2) = r^2
        o final
          x^2(2m + 2) + x(-2h+2mB) + (h^2 + B^2 - r^2)

           (      a      )        (   b   )      (     c           )
                  |                   |                |
                   \_________________/________________/
                           |
        what we care about ^

        x^2(2 * 1) + x(-2 * 50 + 2 * 1 * -50) + (50*50 + -50*50 - 10*10)

      * /
      var m = this.slope();
      var yi = this.yintercept();

      var h = vec.x;
      var k = vec.y;

      var B = yi-k;

      var a = m*B+1;
      // var b = -2*h + 2*B*m;
      // var c = (B*B) + (h*h) - r*r;

      //var a = (2 * m * b) + 2;
      var b = (-2 * h) + (2 * m * B);
      var c = (h*h) + (B*B) - r2;

console.log('c(%d)=%d*%d + %d*%d - %d', c, h, h, B, B, r2);
console.log('SQRT', b*b - 4*a*c, 'b*b', b*b, '-', 4*a*c);
      var det = Math.sqrt(b*b - 4*a*c);
      var den = 2*a;
console.log(a,b,c);
      var x = (-b + det) / den;
      var x2 = (-b - det) / den;

      v1 = Vec2(x, this.solveForY(x));
      v2 = Vec2(x2, this.solveForY(x2));
    }

    return [v1, v2];

  // tangent
  } else if (l2 === r2) {
    return [closest];
  }
};*/

var det = function(x1, y1, x2, y2) {
  return x1*y2 - y1*x2;
};

Line2.prototype.solveForX = function(y) {
  if (this.isVertical()) {
    return this.xintercept();
  } else {
    return (y - this.yintercept()) / this.slope();
  }
};

Line2.prototype.solveForY = function(x) {
  if (this.isHorizontal()) {
    return this.yintercept();
  } else {
    return this.slope() * x + this.yintercept();
  }
};

Line2.prototype.intersect = function(line, y1, x2, y2) {

  if ((defined(y1) && defined(y2)) || defined(line.end)) {
    return this.intersectSegment(line, y1, x2, y2);
  }

  var s1 = this.slope();
  var s2 = line.slope();

  // Parallel lines
  if (s1 === s2) {
    return (this.yintercept() === line.yintercept() &&
            this.xintercept() === line.xintercept());
  }

  if (finite(s1) && finite(s2)) {

    var x1 = line.solveForX(-1);
    var y1 = line.solveForY(x1);
    var x2 = line.solveForX(1);
    var y2 = line.solveForY(x2);

    var x3 = this.solveForX(-1);
    var y3 = this.solveForY(x3);
    var x4 = this.solveForX(1);
    var y4 = this.solveForY(x4);

    var a = det(x1, y1, x2, y2);
    var b = det(x3, y3, x4, y4);

    var xnum = det(a, x1 - x2, b, x3 - x4);
    var ynum = det(a, y1 - y2, b, y3 - y4);

    var den = det(
      x1 - x2, y1 - y2,
      x3 - x4, y3 - y4
    );

    return Vec2(xnum/den, ynum/den);
  } else {
    var slope, yi, x = this.xintercept() || line.xintercept();
    if (!finite(s1)) {
      slope = s2;
      yi = line.yintercept();
    } else {
      slope = s1;
      yi = this.yintercept();
    }

    // Diagonal line
    if (slope !== 0) {
      return Vec2(x, x*slope + yi);

    // Horizonal line
    } else {
      return Vec2(x, yi);
    }
  }
};

Line2.fromPoints = function(x1, y1, x2, y2) {

  if (isArray(y1)) {
    y2 = y1[1];
    x2 = y1[0];
  } else if (defined(y1) && defined(y1.x) && defined(y1.y)) {
    y2 = y1.y;
    x2 = y1.x;
  }

  if (isArray(x1)) {
    y1 = x1[1];
    x1 = x1[0];
  } else if (defined(x1) && defined(x1.x) && defined(x1.y)) {
    y1 = x1.y;
    x1 = x1.x;
  }

  var line = new Line2();
  var slope = (y2 - y1) / (x2 - x1);
  line.slope(slope);

  if (line.isHorizontal()) {
    line.yintercept(y1);
  } else if (line.isVertical()) {
    line.xintercept(x2);
  } else {
    line.yintercept(y1 - slope * x1);
  }

  return line;
};

Line2.prototype.isHorizontal = function() {
  return !this.slope();
};

Line2.prototype.isVertical = function() {
  return !finite(this.slope());
};

Line2.prototype.closestPointTo = function(vec) {
  var yi = this.yintercept();
  var xi = this.xintercept();
  var s = this.slope();

  if (this.isHorizontal()) {
    return Vec2(vec.x, yi);
  } else if (this.isVertical()) {
    return Vec2(xi, vec.y);
  } else {
    return this.intersect(this.createPerpendicular(vec));
  }
};

Line2.prototype.containsPoint = function(vec, y) {
  var x = vec;
  if (!defined(y)) {
    y = vec.y;
    x = vec.x;
  }

  if (this.isHorizontal()) {
    return y === this.yintercept();
  } else if (this.isVertical()) {
    return x === this.xintercept();
  } else {
    return y === this.slope() * x + this.yintercept();
  }
};


if (typeof module !== "undefined" && typeof module.exports == "object") {
  module.exports = Line2;
}

if (typeof window !== "undefined") {
  window.line2 = window.line2 || line2;
}