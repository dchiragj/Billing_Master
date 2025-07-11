// import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// const InvoicePDF = ({ data }) => {

//     console.log(data);

//     // Register fonts
//     Font.register({
//         family: 'Helvetica',
//         fonts: [
//             { src: 'https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf' },
//             { src: 'https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf', fontWeight: 'bold' }
//         ]
//     });

//     // Extract data from props
//     const { master, details } = data;

//     // Constants for pagination
//     const ROWS_PER_PAGE = 15; // Adjust based on your layout needs

//     // Calculate totals
//     const calculateTotals = () => {
//         let totalQty = 0;
//         let basicAmount = 0;
//         let cgstAmount = 0;
//         let sgstAmount = 0;
//         let igstAmount = 0;
//         let netAmount = 0;
//         let itemTotals = [];

//         details.forEach(item => {
//             totalQty += item.QTY;
//             const itemBasic = item["Net_Amt"];
//             const total = item.NETamt;
//             const itemCGST = item.CGSTAmt || 0;
//             const itemSGST = item.SGSTAmt || 0;
//             const itemIGST = item.IGSTAmt || 0;
//             const itemTotal = itemBasic + itemCGST + itemSGST + itemIGST;

//             basicAmount += itemBasic;
//             cgstAmount += itemCGST;
//             sgstAmount += itemSGST;
//             igstAmount += itemIGST;
//             netAmount += total;

//             itemTotals.push(itemTotal);
//         });

//         return {
//             totalQty,
//             basicAmount,
//             cgstAmount,
//             sgstAmount,
//             igstAmount,
//             netAmount,
//             itemTotals
//         };
//     };

//     const totals = calculateTotals();

//     // Convert number to words
//     const numberToWords = (num) => {
//         // Simplified version - you might want to implement a more complete solution
//         const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//         const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//         const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

//         if (num === 0) return 'Zero';

//         let words = '';
//         if (num >= 100000) {
//             words += units[Math.floor(num / 100000)] + ' Lakh ';
//             num %= 100000;
//         }

//         if (num >= 1000) {
//             words += units[Math.floor(num / 1000)] + ' Thousand ';
//             num %= 1000;
//         }

//         if (num >= 100) {
//             words += units[Math.floor(num / 100)] + ' Hundred ';
//             num %= 100;
//         }

//         if (num > 0) {
//             if (words !== '') words += 'and ';

//             if (num < 10) {
//                 words += units[num];
//             } else if (num < 20) {
//                 words += teens[num - 10];
//             } else {
//                 words += tens[Math.floor(num / 10)];
//                 if (num % 10 > 0) {
//                     words += ' ' + units[num % 10];
//                 }
//             }
//         }

//         return words + ' Rupees Only';
//     };

//     // Create styles (same as original with added column)
//     const styles = StyleSheet.create({
//         page: {
//             fontFamily: 'Helvetica',
//             fontSize: 10,
//             lineHeight: 1.2,
//             padding: 15
//         },
//         main: {
//             borderWidth: 1,
//             borderColor: '#000',
//             position: 'relative',
//             height: '95%',
//         },
//         headerContainer: {
//             padding: 5,
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//         },
//         companyLogo: {
//             width: '20%',
//         },
//         image: {
//             width: 150,      
//             height: 80,
//             paddingRight: 50,
//           },

