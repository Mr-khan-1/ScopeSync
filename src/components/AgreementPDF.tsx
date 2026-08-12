import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ScopePage } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottom: '1 solid #eee', paddingBottom: 10 },
  companyName: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  title: { fontSize: 20, marginBottom: 20, color: '#111' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#444', textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  bullet: { width: 15, fontSize: 14 },
  itemText: { flex: 1, lineHeight: 1.4 },
  itemPrice: { width: 60, textAlign: 'right', fontWeight: 'bold' },
  budgetBox: { marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 4 },
  budgetText: { fontSize: 14, fontWeight: 'bold' },
  signatureSection: { marginTop: 40, borderTop: '1 solid #eee', paddingTop: 20 },
  signatureRow: { flexDirection: 'row', justifyContent: 'space-between' },
  signatureBlock: { width: '45%', position: 'relative' },
  signatureLine: { borderBottom: '1 solid #333', height: 40, marginBottom: 5, justifyContent: 'flex-end', paddingBottom: 2 },
  stampImage: { width: 100, height: 50, objectFit: 'contain', position: 'absolute', bottom: 10, right: 0, opacity: 0.8 },
  disclaimer: { fontSize: 8, color: '#888', marginTop: 10, fontStyle: 'italic' },
});

export const AgreementPDF = ({ scope }: { scope: ScopePage }) => {
  const inScope = scope.items.filter(i => i.category === 'in-scope');
  const outOfScope = scope.items.filter(i => i.category === 'out-of-scope');
  const assumptions = scope.items.filter(i => i.category === 'assumption');
  
  const isFixed = scope.budgetType === 'fixed_total';
  const totalCost = isFixed ? scope.items.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{scope.freelancerName}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text>Date: {new Date(scope.lockedAt || scope.createdAt).toLocaleDateString()}</Text>
            <Text>Client: {scope.clientName}</Text>
          </View>
        </View>

        <Text style={styles.title}>{scope.title}</Text>

        {(scope.timeline || scope.revisionPolicy) && (
          <View style={styles.section}>
            {scope.timeline && <Text style={{ marginBottom: 5 }}><Text style={{ fontWeight: 'bold' }}>Timeline:</Text> {scope.timeline}</Text>}
            {scope.revisionPolicy && <Text><Text style={{ fontWeight: 'bold' }}>Revisions:</Text> {scope.revisionPolicy}</Text>}
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
                  <Text style={styles.itemPrice}>${item.estimatedPrice}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {outOfScope.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Out of Scope</Text>
            {outOfScope.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        {assumptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assumptions</Text>
            {assumptions.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.budgetBox}>
          {isFixed ? (
            <Text style={styles.budgetText}>Total Project Budget: ${totalCost}</Text>
          ) : (
            <Text style={styles.budgetText}>Hourly Rate: ${scope.hourlyRate}/hr</Text>
          )}
        </View>

        {scope.signature && (
          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Agreement Signatures</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine}>
                  <Text>{scope.signature.signerName}</Text>
                  {scope.signature.stampDataUrl && (
                    <Image src={scope.signature.stampDataUrl} style={styles.stampImage} />
                  )}
                </View>
                <Text>Signed By</Text>
                <Text style={{ fontSize: 10, marginTop: 4 }}>{new Date(scope.signature.signedAt).toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.disclaimer}>This is an informal agreement record for tracking purposes, not a certified legal e-signature.</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
