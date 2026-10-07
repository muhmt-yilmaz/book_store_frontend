


export const getErrorMessage = (error, fallback = "Bir hata oluştu, lütfen tekrar deneyin.") => {


    if (!error?.response) {
        if (error?.code === 'ECONNABORTED') {
            return "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
        }
        return "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.";
    }

    const data = error.response.data;
    if (!data) return fallback;

    
    if (data.object && typeof data.object === 'object' && !Array.isArray(data.object)) {
        const fieldMessages = Object.values(data.object).filter(Boolean);
        if (fieldMessages.length > 0) {
            return fieldMessages.join(' ');
        }
    }

    return data.message || fallback;
};
