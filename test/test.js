if (typeof require !== "undefined") {
  var Line2 = require("../line2.js");
  var Vec2 = require("vec2");
}

var ok = function(a, msg) { if (!a) throw new Error(msg || "not ok"); };

describe('line2', function() {
  describe('#ctor', function() {
    it('accepts slope/yintercept', function() {
      var l = new Line2(1, 0);
      ok(l.slope() === 1);
      ok(l.yintercept() === 0);
    });

    it('accepts 4 points', function() {
      var l = new Line2(0, 0, 10, 10);
      ok(l.slope() === 1);
      ok(l.yintercept() === 0);
    });
  });

  describe('#change', function() {
    it('returns the callback', function() {
      var l = new Line2();
      var fn = function() {};
      ok(l.change(fn) === fn);
    });

    it('should notify the caller', function() {
      var l = new Line2(0, 0, 100, 100);
      var count = 0;

      l.change(function(line) {
        ok(line === l);
        count++;
      });

      l.slope(1/4);
      l.yintercept(5);
      l.xintercept(1);

      ok(count === 3);
    });
  });

  describe('#ignore', function() {
    it('removes the passed listener', function() {
      var l = new Line2();
      var count = 0;
      var fn = l.change(function() { count++; });
      var fn2 = l.change(function() { count++; });

      l.ignore(fn);
      l.slope(1.2);

      ok(count === 1);
    });

    it('removes all listeners if no callback is specified', function() {
      var l = new Line2();
      var count = 0;
      var fn = l.change(function() { count++; });
      var fn2 = l.change(function() { count++; });

      l.ignore();
      l.slope(1.2);

      ok(count === 0);
    });
  });

  describe('#notify', function() {
    it('calls all of the registered listeners', function() {
      var l = new Line2();
      var count = '';
      var fn = l.change(function(line) {
        ok(line === l);
        count += 'f';
      });
      var fn2 = l.change(function(line) {
        ok(line === l);
        count += 'l';
      });

      l.notify();
      ok(count === 'fl');
    });
  });

  describe('#yintercept', function() {
    it('acts as a getter', function() {
      var l = new Line2(0, 2, 100, 100);
      ok(l.yintercept() === 2);
    });

    it('acts as a setter', function() {
      var l = new Line2(0, 2, 100, 100);
      l.yintercept(4);
      ok(l.yintercept() === 4);
    });

    it('acts as a setter and updates xintercept', function() {
      var l = new Line2(0, 2, 20, 22);
      l.yintercept(4);
      ok(l.yintercept() === 4);
      ok(l.xintercept() === -4);
    });

    it('acts as a setter and updates xintercept (horizontal)', function() {
      var l = new Line2(0, 100, 100, 100);
      l.yintercept(4);
      ok(l.yintercept() === 4);
      ok(l.xintercept() === null);
    });

    it('does not notify when set to the same value', function() {
      var l = new Line2(0, 100, 100, 100);
      var c = 0;
      l.change(function() { c++; });

      l.yintercept(100);
      ok(l.yintercept() === 100);
      ok(c === 0);
    });
  });

  describe('#slope', function() {
    it('updates the x-intercept', function() {
      var l = new Line2(1, 10);
      ok(l.xintercept() === -10);
      l.slope(-1);
      ok(l.xintercept() === 10);
    });

    it('does not update the x-intercept (horizontal)', function() {
      var l = new Line2(1, 10);
      l.slope(0);
      ok(l.xintercept() === null);
    });

    it('does not notify if changed to the same value', function() {
      var l = new Line2(1, 10);
      var c = 0;
      l.change(function() { c++; });

      l.slope(1);

      ok(c === 0);
    });

  });


  describe('#xintercept', function() {
    it('acts as a getter', function() {
      var l = new Line2(0, 2, 20, 22);
      ok(l.xintercept() === -2);
    });

    it('acts as a setter', function() {
      var l = new Line2(0, 2, 20, 22);
      l.xintercept(4);
      ok(l.xintercept() === 4);
    });

    it('acts as a setter and updates yintercept', function() {
      var l = new Line2(3, 5);

      l.xintercept(2);

      ok(l.yintercept() === -6);
      ok(l.xintercept() === 2);
    });

    it('acts as a setter and updates yintercept', function() {
      var l = new Line2(0, 2, 20, 22);

      l.xintercept(4);

      ok(l.yintercept() === -4);
      ok(l.xintercept() === 4);
    });

    it('acts as a setter and updates xintercept (vertical)', function() {
      var l = new Line2(100, 0, 100, 100);
      l.xintercept(4);
      ok(l.xintercept() === 4);
      ok(l.yintercept() === null);
    });

    it('does not notify when set to the same value', function() {
      var l = new Line2(0, 0, 100, 100);
      var c = 0;
      l.change(function() { c++; });

      l.xintercept(0);

      ok(l.xintercept() === 0);
      ok(c === 0);
    });
  });



  describe('#fromPoints', function() {
    it('computes the slope and yintercept', function() {
      [
        Line2.fromPoints([1, 1], [10, 10]),
        Line2.fromPoints(Vec2(1, 1), Vec2(10, 10)),
        Line2.fromPoints(1, 1, 10, 10),
      ].forEach(function(line) {
        ok(line.slope() === 1);
        ok(line.yintercept() === 0);
      });
    });

    it('computes the slope and yintercept (vertical)', function() {
      var l = Line2.fromPoints(100, 0, 100, 100);
      ok(l.slope() === Infinity);
      ok(l.xintercept() === 100);
      ok(l.isVertical());
      ok(!l.isHorizontal());
    });

    it('computes the slope and yintercept (horizontal)', function() {
      var l = Line2.fromPoints(0, 100, 100, 100);
      ok(l.slope() === 0);
      ok(l.yintercept() === 100);
      ok(!l.isVertical());
      ok(l.isHorizontal());
    });

    it('computes the slope and yintercept (diagonal)', function() {
      var l = Line2.fromPoints(2, 8, 20, 80);
      ok(l.slope() === 4);
      ok(l.yintercept() === 0);
      ok(!l.isVertical());
      ok(!l.isHorizontal());
    });

    it('computes the slope and yintercept (diagonal)', function() {
      var l = Line2.fromPoints(8, 2, 80, 20);
      ok(l.slope() === 0.25);
      ok(l.yintercept() === 0);
      ok(!l.isVertical());
      ok(!l.isHorizontal());
    });

    it('computes the slope and yintercept (diagonal)', function() {
      var l = Line2.fromPoints(2, 0, 20, 18);
      ok(l.slope() === 1);
      ok(l.yintercept() === -2);
      ok(!l.isVertical());
      ok(!l.isHorizontal());
    });
  });

  describe('#closestPointTo', function() {
    it('finds the closest point to this line (horizontal)', function() {
      var l = Line2.fromPoints(0, 0, 100, 0);
      ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(10, 0)));
    });

    it('finds the closest point to this line (vertical)', function() {
      var l = Line2.fromPoints(100, 0, 100, 100);
      ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(100, 10)));
    });

    it('finds the closest point to this line (diagonal)', function() {
      var l = Line2.fromPoints(0, 0, 100, 100);
      ok(l.closestPointTo(Vec2(25, 75)).equal(Vec2(50, 50)));
    });

    it('finds the closest point to this line (diagonal)', function() {
      var l = Line2(80, 0, 100, 100);
      var r = l.closestPointTo(Vec2(99, 50));
      ok(r.equal(90.34615385000001, 51.73076923));
    });

  });

  describe('#intersect', function() {
    it('computes the intersection of normal lines', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(0, 10, 10, 0);

      var v = l1.intersect(l2);
      ok(v.equal(5, 5));
    });

    it('returns false when lines are parallel', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(0, 5, 5, 10);

      ok(!l1.intersect(l2));
    });

    it('returns true when lines are collinear', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 10);
      var l2 = Line2.fromPoints(5, 5, 9, 9);
      ok(l1.intersect(l2) === true);
    });

    it('finds the intersection of perpendicular lines (vertical-vertical)', function() {
      var l1 = Line2.fromPoints(0, 0, 10, 0);
      var l2 = Line2.fromPoints(5, 10, 5, 0);

      ok(l1.intersect(l2).equal(5, 0));
      ok(l2.intersect(l1).equal(5, 0));
    });

    it('finds intersection of lines (horizontal - diagonal)', function() {
      var l1 = Line2.fromPoints(-100, -110, -101, -110);
      var l2 = Line2.fromPoints(92.92893219, -107.07106781, 92.22182541, -106.36396103);

      ok(l1.intersect(l2).equal(95.85786438, -110));
    });

    it('finds intersection of lines (horizontal - diagonal)', function() {
      var l2 = Line2.fromPoints(-100, -110, -101, -110);
      var l1 = Line2.fromPoints(92.92893219, -107.07106781, 92.22182541, -106.36396103);
      console.log(l1.intersect(l2));
      ok(l1.intersect(l2).equal(95.85786438, -110));
    });

    it('finds the intersection of lines (vertial-diagonal)', function() {
      var l1 = Line2.fromPoints(0, 0, 55, 25);
      var l2 = Line2.fromPoints(30, 30, 30, 0);
      ok(l1.intersect(l2).equal(30, 13.6363635));
      ok(l2.intersect(l1).equal(30, 13.6363635));
    });

    it('returns a vec2 when intersected with a segment (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(5, 5, 5, -5).equal(5, 0));
    });

    it('returns a vec2 when intersected with a segment (horizontal - diagonal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(50, 10, 30, -10).equal(40, 0));
    });

    it('returns false when no intersection (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(!l1.intersect(5, 5, 5, 1));
    });

    it('returns true when colinear (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 0, 5, 0) === true);
    });

    it('returns false when parallel (horizontal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 5, 5, 5) === false);
    });

    it('returns true when colinear (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(100, 10, 100, 50) === true);
    });

    it('returns vec2 when intersection (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(50, 50, 200, 50).equal(100, 50));
    });

    it('returns false when parallel (vertical)', function() {
      var l1 = Line2(100, 0, 100, 100);
      ok(l1.intersect(5, 0, 5, 5) === false);
    });

    it('returns a vec2 when intersected with a segment (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(l1.intersect(25, 75, 75, 25).equal(50, 50));
    });

    it('returns false when no intersection (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(!l1.intersect(25, 75, 30, 75));
    });

    it('returns true when colinear (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 0);
      ok(l1.intersect(0, 0, 5, 0) === true);
    });

    it('returns false when parallel (diagonal)', function() {
      var l1 = Line2(0, 0, 100, 100);
      ok(l1.intersect(0, 5, 5, 10) === false);
    });
  });

  describe('#isHorizontal', function() {
    it('true if horizontal', function() {
      var l = Line2.fromPoints(0, 0, 100, 0);
      ok(l.isHorizontal());
    });
    it('false if not horizontal', function() {
      var l = Line2.fromPoints(0, 0, 100, 10);
      ok(!l.isHorizontal());
    });
  });

  describe('#isVertical', function() {
    it('true if vertical', function() {
      var l = Line2.fromPoints(100, 0, 100, 100);
      ok(l.isVertical());
    });
    it('false if not vertical', function() {
      var l = Line2.fromPoints(10, 0, 100, 10);
      ok(!l.isVertical());
    });
  });

  describe('#containsPoint', function() {
    it('may take an x,y', function() {
      var l = Line2(0, 0, 10, 0);
      ok(!l.containsPoint(5, 1));
      ok(l.containsPoint(5, 0));
    });

    it('returns false when not contained (horizontal)', function() {
      var l = Line2(0, 0, 10, 0);
      ok(!l.containsPoint(Vec2(5, 1)));
    });

    it('returns true when contained (horizontal)', function() {
      var l = Line2(0, 0, 10, 0);
      ok(l.containsPoint(Vec2(5, 0)));
    });

    it('returns false when not contained (vertical)', function() {
      var l = Line2(10, 0, 10, 10);
      ok(!l.containsPoint(Vec2(5, 1)));
    });

    it('returns true when contained (vertical)', function() {
      var l = Line2(10, 0, 10, 10);
      ok(l.containsPoint(Vec2(10, 5)));
    });

    it('returns true when contained (diagonal)', function() {
      var l = Line2(0, 0, 10, 10);
      ok(l.containsPoint(Vec2(5, 5)));
    });

    it('returns false when not contained (diagonal)', function() {
      var l = Line2(0, 0, 10, 10);
      ok(!l.containsPoint(Vec2(5, 2)));
    });
  });

  describe('#createPerpendicular', function() {
    it('should return a perpendicular line', function() {
      var l = Line2(0, 0, 10, 10);
      var l2 = l.createPerpendicular(Vec2(5,5));
      ok(l2.yintercept() === 10);
      ok(l2.slope() === -1);
    });

    it('should return a perpendicular line (vertical)', function() {
      var l = Line2(10, 0, 10, 10);
      var l2 = l.createPerpendicular(Vec2(10,5));

      ok(l2.yintercept() === 5);
      ok(l2.slope() === 0);
    });

    it('should return a perpendicular line (horizontal)', function() {
      var l = Line2(0, 10, 10, 10);
      var l2 = l.createPerpendicular(Vec2(5, 10));

      ok(l2.xintercept() === 5);
      ok(l2.slope() === Infinity);
    });
  });

  describe('#intersectCircle', function() {
    it('should work from origin', function() {
      var l = new Line2(2, 2);

      var r = l.intersectCircle(Vec2(0, 0), 10);
      ok(r.length === 2);
      r.sort(function(a, b) {
        return a.y > b.y ? -1 : 1;
      });

      ok(r[0].equal(3.65421149, 9.30842298));
      ok(r[1].equal(-5.25421149, -8.50842298));
    });

    it('returns an array of vec2s at intersection point (vertical on line)', function() {
      var l = Line2(100, 0, 100, 100);
      var r = l.intersectCircle(Vec2(100, 50), 55);
      ok(r.length === 2);
      r.sort(function(a, b) {
        return a.y > b.y ? -1 : 1;
      });

      ok(r[0].equal(100, 105));
      ok(r[1].equal(100, -5));
    });

    it('returns an array of vec2s at intersection point (vertical on circle center)', function() {
      var l = Line2(100, 0, 100, 100);
      var r = l.intersectCircle(Vec2(100, 50), 100);

      ok(r.length === 2);
      r.sort(function(a, b) {
        return a.y > b.y ? -1 : 1;
      });

      ok(r[0].equal(100, 150));
      ok(r[1].equal(100, -50));
    });

    it('returns a single item array when tangent', function() {
      var l = Line2(0, 100, 100, 100);
      var r = l.intersectCircle(Vec2(50, 50), 50);

      ok(r.length === 1);
      ok(r[0].equal(50, 100));
    });

    it('returns an array of vec2s at intersection point (horizontal)', function() {
      var l = Line2(0, 0, 100, 0);
      var r = l.intersectCircle(Vec2(50, 50), 55);

      ok(r.length === 2);
      ok(r[0].equal(72.91287847, 0));
      ok(r[1].equal(27.08712153, 0));
    });

    it('returns an array of vec2s at intersection point (diagonal)', function() {
      var l = Line2(0, 0, 100, 100);
      var r = l.intersectCircle(Vec2(50, 50), 10);

      ok(r.length === 2);
      ok(r[0].equal(57.07106781, 57.07106781));
      ok(r[1].equal(42.92893219, 42.92893219));
    });


    it('returns [] when no intersection (diagonal)', function() {
      var l = Line2(0, 0, 100, 100);
      var r = l.intersectCircle(Vec2(50, 0), 10);

      ok(!r.length);
    });

    it('returns [] when no intersection (vertical)', function() {
      var l = Line2(100, 0, 100, 100);
      var r = l.intersectCircle(Vec2(50, 0), 10);
      ok(!r.length);
    });

    it('returns [] when no intersection (horizontal)', function() {
      var l = Line2(0, 100, 100, 100);
      var r = l.intersectCircle(Vec2(50, 0), 10);
      ok(!r.length);
    });

    it('returns [] when no intersection (horizontal)', function() {
      var l = Line2(0, 100, 100, 100);
      var r = l.intersectCircle(Vec2(50, 0), 10);
      ok(!r.length);
    });

    it('returns an array of vec2s at intersection point (vertical off circle)', function() {
      var l = Line2(100, 0, 100, 100);
      var r = l.intersectCircle(Vec2(120, 50), 100);

      ok(r.length === 2);
      ok(r[0].equal(100, 147.97958971));
      ok(r[1].equal(100, -47.97958971));
    });
  });
});
