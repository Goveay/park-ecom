import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ChevronRight, Home as HomeIcon} from 'lucide-react';
import {COMPANY, LEGAL_DOCUMENTS, getLegalDocument} from '@/lib/legal';

export function generateStaticParams() {
    return LEGAL_DOCUMENTS.map((document) => ({slug: document.slug}));
}

export async function generateMetadata({params}: PageProps<'/legal/[slug]'>): Promise<Metadata> {
    const {slug} = await params;
    const document = getLegalDocument(slug);

    if (!document) {
        return {title: 'Sayfa Bulunamadı'};
    }

    return {
        title: document.title,
        description: document.description,
        alternates: {
            canonical: `/legal/${document.slug}`,
        },
    };
}

export default async function LegalPage({params}: PageProps<'/legal/[slug]'>) {
    const {slug} = await params;
    const document = getLegalDocument(slug);

    if (!document) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="mx-auto max-w-3xl">
                <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto no-scrollbar whitespace-nowrap">
                    <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <HomeIcon className="h-4 w-4"/>
                        <span>Anasayfa</span>
                    </Link>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-40"/>
                    <span>Yasal</span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-40"/>
                    <span className="text-foreground font-medium">{document.title}</span>
                </nav>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{document.title}</h1>
                <p className="mt-3 text-sm text-muted-foreground">Son güncelleme: {document.updatedAt}</p>

                <div className="prose prose-sm sm:prose-base mt-8 max-w-none text-muted-foreground">
                    {document.sections.map((section, index) => (
                        <section key={index} className="mb-8">
                            {section.heading && (
                                <h2 className="mb-3 text-lg font-bold text-foreground">{section.heading}</h2>
                            )}
                            {section.paragraphs?.map((paragraph, paragraphIndex) => (
                                <p key={paragraphIndex}>{paragraph}</p>
                            ))}
                            {section.list && (
                                <ul>
                                    {section.list.map((item, itemIndex) => (
                                        <li key={itemIndex}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                <div className="mt-10 rounded-xl border border-border/60 bg-muted/30 p-5 text-sm">
                    <p className="mb-2 font-bold text-foreground">Satıcı Bilgileri</p>
                    <p className="text-muted-foreground">{COMPANY.legalName}</p>
                    <p className="text-muted-foreground">{COMPANY.address}</p>
                    <p className="text-muted-foreground">Telefon: {COMPANY.phone}</p>
                    <p className="text-muted-foreground">E-posta: {COMPANY.email}</p>
                    {COMPANY.taxOffice && (
                        <p className="text-muted-foreground">Vergi Dairesi: {COMPANY.taxOffice}</p>
                    )}
                    {COMPANY.taxNumber && (
                        <p className="text-muted-foreground">Vergi No: {COMPANY.taxNumber}</p>
                    )}
                    {COMPANY.mersis && (
                        <p className="text-muted-foreground">MERSİS: {COMPANY.mersis}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
