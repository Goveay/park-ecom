'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MapPin, Truck, CreditCard, Edit } from 'lucide-react';
import Link from 'next/link';
import { useCheckout } from '../checkout-provider';
import { placeOrder as placeOrderAction } from '../actions';
import { Price } from '@/components/commerce/price';

interface ReviewStepProps {
  onEditStep: (step: 'shipping' | 'delivery' | 'payment') => void;
}

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { order, paymentMethods, selectedPaymentMethodCode } = useCheckout();
  const [loading, setLoading] = useState(false);
  const [salesAgreement, setSalesAgreement] = useState(false);
  const [privacyAgreement, setPrivacyAgreement] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.code === selectedPaymentMethodCode
  );

  const agreementsAccepted = salesAgreement && privacyAgreement;
  const isOrderReady =
    Boolean(order.shippingAddress) &&
    Boolean(order.shippingLines?.length) &&
    Boolean(selectedPaymentMethodCode);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethodCode || !agreementsAccepted) return;

    setLoading(true);
    try {
      await placeOrderAction(selectedPaymentMethodCode, true);
    } catch (error) {
      // Check if this is a Next.js redirect (which is expected)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        // This is a redirect, not an error - let it propagate
        throw error;
      }
      console.error('Error placing order:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Siparişinizi gözden geçirin</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Teslimat Adresi</h4>
          </div>
          {order.shippingAddress ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.streetLine1}
                  {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep('shipping')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Teslimat adresi seçilmedi</p>
          )}
        </div>

        {/* Delivery Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Teslimat Yöntemi</h4>
          </div>
          {order.shippingLines && order.shippingLines.length > 0 ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingLines[0].shippingMethod.name}</p>
                <p className="text-muted-foreground">
                  {order.shippingLines[0].priceWithTax === 0
                    ? 'Ücretsiz'
                    : <Price value={order.shippingLines[0].priceWithTax} currencyCode={order.currencyCode} />}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep('delivery')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Teslimat yöntemi seçilmedi</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Ödeme Yöntemi</h4>
          </div>
          {selectedPaymentMethod ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{selectedPaymentMethod.name}</p>
                {selectedPaymentMethod.description && (
                  <p className="text-muted-foreground mt-1">
                    {selectedPaymentMethod.description}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep('payment')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Düzenle
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ödeme yöntemi seçilmedi</p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="sales-agreement"
            checked={salesAgreement}
            onCheckedChange={(checked) => setSalesAgreement(checked === true)}
          />
          <label htmlFor="sales-agreement" className="text-sm leading-relaxed">
            <Link
              href="/legal/mesafeli-satis"
              target="_blank"
              className="font-medium underline underline-offset-2"
            >
              Mesafeli Satış Sözleşmesi
            </Link>{' '}
            ve{' '}
            <Link
              href="/legal/on-bilgilendirme"
              target="_blank"
              className="font-medium underline underline-offset-2"
            >
              Ön Bilgilendirme Formu
            </Link>
            &apos;nu okudum ve onaylıyorum.
          </label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy-agreement"
            checked={privacyAgreement}
            onCheckedChange={(checked) => setPrivacyAgreement(checked === true)}
          />
          <label htmlFor="privacy-agreement" className="text-sm leading-relaxed">
            <Link
              href="/legal/kvkk"
              target="_blank"
              className="font-medium underline underline-offset-2"
            >
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum.
          </label>
        </div>
      </div>

      <Button
        onClick={handlePlaceOrder}
        disabled={loading || !isOrderReady || !agreementsAccepted}
        size="lg"
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Siparişi Tamamla
      </Button>

      {!isOrderReady && (
        <p className="text-sm text-destructive text-center">
          Sipariş vermeden önce tüm adımları tamamlayın
        </p>
      )}

      {isOrderReady && !agreementsAccepted && (
        <p className="text-sm text-muted-foreground text-center">
          Siparişi tamamlamak için sözleşmeleri onaylayın
        </p>
      )}
    </div>
  );
}
