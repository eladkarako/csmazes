/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.BinaryTree = (function(superClass) {
  extend(BinaryTree, superClass);

  BinaryTree.prototype.IN = 0x1000;

  BinaryTree.prototype.isCurrent = function(x, y) {
    return this.x === x && this.y === y;
  };

  function BinaryTree(maze, options) {
    var ref;
    BinaryTree.__super__.constructor.apply(this, arguments);
    this.x = 0;
    this.y = 0;
    switch ((ref = options.input) != null ? ref : "nw") {
      case "nw":
        this.bias = Maze.Direction.N | Maze.Direction.W;
        break;
      case "ne":
        this.bias = Maze.Direction.N | Maze.Direction.E;
        break;
      case "sw":
        this.bias = Maze.Direction.S | Maze.Direction.W;
        break;
      case "se":
        this.bias = Maze.Direction.S | Maze.Direction.E;
    }
    this.northBias = (this.bias & Maze.Direction.N) !== 0;
    this.southBias = (this.bias & Maze.Direction.S) !== 0;
    this.eastBias = (this.bias & Maze.Direction.E) !== 0;
    this.westBias = (this.bias & Maze.Direction.W) !== 0;
  }

  BinaryTree.prototype.step = function() {
    var direction, dirs, nx, ny, oldX, oldY, ref;
    if (this.y >= this.maze.height) {
      return false;
    }
    dirs = [];
    if (this.northBias && this.y > 0) {
      dirs.push(Maze.Direction.N);
    }
    if (this.southBias && this.y + 1 < this.maze.height) {
      dirs.push(Maze.Direction.S);
    }
    if (this.westBias && this.x > 0) {
      dirs.push(Maze.Direction.W);
    }
    if (this.eastBias && this.x + 1 < this.maze.width) {
      dirs.push(Maze.Direction.E);
    }
    direction = this.rand.randomElement(dirs);
    if (direction) {
      nx = this.x + Maze.Direction.dx[direction];
      ny = this.y + Maze.Direction.dy[direction];
      this.maze.carve(this.x, this.y, direction);
      this.maze.carve(nx, ny, Maze.Direction.opposite[direction]);
      this.updateAt(nx, ny);
    } else {
      this.maze.carve(this.x, this.y, this.IN);
    }
    ref = [this.x, this.y], oldX = ref[0], oldY = ref[1];
    this.x++;
    if (this.x >= this.maze.width) {
      this.x = 0;
      this.y++;
      this.eventAt(this.x, this.y);
    }
    this.updateAt(oldX, oldY);
    this.updateAt(this.x, this.y);
    return this.y < this.maze.height;
  };

  return BinaryTree;

})(Maze.Algorithm);
