/*
Author: Jamis Buck <jamis@jamisbuck.org>
License: Public domain, baby. Knock yourself out.

The original CoffeeScript sources are always available on GitHub:
http://github.com/jamis/csmazes
 */
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Maze.Algorithms.GrowingBinaryTree = (function(superClass) {
  extend(GrowingBinaryTree, superClass);

  function GrowingBinaryTree() {
    return GrowingBinaryTree.__super__.constructor.apply(this, arguments);
  }

  GrowingBinaryTree.prototype.runStep = function() {
    var cell, count, direction, i, index, len, nx, ny, ref;
    index = this.nextCell();
    cell = this.cells.splice(index, 1)[0];
    this.maze.uncarve(cell.x, cell.y, this.QUEUE);
    this.updateAt(cell.x, cell.y);
    count = 0;
    ref = this.rand.randomDirections();
    for (i = 0, len = ref.length; i < len; i++) {
      direction = ref[i];
      nx = cell.x + Maze.Direction.dx[direction];
      ny = cell.y + Maze.Direction.dy[direction];
      if (this.maze.isValid(nx, ny) && this.maze.isBlank(nx, ny)) {
        this.maze.carve(cell.x, cell.y, direction);
        this.maze.carve(nx, ny, Maze.Direction.opposite[direction]);
        this.enqueue(nx, ny);
        this.updateAt(cell.x, cell.y);
        this.updateAt(nx, ny);
        count += 1;
        if (count > 1) {
          return;
        }
      }
    }
  };

  return GrowingBinaryTree;

})(Maze.Algorithms.GrowingTree);