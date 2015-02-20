/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.RecursiveBacktracker = (function(superClass) {
  extend(RecursiveBacktracker, superClass);

  RecursiveBacktracker.prototype.IN = 0x1000;

  RecursiveBacktracker.prototype.STACK = 0x2000;

  RecursiveBacktracker.prototype.START = 1;

  RecursiveBacktracker.prototype.RUN = 2;

  RecursiveBacktracker.prototype.DONE = 3;

  function RecursiveBacktracker(maze, options) {
    RecursiveBacktracker.__super__.constructor.apply(this, arguments);
    this.state = this.START;
    this.stack = [];
  }

  RecursiveBacktracker.prototype.step = function() {
    switch (this.state) {
      case this.START:
        this.startStep();
        break;
      case this.RUN:
        this.runStep();
    }
    return this.state !== this.DONE;
  };

  RecursiveBacktracker.prototype.startStep = function() {
    var ref, x, y;
    ref = [this.rand.nextInteger(this.maze.width), this.rand.nextInteger(this.maze.height)], x = ref[0], y = ref[1];
    this.maze.carve(x, y, this.IN | this.STACK);
    this.updateAt(x, y);
    this.stack.push({
      x: x,
      y: y,
      dirs: this.rand.randomDirections()
    });
    this.state = this.RUN;
    return this.carvedOnLastStep = true;
  };

  RecursiveBacktracker.prototype.runStep = function() {
    var current, dir, nx, ny;
    while (true) {
      current = this.stack[this.stack.length - 1];
      dir = current.dirs.pop();
      nx = current.x + Maze.Direction.dx[dir];
      ny = current.y + Maze.Direction.dy[dir];
      if (this.maze.isValid(nx, ny)) {
        if (this.maze.isBlank(nx, ny)) {
          this.stack.push({
            x: nx,
            y: ny,
            dirs: this.rand.randomDirections()
          });
          this.maze.carve(current.x, current.y, dir);
          this.updateAt(current.x, current.y);
          this.maze.carve(nx, ny, Maze.Direction.opposite[dir] | this.STACK);
          this.updateAt(nx, ny);
          if (!this.carvedOnLastStep) {
            this.eventAt(nx, ny);
          }
          this.carvedOnLastStep = true;
          break;
        } else if (this.canWeave(dir, nx, ny)) {
          this.performWeave(dir, current.x, current.y, (function(_this) {
            return function(x, y) {
              _this.stack.push({
                x: x,
                y: y,
                dirs: _this.rand.randomDirections()
              });
              if (!_this.carvedOnLastStep) {
                _this.eventAt(x, y);
              }
              return _this.maze.carve(x, y, _this.STACK);
            };
          })(this));
          this.carvedOnLastStep = true;
          break;
        }
      }
      if (current.dirs.length === 0) {
        this.maze.uncarve(current.x, current.y, this.STACK);
        this.updateAt(current.x, current.y);
        if (this.carvedOnLastStep) {
          this.eventAt(current.x, current.y);
        }
        this.stack.pop();
        this.carvedOnLastStep = false;
        break;
      }
    }
    if (this.stack.length === 0) {
      return this.state = this.DONE;
    }
  };

  RecursiveBacktracker.prototype.isStack = function(x, y) {
    return this.maze.isSet(x, y, this.STACK);
  };

  return RecursiveBacktracker;

})(Maze.Algorithm);