
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastFromShadcn,
} from "@/components/ui/use-toast";

const useToast = () => {
  const { toast } = useToastFromShadcn();
  
  return {
    toast: (props: ToastProps & { description?: React.ReactNode; title?: React.ReactNode; action?: ToastActionElement }) => {
      toast({
        ...props,
      });
    },
  };
};

export { useToast };
