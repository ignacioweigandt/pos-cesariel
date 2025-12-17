'use client';

interface SocialPlatform {
  name: string;
  icon: string;
  placeholder: string;
}

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelect: (platform: SocialPlatform) => void;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { name: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/tu-pagina' },
  { name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/tu-usuario' },
  { name: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/tu-usuario' },
  { name: 'WhatsApp', icon: '📱', placeholder: 'https://wa.me/5491123456789' },
  { name: 'YouTube', icon: '📺', placeholder: 'https://youtube.com/tu-canal' },
  { name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@tu-usuario' },
  { name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/tu-empresa' },
  { name: 'Website', icon: '🌐', placeholder: 'https://tu-sitio-web.com' },
];

export function PlatformSelector({ selectedPlatform, onSelect }: PlatformSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Plataforma
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SOCIAL_PLATFORMS.map((platform) => (
          <button
            key={platform.name}
            onClick={() => onSelect(platform)}
            className={`p-3 border rounded-lg text-center transition-colors ${
              selectedPlatform === platform.name
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">{platform.icon}</div>
            <div className="text-sm font-medium text-black">{platform.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