//         companyInfo: {
//             width: '50%',
//         },
//         companyName: {
//             fontSize: 15,
//             fontWeight: 'bold',
//             marginBottom: 10,
//             textTransform: 'uppercase',
//         },
//         companyAddress: {
//             marginBottom: 1,
//             fontSize: 9,
//         },
//         contactInfo: {
//             marginBottom: 1,
//             fontSize: 9,
//         },
//         taxInfo: {
//             width: '30%',
//             alignItems: 'flex-end',
//             flexDirection: 'column',
//           justifyContent: 'center',
//           gap: 5
//         },
//         label: {
//             fontWeight: 'bold',
//             fontSize: 9,
//             width: '20%',
//         },
//         value: {
//             fontSize: 9,
//             width: '60%',
//             textAlign: 'right',
//         },
//         dividerLine: {
//             borderBottomWidth: 1,
//             borderBottomColor: '#000',
//         },
//         customerContainer: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//         },
//         customerHead: {
//             padding: 5,
//         },
//         customerInfo: {
//             padding: 5,
//             width: '60%',
//         },
//         customerHeader: {
//             fontSize: 10,
//             fontWeight: 'bold',
//             marginBottom: 3,
//         },
//         customerAddress: {
//             // paddingLeft: 5,
//             fontSize: 9,
//         },
//         customerContact: {
//             // paddingLeft: 5,
//             fontSize: 9,
//         },
//         customerTax: {
//             // paddingLeft: 5,
//             fontSize: 9,
//         },
//         invoiceContainer: {
//             width: '25%',
//             borderLeftWidth: 1,
//             borderColor: '#000',
//             margin: 0,
//         },
//         invoiceHeader: {
//             fontSize: 10,
//             fontWeight: 'bold',
//             textAlign: 'center',
//             borderBottom: 1,
//             padding: 5,
//             borderBottomColor: '#000',
//         },
//         invoiceDetails: {
//             padding: 5,
//             marginLeft: 0,
//         },
//         invoiceRow: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//         },
//         invoiceLabel: {
//             fontWeight: 'bold',
//             fontSize: 9,
//             width: '30%',
//         },
//         invoiceValue: {
//             fontSize: 9,
//             width: '70%',
//             textAlign: 'right',
//         },
//         table: {
//             width: '100%',
//             borderTopWidth: 1,
//             borderBottomWidth: 1,
//             borderColor: '#000',
//             flexGrow: 1,
//         },
//         tableRow: {
//             flexDirection: 'row',
//             borderBottomWidth: 1,
//             borderBottomColor: '#000',
//             // height: '30'
//         },
//         tableRowBottom: {
//             flexDirection: 'row',
//             borderTopWidth: 1,
//             borderTopColor: '#000',
//             marginTop: 'auto',
//         },
//         tableHeader: {
//             flexDirection: 'row',
//             fontWeight: 'bold',
//             fontSize: 9,
//         },
//         tableCol: {
//             padding: 4,
//             borderRightWidth: 1,
//             borderRightColor: '#000',
//             fontSize: 9,
//         },
//         emptyRow: {
//             flexDirection: 'row',
//             flexGrow: 1,
//             borderBottomWidth: 1,
//             borderBottomColor: '#000',
//         },
//         emptyCol: {
//             padding: 4,
//             borderRightWidth: 1,
//             borderRightColor: '#000',
//             fontSize: 9,
//             height: '100%',
//         },
//         col1: { width: '5%', textAlign: 'center' },
//         col2: { width: '35%' },
//         col3: { width: '8%', textAlign: 'center' },
//         col4: { width: '8%', textAlign: 'right' },
//         col5: { width: '8%', textAlign: 'right' },
//         col6: { width: '9%', textAlign: 'right' },
//         col7: { width: '9%', textAlign: 'right' },
//         col8: { width: '9%', textAlign: 'right' },
//         col9: { width: '9%', textAlign: 'right' },
//         colSpan2: { width: '48%', textAlign: 'right', fontWeight: 'bold' },
//         colSpan3: { width: '52%', fontWeight: 'bold' },
//         summaryText: {
//             marginTop: 4,
//             marginBottom: 6,
//             fontSize: 9,    
//         },
//         netPayableContainer: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             borderTopWidth: 1,
//             borderBottomWidth: 1,
//             BorderColor: '#000',
//         },
//         netPayableLeft: {
//             width: '65%',
//         },
//         netPayable: {
//             borderBottomWidth: 1,
//             BorderColor: '#000',
//             padding: 5
//         },
//         netPayableRight: {
//             width: '35%',
//             borderLeftWidth: 1,
//             BorderColor: '#000',
//         },
//         netPayableTitle: {
//             fontWeight: 'bold',
//             fontSize: 10,
//         },
//         netPayableWords: {
//             fontSize: 9,
//         },
//         bankDetails: {
//             fontSize: 9,
//             padding: 5
//         },
//         bankTitle: {
//             fontWeight: 'bold',
//         },
//         amountBox: {
//             flexDirection: 'column',
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: 5,
//         },
//         amountRow: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             width: '100%',
//             padding: 5,
//         },
//         footerContainer: {
//             position: 'fixed',
//             bottom: 0,
//             left: 0,
//             right: 0,
//         },
//         mainFooter: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//         },
//         termsContainer: {
//             fontSize: 8,
//             padding: 5,
//             width: '65%',
//         },
//         termsTitle: {
//             fontWeight: 'bold',
//         },
//         signatureContainer: {
//             width: '35%',
//             borderLeftWidth: 1,
//             borderColor: '#000',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'flex-end',
//         },
//         signatureText: {
//             borderTopWidth: 1,
//             width: '80%',
//             textAlign: 'center'
//         },
//         generatedBy: {
//             textAlign: 'start',
//             fontSize: 7,
//             fontStyle: 'italic',
//         },
//         pageNumber: {
//             fontSize: 8,
//             textAlign: 'center',
//             marginTop: 5
//         },
//         continuedText: {
//             fontSize: 8,
//             fontStyle: 'italic',
//             textAlign: 'center',
//             padding: 3,
//             backgroundColor: '#f0f0f0'
//         },
//         boldAmount: {
//             fontWeight: 'bold'
//         },
//         lastAmountRow: {
//             borderTopWidth: 1,
//             borderTopColor: '#000'
//         }
//     });

