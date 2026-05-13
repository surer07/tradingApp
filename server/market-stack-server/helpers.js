function formatForClient(data) {
    console.log(data)
    if (!Array.isArray(data)) {
        console.warn("formatForClient received invalid data type:", typeof data);
        return [];
    }

    return data.map((item) => {
        return {
            label: item.name || "Unknown Name",
            value: item.symbol
        };
    });
}

module.exports = { formatForClient };