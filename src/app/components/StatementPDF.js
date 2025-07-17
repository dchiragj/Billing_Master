import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import moment from 'moment';

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
    padding: 20,
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
  totaltableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
    fontFamily: 'Helvetica-Bold',
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

const StatementPDF = ({ data, companyDetails, customerDetails, totals, duration }) => {
  let runningBalance = 0;

  const statementData = {
    companyName: companyDetails?.CompanyName,
    companyAddress: companyDetails?.Address,
    accountName: customerDetails?.CustomerName,
    accountAddress: customerDetails?.CustomerAddress,
    pan: customerDetails?.PANNo,
    mobile: customerDetails?.ContactNo,
    duration: duration || data?.duration,
    transactions: data?.map((item, index) => {
      const credit = parseFloat(item.Credit || 0).toFixed(2);
      const debit = parseFloat(item.Debit || 0).toFixed(2);
      runningBalance = (parseFloat(runningBalance) + (parseFloat(debit) - parseFloat(credit))).toFixed(2);

      return {
        date: item.transdate ? moment(item.transdate).format('DD MMM YYYY') : '-',
        description: item.Narration === 'NA' ? item.DOCNO : item.Narration || '-',
        credit: parseFloat(credit).toFixed(2),
        debit: parseFloat(debit).toFixed(2),
        balance: parseFloat(runningBalance).toFixed(2),
      };
    }) || [],
    totalCredit: parseFloat(totals?.credit || 0).toFixed(2),
    totalDebit: parseFloat(totals?.debit || 0).toFixed(2),
    generatedDate: moment().format('YYYY-MM-DD'),
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fixed Header for All Pages */}
        <View style={styles.statementT} fixed>
          <View style={styles.header}>
            <Text style={styles.companyName}>{statementData.companyName}</Text>
            <Text style={styles.companyAddress}>{statementData.companyAddress}</Text>
          </View>
          <View style={styles.separator} />
        </View>

        {/* Statement Title and Account Information (Only on First Page) */}
        <View style={styles.statementT}>
          <Text style={styles.statementTitle}>Statement</Text>
          <View style={styles.statementContent}>
            <Text style={styles.key}>Account:</Text>
            <Text style={styles.value}>{statementData.accountName}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text>{statementData.accountAddress}</Text>
            {/* <Text>PAN: {statementData.pan}</Text>
            <Text>Mobile: {statementData.mobile}</Text> */}
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
            <View style={styles.tableHeader} fixed>
              <Text style={styles.dateCol}>Date</Text>
              <Text style={styles.descCol}>Description</Text>
              <Text style={styles.creditCol}>Credit</Text>
              <Text style={styles.debitCol}>Debit</Text>
              <Text style={styles.balanceCol}>Balance</Text>
            </View>

            {/* Table Rows with wrap control */}
            <View wrap>
              {statementData.transactions.map((transaction, index) => (
                <View style={styles.tableRow} key={index} wrap={false}>
                  <Text style={styles.dateCol}>{transaction.date}</Text>
                  <Text style={styles.descCol}>{transaction.description}</Text>
                  <Text style={styles.creditCol}>{transaction.credit}</Text>
                  <Text style={styles.debitCol}>{transaction.debit}</Text>
                  <Text style={styles.balanceCol}>{transaction.balance}</Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totaltableRow} wrap={false}>
              <Text style={styles.dateCol}></Text>
              <Text style={styles.descCol}>Total</Text>
              <Text style={styles.creditCol}>{statementData.totalCredit}</Text>
              <Text style={styles.debitCol}>{statementData.totalDebit}</Text>
              <Text style={styles.balanceCol}></Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Generated on ${statementData.generatedDate} Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default StatementPDF;