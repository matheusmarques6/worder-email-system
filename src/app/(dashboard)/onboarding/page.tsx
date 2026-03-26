"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { createClient } from "@/lib/supabase/client";
import { StepConnectShopify } from "@/components/onboarding/step-connect-shopify";
import { StepInstallPixel } from "@/components/onboarding/step-install-pixel";
import { StepConnectWhatsapp } from "@/components/onboarding/step-connect-whatsapp";
import { StepImportContacts } from "@/components/onboarding/step-import-contacts";
import { StepFirstForm } from "@/components/onboarding/step-first-form";
import { StepFirstAutomation } from "@/components/onboarding/step-first-automation";

const STEPS = [
  { number: 1, label: "Conectar Shopify" },
  { number: 2, label: "Instalar Pixel" },
  { number: 3, label: "WhatsApp" },
  { number: 4, label: "Importar Contatos" },
  { number: 5, label: "Primeiro Formulário" },
  { number: 6, label: "Primeira Automação" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { store, loading } = useStore();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (store?.settings?.onboarding_step) {
      setCurrentStep(store.settings.onboarding_step);
    }
  }, [store]);

  const saveStep = useCallback(
    async (step: number, complete = false) => {
      if (!store) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("stores")
        .update({
          settings: {
            ...store.settings,
            onboarding_step: step,
            onboarding_complete: complete,
          },
        })
        .eq("id", store.id);

      if (error) {
        toast.error("Erro ao salvar progresso.");
      }
    },
    [store]
  );

  const handleNext = useCallback(async () => {
    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      await saveStep(next);
    } else {
      await saveStep(6, true);
      toast.success("Onboarding concluído! Bem-vindo ao Convertfy Mail.");
      router.push("/");
    }
  }, [currentStep, saveStep, router]);

  const handleBack = useCallback(async () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      await saveStep(prev);
    }
  }, [currentStep, saveStep]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar - Progress */}
      <div className="w-64 bg-white border-r border-gray-200 p-8 flex-shrink-0">
        <h2 className="text-[18px] font-semibold text-gray-900 mb-8">
          Configuração
        </h2>
        <div className="space-y-0">
          {STEPS.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;
            const isFuture = step.number > currentStep;

            return (
              <div key={step.number} className="flex items-start gap-3">
                {/* Dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-[12px] font-semibold">
                        {step.number}
                      </span>
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-[14px] pt-1.5 ${
                    isActive
                      ? "text-gray-900 font-semibold"
                      : isFuture
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          {currentStep === 1 && (
            <StepConnectShopify onComplete={handleNext} />
          )}
          {currentStep === 2 && (
            <StepInstallPixel onComplete={handleNext} />
          )}
          {currentStep === 3 && (
            <StepConnectWhatsapp onComplete={handleNext} />
          )}
          {currentStep === 4 && (
            <StepImportContacts onComplete={handleNext} />
          )}
          {currentStep === 5 && <StepFirstForm onComplete={handleNext} />}
          {currentStep === 6 && (
            <StepFirstAutomation onComplete={handleNext} />
          )}
        </div>

        {/* Bottom navigation */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-[14px] bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltar
            </button>
            <div className="flex gap-3">
              {currentStep < 6 && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-700"
                >
                  Pular
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 text-[14px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                {currentStep === 6 ? "Concluir" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
