import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  companyAddress: {
    fontSize: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  accountInfo: {
    marginBottom: 15,
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '20%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  descCol: {
    width: '40%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  amountCol: {
    width: '20%',
    padding: 5,
    textAlign: 'right',
    borderRightWidth: 1,
    borderColor: '#000',
  },
  lastCol: {
    width: '20%',
    padding: 5,
    textAlign: 'right',
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  totalLabel: {
    width: '60%',
    paddingRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalValue: {
    width: '20%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    textAlign: 'center',
    color: '#555',
  },
});

const StatementPDF = ({ data }) => {
  // Default data
  const statementData = {
    companyName: data?.companyName || 'BUSTER GRUH UDHYOG',
    companyAddress: data?.companyAddress || 'PLOT NO-172, JAY JAGDISH NAGAR SOCIETY - 1, MATAVADI, VARACHHA ROAD, VARACHHA Surat, Surat, 395006, Gujarat, India',
    accountName: data?.accountName || 'MIRA AGENCY',
    accountAddress: data?.accountAddress || 'PAROLA ROAD BEHIND CENTRAL BANK , BADGUJAR PLOT DHULE , Dhule, 424001, Maharashtra',
    pan: data?.pan || 'APNPV6525P',
    mobile: data?.mobile || '88300 79001',
    duration: data?.duration || 'All',
    transactions: data?.transactions || [
      { date: '02 Jun 2025', description: 'Opening balance as on 02 Jun 2025', credit: '', debit: '', balance: ' 0.00' },
      { date: '02 Jun 2025', description: 'Sales#CB-45', credit: ' 32,200.00', debit: '', balance: ' 32,200.00 Dr' },
      { date: '08 Jun 2025', description: 'Receipt#2025-26-66: Cash on hand', credit: ' 32,200.00', debit: '', balance: ' 0.00' },
      { date: '16 Jun 2025', description: 'Sales#BGU-24', credit: ' 32,200.00', debit: '', balance: ' 32,200.00 Dr' },
      { date: '16 Jun 2025', description: 'Closing balance as on 16 Jun 2025', credit: '', debit: ' 32,200.00', balance: ' 32,200.00 Dr' },
    ],
    totalCredit: data?.totalCredit || ' 32,200.00',
    totalDebit: data?.totalDebit || ' 64,400.00',
    generatedDate: data?.generatedDate || '2025-07-11',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}># BUSTER GRUH UDHYOG</Text>
          <Text style={styles.companyAddress}>
            PLOT NO-172, JAY JAGDISH NAGAR SOCIETY - 1, MATAVADI, VARACHHA ROAD, VARACHHA Surat, Surat, 395006, Gujarat, India
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>## Statement</Text>

        {/* Account Information */}
        <View style={styles.accountInfo}>
          <Text>| Account: | {statementData.accountName}</Text>
          <Text>| Address: |{statementData.accountAddress}</Text>
          <Text>| PAN : {statementData.pan}</Text>
          <Text>| Mobile : {statementData.mobile}</Text>
          <Text>| Duration: | {statementData.duration}</Text>
        </View>

        {/* Transaction Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>Date</Text>
            <Text style={styles.descCol}>Description</Text>
            <Text style={styles.amountCol}>Credit</Text>
            <Text style={styles.amountCol}>Debit</Text>
            <Text style={styles.lastCol}>Balance</Text>
          </View>

          {/* Table Rows */}
          {statementData.transactions.map((transaction, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{transaction.date}</Text>
              <Text style={styles.descCol}>{transaction.description}</Text>
              <Text style={styles.amountCol}>{transaction.credit}</Text>
              <Text style={styles.amountCol}>{transaction.debit}</Text>
              <Text style={styles.lastCol}>{transaction.balance}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{statementData.totalCredit}</Text>
          <Text style={styles.totalValue}>{statementData.totalDebit}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {statementData.generatedDate} Page 1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default StatementPDF;