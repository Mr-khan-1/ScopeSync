import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ScopePage } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', fontSize: 10.5, color: '#1a1a1a', lineHeight: 1.45 },
  header: { marginBottom: 28, borderBottom: '2pt solid #2563eb', paddingBottom: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontSize: 9, color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2 },
  docTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  metaGrid: { flexDirection: 'row', marginTop: 12, gap: 28 },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 7.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  metaValue: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, borderBottom: '0.5pt solid #e2e8f0', paddingBottom: 4 },
  itemRow: { flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start', paddingLeft: 2 },
  bullet: { width: 14, fontSize: 10, color: '#2563eb', marginTop: 0.5 },
  itemText: { flex: 1, lineHeight: 1.4, color: '#334155' },
  itemPrice: { width: 90, textAlign: 'right', fontWeight: 'bold', color: '#0f172a', fontSize: 10 },
  infoBox: { backgroundColor: '#f8fafc', borderRadius: 4, padding: 10, marginBottom: 14, borderLeft: '2pt solid #2563eb' },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { width: 100, fontSize: 9, color: '#64748b' },
  infoValue: { flex: 1, fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  budgetBox: { marginTop: 8, padding: 14, backgroundColor: '#eff6ff', borderRadius: 4, border: '1pt solid #bfdbfe' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  budgetLabel: { fontSize: 9.5, color: '#475569' },
  budgetValue: { fontSize: 9.5, fontWeight: 'bold', color: '#0f172a' },
  budgetTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1pt solid #2563eb' },
  budgetTotalLabel: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  budgetTotalValue: { fontSize: 11, fontWeight: 'bold', color: '#2563eb' },
  changeOrderSection: { marginTop: 20, paddingTop: 14, borderTop: '1.5pt solid #2563eb' },
  changeOrderTitle: { fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 },
  changeOrderSubtitle: { fontSize: 8.5, color: '#64748b', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 6, borderBottom: '0.5pt solid #cbd5e1' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: '0.5pt solid #e2e8f0' },
  colDesc: { flex: 3.5, fontSize: 8.5 },
  colDate: { flex: 1.2, fontSize: 8.5, textAlign: 'center', color: '#64748b' },
  colPrice: { flex: 1.3, fontSize: 8.5, textAlign: 'right', fontWeight: 'bold' },
  colHeader: { fontSize: 7.5, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  signatureSection: { marginTop: 30, borderTop: '0.5pt solid #cbd5e1', paddingTop: 18 },
  signatureTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 14, color: '#0f172a' },
  signatureGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 50 },
  signatureBlock: { width: '42%' },
  signatureLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  signatureLine: { borderBottom: '0.5pt solid #334155', height: 32, marginBottom: 4, justifyContent: 'flex-end', paddingBottom: 2, position: 'relative' },
  signatureName: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
  signatureDate: { fontSize: 8, color: '#64748b', marginTop: 2 },
  stampImage: { width: 85, height: 42, objectFit: 'contain', position: 'absolute', bottom: 2, right: 0, opacity: 0.65 },
  disclaimer: { position: 'absolute', bottom: 22, left: 45, right: 45, fontSize: 6.5, color: '#94a3b8', textAlign: 'center', borderTop: '0.5pt solid #e2e8f0', paddingTop: 5 },
  pageNumber: { position: 'absolute', bottom: 22, right: 45, fontSize: 7.5, color: '#94a3b8' },
  outOfScopeBox: { backgroundColor: '#fef2f2', borderRadius: 3, padding: 8, marginTop: 6, borderLeft: '2pt solid #ef4444' },
  outOfScopeTitle: { fontSize: 9, fontWeight: 'bold', color: '#dc2626', marginBottom: 4 },
  assumptionBox: { backgroundColor: '#fffbeb', borderRadius: 3, padding: 8, marginTop: 6, borderLeft: '2pt solid #f59e0b' },
  assumptionTitle: { fontSize: 9, fontWeight: 'bold', color: '#d97706', marginBottom: 4 },
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brand}>ScopeSync Agreement</Text>
              <Text style={styles.docTitle}>{scope.title}</Text>
              <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>STATEMENT OF WORK & PROJECT SCOPE</Text>
            </View>
          </View>
          <View style={styles.metaGrid}>
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
              <Text style={styles.metaValue}>{scope.clientName}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>{scope.status === 'locked' ? 'Signed & Active' : scope.status}</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 9.5, color: '#475569', marginBottom: 16, lineHeight: 1.5 }}>
          This Statement of Work ("SOW") is made effective as of the date signed below, by and between the Client ({scope.clientName}) and the {freelancerLabel} ({scope.freelancerName}). The parties agree to the following scope of services, deliverables, and terms.
        </Text>

        {(scope.timeline || scope.revisionPolicy) && (
          <View style={styles.infoBox}>
            {scope.timeline && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Timeline</Text>
                <Text style={styles.infoValue}>{scope.timeline}</Text>
              </View>
            )}
            {scope.revisionPolicy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Revision Policy</Text>
                <Text style={styles.infoValue}>{scope.revisionPolicy}</Text>
              </View>
            )}
          </View>
        )}

        {inScope.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Scope</Text>
            {inScope.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.itemText}>{item.text}</Text>
                {isFixed && item.estimatedPrice ? (
                  <Text style={styles.itemPrice}>{formatCurrency(item.estimatedPrice, scope.currency)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {outOfScope.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Out of Scope</Text>
            <View style={styles.outOfScopeBox}>
              <Text style={styles.outOfScopeTitle}>The following items are explicitly excluded from this agreement:</Text>
              {outOfScope.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.bullet}>×</Text>
                  <Text style={styles.itemText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {assumptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assumptions</Text>
            <View style={styles.assumptionBox}>
              <Text style={styles.assumptionTitle}>This agreement assumes the following:</Text>
              {assumptions.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <Text style={styles.bullet}>◦</Text>
                  <Text style={styles.itemText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetBox}>
            {isFixed ? (
              <>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Original Project Budget</Text>
                  <Text style={styles.budgetValue}>{formatCurrency(originalTotal, scope.currency)}</Text>
                </View>
                {changeOrders.length > 0 && changeOrders.map((co, i) => (
                  <View key={i} style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Change Order: {co.description.substring(0, 35)}...</Text>
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
            <Text style={styles.changeOrderSubtitle}>The following changes have been approved by both parties and are now part of this agreement.</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc, styles.colHeader]}>Description</Text>
              <Text style={[styles.colDate, styles.colHeader]}>Date Approved</Text>
              <Text style={[styles.colPrice, styles.colHeader]}>Approved Price</Text>
            </View>
            {changeOrders.map((co, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDesc}>{co.description}</Text>
                <Text style={styles.colDate}>{formatDate(co.approvedAt)}</Text>
                <Text style={styles.colPrice}>{formatCurrency(co.approvedPrice, scope.currency)}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
              <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Change Order Subtotal</Text>
              <Text style={styles.colDate}></Text>
              <Text style={[styles.colPrice, { color: '#2563eb' }]}>{formatCurrency(changeOrderTotal, scope.currency)}</Text>
            </View>
          </View>
        )}

        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Agreement Signatures</Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 12 }}>
            Both parties have reviewed and agreed to the terms above.
          </Text>
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
                <Text style={styles.signatureDate}>{formatDate(scope.clientSignature.signedAt)}</Text>
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
                <Text style={styles.signatureDate}>{formatDate(scope.signature.signedAt)}</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This is an informal agreement record for tracking purposes, not a certified legal e-signature. 
          ScopeSync facilitates scope clarity between parties but does not provide legal advice or binding contract enforcement.
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};
