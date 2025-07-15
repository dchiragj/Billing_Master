import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Oswald font (though not used in styles, included for consistency)
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  statementT: {
    paddingHorizontal: 30,
  },
  header: {
    textAlign: 'center',
    lineHeight: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 10,
    marginBottom: 5,
  },
  statementTitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'start',
  },
  statementContent: {
    flexDirection: 'row',
    gap: 10,
  },
  key: {
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  accountInfo: {
    marginTop: 5,
    lineHeight: 1,
    textAlign: 'left',
    marginLeft: 50,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 5,
  },
  table: {
    width: '100%',
    marginBottom: 10,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  dateCol: {
    width: '15%',
    padding: 5,
    textAlign: 'left',
  },
  descCol: {
    width: '40%',
    padding: 5,
    textAlign: 'left',
  },
  creditCol: {
    width: '15%',
    padding: 5,
    textAlign: 'right',
  },
  debitCol: {
    width: '15%',
    padding: 5,
    textAlign: 'right',
  },
  balanceCol: {
    width: '15%',
    padding: 5,
    textAlign: 'right',
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
    companyAddress:
      data?.companyAddress ||
      'PLOT NO-172, JAY JAGDISH NAGAR SOCIETY - 1, MATAVADI, VARACHHA ROAD, VARACHHA Surat, Surat, 395006, Gujarat, India',
    accountName: data?.accountName || 'MIRA AGENCY',
    accountAddress:
      data?.accountAddress || 'PAROLA ROAD BEHIND CENTRAL BANK, BADGUJAR PLOT DHULE, Dhule, 424001, Maharashtra',
    pan: data?.pan || 'APNPV6525P',
    mobile: data?.mobile || '88300 79001',
    duration: data?.duration || 'All',
    transactions: data?.transactions || [
      { date: '02 Jun 2025', description: 'Opening balance as on 02 Jun 2025', credit: '', debit: '', balance: '₹ 0.00' },
      { date: '02 Jun 2025', description: 'Sales#CB-45', credit: '', debit: '₹ 32,200.00', balance: '₹ 32,200.00 Dr' },
      { date: '08 Jun 2025', description: 'Receipt#2025-26-66: Cash on hand', credit: '₹ 32,200.00', debit: '', balance: '₹ 0.00' },
      { date: '16 Jun 2025', description: 'Sales#BGU-24', credit: '', debit: '₹ 32,200.00', balance: '₹ 32,200.00 Dr' },
      { date: '16 Jun 2025', description: 'Closing balance as on 16 Jun 2025', credit: '', debit: '', balance: '₹ 32,200.00 Dr' },
    ],
    totalCredit: data?.totalCredit || '₹ 32,200.00',
    totalDebit: data?.totalDebit || '₹ 64,400.00',
    generatedDate: data?.generatedDate || '2025-07-14',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.statementT}>
          <View style={styles.header}>
            <Text style={styles.companyName}>{statementData.companyName}</Text>
            <Text style={styles.companyAddress}>{statementData.companyAddress}</Text>
          </View>
        </View>
        <View style={styles.separator} />

        {/* Statement Title and Account Information */}
        <View style={styles.statementT}>
          <Text style={styles.statementTitle}>Statement</Text>
          <View style={styles.statementContent}>
            <Text style={styles.key}>Account:</Text>
            <Text style={styles.value}>{statementData.accountName}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text>{statementData.accountAddress}</Text>
            <Text>PAN: {statementData.pan}</Text>
            <Text>Mobile: {statementData.mobile}</Text>
          </View>
          <View style={styles.statementContent}>
            <Text style={styles.key}>Duration:</Text>
            <Text style={styles.value}>{statementData.duration}</Text>
          </View>
          <View style={styles.separator} />
        </View>

        {/* Transaction Table */}
        <View style={styles.statementT}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.dateCol}>Date</Text>
              <Text style={styles.descCol}>Description</Text>
              <Text style={styles.creditCol}>Credit</Text>
              <Text style={styles.debitCol}>Debit</Text>
              <Text style={styles.balanceCol}>Balance</Text>
            </View>

            {/* Table Rows */}
            {statementData.transactions.map((transaction, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.dateCol}>{transaction.date}</Text>
                <Text style={styles.descCol}>{transaction.description}</Text>
                <Text style={styles.creditCol}>{transaction.credit}</Text>
                <Text style={styles.debitCol}>{transaction.debit}</Text>
                <Text style={styles.balanceCol}>{transaction.balance}</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={styles.tableRow}>
              <Text style={styles.dateCol}></Text>
              <Text style={styles.descCol}>Total</Text>
              <Text style={styles.creditCol}>{statementData.totalCredit}</Text>
              <Text style={styles.debitCol}>{statementData.totalDebit}</Text>
              <Text style={styles.balanceCol}></Text>
            </View>
          </View>
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