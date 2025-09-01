 export const numberToWords = (num) => {
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

export const sortByDate = (data, dateField, order = 'asc') => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const sortByMrsnoDesc = (data) => {
  return data.sort((a, b) => {
    const numA = parseInt(a.Mrsno.split("/").pop());
    const numB = parseInt(b.Mrsno.split("/").pop());
    return numB - numA; // Descending
  });
}