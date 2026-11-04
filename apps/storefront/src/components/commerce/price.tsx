'use client';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({value, currencyCode = 'USD'}: PriceProps) {
    return (
        <>
            {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currencyCode,
            }).format(value / 100)}
        </>
    );
}
