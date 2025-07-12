import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderColor: '#e0e0e0',
    paddingBottom: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#555',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receivedFrom: {
    width: '60%',
  },
  receiptDetails: {
    width: '40%',
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  valueText: {
    fontSize: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 10,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '33%',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  amountInWords: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 15,
  },
  amountWordsText: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signatureLine: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderStyle: 'line',
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 8,
    color: '#777',
    width: '20%',
    alignSelf: 'flex-end',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: 1,
    borderColor: '#e0e0e0',
    fontSize: 8,
    color: '#777',
    textAlign: 'center',
  },
});

// MRviewPDF component
function MRviewPDF({ data }) {
  const receiptData = {
    companyName: data?.companyName || 'BUSTER GRUH UDHYOG',
    address:
      data?.address ||
      'PLOT NO-172, JAY JAGDISH NAGAR SOCIETY - 1, MATAVADI, VARACHHA ROAD, VARACHHA Surat, 395006, Gujarat, India',
    phone: data?.phone || '9714441022',
    gstin: data?.gstin || '24AKKPR2844R1ZE',
    pan: data?.pan || 'AKKPR2844R',
    receivedFrom: {
      name: data?.ptmsstr || data?.receivedFrom?.name || 'MARUTI SALES AGENCY',
      gstin: data?.receivedFrom?.gstin || '24AYYPR43026126',
      pan: data?.receivedFrom?.pan || 'AYYPR43026',
    },
    receiptNo: data?.Mrsno || '2025-26-92',
    date: data?.MrDate || '03 Jul 2025',
    transactions:
      data?.transactions || [
        {
          date: data?.MrDate || '03 Jul 2025',
          description: `Sales#${data?.Mrsno || 'BGU-25'}`,
          amount: data?.MrAmt || 80000,
        },
      ],
    amountInWords: data?.amountInWords || 'Eighty Thousand Rupees Only',
    totalAmount: data?.totalAmount || data?.MrAmt || 80000,
    // generatedBy: data?.generatedBy || 'https://hisab.co',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src="/Uploads/Logo.png" />
            <View>
              <Text style={styles.companyName}>{receiptData.companyName}</Text>
              <Text style={styles.companyDetails}>{receiptData.address}</Text>
              <Text style={styles.companyDetails}>
                Phone: {receiptData.phone} | GSTIN: {receiptData.gstin} | PAN: {receiptData.pan}
              </Text>
            </View>
          </View>
        </View>

        {/* Received From and Receipt Header */}
        <View style={styles.headerRow}>
          <View style={styles.receivedFrom}>
            <Text style={styles.labelText}>Received From</Text>
            <Text style={[styles.valueText, { fontWeight: 'bold' }]}>
              {receiptData.receivedFrom.name}
            </Text>
            <Text style={styles.valueText}>
              GSTIN: {receiptData.receivedFrom.gstin} | PAN: {receiptData.receivedFrom.pan}
            </Text>
          </View>
          <View style={styles.receiptDetails}>
            <Text style={[styles.labelText, { textAlign: 'right' }]}>Receipt</Text>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={[styles.valueText, { width: 60 }]}>Ref. No.:</Text>
              <Text style={styles.valueText}>{receiptData.receiptNo}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.valueText, { width: 60 }]}>Receipt Date:</Text>
              <Text style={styles.valueText}>{receiptData.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider}></View>

        <Text style={[styles.valueText, { marginBottom: 10 }]}>
          It is acknowledged that we have received for the following transactions
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text>Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Description</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>Amount</Text>
            </View>
          </View>
          {receiptData.transactions.map((transaction, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text>{transaction.date}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{transaction.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{transaction.amount.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.amountInWords}>
          <Text style={[styles.valueText, styles.amountWordsText]}>Amount in Words:</Text>
          <Text style={styles.valueText}>{receiptData.amountInWords}</Text>
          <Text style={styles.totalAmount}>Total:{receiptData.totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.signatureLine}>
          <Text>Authorised Signature</Text>
        </View>

        <View style={styles.footer}>
          <Text>This is a computer generated receipt and does not require a physical signature</Text>
          <Text>Generated using {receiptData.generatedBy}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default MRviewPDF;