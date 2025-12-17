'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { configApi, ecommerceAdvancedApi } from '@/lib/api';

interface EcommerceConfig {
  id?: number;
  store_name: string;
  store_description: string;
  store_logo: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_percentage: number;
}

export default function StoreLogoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState<EcommerceConfig>({
    store_name: '',
    store_description: '',
    store_logo: null,
    contact_email: '',
    contact_phone: '',
    address: '',
    currency: 'ARS',
    tax_percentage: 0
  });

  // Cargar configuración actual
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const response = await configApi.getEcommerceConfig();
        if (response.data) {
          setConfig(response.data);
        }
      } catch (error) {
        console.error('Error loading e-commerce config:', error);
        toast.error('Error al cargar la configuración de la tienda');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Manejar upload de logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Crear FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'store-logo');

      // Upload usando el endpoint específico para logo
      const response = await fetch('http://localhost:8000/config/upload-logo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error uploading logo');
      }

      const result = await response.json();
      
      // Actualizar estado local
      setConfig(prev => ({
        ...prev,
        store_logo: result.url
      }));

      toast.success('Logo subido exitosamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar logo
  const handleRemoveLogo = async () => {
    try {
      setConfig(prev => ({
        ...prev,
        store_logo: null
      }));
      toast.success('Logo eliminado');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Error al eliminar el logo');
    }
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (config.id) {
        await configApi.updateEcommerceConfig(config);
      } else {
        await configApi.createEcommerceConfig(config);
      }
      
      toast.success('Configuración guardada exitosamente');
      router.push('/settings');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black">Gestión de Logo</h1>
            <p className="text-black">Configurar el logo de tu tienda online</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información de la tienda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Información de la Tienda</CardTitle>
              <CardDescription>
                Configura el nombre y descripción de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store_name" className="text-black">Nombre de la Tienda</Label>
                <Input
                  id="store_name"
                  value={config.store_name}
                  onChange={(e) => setConfig(prev => ({ ...prev, store_name: e.target.value }))}
                  placeholder="Mi Tienda Online"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="store_description" className="text-black">Descripción</Label>
                <Textarea
                  id="store_description"
                  value={config.store_description}
                  onChange={(e) => setConfig(prev => ({ ...prev, store_description: e.target.value }))}
                  placeholder="Descripción de tu tienda..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Logo de la Tienda</CardTitle>
              <CardDescription>
                Sube el logo de tu tienda. Se mostrará en el header del e-commerce.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vista previa del logo actual */}
              {config.store_logo ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-black">Logo Actual:</div>
                  <div className="relative inline-block">
                    <Image
                      src={config.store_logo}
                      alt="Logo de la tienda"
                      width={200}
                      height={100}
                      className="object-contain border rounded-lg bg-gray-50 p-4"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveLogo}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <PhotoIcon className="h-12 w-12 text-black mx-auto mb-4" />
                  <p className="text-black">No hay logo configurado</p>
                </div>
              )}

              {/* Upload de nuevo logo */}
              <div>
                <Label htmlFor="logo-upload" className="text-black">
                  {config.store_logo ? 'Cambiar Logo' : 'Subir Logo'}
                </Label>
                <div className="mt-1">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    {isUploading ? 'Subiendo...' : (config.store_logo ? 'Cambiar Logo' : 'Subir Logo')}
                  </Button>
                </div>
                <p className="text-xs text-black mt-1">
                  Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Información de Contacto</CardTitle>
              <CardDescription>
                Información que se mostrará en la tienda online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email" className="text-black">Email de Contacto</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={config.contact_email}
                    onChange={(e) => setConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contacto@mitienda.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone" className="text-black">Teléfono de Contacto</Label>
                  <Input
                    id="contact_phone"
                    value={config.contact_phone}
                    onChange={(e) => setConfig(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+54 9 11 1234-5678"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-black">Dirección</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Buenos Aires, Argentina"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Link href="/settings">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}