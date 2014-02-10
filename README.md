# line2

## install

`npm install line2`

or include it in a script tag in the browser

## use

```javascript

var Line = require('line2');

var l = new Line(0, 0, 10, 10);

console.log(l.slope(), l.yintercept(), l.xintercept()); // 1 0 0

```


### api surface

__Line2(x1, y1, x2, y2)__ or __Line2(slope, yIntercept)__

returns a new `Line2`

__change(fn)__

add an observer that will be notified of any change.

_callback signature_: `function(line) {}`

__ignore([fn])__

Removes a listener, if no `fn` is passed remove them all.

__notify()__

Call all of the listeners, manually.

__yintercept([y])__

return the computed y-intercept or `null` if verical

When `y` is passed it will set the y-intercept of this line and the x-intercept if appropriate (not horizontal)

__xintercept([x])__

return the computed x-intercept or `null` if horizontal

when `x` is passed it will set the x-intercept of this line and the y-intercept if appropriate (not vertical)

__slope([slope])__

return the computed slope.

When `slope` is passed it will set the slope of this line

_note_: this will be `Infinity` if the line is vertical

__intersectSegment(x1, y1, x2, y2)__

returns:

* `true` when the segment is colinear with this line
* `false` when the segment does not intersect with this line
* `Vec2` representing where the point of interesection

__createPerpendicular(vec2)__

returns a new line instance that is perpendicular to this line and goes through the provided point

__intersectCircle(vec2, radius)__

returns an array of `Vec2`s which represent the intersections.

a length of:

* `0` means no intersections
* `1` means the line is tangent to the provided circle
* `2` means the line fully intersects

__solveForX(y)__

return the `x` coordinate using the provided `y`

__solveForY(x)__

return the `y` coordinate using the provided `x`

__intersect(line2)__ or __intersect(x1, y1, x2, y2)__

returns a `Vec2` representing the point of intersection if there was one.

If the lines are colinear, it returns `true`

If there is no intersection, it returns `false`

__isHorizontal()__

return boolean

__isVertical()__

return boolean

__closestPointTo(vec2)__

returns the a `Vec2` representing the closest point on this line to the provided vec2

__containsPoint(vec2)__

returns true if the provided vec2 is on this line

### license

MIT (see: [license.txt](blob/master/license.txt))
