/**
 * ---------------------------------------------------------------------------
 * SignRecognitionEngine — modular computer-vision interface
 * ---------------------------------------------------------------------------
 * Pipeline this interface is designed for:
 *
 *   Camera
 *     ↓ MediaPipe Hand Landmarker (21 keypoints, 3D)
 *     ↓ Feature extraction (normalised, scale/rotation invariant)
 *     ↓ Sign classifier (TensorFlow.js / ONNX Runtime Web)
 *     ↓ Prediction + confidence
 *     ↓ Feedback
 *
 * The UI in CameraPractice.tsx only talks to this interface, so a trained
 * model can be dropped in later without touching a single page component.
 *
 * IMPORTANT: no trained sign classifier ships with this build. The reference
 * implementation below performs NO inference and always reports
 * `modelStatus: 'unavailable'` with an honest explanation. It never invents a
 * prediction or a confidence score.
 * ---------------------------------------------------------------------------
 */

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

export interface Prediction {
  label: string;
  signId?: string;
  /** 0..1 */
  confidence: number;
}

export interface FrameResult {
  detected: boolean;
  landmarks?: HandLandmark[];
  prediction?: Prediction;
  /** Short, actionable coaching line */
  feedback?: string;
  modelStatus: ModelStatus;
  /** Human-readable explanation of the current engine state */
  message?: string;
}

export interface SignRecognitionEngine {
  readonly name: string;
  readonly supported: boolean;
  init(): Promise<void>;
  start(video: HTMLVideoElement): Promise<void>;
  stop(): void;
  /** Called once per animation frame while the camera preview is live */
  analyzeFrame(video: HTMLVideoElement, timestampMs: number): Promise<FrameResult>;
  dispose(): void;
}

export class PlaceholderEngine implements SignRecognitionEngine {
  readonly name = 'placeholder-engine';
  readonly supported = false;
  private status: ModelStatus = 'idle';

  async init(): Promise<void> {
    this.status = 'loading';
    // Integration point: load MediaPipe Tasks Vision + a trained .onnx/.tflite
    // classifier here. Left intentionally empty so nothing false is claimed.
    this.status = 'unavailable';
  }

  async start(_video: HTMLVideoElement): Promise<void> {
    await this.init();
  }

  stop(): void {
    /* nothing to stop until a real model is attached */
  }

  async analyzeFrame(_video: HTMLVideoElement, _t: number): Promise<FrameResult> {
    return {
      detected: false,
      modelStatus: this.status,
      message:
        'Camera preview is live, but sign recognition is not switched on yet. A trained model must be validated with the Deaf community before we enable predictions.',
      feedback: 'Position your hand fully inside the frame to prepare.',
    };
  }

  dispose(): void {
    this.status = 'idle';
  }
}

let engine: SignRecognitionEngine | null = null;

/** Factory — swap `PlaceholderEngine` for a real implementation later. */
export function createRecognitionEngine(): SignRecognitionEngine {
  if (!engine) engine = new PlaceholderEngine();
  return engine;
}

/** Expected landmark slots (MediaPipe Hand Landmarker ordering). */
export const LANDMARK_COUNT = 21;
