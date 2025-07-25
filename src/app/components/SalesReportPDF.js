import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';

// Register font
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30, 
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    marginBottom: 10, 
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 5, 
  },
  companyName: {
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 4, 
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  address: {
    fontSize: 9, 
    textAlign: 'center',
    lineHeight: 1.2, 
  },
  summaryContainer: {
    marginBottom: 8, 
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 5, 
  },
  title: {
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 6, 
    textAlign: 'center',
    textDecoration: 'underline',
  },
  filters: {
    fontSize: 8, 
    marginBottom: 4, 
    color: '#555',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  itemHeaderRow: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 3, 
    fontSize: 9, 
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    flexWrap: 'wrap', 
  },
  tableFooterCell: { 
    padding: 3,
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
  },
  nameCell: {
    width: '30%',
    flexWrap: 'wrap', 
  },
  qtyCell: {
    width: '15%',
    textAlign: 'right',
  },
  rateCell: {
    width: '15%',
    textAlign: 'right',
  },
  profitCell: {
    width: '20%',
    textAlign: 'right',
  },
  amountCell: {
    width: '20%',
    textAlign: 'right',
  },
  generatedText: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5, // Reduced from 10
  },
});

// Format number with Indian comma style
const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "0.00";
  return num.toFixed(2).replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');
};

const SalesReportPDF = ({  data = [], companyDetails = {}, duration = '', totals = {}  }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View wrap={false}>
          {/* Header */}
          <View style={styles.headerContainer} fixed>
            <Text style={styles.companyName}>{companyDetails?.CompanyName}</Text>
            <Text style={styles.address}>{companyDetails?.Address}</Text>
          </View>

          {/* Sales Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.title}>Sales Summary</Text>
            <Text style={styles.filters}>
              {duration} | Invoice book: All | Item type: All | Item: All | Contact or Bank: All
            </Text>
            <Text style={styles.filters}>Group by: Item & Contact | Sort by: Name (Asc)</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.nameCell]}>Item name</Text>
              <Text style={[styles.tableCell, styles.qtyCell]}>Qty</Text>
              <Text style={[styles.tableCell, styles.rateCell]}>Avg. Sale rate</Text>
              <Text style={[styles.tableCell, styles.profitCell]}>Profit/Margin</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>Amount</Text>
            </View>

            {/* Table Rows */}
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <View style={[styles.tableRow, styles.itemHeaderRow]}>
                  <Text style={[styles.tableCell, styles.nameCell]}>{item.itemName}</Text>
                  <Text style={[styles.tableCell, styles.qtyCell]}>{item.itemQty} Box</Text>
                  <Text style={[styles.tableCell, styles.rateCell]}>{formatNumber(item.itemAvgSales)}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.profitCell,
                      item.itemProfitMargin >= 0 ? styles.positive : styles.negative,
                    ]}
                  >
                    {item.itemProfitMargin >= 0 ? '' : '-'}{formatNumber(Math.abs(item.itemProfitMargin))}
                  </Text>
                  <Text style={[styles.tableCell, styles.amountCell]}>{formatNumber(item.itemAmount)}</Text>
                </View>
                {item.parties.map((party, idx) => {
                  const profitPercentage = party.partyAmount
                    ? ((party.partyProfitMargin / party.partyAmount) * 100).toFixed(2)
                    : '0.00';
                  return (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.nameCell]}>  {party.partyName}</Text>
                      <Text style={[styles.tableCell, styles.qtyCell]}>{party.partyQty}</Text>
                      <Text style={[styles.tableCell, styles.rateCell]}>{formatNumber(party.partyAvgSales)}</Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.profitCell,
                          party.partyProfitMargin >= 0 ? styles.positive : styles.negative,
                        ]}
                      >
                        {party.partyProfitMargin >= 0 ? '' : '-'}{formatNumber(Math.abs(party.partyProfitMargin))}
                        {party.partyProfitMargin >= 0 && ` (${profitPercentage}%)`}
                      </Text>
                      <Text style={[styles.tableCell, styles.amountCell]}>{formatNumber(party.partyAmount)}</Text>
                    </View>
                  );
                })}
              </React.Fragment>
            ))}
            {/* Totals Row */}
            <View style={[styles.tableRow, styles.totalRow]} wrap={false}>
              <Text style={[styles.tableFooterCell, styles.nameCell]}>Grand Total</Text>
              <Text style={[styles.tableFooterCell, styles.qtyCell]}>{totals.totalQty} Box</Text>
              <Text style={[styles.tableFooterCell, styles.rateCell]}>-</Text>
              <Text
                style={[
                  styles.tableFooterCell,
                  styles.profitCell,
                  totals.isProfitPositive ? styles.positive : styles.negative,
                ]}
              >
                {totals.isProfitPositive ? '' : '-'}{formatNumber(Math.abs(totals.totalProfitMargin))}
              </Text>
              <Text style={[styles.tableFooterCell, styles.amountCell]}>{formatNumber(totals.totalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.generatedText}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalesReportPDF;