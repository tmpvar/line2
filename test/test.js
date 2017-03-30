var test = require('tape');

if (typeof require !== "undefined") {
  var Line2 = require("../line2.js");
  var Vec2 = require("vec2");
}

var ok = function(a, msg) { if (!a) throw new Error(msg || "not ok"); };

test('ctor - accepts slope/yintercept', function(t) {
  var l = new Line2(1, 0);
  t.equal(l.slope(), 1);
  t.equal(l.yintercept(), 0);
  t.end();
});

test('ctor - accepts 4 points', function(t) {
  var l = new Line2(0, 0, 10, 10);
  t.equal(l.slope(), 1);
  t.equal(l.yintercept(), 0);
  t.end();
});

test('change - returns the callback', function(t) {
  var l = new Line2();
  var fn = function(t) {};
  t.equal(l.change(fn), fn);
  t.end();
});

test('change - should notify the caller', function(t) {
  var l = new Line2(0, 0, 100, 100);
  var count = 0;

  l.change(function(line) {
    t.equal(line, l);
    count++;
  });

  l.slope(1/4);
  l.yintercept(5);
  l.xintercept(1);

  t.equal(count, 3);
  t.end();
});


test('ignore - removes the passed listener', function(t) {
  var l = new Line2();
  var count = 0;
  var fn = l.change(function(t) { count++; });
  var fn2 = l.change(function(t) { count++; });

  l.ignore(fn);
  l.slope(1.2);

  t.equal(count, 1);
  t.end();
});

test('ignore - removes all listeners if no callback is specified', function(t) {
  var l = new Line2();
  var count = 0;
  var fn = l.change(function(t) { count++; });
  var fn2 = l.change(function(t) { count++; });

  l.ignore();
  l.slope(1.2);

  t.equal(count, 0);
  t.end();
});

test('notify - calls all of the registered listeners', function(t) {
  var l = new Line2();
  var count = '';
  var fn = l.change(function(line) {
    t.equal(line, l);
    count += 'f';
  });
  var fn2 = l.change(function(line) {
    t.equal(line, l);
    count += 'l';
  });

  l.notify();
  t.equal(count, 'fl');
  t.end();
});

test('yintercept - acts as a getter', function(t) {
  var l = new Line2(0, 2, 100, 100);
  t.equal(l.yintercept(), 2);
  t.end();
});

test('yintercept - acts as a setter', function(t) {
  var l = new Line2(0, 2, 100, 100);
  l.yintercept(4);
  t.equal(l.yintercept(), 4);
  t.end()
});

test('yintercept - acts as a setter and updates xintercept', function(t) {
  var l = new Line2(0, 2, 20, 22);
  l.yintercept(4);
  t.equal(l.yintercept(), 4);
  t.equal(l.xintercept(), -4);
  t.end();
});

test('yintercept - acts as a setter and updates xintercept (horizontal)', function(t) {
  var l = new Line2(0, 100, 100, 100);
  l.yintercept(4);
  t.equal(l.yintercept(), 4);
  t.equal(l.xintercept(), null);
  t.end();
});

test('yintercept - does not notify when set to the same value', function(t) {
  var l = new Line2(0, 100, 100, 100);
  var c = 0;
  l.change(function(t) { c++; });

  l.yintercept(100);
  t.equal(l.yintercept(), 100);
  t.equal(c, 0);
  t.end();
});

test('slope - updates the x-intercept', function(t) {
  var l = new Line2(1, 10);
  t.equal(l.xintercept(), -10);
  l.slope(-1);
  t.equal(l.xintercept(), 10);
  t.end();
});

test('slope - does not update the x-intercept (horizontal)', function(t) {
  var l = new Line2(1, 10);
  l.slope(0);
  t.equal(l.xintercept(), null);
  t.end();
});

test('slope - does not notify if changed to the same value', function(t) {
  var l = new Line2(1, 10);
  var c = 0;
  l.change(function(t) { c++; });

  l.slope(1);

  t.equal(c, 0);
  t.end();
});

