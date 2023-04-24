import { Cell } from "./cell.js";

const Grid_Size = 4;
const Cells_Count = Grid_Size * Grid_Size;

export class Grid {
  constructor(gridElement) {
    this.cells = [];
    for (let i = 0; i < Cells_Count; i++) {
      this.cells.push(
        new Cell(gridElement, i % Grid_Size, Math.floor(i / Grid_Size))
      );
    }

    this.cellsGroupedByColumn = this.groupCellsByColumn();
    this.cellsGroupedByReversedColumn = this.cellsGroupedByColumn.map(column => [...column].reverse());
    this.cellsGroupedByRow = this.groupCellsByRow();
    this.cellsGroupedByReversedRow = this.cellsGroupedByRow.map(raw => [...raw].reverse());
  }

  getRandomEmptyCell() {
    const emptyCells = this.cells.filter(cell => cell.isEmpty());
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  groupCellsByColumn() {
    return this.cells.reduce((groupedCells, cell) => {
      groupedCells[cell.x] = groupedCells[cell.x] || [];
      groupedCells[cell.x][cell.y] = cell;
      return groupedCells;
    }, []);
  }

  groupCellsByRow() {
    return this.cells.reduce((groupedCells, cell) => {
      groupedCells[cell.y] = groupedCells[cell.y] || [];
      groupedCells[cell.y][cell.x] = cell;
      return groupedCells;
    }, []);
  }
}