//     const renderTableRows = (items, startIndex = 0) => {
//         return items.map((item, index) => {
//             const itemTotal = totals.itemTotals[startIndex + index];
//             const totalTax = (item.CGSTAmt || 0) + (item.SGSTAmt || 0) + (item.IGSTAmt || 0);

//             return (
//                 <View style={styles.tableRow} key={startIndex + index}>
//                     <Text style={[styles.tableCol, styles.col1]}>{startIndex + index + 1}</Text>
//                     <Text style={[styles.tableCol, styles.col2]}>{item.ItemName}</Text>
//                     <Text style={[styles.tableCol, styles.col3]}>{item.HSNCode}</Text>
//                     <Text style={[styles.tableCol, styles.col4]}>{item.QTY} {item.Per}</Text>
//                     <Text style={[styles.tableCol, styles.col5]}>{item.Price.toFixed(2) || 0.00}</Text>
//                     <Text style={[styles.tableCol, styles.col6]}>{item.Disc || 0.00}</Text>
//                     <Text style={[styles.tableCol, styles.col7]}>{item["Net_Amt"]?.toFixed(2) || 0.00}</Text>
//                     <Text style={[styles.tableCol, styles.col8]}>{totalTax.toFixed(2) || 0.00}</Text>
//                     <Text style={[styles.tableCol, styles.col9]}>{item.NETamt.toFixed(2) || 0.00}</Text>
//                 </View>
//             );
//         });
//     };

//     const renderInvoicePages = () => {
//         const pages = [];
//         const totalPages = Math.ceil(details.length / ROWS_PER_PAGE);
//         let remainingItems = [...details];

//         for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
//             const isLastPage = pageNum === totalPages;
//             const pageItems = remainingItems.slice(0, ROWS_PER_PAGE);
//             remainingItems = remainingItems.slice(ROWS_PER_PAGE);
//             const startIndex = (pageNum - 1) * ROWS_PER_PAGE;

//             pages.push(
//                 <Page size="A4" style={styles.page} key={pageNum}>
//                     <View style={styles.main}>
//                         {/* Header - same on all pages */}
//                         <View style={styles.headerContainer}>
//                             <View style={styles.companyLogo}>
//                             <Image style={styles.image} src='/uploads/Logo.png' />
//                             </View>
//                             <View style={styles.companyInfo}>
//                                 <Text style={styles.companyName}>BUSTER GRUH UDHYOG</Text>
//                                 <Text style={styles.companyAddress}>
//                                     PLOT NO-172, JAY JAGDISH NAGAR SOCIETY - 1, MATAVADI, VARACHHA ROAD, VARACHHA Surat, Surat, 395006, Gujarat
//                                 </Text>
//                                 <Text style={styles.contactInfo}>Phone: 9714441022</Text>
//                             </View>
//                             <View style={styles.taxInfo}>
//                                 <View style={styles.invoiceRow}>
//                                         <Text style={styles.label}>GSTIN:</Text>
//                                         <Text style={styles.value}>24AKKPR2844R1ZE</Text>
//                                     </View>
//                                     <View style={styles.invoiceRow}>
//                                         <Text style={styles.label}>PAN:</Text>
//                                         <Text style={styles.value}>AKKPR2844R</Text>
//                                     </View>
//                             </View>
//                         </View>

//                         <View style={styles.dividerLine}></View>

//                         {/* Customer info - same on all pages */}
//                         <View style={styles.customerContainer}>
//                             <Text style={styles.customerHead}> Billed To:</Text>
//                             <View style={styles.customerInfo}>
//                                 <Text style={styles.customerHeader}>{master.Customer.split(':')[0]}</Text>
//                                 <Text style={styles.customerAddress}>{master.Address}</Text>
//                                 <Text style={styles.customerContact}>Mo: {master.Mobileno}</Text>
//                                 {/* {master.GSTINNo && ( */}
//                                     <Text style={styles.customerTax}>
//                                         {master.GSTINNo ? `GSTIN: ${master.GSTINNo}` : ''}
//                                         {master.PanNo ? `   PAN: ${master.PanNo}` : ''}
//                                     </Text>
//                                 {/* )} */}
//                             </View>
//                             <View style={styles.invoiceContainer}>
//                                 <Text style={styles.invoiceHeader}>INVOICE</Text>
//                                 <View style={styles.invoiceDetails}>
//                                     <View style={styles.invoiceRow}>
//                                         <Text style={styles.invoiceLabel}>Number:</Text>
//                                         <Text style={styles.invoiceValue}>{master.BillNO}</Text>
//                                     </View>
//                                     <View style={styles.invoiceRow}>
//                                         <Text style={styles.invoiceLabel}>Date:</Text>
//                                         <Text style={styles.invoiceValue}>{master.BillDate}</Text>
//                                     </View>
//                                 </View>
//                             </View>
//                         </View>

