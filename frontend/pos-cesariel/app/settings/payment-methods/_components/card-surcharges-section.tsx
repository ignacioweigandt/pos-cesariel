'use client';

import { CreditCardIcon } from '@heroicons/react/24/outline';
import { CustomInstallmentsManager } from '@/features/configuracion';
import { CardConfigItem } from './card-config-item';
import { SingleCardConfig } from './single-card-config';

interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

interface CardSurchargesSectionProps {
  configs: PaymentConfig[];
  onUpdateSurcharge: (id: number, surcharge: number) => void;
  onToggleConfig: (id: number) => void;
}

export function CardSurchargesSection({
  configs,
  onUpdateSurcharge,
  onToggleConfig
}: CardSurchargesSectionProps) {
  const bancarizadasConfigs = configs
    .filter(config => config.card_type === 'bancarizadas')
    .sort((a, b) => a.installments - b.installments);

  const noBancarizadasConfig = configs.find(
    config => config.card_type === 'no_bancarizadas'
  );

  const naranjaConfig = configs.find(
    config => config.card_type === 'tarjeta_naranja'
  );

  const noSurchargeConfigs = configs.filter(
    config => config.payment_type === 'efectivo' || config.payment_type === 'transferencia'
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCardIcon className="h-6 w-6 text-blue-500 mr-3" />
        <h2 className="text-lg font-medium text-black">Recargos por Tarjeta</h2>
        <p className="text-sm text-black ml-3">Configura los recargos que aparecen en el POS</p>
      </div>

      <div className="space-y-6">
        {/* Tarjetas Bancarizadas */}
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Tarjetas Bancarizadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {bancarizadasConfigs.map((config) => (
              <CardConfigItem
                key={config.id}
                installments={config.installments}
                surchargePercentage={config.surcharge_percentage}
                isActive={config.is_active}
                onUpdateSurcharge={(surcharge) => onUpdateSurcharge(config.id, surcharge)}
                onToggle={() => onToggleConfig(config.id)}
                color="green"
              />
            ))}
          </div>
        </div>

        {/* Cuotas Personalizadas - Bancarizadas */}
        <div className="mt-6">
          <CustomInstallmentsManager
            cardType="bancarizadas"
            title="Cuotas Personalizadas - Tarjetas Bancarizadas"
            color="green"
          />
        </div>

        {/* Tarjetas No Bancarizadas */}
        {noBancarizadasConfig && (
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Tarjetas No Bancarizadas
            </h3>
            <SingleCardConfig
              title="1 cuota"
              description="Tarjetas no bancarizadas"
              surchargePercentage={noBancarizadasConfig.surcharge_percentage}
              isActive={noBancarizadasConfig.is_active}
              onUpdateSurcharge={(surcharge) => onUpdateSurcharge(noBancarizadasConfig.id, surcharge)}
              onToggle={() => onToggleConfig(noBancarizadasConfig.id)}
              color="orange"
            />
          </div>
        )}

        {/* Cuotas Personalizadas - No Bancarizadas */}
        <div className="mt-6">
          <CustomInstallmentsManager
            cardType="no_bancarizadas"
            title="Cuotas Personalizadas - Tarjetas No Bancarizadas"
            color="orange"
          />
        </div>

        {/* Tarjeta Naranja */}
        {naranjaConfig && (
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Tarjeta Naranja
            </h3>
            <SingleCardConfig
              title="1 cuota"
              description="Tarjeta Naranja"
              surchargePercentage={naranjaConfig.surcharge_percentage}
              isActive={naranjaConfig.is_active}
              onUpdateSurcharge={(surcharge) => onUpdateSurcharge(naranjaConfig.id, surcharge)}
              onToggle={() => onToggleConfig(naranjaConfig.id)}
              color="purple"
            />
          </div>
        )}

        {/* Métodos sin recargo */}
        {noSurchargeConfigs.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-black mb-4">Métodos sin Recargo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {noSurchargeConfigs.map((config) => (
                <div key={config.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black capitalize">{config.payment_type}</h4>
                    <p className="text-sm text-black">{config.description}</p>
                  </div>
                  <div className="text-sm font-medium text-green-600">0% recargo</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
