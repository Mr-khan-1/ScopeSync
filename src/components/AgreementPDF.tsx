import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ScopePage } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', lineHeight: 1.35 },
  header: { marginBottom: 15, borderBottom: '1.5pt solid #2563eb', paddingBottom: 10 },
  brand: { fontSize: 8, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  docTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 4, marginBottom: 8, lineHeight: 1.2 },
  subTitle: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  metaBox: { flexDirection: 'row', backgroundColor: '#f8fafc', border: '0.5pt solid #e2e8f0', borderRadius: 4, padding: 10, marginBottom: 15 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  
  intro: { fontSize: 8.5, color: '#475569', marginBottom: 15, lineHeight: 1.4 },
  
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoBlock: { flex: 1, backgroundColor: '#f1f5f9', padding: 8, borderRadius: 3, borderLeft: '1.5pt solid #2563eb' },
  infoLabel: { fontSize: 7.5, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 8.5, fontWeight: 'bold', color: '#0f172a' },

  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, borderBottom: '0.5pt solid #e2e8f0', paddingBottom: 2 },
  itemRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-start', paddingLeft: 2 },
  bullet: { width: 10, fontSize: 9, color: '#2563eb' },
  itemText: { flex: 1, color: '#334155' },
  
  budgetBox: { marginTop: 4, padding: 10, backgroundColor: '#eff6ff', borderRadius: 3, border: '0.5pt solid #bfdbfe' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  budgetLabel: { fontSize: 8.5, color: '#475569' },
  budgetValue: { fontSize: 8.5, fontWeight: 'bold', color: '#0f172a' },
  budgetTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '0.5pt solid #2563eb' },
  budgetTotalLabel: { fontSize: 9.5, fontWeight: 'bold', color: '#0f172a' },
  budgetTotalValue: { fontSize: 9.5, fontWeight: 'bold', color: '#2563eb' },
  
  changeOrderSection: { marginTop: 12, paddingTop: 10, borderTop: '1pt solid #2563eb' },
  changeOrderTitle: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', marginBottom: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderBottom: '0.5pt solid #cbd5e1' },
  tableRow: { flexDirection: 'row', padding: 4, borderBottom: '0.5pt solid #e2e8f0' },
  colDesc: { flex: 3.5, fontSize: 8 },
  colDate: { flex: 1.2, fontSize: 8, textAlign: 'center', color: '#64748b' },
  colPrice: { flex: 1.3, fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
  colHeader: { fontSize: 7, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  
  signatureSection: { marginTop: 20, borderTop: '0.5pt solid #cbd5e1', paddingTop: 15 },
  signatureTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, color: '#0f172a' },
  signatureGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 30 },
  signatureBlock: { width: '45%' },
  signatureLabel: { fontSize: 7.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  signatureLine: { borderBottom: '0.5pt solid #334155', height: 28, marginBottom: 3, justifyContent: 'flex-end', paddingBottom: 2, position: 'relative' },
  signatureName: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  signatureDate: { fontSize: 7, color: '#64748b' },
  stampImage: { width: 70, height: 35, objectFit: 'contain', position: 'absolute', bottom: 2, right: 0, opacity: 0.7 },
  
  disclaimer: { position: 'absolute', bottom: 15, left: 30, right: 30, fontSize: 6, color: '#94a3b8', textAlign: 'center', borderTop: '0.5pt solid #e2e8f0', paddingTop: 4 },
  pageNumber: { position: 'absolute', bottom: 15, right: 30, fontSize: 7, color: '#94a3b8' },
});

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', PKR: 'Rs. ', AUD: 'A$', CAD: 'C$', INR: '₹', JPY: '¥'
  };
  const symbol = symbols[currency] || currency + ' ';
  return symbol + amount.toLocaleString('en-US');
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const AgreementPDF = ({ scope }: { scope: ScopePage }) => {
  const inScope = scope.items.filter(i => i.category === 'in-scope');
  const outOfScope = scope.items.filter(i => i.category === 'out-of-scope');
  const assumptions = scope.items.filter(i => i.category === 'assumption');
  const isFixed = scope.budgetType === 'fixed_total';
  const originalTotal = isFixed 
    ? (scope.totalBudget || scope.items.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0))
    : 0;
  const changeOrders = scope.changeOrders || [];
  const changeOrderTotal = changeOrders.reduce((sum, co) => sum + co.approvedPrice, 0);
  const grandTotal = originalTotal + changeOrderTotal;

  const isAgency = scope.signature?.type === 'agency';
  const freelancerLabel = isAgency ? 'Agency' : 'Freelancer';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>ScopeSync Agreement</Text>
          <Text style={styles.docTitle}>{scope.title}</Text>
          <Text style={styles.subTitle}>STATEMENT OF WORK & PROJECT SCOPE</Text>
        </View>

        <View style={styles.metaBox}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formatDate(scope.lockedAt || scope.createdAt)}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{freelancerLabel}</Text>
            <Text style={styles.metaValue}>{scope.freelancerName}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{scope.clientName || 'Pending'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{scope.status === 'locked' ? 'Signed & Active' : 'Draft'}</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          This Statement of Work ("SOW") is made effective as of the date signed below, by and between {scope.clientName || 'the Client'} and {scope.freelancerName} ({freelancerLabel}). The parties agree to the following scope of services, deliverables, and terms.
        </Text>

        {(scope.timeline || scope.revisionPolicy) && (
          <View style={styles.infoGrid}>
            {scope.timeline && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Timeline</Text>
                <Text style={styles.infoValue}>{scope.timeline}</Text>
              </View>
            )}
            {scope.revisionPolicy && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Revision Policy</Text>
                <Text style={styles.infoValue}>{scope.revisionPolicy}</Text>
              </View>
            )}
          </View>
        )}

        {inScope.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Scope Deliverables</Text>
            {inScope.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        {outOfScope.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Out of Scope Exclusions</Text>
            {outOfScope.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={[styles.bullet, { color: '#ef4444' }]}>×</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        {assumptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Assumptions</Text>
            {assumptions.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={[styles.bullet, { color: '#f59e0b' }]}>◦</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Budget</Text>
          <View style={styles.budgetBox}>
            {isFixed ? (
              <>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Original Project Budget</Text>
                  <Text style={styles.budgetValue}>{formatCurrency(originalTotal, scope.currency)}</Text>
                </View>
                {changeOrders.length > 0 && changeOrders.map((co, i) => (
                  <View key={i} style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Change Order: {co.description}</Text>
                    <Text style={styles.budgetValue}>+ {formatCurrency(co.approvedPrice, scope.currency)}</Text>
                  </View>
                ))}
                <View style={styles.budgetTotal}>
                  <Text style={styles.budgetTotalLabel}>Total Agreement Value</Text>
                  <Text style={styles.budgetTotalValue}>{formatCurrency(grandTotal, scope.currency)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.budgetTotal}>
                <Text style={styles.budgetTotalLabel}>Hourly Rate</Text>
                <Text style={styles.budgetTotalValue}>{formatCurrency(scope.hourlyRate || 0, scope.currency)}/hr</Text>
              </View>
            )}
          </View>
        </View>

        {changeOrders.length > 0 && (
          <View style={styles.changeOrderSection}>
            <Text style={styles.changeOrderTitle}>Appendix A — Approved Change Orders</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc, styles.colHeader]}>Description</Text>
              <Text style={[styles.colDate, styles.colHeader]}>Date</Text>
              <Text style={[styles.colPrice, styles.colHeader]}>Price</Text>
            </View>
            {changeOrders.map((co, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDesc}>{co.description}</Text>
                <Text style={styles.colDate}>{formatDate(co.approvedAt)}</Text>
                <Text style={styles.colPrice}>{formatCurrency(co.approvedPrice, scope.currency)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Signatures</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Client</Text>
              <View style={styles.signatureLine}>
                {scope.clientSignature ? (
                  <Text style={styles.signatureName}>{scope.clientSignature.signerName}</Text>
                ) : (
                  <Text style={{ color: '#94a3b8', fontSize: 10 }}>Not signed</Text>
                )}
              </View>
              {scope.clientSignature && (
                <Text style={styles.signatureDate}>Signed: {formatDate(scope.clientSignature.signedAt)}</Text>
              )}
            </View>

            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>{freelancerLabel}</Text>
              <View style={styles.signatureLine}>
                {scope.signature ? (
                  <>
                    <Text style={styles.signatureName}>{scope.signature.signerName}</Text>
                    {scope.signature.stampDataUrl && (
                      <Image src={scope.signature.stampDataUrl} style={styles.stampImage} />
                    )}
                  </>
                ) : (
                  <Text style={{ color: '#94a3b8', fontSize: 10 }}>Not signed</Text>
                )}
              </View>
              {scope.signature && (
                <Text style={styles.signatureDate}>Signed: {formatDate(scope.signature.signedAt)}</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This is an informal agreement record generated by ScopeSync. It is not a certified legal e-signature or binding contract.
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};