//                         {/* Table */}   
//                         <View style={styles.table}>
//                             {/* Table header - same on all pages */}
//                             <View style={[styles.tableRow, styles.tableHeader]}>
//                                 <Text style={[styles.tableCol, styles.col1]}>No</Text>
//                                 <Text style={[styles.tableCol, styles.col2]}>Item</Text>
//                                 <Text style={[styles.tableCol, styles.col3]}>HSN</Text>
//                                 <Text style={[styles.tableCol, styles.col4]}>Qty</Text>
//                                 <Text style={[styles.tableCol, styles.col5]}>Rate</Text>
//                                 <Text style={[styles.tableCol, styles.col6]}>Discount</Text>
//                                 <Text style={[styles.tableCol, styles.col7]}>Amount</Text>
//                                 <Text style={[styles.tableCol, styles.col8]}>Taxes</Text>
//                                 <Text style={[styles.tableCol, styles.col9]}>Total</Text>
//                             </View>

//                             {/* "Continued from previous page" indicator (except first page) */}
//                             {/* {pageNum > 1 && (
//                                 <View style={styles.continuedText}>
//                                     <Text>Continued from previous page...</Text>
//                                 </View>
//                             )} */}

//                             {/* Render the rows for this page */}
//                             {renderTableRows(pageItems, startIndex)}

//                             {/* Empty space if needed */}
//                             {/* {!isLastPage && pageItems.length < ROWS_PER_PAGE && ( */}
//                                 <View style={styles.emptyRow}>
//                                     <Text style={[styles.emptyCol, styles.col1]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col2]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col3]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col4]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col5]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col6]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col7]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col8]}></Text>
//                                     <Text style={[styles.emptyCol, styles.col9]}></Text>
//                                 </View>
//                             {/* )} */}

//                             {/* "Continued on next page" indicator (except last page) */}
//                             {/* {!isLastPage && (
//                                 <View style={styles.continuedText}>
//                                     <Text>Continued on next page...</Text>
//                                 </View>
//                             )} */}

//                             {/* Footer - only on last page */}
//                             {isLastPage && (
//                                 <View style={styles.tableRowBottom}>
//                                     <Text style={[styles.tableCol, styles.colSpan2]}>Total qty</Text>
//                                     <Text style={[styles.tableCol, styles.colSpan3]}>{totals.totalQty}({details[0]?.Per || 'BOX'})</Text>
//                                 </View>
//                              )} 
//                         </View>

//                         {/* Footer section - only on last page */}
//                         {/* {isLastPage && ( */}
//                             <View style={styles.footerContainer}>
//                                 <View style={styles.netPayableContainer}>
//                                     <View style={styles.netPayableLeft}>
//                                         <View style={styles.netPayable}>
//                                             <Text style={styles.netPayableTitle}>Net Payable In Words:</Text>
//                                             <Text style={styles.netPayableWords}>{numberToWords(Math.round(totals.netAmount))}</Text>
//                                         </View>
//                                         <View style={styles.bankDetails}>
//                                             <Text style={styles.bankTitle}>Bank detail</Text>
//                                             <Text>Bank:- AXIS BANK YOGI CHOWK</Text>
//                                             <Text>A/C NAME: BUSTER GRUH UDHYOG</Text>
//                                             <Text>A/C number: 922020012079288</Text>
//                                             <Text>IFSC: UTIB0003732</Text>
//                                         </View>
//                                     </View>

//                                     <View style={styles.netPayableRight}>
//                                         <View style={styles.amountBox}>
//                                             <View style={styles.amountRow}>
//                                                 <Text>Basic Amount</Text>
//                                                 <Text>₹ {totals.basicAmount?.toFixed(2)}</Text>
//                                             </View>
//                                             {totals.cgstAmount > 0 && (
//                                                 <View style={styles.amountRow}>
//                                                     <Text>CGST</Text>
//                                                     <Text>₹ {totals.cgstAmount.toFixed(2)}</Text>
//                                                 </View>
//                                             )}
//                                             {totals.sgstAmount > 0 && (
//                                                 <View style={styles.amountRow}>
//                                                     <Text>SGST</Text>
//                                                     <Text>₹ {totals.sgstAmount.toFixed(2)}</Text>
//                                                 </View>
//                                             )}
//                                             {totals.igstAmount > 0 && (
//                                                 <View style={styles.amountRow}>
//                                                     <Text>IGST</Text>
//                                                     <Text>₹ {totals.igstAmount.toFixed(2)}</Text>
//                                                 </View>
//                                             )}
//                                             <View style={[styles.amountRow, styles.lastAmountRow, styles.boldAmount]}>
//                                                 <Text>Net payable</Text>
//                                                 <Text>₹ {totals.netAmount?.toFixed(2)}</Text>
//                                             </View>
//                                         </View>
//                                     </View>
//                                 </View>

