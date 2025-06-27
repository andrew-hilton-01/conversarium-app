import { useState } from 'react';

// The content for each step of the tutorial
const tutorialSteps = [
  {
    title: 'Welcome to the Conversation Flow Demo!',
    content: 'This interactive demo lets you practice a conversation by speaking your responses. Click "Next" to learn how it works.',
  },
  {
    title: 'How to Interact',
    content: 'To respond, click the 🎤 "Record" button and speak a phrase that matches the content of any available (glowing) node. The system will find the best match and advance the conversation.',
  },
  {
    title: 'About This Demo',
    content: 'This demo uses free, standard browser APIs for speech recognition and voice synthesis. The final product will feature more advanced, lifelike voices, better response matching, and support for complex branching conversations.',
  },
  {
    title: 'Ready to Start?',
    content: 'Close this tutorial to begin the practice session. You can reset your progress at any time.',
  },
];

export default function TutorialOverlay({ show, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Don't render if the 'show' prop is false
  if (!show) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // On the last step, the button calls onClose
    }
  };
  
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const currentSlide = tutorialSteps[currentStep];

  return (
    <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center text-center backdrop-blur-sm p-4">
      <div className="p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">{currentSlide.title}</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">{currentSlide.content}</p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
            {tutorialSteps.map((_, index) => (
                <div 
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                />
            ))}
        </div>

        <button 
          onClick={handleNext} 
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-colors w-full md:w-auto"
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}