test('xintercept - acts as a getter', function(t) {
  var l = new Line2(0, 2, 20, 22);
  t.equal(l.xintercept(), -2);
  t.end();
});

test('xintercept - acts as a setter', function(t) {
  var l = new Line2(0, 2, 20, 22);
  l.xintercept(4);
  t.equal(l.xintercept(), 4);
  t.end();
});

test('xintercept - acts as a setter and updates yintercept', function(t) {
  var l = new Line2(3, 5);

  l.xintercept(2);

  t.equal(l.yintercept(), -6);
  t.equal(l.xintercept(), 2);
  t.end();
});

test('xintercept - acts as a setter and updates yintercept', function(t) {
  var l = new Line2(0, 2, 20, 22);

  l.xintercept(4);

  t.equal(l.yintercept(), -4);
  t.equal(l.xintercept(), 4);
  t.end();
});

test('xintercept - acts as a setter and updates xintercept (vertical)', function(t) {
  var l = new Line2(100, 0, 100, 100);
  l.xintercept(4);
  t.equal(l.xintercept(), 4);
  t.equal(l.yintercept(), null);
  t.end();
});

test('xintercept - does not notify when set to the same value', function(t) {
  var l = new Line2(0, 0, 100, 100);
  var c = 0;
  l.change(function(t) { c++; });

  l.xintercept(0);

  t.equal(l.xintercept(), 0);
  t.equal(c, 0);
  t.end();
});

test('fromPoints - computes the slope and yintercept', function(t) {
  [
    Line2.fromPoints([1, 1], [10, 10]),
    Line2.fromPoints(Vec2(1, 1), Vec2(10, 10)),
    Line2.fromPoints(1, 1, 10, 10),
  ].forEach(function(line) {
    t.equal(line.slope(), 1);
    t.equal(line.yintercept(), 0);
  });
  t.end();
});

test('fromPoints - computes the slope and yintercept (vertical)', function(t) {
  var l = Line2.fromPoints(100, 0, 100, 100);
  t.equal(l.slope(), Infinity);
  t.equal(l.xintercept(), 100);
  t.ok(l.isVertical());
  t.ok(!l.isHorizontal());
  t.end();
});

test('fromPoints - computes the slope and yintercept (horizontal)', function(t) {
  var l = Line2.fromPoints(0, 100, 100, 100);
  t.equal(l.slope(), 0);
  t.equal(l.yintercept(), 100);
  t.ok(!l.isVertical());
  t.ok(l.isHorizontal());
  t.end();
});

test('fromPoints - computes the slope and yintercept (diagonal)', function(t) {
  var l = Line2.fromPoints(2, 8, 20, 80);
  t.equal(l.slope(), 4);
  t.equal(l.yintercept(), 0);
  t.ok(!l.isVertical());
  t.ok(!l.isHorizontal());
  t.end();
});

test('fromPoints - computes the slope and yintercept (diagonal)', function(t) {
  var l = Line2.fromPoints(8, 2, 80, 20);
  t.equal(l.slope(), 0.25);
  t.equal(l.yintercept(), 0);
  t.ok(!l.isVertical());
  t.ok(!l.isHorizontal());
  t.end();
});

test('fromPoints - computes the slope and yintercept (diagonal)', function(t) {
  var l = Line2.fromPoints(2, 0, 20, 18);
  t.equal(l.slope(), 1);
  t.equal(l.yintercept(), -2);
  t.ok(!l.isVertical());
  t.ok(!l.isHorizontal());
  t.end();
});

test('closestPointTo - finds the closest point to this line (horizontal)', function(t) {
  var l = Line2.fromPoints(0, 0, 100, 0);
  t.ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(10, 0)));
  t.end();
});

test('closestPointTo - finds the closest point to this line (vertical)', function(t) {
  var l = Line2.fromPoints(100, 0, 100, 100);
  t.ok(l.closestPointTo(Vec2(10, 10)).equal(Vec2(100, 10)));
  t.end();
});

test('closestPointTo - finds the closest point to this line (diagonal)', function(t) {
  var l = Line2.fromPoints(0, 0, 100, 100);
  t.ok(l.closestPointTo(Vec2(25, 75)).equal(Vec2(50, 50)));
  t.end();
});

