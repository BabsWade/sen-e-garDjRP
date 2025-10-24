import React from "react";

const TailwindTest: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Tailwind fonctionne ✅
      </h1>
      <p className="text-gray-700 text-lg">
        Si tu vois ce message stylé, Tailwind est bien actif !
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Bouton Tailwind
      </button>
    </div>
  );
};

export default TailwindTest;
