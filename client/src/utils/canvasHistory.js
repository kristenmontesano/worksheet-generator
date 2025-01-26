import * as fabric from 'fabric';

class CanvasHistory {
  constructor(canvas) {
    this.canvas = canvas;
    this.history = [];
    this.historyRedo = [];
    this._isClearingCanvas = false; // Flag to avoid tracking during canvas clearing

    this._initialize();
  }

  _initialize() {
    // Save the initial canvas state
    this._saveCanvasState();

    // Add event listeners to track changes and save state
    this.canvas.on('object:added', () => this._saveCanvasState());
    this.canvas.on('object:modified', () => this._saveCanvasState());
    this.canvas.on('object:removed', () => {
      if (!this._isClearingCanvas) {
        this._saveCanvasState();
      }
    });
  }

  // Save the current canvas state
  _saveCanvasState() {
    const jsonCanvas = structuredClone(this.canvas.toObject().objects);
    if (
      this.history.length === 0 ||
      JSON.stringify(this.history[this.history.length - 1]) !==
        JSON.stringify(jsonCanvas)
    ) {
      this.history.push(jsonCanvas); // Push current state to history
      this.historyRedo = []; // Clear redo stack whenever a new action occurs
      console.log('Canvas state saved:', jsonCanvas);
    }
  }

  // Clear all objects from the canvas
  _clearCanvas() {
    this._isClearingCanvas = true;
    this.canvas.remove(...this.canvas.getObjects());
    this._isClearingCanvas = false;
  }

  // Apply a given state to the canvas
  async _applyState(state) {
    this._clearCanvas();

    const objects = await fabric.util.enlivenObjects(state);
    objects.forEach((obj) => {
      this.canvas.add(obj);
    });

    this.canvas.renderAll();
  }

  // Undo the last action
  async undo() {
    if (this.history.length <= 1) {
      console.warn('No more undo actions available');
      return;
    }

    this.historyRedo.push(this.history.pop()); // Push current state to redo stack
    const lastState = this.history[this.history.length - 1]; // Get previous state

    await this._applyState(lastState);
    console.log('Undo complete');
  }

  // Redo the last undone action
  async redo() {
    if (this.historyRedo.length === 0) {
      console.warn('No more redo actions available');
      return;
    }

    const nextState = this.historyRedo.pop(); // Get the state to redo
    this.history.push(nextState); // Push it back to history

    await this._applyState(nextState);
    console.log('Redo complete');
  }

  // Clear the history and redo stacks
  clearHistory() {
    this.history = [];
    this.historyRedo = [];
    console.log('History cleared');
  }
}

export default CanvasHistory;