test('closestPointTo - finds the closest point to this line (diagonal)', function(t) {
  var l = Line2(80, 0, 100, 100);
  var r = l.closestPointTo(Vec2(99, 50));
  t.ok(r.equal(90.34615385000001, 51.73076923));
  t.end();
});

test('intersect - computes the intersection of normal lines', function(t) {
  var l1 = Line2.fromPoints(0, 0, 10, 10);
  var l2 = Line2.fromPoints(0, 10, 10, 0);

  var v = l1.intersect(l2);
  t.ok(v.equal(5, 5));
  t.end()
});

test('intersect - returns false when lines are parallel', function(t) {
  var l1 = Line2.fromPoints(0, 0, 10, 10);
  var l2 = Line2.fromPoints(0, 5, 5, 10);

  t.ok(!l1.intersect(l2));
  t.end();
});

test('intersect - returns true when lines are collinear', function(t) {
  var l1 = Line2.fromPoints(0, 0, 10, 10);
  var l2 = Line2.fromPoints(5, 5, 9, 9);
  t.equal(l1.intersect(l2), true);
  t.end();
});

test('intersect - finds the intersection of perpendicular lines (vertical-vertical)', function(t) {
  var l1 = Line2.fromPoints(0, 0, 10, 0);
  var l2 = Line2.fromPoints(5, 10, 5, 0);

  t.ok(l1.intersect(l2).equal(5, 0));
  t.ok(l2.intersect(l1).equal(5, 0));
  t.end();
});

test('intersect - returns true when colinear (vertical)', function (t) {
  var l1 = Line2.fromPoints(10,0, 10, 10)
  var l2 = Line2.fromPoints(10,10,10,0)
  t.equal(l1.intersect(l2), true);
  t.end();  
})

test('intersect - returns false when intersection (vertical)', function (t) {
  var l1 = Line2.fromPoints(10,0, 10, 10)
  var l2 = Line2.fromPoints(11,10,11,0)
  t.equal(l1.intersect(l2), false);
  t.end();  
})


test('intersect - finds intersection of lines (horizontal - diagonal)', function(t) {
  var l1 = Line2.fromPoints(-100, -110, -101, -110);
  var l2 = Line2.fromPoints(92.92893219, -107.07106781, 92.22182541, -106.36396103);

  t.ok(l1.intersect(l2).equal(95.85786438, -110));
  t.end();
});

test('intersect - finds intersection of lines (horizontal - diagonal)', function(t) {
  var l2 = Line2.fromPoints(-100, -110, -101, -110);
  var l1 = Line2.fromPoints(92.92893219, -107.07106781, 92.22182541, -106.36396103);
  t.ok(l1.intersect(l2).equal(95.85786438, -110));
  t.end();
});

test('intersect - finds the intersection of lines (vertial-diagonal)', function(t) {
  var l1 = Line2.fromPoints(0, 0, 55, 25);
  var l2 = Line2.fromPoints(30, 30, 30, 0);
  t.ok(l1.intersect(l2).equal(30, 13.6363635));
  t.ok(l2.intersect(l1).equal(30, 13.6363635));
  t.end();
});

test('returns a vec2 when intersected with a segment (horizontal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.ok(l1.intersect(5, 5, 5, -5).equal(5, 0));
  t.end();
});

test('returns a vec2 when intersected with a segment (horizontal - diagonal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.ok(l1.intersect(50, 10, 30, -10).equal(40, 0));
  t.end();
});

test('returns false when no intersection (horizontal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.ok(!l1.intersect(5, 5, 5, 1));
  t.end();
});

test('returns true when colinear (horizontal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.equal(l1.intersect(0, 0, 5, 0), true);
  t.end();
});

test('returns false when parallel (horizontal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.equal(l1.intersect(0, 5, 5, 5), false);
  t.end();
});

test('returns true when colinear (vertical)', function(t) {
  var l1 = Line2(100, 0, 100, 100);
  t.equal(l1.intersect(100, 10, 100, 50), true);
  t.end();
});