//                                 <View style={styles.mainFooter}>
//                                     <View style={styles.termsContainer}>
//                                         <Text style={styles.termsTitle}>Terms and Conditions</Text>
//                                         <Text>(1) Goods once sold will not be accepted return</Text>
//                                         <Text>(2) In case of late payment interest 18% p.a. will be levied</Text>
//                                         <Text>(3) Subject to Surat Jurisdiction. E & O.E</Text>
//                                     </View>

//                                     <View style={styles.signatureContainer}>
//                                         <Text style={styles.signatureText}>Authorised Signature</Text>
//                                     </View>
//                                 </View>
//                             </View>
//                         {/* )} */}
//                     </View>
//                     { totalPages > 1 ?  <Text style={styles.pageNumber}>
//                         Page {pageNum} of {totalPages}
//                     </Text>: ""}
//                     {isLastPage && <Text style={styles.generatedBy}>Generated using https://hisab.co.uk/</Text>}
//                 </Page>
//             );
//         }

//         return pages;
//     };

//     return (
//         <Document>
//             {renderInvoicePages()}
//         </Document>
//     );
// };

// export default InvoicePDF;
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';


const InvoicePDF = ({ data }) => {
    // Register fonts
    Font.register({
        family: 'Helvetica',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf' },
            { src: 'https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf', fontWeight: 'bold' }
        ]
    });
    
    // Extract data from props
    const { master, details, dropdownData } = data
    const { companyInfo, bankDetails, termsConditions } = dropdownData;

    // Constants for pagination
    const ROWS_PER_PAGE = 20;


    // Calculate totals
    const calculateTotals = () => {
        let totalQty = 0;
        let basicAmount = 0;
        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;
        let netAmount = 0;
        let itemTotals = [];

        details.forEach(item => {
            totalQty += item.QTY;
            const itemBasic = item["Net_Amt"];
            const total = item.NETamt;
            const itemCGST = item.CGSTAmt || 0;
            const itemSGST = item.SGSTAmt || 0;
            const itemIGST = item.IGSTAmt || 0;
            const itemTotal = itemBasic + itemCGST + itemSGST + itemIGST;

            basicAmount += itemBasic;
            cgstAmount += itemCGST;
            sgstAmount += itemSGST;
            igstAmount += itemIGST;
            netAmount += total;

            itemTotals.push(itemTotal);
        });

        return {
            totalQty,
            basicAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            netAmount,
            itemTotals
        };
    };

    const totals = calculateTotals();

    // Convert number to words
  const numberToWords = (num) => {
    // Handle invalid inputs
    if (!Number.isFinite(num) || num < 0) return 'Zero Rupees Only';
    if (num === 0) return 'Zero Rupees Only';

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    // Convert number to integer and handle decimals if needed
    num = Math.round(num);

    // Convert number to string and reverse it for easier processing
    const digits = String(num).split('').reverse();
    let words = [];
    let segmentCount = 0;

    for (let i = 0; i < digits.length; i += 3) {
        const segment = digits.slice(i, i + 3).reverse().join('');
        const segmentNum = parseInt(segment, 10);

        if (segmentNum > 0) {
            let segmentWords = '';

            // Hundreds
            if (segmentNum >= 100) {
                segmentWords += units[Math.floor(segmentNum / 100)] + ' Hundred ';
            }

            // Tens and Units
            const tensUnits = segmentNum % 100;
            if (tensUnits > 0) {
                if (segmentWords) segmentWords += 'and ';
                if (tensUnits < 10) {
                    segmentWords += units[tensUnits];
                } else if (tensUnits < 20) {
                    segmentWords += teens[tensUnits - 10];
                } else {
                    segmentWords += tens[Math.floor(tensUnits / 10)];
                    if (tensUnits % 10 > 0) {
                        segmentWords += ' ' + units[tensUnits % 10];
                    }
                }
            }

            // Add scale (Thousand, Lakh, etc.)
            if (segmentWords) {
                words.unshift(segmentWords + (scales[segmentCount] ? ' ' + scales[segmentCount] : ''));
            }
        }

        segmentCount++;
    }

    return words.length > 0 ? words.join(' ') + ' Rupees Only' : 'Zero Rupees Only';
};

    // Styles (same as original)
    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            lineHeight: 1.2,
            padding: 15
        },
        main: {
            borderWidth: 1,
            borderColor: '#000',
            position: 'relative',
            height: '95%',
        },
        headerContainer: {
            padding: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        companyLogo: {
            width: '20%',
        },
        image: {
            width: 150,
            height: 80,
            paddingRight: 50,
        },
        companyInfo: {
            width: '50%',
        },
        companyName: {
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 10,
            textTransform: 'uppercase',
        },
        companyAddress: {
            marginBottom: 1,
            fontSize: 9,
        },
        contactInfo: {
            marginBottom: 1,
            fontSize: 9,
        },
        taxInfo: {
            width: '30%',
            alignItems: 'flex-end',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 5
        },
        label: {
            fontWeight: 'bold',
            fontSize: 9,
            width: '20%',
        },
        value: {
            fontSize: 9,
            width: '60%',
            textAlign: 'right',
        },
        dividerLine: {
            borderBottomWidth: 1,
            borderBottomColor: '#000',
        },
        customerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        customerHead: {
            padding: 5,
        },
        customerInfo: {
            padding: 5,
            width: '60%',
        },
        customerHeader: {
            fontSize: 10,
            fontWeight: 'bold',
            marginBottom: 3,
        },
        customerAddress: {
            fontSize: 9,
        },
        customerContact: {
            fontSize: 9,
        },
        customerTax: {
            fontSize: 9,
        },
        invoiceContainer: {
            width: '50%',
            borderLeftWidth: 1,
            borderColor: '#000',
            margin: 0,
        },
        invoiceHeader: {
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: 1,
            padding: 5,
            borderBottomColor: '#000',
        },
        invoiceDetails: {
            padding: 5,
            marginLeft: 0,
        },
        invoiceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        invoiceLabel: {
            fontWeight: 'bold',
            fontSize: 9,
            width: '30%',
        },
        invoiceValue: {
            fontSize: 9,
            width: '70%',
            textAlign: 'right',
        },
        table: {
            width: '100%',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#000',
            flexGrow: 1,
        },
        tableRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#000',
        },
        tableRowBottom: {
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#000',
            marginTop: 'auto',
        },
        tableHeader: {
            flexDirection: 'row',
            fontWeight: 'bold',
            fontSize: 9,
        },
        tableCol: {
            padding: 4,
            borderRightWidth: 1,
            borderRightColor: '#000',
            fontSize: 9,
        },
        emptyRow: {
            flexDirection: 'row',
            flexGrow: 1,
            borderBottomWidth: 1,
            borderBottomColor: '#000',
        },
        emptyCol: {
            padding: 4,
            borderRightWidth: 1,
            borderRightColor: '#000',
            fontSize: 9,
            height: '100%',
        },
        col1: { width: '5%', textAlign: 'center' },
        col2: { width: '35%' },
        col3: { width: '8%', textAlign: 'center' },
        col4: { width: '8%', textAlign: 'right' },
        col5: { width: '8%', textAlign: 'right' },
        col6: { width: '9%', textAlign: 'right' },
        col7: { width: '9%', textAlign: 'right' },
        col8: { width: '9%', textAlign: 'right' },
        col9: { width: '9%', textAlign: 'right' },
        colSpan2: { width: '48%', textAlign: 'right', fontWeight: 'bold' },
        colSpan3: { width: '52%', fontWeight: 'bold' },
        summaryText: {
            marginTop: 4,
            marginBottom: 6,
            fontSize: 9,
        },
        netPayableContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#000',
        },
        netPayableLeft: {
            width: '65%',
        },
        netPayable: {
            borderBottomWidth: 1,
            borderColor: '#000',
            // padding: 5
        },
        netPayableRight: {
            width: '35%',
            borderLeftWidth: 1,
            borderColor: '#000',
        },
        netPayableTitle: {
            fontWeight: 'bold',
            fontSize: 10,
        },
        netPayableWords: {
            fontSize: 9,
        },
        bankDetails: {
            fontSize: 9,
            padding: 5
        },
        bankTitle: {
            fontWeight: 'bold',
        },
        amountBox: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
        },
        amountRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            padding: 5,
        },
        footerContainer: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
        },
        mainFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        termsContainer: {
            fontSize: 8,
            padding: 5,
            width: '65%',
        },
        termsTitle: {
            fontWeight: 'bold',
        },
        signatureContainer: {
            width: '35%',
            borderLeftWidth: 1,
            borderColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        signatureText: {
            borderTopWidth: 1,
            width: '80%',
            textAlign: 'center'
        },
        generatedBy: {
            textAlign: 'start',
            fontSize: 7,
            fontStyle: 'italic',
        },
        pageNumber: {
            fontSize: 8,
            textAlign: 'center',
            marginTop: 5
        },
        continuedText: {
            fontSize: 8,
            fontStyle: 'italic',
            textAlign: 'center',
            padding: 3,
            backgroundColor: '#f0f0f0'
        },
        boldAmount: {
            fontWeight: 'bold'
        },
        lastAmountRow: {
            borderTopWidth: 1,
            borderTopColor: '#000'
        }
    });

    const renderTableRows = (items, startIndex = 0) => {
        return items.map((item, index) => {
            const itemTotal = totals.itemTotals[startIndex + index];
            const totalTax = (item.CGSTAmt || 0) + (item.SGSTAmt || 0) + (item.IGSTAmt || 0);

            return (
                <View style={styles.tableRow} key={startIndex + index}>
                    <Text style={[styles.tableCol, styles.col1]}>{startIndex + index + 1}</Text>
                    <Text style={[styles.tableCol, styles.col2]}>{item.ItemName}</Text>
                    <Text style={[styles.tableCol, styles.col3]}>{item.HSNCode}</Text>
                    <Text style={[styles.tableCol, styles.col4]}>{item.QTY} {item.Per}</Text>
                    <Text style={[styles.tableCol, styles.col5]}>{item.Price.toFixed(2) || 0.00}</Text>
                    <Text style={[styles.tableCol, styles.col6]}>{item.Disc || 0.00}</Text>
                    <Text style={[styles.tableCol, styles.col7]}>{item["Net Price"]?.toFixed(2) || 0.00}</Text>
                    <Text style={[styles.tableCol, styles.col8]}>{totalTax.toFixed(2) || 0.00}</Text>
                    <Text style={[styles.tableCol, styles.col9]}>{item.NETamt.toFixed(2) || 0.00}</Text>
                </View>
            );
        });
    };

    const renderInvoicePages = () => {
        const pages = [];
        const totalPages = Math.ceil(details.length / ROWS_PER_PAGE);
        let remainingItems = [...details];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const isLastPage = pageNum === totalPages;
            const pageItems = remainingItems.slice(0, ROWS_PER_PAGE);
            remainingItems = remainingItems.slice(ROWS_PER_PAGE);
            const startIndex = (pageNum - 1) * ROWS_PER_PAGE;

            pages.push(
                <Page size="A4" style={styles.page} key={pageNum}>
                    <View style={styles.main}>
                        {/* Header - same on all pages */}
                        <View style={styles.headerContainer}>
                            <View style={styles.companyLogo}>
                                <Image style={styles.image} src='/uploads/Logo.png' />
                            </View>
                            <View style={styles.companyInfo}>
                                <Text style={styles.companyName}>{companyInfo.CompanyName}</Text>
                                <Text style={styles.companyAddress}>
                                    {companyInfo.Address.replace(/\r\n/g, ' ')}
                                </Text>
                                <Text style={styles.contactInfo}>Phone: {companyInfo.ContactNo}</Text>
                            </View>
                            <View style={styles.taxInfo}>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.label}>GSTIN:</Text>
                                    <Text style={styles.value}>{companyInfo.GSTINNo}</Text>
                                </View>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.label}>PAN:</Text>
                                    <Text style={styles.value}>{companyInfo.PANNo}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.dividerLine}></View>

                        {/* Customer info - same on all pages */}
                        <View style={styles.customerContainer}>
                            {/* <Text style={styles.customerHead}>Billed To:</Text> */}
                            <View style={styles.customerInfo}>
                                <Text style={styles.customerHeader}>{master?.Customer.split(':')[0]}</Text>
                                <Text style={styles.customerAddress}>{master?.Address}</Text>
                                <Text style={styles.customerContact}>Mo: {master?.Mobileno}</Text>
                                <Text style={styles.customerTax}>
                                    {master?.GSTINNo ? `GSTIN: ${master?.GSTINNo}` : ''}
                                    {master?.PanNo ? `PAN: ${master?.PanNo}` : ''}
                                </Text>
                            </View>
                            <View style={styles.invoiceContainer}>
                                <Text style={styles.invoiceHeader}>INVOICE</Text>
                                <View style={styles.invoiceDetails}>
                                    <View style={styles.invoiceRow}>
                                        <Text style={styles.invoiceLabel}>Number:</Text>
                                        <Text style={styles.invoiceValue}>{master?.BillNO}</Text>
                                    </View>
                                    <View style={styles.invoiceRow}>
                                        <Text style={styles.invoiceLabel}>Date:</Text>
                                        <Text style={styles.invoiceValue}>{master?.BillDate}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Table */}
                        <View style={styles.table}>
                            {/* Table header */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCol, styles.col1]}>No</Text>
                                <Text style={[styles.tableCol, styles.col2]}>Item</Text>
                                <Text style={[styles.tableCol, styles.col3]}>HSN</Text>
                                <Text style={[styles.tableCol, styles.col4]}>Qty</Text>
                                <Text style={[styles.tableCol, styles.col5]}>Rate</Text>
                                <Text style={[styles.tableCol, styles.col6]}>Discount</Text>
                                <Text style={[styles.tableCol, styles.col7]}>Amount</Text>
                                <Text style={[styles.tableCol, styles.col8]}>Taxes</Text>
                                <Text style={[styles.tableCol, styles.col9]}>Total</Text>
                            </View>

                            {/* Render the rows for this page */}
                            {renderTableRows(pageItems, startIndex)}

                            {/* Empty space if needed */}
                            <View style={styles.emptyRow}>
                                <Text style={[styles.emptyCol, styles.col1]}></Text>
                                <Text style={[styles.emptyCol, styles.col2]}></Text>
                                <Text style={[styles.emptyCol, styles.col3]}></Text>
                                <Text style={[styles.emptyCol, styles.col4]}></Text>
                                <Text style={[styles.emptyCol, styles.col5]}></Text>
                                <Text style={[styles.emptyCol, styles.col6]}></Text>
                                <Text style={[styles.emptyCol, styles.col7]}></Text>
                                <Text style={[styles.emptyCol, styles.col8]}></Text>
                                <Text style={[styles.emptyCol, styles.col9]}></Text>
                            </View>

                            {/* Footer - only on last page */}
                            {isLastPage && (
                                <View style={styles.tableRowBottom}>
                                    <Text style={[styles.tableCol, styles.colSpan2]}>Total qty</Text>
                                    <Text style={[styles.tableCol, styles.colSpan3]}>{totals.totalQty}({details[0]?.Per || 'BOX'})</Text>
                                </View>
                            )}
                        </View>

                        {/* Footer section - only on last page */}
                        {isLastPage && (
                            <View style={styles.footerContainer}>
                                <View style={styles.netPayableContainer}>
                                    <View style={styles.netPayableLeft}>
                                        <View style={(totals.cgstAmount > 0 || totals.sgstAmount > 0) ? styles.netPayable : {}}>
                                            <Text style={styles.netPayableTitle}>Net Payable In Words:</Text>
                                            <Text style={styles.netPayableWords}>{numberToWords(Math.round(totals.netAmount))}</Text>
                                        </View>
                                        {(totals.cgstAmount > 0 || totals.sgstAmount > 0) && (
                                            <View style={styles.bankDetails}>
                                                <Text style={styles.bankTitle}>Bank detail</Text>
                                                {bankDetails.split('\n').map((line, i) => (
                                                    <Text key={i}>{line}</Text>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.netPayableRight}>
                                        <View style={styles.amountBox}>
                                            <View style={styles.amountRow}>
                                                <Text>Basic Amount</Text>
                                                <Text> {totals.basicAmount?.toFixed(2)}</Text>
                                            </View>
                                            {totals.cgstAmount > 0 && (
                                                <View style={styles.amountRow}>
                                                    <Text>CGST</Text>
                                                    <Text> {totals.cgstAmount.toFixed(2)}</Text>
                                                </View>
                                            )}
                                            {totals.sgstAmount > 0 && (
                                                <View style={styles.amountRow}>
                                                    <Text>SGST</Text>
                                                    <Text> {totals.sgstAmount.toFixed(2)}</Text>
                                                </View>
                                            )}
                                            {totals.igstAmount > 0 && (
                                                <View style={styles.amountRow}>
                                                    <Text>IGST</Text>
                                                    <Text> {totals.igstAmount.toFixed(2)}</Text>
                                                </View>
                                            )}
                                            <View style={[styles.amountRow, styles.lastAmountRow, styles.boldAmount]}>
                                                <Text>Net payable</Text>
                                                <Text>Rs. {totals.netAmount?.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.mainFooter}>
                                    <View style={styles.termsContainer}>
                                        <Text style={styles.termsTitle}>Terms and Conditions</Text>
                                        {termsConditions.map((term, i) => (
                                            <Text key={i}>{term}</Text>
                                        ))}
                                    </View>

                                    <View style={styles.signatureContainer}>
                                        <Text style={styles.signatureText}>Authorised Signature</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                    {totalPages > 1 && (
                        <Text style={styles.pageNumber}>
                            Page {pageNum} of {totalPages}
                        </Text>
                    )}
                    {isLastPage && <Text style={styles.generatedBy}>Generated using https://hisab.co.uk/</Text>}
                </Page>
            );
        }

        return pages;
    };

    return (
        <Document>
            {renderInvoicePages()}
        </Document>
    );
};

export default InvoicePDF;