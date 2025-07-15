import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { numberToWords } from '@/lib/utiles';

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
    gap: 10,
    flexDirection: 'column',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
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
  taxInfo: {
    // width: '60%',
    alignItems: 'flex-end',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 5
  },
  label: {
    fontWeight: 'bold',
    fontSize: 9,
    width: '30%',
  },
  value: {
    fontSize: 9,
    width: '50%',
    textAlign: 'right',
  },
    invoiceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
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
    fontSize: 10,
  },
  totalAmount: {
    fontSize: 10,
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
function MRviewPDF({ data, companyDetails }) {
  const receiptData = {
    companyName: companyDetails?.CompanyName,
    address: companyDetails?.Address,
    phone: companyDetails?.ContactNo,
    gstin: companyDetails?.GSTINNo || ' - Not Provided -',
    pan: companyDetails?.PANNo,
    receivedFrom: {
      name: data?.ptmsstr,
      gstin: data?.GSTINNo,
      pan: data?.PanNo,
    },
    receiptNo: data?.Mrsno,
    date: data?.MRSDT,
    transactions: data?.details?.map(item => ({
      date: item?.BillDate,
      description: item.Billno || '',
      amount: item.Netamt || 0,
      remarks: item.remarks || '',
    })),
    amountInWords: data?.MrAmt,
    totalAmount: data?.MrAmt,
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
              GSTIN: {receiptData.receivedFrom.gstin || '- Not Provided -'} | PAN: {receiptData.receivedFrom.pan}
            </Text>
          </View>
          <View style={styles.receiptDetails}>
            <Text style={[styles.labelText, { textAlign: 'right' }]}>Receipt</Text>
            {/* <View style={{ flexDirection: 'row',  marginBottom: 5 }}>
              <Text style={[styles.valueText, { width: 60 }]}>Ref. No.:</Text>
              <Text style={styles.valueText}>{receiptData.receiptNo}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.valueText, { width: 60 }]}>Receipt Date:</Text>
              <Text style={styles.valueText}>{receiptData.date}</Text>
            </View> */}
            <View style={styles.taxInfo}>
              <View style={styles.invoiceRow}>
                <Text style={styles.label}>Ref. No.</Text>
                <Text style={styles.value}>{receiptData.receiptNo}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.label}>Receipt Date</Text>
                <Text style={styles.value}>{receiptData.date}</Text>
              </View>
            </View>
          </View>

        </View>

        <View style={styles.divider}></View>

        <Text style={[styles.valueText, { marginBottom: 10 ,textAlign: 'center'}]}>
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
            <View style={[styles.tableCol, { textAlign: 'right' }]}>
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
              <View style={[styles.tableCol, { textAlign: 'right' }]}>
                <Text>{transaction.amount.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.amountInWords}>
          <Text style={[styles.valueText, styles.amountWordsText]}>Amount in Words:</Text>
          <Text style={styles.valueText}>{numberToWords(receiptData.amountInWords)}</Text>
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