import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressSteps from "@/components/ProgressSteps";
import ImageUploader from "@/components/ImageUploader";
import CanvasEditor from "@/components/CanvasEditor";
import PriceEditor from "@/components/PriceEditor";
import PreviewShare from "@/components/PreviewShare";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorMessage from "@/components/ErrorMessage";
import { useQuery } from "@tanstack/react-query";
import { TemplateType } from "@/types";

const Home: React.FC = () => {
  const { state, dispatch } = useAppContext();

  // Fetch templates from config.json
  const { data: templates } = useQuery<TemplateType[]>({
    queryKey: ["/templates/config.json"],
    staleTime: Infinity,
  });

  // Set first template as selected when templates are loaded
  useEffect(() => {
    if (templates && templates.length > 0 && !state.selectedTemplate) {
      dispatch({ type: "SET_TEMPLATE", payload: templates[0] });
    }
  }, [templates, state.selectedTemplate, dispatch]);

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <ImageUploader />;
      case 2:
        return <CanvasEditor templates={templates || []} />;
      case 3:
        return <PriceEditor />;
      case 4:
        return <PreviewShare />;
      default:
        return <ImageUploader />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressSteps />
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
            {state.error && <ErrorMessage />}
            {renderCurrentStep()}
            {state.isLoading && <LoadingOverlay />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