test('returns vec2 when intersection (vertical)', function(t) {
  var l1 = Line2(100, 0, 100, 100);
  t.ok(l1.intersect(50, 50, 200, 50).equal(100, 50));
  t.end();
});

test('returns false when parallel (vertical)', function(t) {
  var l1 = Line2(100, 0, 100, 100);
  t.equal(l1.intersect(5, 0, 5, 5), false);
  t.end();
});

test('returns a vec2 when intersected with a segment (diagonal)', function(t) {
  var l1 = Line2(0, 0, 100, 100);
  t.ok(l1.intersect(25, 75, 75, 25).equal(50, 50));
  t.end();
});

test('returns false when no intersection (diagonal)', function(t) {
  var l1 = Line2(0, 0, 100, 100);
  t.ok(!l1.intersect(25, 75, 30, 75));
  t.end();
});

test('returns true when colinear (diagonal)', function(t) {
  var l1 = Line2(0, 0, 100, 0);
  t.equal(l1.intersect(0, 0, 5, 0), true);
  t.end();
});

test('returns false when parallel (diagonal)', function(t) {
  var l1 = Line2(0, 0, 100, 100);
  t.equal(l1.intersect(0, 5, 5, 10), false);
  t.end();
});

test('isHorizontal - true if horizontal', function(t) {
  var l = Line2.fromPoints(0, 0, 100, 0);
  t.ok(l.isHorizontal());
  t.end();
});

test('isHorizontal - false if not horizontal', function(t) {
  var l = Line2.fromPoints(0, 0, 100, 10);
  t.ok(!l.isHorizontal());
  t.end();
});

test('true if vertical', function(t) {
  var l = Line2.fromPoints(100, 0, 100, 100);
  t.ok(l.isVertical());
  t.end();
});

test('false if not vertical', function(t) {
  var l = Line2.fromPoints(10, 0, 100, 10);
  t.ok(!l.isVertical());
  t.end();
});

test('containsPoint - may take an x,y', function(t) {
  var l = Line2(0, 0, 10, 0);
  t.ok(!l.containsPoint(5, 1));
  t.ok(l.containsPoint(5, 0));
  t.end();
});

test('containsPoint - returns false when not contained (horizontal)', function(t) {
  var l = Line2(0, 0, 10, 0);
  t.ok(!l.containsPoint(Vec2(5, 1)));
  t.end();
});

test('containsPoint - returns true when contained (horizontal)', function(t) {
  var l = Line2(0, 0, 10, 0);
  t.ok(l.containsPoint(Vec2(5, 0)));
  t.end();
});

test('containsPoint - returns false when not contained (vertical)', function(t) {
  var l = Line2(10, 0, 10, 10);
  t.ok(!l.containsPoint(Vec2(5, 1)));
  t.end();
});

test('containsPoint - returns true when contained (vertical)', function(t) {
  var l = Line2(10, 0, 10, 10);
  t.ok(l.containsPoint(Vec2(10, 5)));
  t.end();
});

test('containsPoint - returns true when contained (diagonal)', function(t) {
  var l = Line2(0, 0, 10, 10);
  t.ok(l.containsPoint(Vec2(5, 5)));
  t.end();
});

test('containsPoint - returns false when not contained (diagonal)', function(t) {
  var l = Line2(0, 0, 10, 10);
  t.ok(!l.containsPoint(Vec2(5, 2)));
  t.end();
});

test('createPerpendicular - should return a perpendicular line', function(t) {
  var l = Line2(0, 0, 10, 10);
  var l2 = l.createPerpendicular(Vec2(5,5));
  t.equal(l2.yintercept(), 10);
  t.equal(l2.slope(), -1);
  t.end();
});

test('createPerpendicular - should return a perpendicular line (vertical)', function(t) {
  var l = Line2(10, 0, 10, 10);
  var l2 = l.createPerpendicular(Vec2(10,5));

  t.equal(l2.yintercept(), 5);
  t.equal(l2.slope(), 0);
  t.end();
});

