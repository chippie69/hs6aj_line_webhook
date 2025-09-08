const isoToThaiDate = (isoDate) => {
    const date = new Date(isoDate);

    const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const  year = date.getFullYear();
    
    const formattedDate = `${day} ${month} ${year}`;

    return formattedDate;
}

module.exports = { isoToThaiDate };