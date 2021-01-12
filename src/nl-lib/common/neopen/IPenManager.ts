import { IBrushType, PenEventName } from "../enums";
import { EventDispatcher, EventCallbackType } from "../event";
import { IPenEvent } from "../structures";
import { INeoSmartpen, IPenToViewerEvent } from "./INeoSmartpen";

export interface IPenManager {
  penArray: INeoSmartpen[];

  pen_colors: string[];
  marker_colors: string[];
  color: string;
  thickness: number;
  penRendererType: IBrushType;


  dispatcher: EventDispatcher;

  init(): void;
  getInstance(): void;

  /**
   *
   */
  createPen(): INeoSmartpen;
  onLivePenPageInfo(event: IPenToViewerEvent): void;
  add(pen: INeoSmartpen, device: BluetoothDevice): void;

  isAlreadyConnected(device: BluetoothDevice): boolean;

  /**
   *
   * @param pen
   */
  removePen(pen: INeoSmartpen): void;

  setActivePen(penId: string): void;
  setColor(color_num: number): void;

  toggleColorRadioButton(color_num: number): void;

  setPenRendererType(type: IBrushType): void;
  setPenTypeStatus($elem, type): void;

  setThickness(thickness: number): void;
  registerRenderContainer(renderContainer): void;
  unregisterRenderContainer(renderContainer): void;

  onConnected(opt: { pen: INeoSmartpen, event: IPenEvent }): void;

  /**
   *
   * @param opt
   */
  onDisconnected(opt: { pen: INeoSmartpen, event: IPenEvent }): void;

  /**
   *
   * @param opt
   */
  onNcodeError(opt: { pen: INeoSmartpen, event: IPenEvent }): void;
  getConnectedPens(): INeoSmartpen[]



  addEventListener(eventName: PenEventName, listener: EventCallbackType): void;
  removeEventListener(eventName: PenEventName, listener: EventCallbackType): void;

}