import { ReplayContainer } from "..";
import { NeoSmartpen } from "./neosmartpen";

let _penmanager_instance = null;

export class PenManager {
  constructor() {
    if (_penmanager_instance) return _penmanager_instance;

    /** @type {Array.<{mac:string, pen:NeoSmartpen}>} */
    this.penArray = [];

    /** @type {Array.<ReplayContainer>} */
    this.render = [];
  }

  static getInstance() {
    if (_penmanager_instance) return _penmanager_instance;

    _penmanager_instance = new PenManager();
    return _penmanager_instance;
  }

  /**
   * @public
   * @return {NeoSmartpen}
   */
  createPen() {
    let pen = new NeoSmartpen();
    return pen;
  }

  /**
   * @public
   * @param {NeoSmartpen} pen 
   */
  addPen(pen) {
    this.penArray.push({ mac: pen.getMac(), pen });
  }

  /**
   * @public
   * @param {NeoSmartpen} pen 
   */
  removePen(pen) {
    const samePen = (item) => item.pen === pen;
    const index = this.penArray.findIndex(samePen);

    if (index > -1) {
      this.penArray.splice(index, 1);
    }
  }

  registerRenderContainer = (renderContainer) => {
    this.render.push(renderContainer);
  }

  unregisterRenderContainer = (renderContainer) => {
    const sameRender = (item) => item === renderContainer;
    const index = this.penArray.findIndex( sameRender);

    if (index > -1) {
      this.render.splice(index, 1);
    }
  }

}