test('createPerpendicular - should return a perpendicular line (horizontal)', function(t) {
  var l = Line2(0, 10, 10, 10);
  var l2 = l.createPerpendicular(Vec2(5, 10));

  t.equal(l2.xintercept(), 5);
  t.equal(l2.slope(), Infinity);
  t.end();
});

test('intersectCircle - should work from origin', function(t) {
  var l = new Line2(2, 2);

  var r = l.intersectCircle(Vec2(0, 0), 10);
  t.equal(r.length, 2);
  r.sort(function(a, b) {
    return a.y > b.y ? -1 : 1;
  });

  t.ok(r[0].equal(3.65421149, 9.30842298));
  t.ok(r[1].equal(-5.25421149, -8.50842298));
  t.end();
});

test('intersectCircle - returns an array of vec2s at intersection point (vertical on line)', function(t) {
  var l = Line2(100, 0, 100, 100);
  var r = l.intersectCircle(Vec2(100, 50), 55);
  t.equal(r.length, 2);
  r.sort(function(a, b) {
    return a.y > b.y ? -1 : 1;
  });

  t.ok(r[0].equal(100, 105));
  t.ok(r[1].equal(100, -5));
  t.end();
});

test('intersectCircle - returns an array of vec2s at intersection point (vertical on circle center)', function(t) {
  var l = Line2(100, 0, 100, 100);
  var r = l.intersectCircle(Vec2(100, 50), 100);

  t.equal(r.length, 2);
  r.sort(function(a, b) {
    return a.y > b.y ? -1 : 1;
  });

  t.ok(r[0].equal(100, 150));
  t.ok(r[1].equal(100, -50));
  t.end();
});

test('intersectCircle - returns a single item array when tangent', function(t) {
  var l = Line2(0, 100, 100, 100);
  var r = l.intersectCircle(Vec2(50, 50), 50);

  t.equal(r.length, 1);
  t.ok(r[0].equal(50, 100));
  t.end();
});

test('intersectCircle - returns an array of vec2s at intersection point (horizontal)', function(t) {
  var l = Line2(0, 0, 100, 0);
  var r = l.intersectCircle(Vec2(50, 50), 55);

  t.equal(r.length, 2);
  t.ok(r[0].equal(72.91287847, 0));
  t.ok(r[1].equal(27.08712153, 0));
  t.end();
});

test('intersectCircle - returns an array of vec2s at intersection point (diagonal)', function(t) {
  var l = Line2(0, 0, 100, 100);
  var r = l.intersectCircle(Vec2(50, 50), 10);

  t.equal(r.length, 2);
  t.ok(r[0].equal(57.07106781, 57.07106781));
  t.ok(r[1].equal(42.92893219, 42.92893219));
  t.end();
});

test('intersectCircle - returns [] when no intersection (diagonal)', function(t) {
  var l = Line2(0, 0, 100, 100);
  var r = l.intersectCircle(Vec2(50, 0), 10);

  t.ok(!r.length);
  t.end();
});

test('intersectCircle - returns [] when no intersection (vertical)', function(t) {
  var l = Line2(100, 0, 100, 100);
  var r = l.intersectCircle(Vec2(50, 0), 10);
  t.ok(!r.length);
  t.end();
});

test('intersectCircle - returns [] when no intersection (horizontal)', function(t) {
  var l = Line2(0, 100, 100, 100);
  var r = l.intersectCircle(Vec2(50, 0), 10);
  t.ok(!r.length);
  t.end();
});

test('intersectCircle - returns [] when no intersection (horizontal)', function(t) {
  var l = Line2(0, 100, 100, 100);
  var r = l.intersectCircle(Vec2(50, 0), 10);
  t.ok(!r.length);
  t.end();
});

test('intersectCircle - returns an array of vec2s at intersection point (vertical off circle)', function(t) {
  var l = Line2(100, 0, 100, 100);
  var r = l.intersectCircle(Vec2(120, 50), 100);

  t.equal(r.length, 2);
  t.ok(r[0].equal(100, 147.97958971));
  t.ok(r[1].equal(100, -47.97958971));
  t.end();
});
