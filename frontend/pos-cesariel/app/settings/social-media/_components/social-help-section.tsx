'use client';

export function SocialHelpSection() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-black mb-4">¿Cómo se utilizan?</h2>
      <div className="space-y-3 text-sm text-black">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <p>Las redes sociales configuradas aparecerán en el footer del e-commerce</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <p>Solo las redes sociales marcadas como "activas" serán visibles</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <p>El orden de visualización determina la secuencia en que aparecen</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <p>Asegúrate de usar URLs completas (incluyendo https://)</p>
        </div>
      </div>
    </div>
  );
}
