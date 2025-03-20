import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { TemplateType, PriceStyleType } from "@/types";

export type Step = 1 | 2 | 3 | 4;

type AppState = {
  currentStep: Step;
  uploadedImage: File | null;
  processedImageUrl: string | null;
  originalImageUrl: string | null;
  selectedTemplate: TemplateType | null;
  priceText: string;
  priceStyle: PriceStyleType;
  isLoading: boolean;
  error: string | null;
  imagePosition: {
    x: number;
    y: number;
    scale: number;
    angle: number;
  };
  pricePosition: {
    x: number;
    y: number;
  };
  fabricCanvas: fabric.Canvas | null;
};

type AppAction =
  | { type: "SET_STEP"; payload: Step }
  | { type: "SET_UPLOADED_IMAGE"; payload: File | null }
  | { type: "SET_PROCESSED_IMAGE"; payload: string | null }
  | { type: "SET_ORIGINAL_IMAGE"; payload: string | null }
  | { type: "SET_TEMPLATE"; payload: TemplateType | null }
  | { type: "SET_PRICE_TEXT"; payload: string }
  | { type: "SET_PRICE_STYLE"; payload: Partial<PriceStyleType> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_IMAGE_POSITION"; payload: Partial<AppState["imagePosition"]> }
  | { type: "SET_PRICE_POSITION"; payload: Partial<AppState["pricePosition"]> }
  | { type: "SET_FABRIC_CANVAS"; payload: fabric.Canvas | null }
  | { type: "RESET_STATE" };

const initialState: AppState = {
  currentStep: 1,
  uploadedImage: null,
  processedImageUrl: null,
  originalImageUrl: null,
  selectedTemplate: null,
  priceText: "$74",
  priceStyle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
  },
  isLoading: false,
  error: null,
  imagePosition: {
    x: 0.5,
    y: 0.45,
    scale: 0.5,
    angle: 0,
  },
  pricePosition: {
    x: 0.5,
    y: 0.85,
  },
  fabricCanvas: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_UPLOADED_IMAGE":
      return { ...state, uploadedImage: action.payload };
    case "SET_PROCESSED_IMAGE":
      return { ...state, processedImageUrl: action.payload };
    case "SET_ORIGINAL_IMAGE":
      return { ...state, originalImageUrl: action.payload };
    case "SET_TEMPLATE":
      return { ...state, selectedTemplate: action.payload };
    case "SET_PRICE_TEXT":
      return { ...state, priceText: action.payload };
    case "SET_PRICE_STYLE":
      return {
        ...state,
        priceStyle: { ...state.priceStyle, ...action.payload },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_IMAGE_POSITION":
      return {
        ...state,
        imagePosition: { ...state.imagePosition, ...action.payload },
      };
    case "SET_PRICE_POSITION":
      return {
        ...state,
        pricePosition: { ...state.pricePosition, ...action.payload },
      };
    case "SET_FABRIC_CANVAS":
      return { ...state, fabricCanvas: action.payload };
    case "RESET_STATE":
      return {
        ...initialState,
        fabricCanvas: state.fabricCanvas,
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
