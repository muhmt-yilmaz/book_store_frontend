import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import BookCover from '../components/BookCover';


const IYZICO_TEST_CARD = {
    cardHolderName: 'John Doe',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '2030',
    cvc: '123'
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const isStaffTestMode = userRole === 'ADMIN' || userRole === 'MANAGER';
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    
    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: ''
    });

    
    const [cardData, setCardData] = useState({
        cardHolderName: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: ''
    });

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {


                const cartRes = await api.get('/cart');
                const cartData = cartRes.data.object || cartRes.data;
                
                if (!cartData || !cartData.items || cartData.items.length === 0) {
                    toast.error("Sepetiniz boş. Ödeme sayfasına geçemezsiniz.");
                    navigate('/cart');
                    return;
                }
                setCart(cartData);


                
                const profileRes = await api.get('/customer/profile');
                const profile = profileRes.data.object || profileRes.data;
                
                setShippingData((prev) => ({
                    ...prev,
                    firstName: profile.name || '',
                    lastName: profile.surname || '',
                    phoneNumber: profile.phoneNumber || ''
                    
                }));

            } catch (error) {
                console.error("Checkout verileri yüklenemedi:", error);
                toast.error("Bilgileriniz yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchCheckoutData();
    }, [navigate]);

    const handleInputChange = (e) => {
        setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    };

    const handleCardChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') value = value.replace(/[^\d]/g, '').slice(0, 16);
        if (name === 'cvc') value = value.replace(/[^\d]/g, '').slice(0, 4);
        if (name === 'expireMonth') value = value.replace(/[^\d]/g, '').slice(0, 2);
        if (name === 'expireYear') value = value.replace(/[^\d]/g, '').slice(0, 4);
        setCardData({ ...cardData, [name]: value });
    };

    const fillTestCard = () => {
        setCardData(IYZICO_TEST_CARD);
        toast.success("Iyzico sandbox test kartı dolduruldu.");
    };

    
    const isValidPhone = (value) => {
        const digitsOnly = value.replace(/[^\d]/g, '');
        return /^[\d\s()+-]+$/.test(value) && digitsOnly.length >= 10;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (isStaffTestMode) {
            toast.error("Personel hesabıyla gerçek sipariş oluşturulamaz. Bu sadece test görünümüdür.");
            return;
        }


        
        if (!isValidPhone(shippingData.phoneNumber)) {
            toast.error("Lütfen geçerli bir telefon numarası girin (en az 10 rakam).");
            return;
        }
        if (shippingData.address.trim().length < 10) {
            toast.error("Lütfen açık adresinizi eksiksiz girin (en az 10 karakter).");
            return;
        }
        if (cardData.cardNumber.length < 15) {
            toast.error("Lütfen geçerli bir kart numarası girin.");
            return;
        }

        setPlacingOrder(true);
        try {


            const orderRequest = {
                orderItems: cart.items.map((item) => ({
                    bookId: item.bookId,
                    quantity: item.quantity
                })),
                recipientName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                shippingPhone: shippingData.phoneNumber,
                shippingAddress: shippingData.address,
                cardHolderName: cardData.cardHolderName,
                cardNumber: cardData.cardNumber,
                expireMonth: cardData.expireMonth,
                expireYear: cardData.expireYear,
                cvc: cardData.cvc
            };

            await api.post('/orders', orderRequest);


            
            
            window.dispatchEvent(new Event('cartUpdated'));

            toast.success("Ödemeniz alındı, siparişiniz oluşturuldu! Teşekkür ederiz 🎉");
            navigate('/my-orders'); 
        } catch (error) {
            console.error("Sipariş hatası:", error);
            toast.error(getErrorMessage(error, "Siparişiniz oluşturulurken bir hata meydana geldi."));
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">Ödeme Sayfası Hazırlanıyor...</div>;
    }

    if (!cart) {
        return null;
    }


    
    const cartTotal = cart.totalPrice || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/cart" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition-colors">
                    <span className="mr-2">←</span> Sepete Geri Dön
                </Link>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Güvenli Ödeme</h1>

                <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
                    
                    {}
                    <div className="w-full lg:w-2/3 space-y-6">
                        
                        {}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>📍</span> Teslimat Bilgileri
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                                    <input type="text" name="firstName" value={shippingData.firstName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                                    <input type="text" name="lastName" value={shippingData.lastName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                                <input type="tel" name="phoneNumber" value={shippingData.phoneNumber} onChange={handleInputChange} required placeholder="05XX XXX XX XX" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                                <textarea name="address" value={shippingData.address} onChange={handleInputChange} required rows="3" placeholder="Mahalle, sokak, no, ilçe/il..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"></textarea>
                            </div>
                        </div>

                        {}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span>💳</span> Kart ile Öde (Iyzico - Test Modu)
                                </h2>
                                <button
                                    type="button"
                                    onClick={fillTestCard}
                                    className="text-xs font-semibold text-primary bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Test Kartını Doldur
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                <input type="text" name="cardHolderName" value={cardData.cardHolderName} onChange={handleCardChange} required placeholder="AD SOYAD" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                <input type="text" inputMode="numeric" name="cardNumber" value={cardData.cardNumber} onChange={handleCardChange} required placeholder="5528 7900 0000 0008" maxLength="16" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
                                    <input type="text" inputMode="numeric" name="expireMonth" value={cardData.expireMonth} onChange={handleCardChange} required placeholder="12" maxLength="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                                    <input type="text" inputMode="numeric" name="expireYear" value={cardData.expireYear} onChange={handleCardChange} required placeholder="2030" maxLength="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                    <input type="text" inputMode="numeric" name="cvc" value={cardData.cvc} onChange={handleCardChange} required placeholder="123" maxLength="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                🔒 Bu, Iyzico'nun sandbox (test) ortamıdır - gerçek para çekilmez. Kendi API
                                anahtarlarınızı henüz tanımlamadıysanız ödeme adımı "yapılandırılmadı" hatası verecektir.
                            </p>
                        </div>
                    </div>

                    {/* SAĞ TARAF: SİPARİŞ ÖZETİ VE ONAY */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Sepet Özeti</h3>
                            
                            {/* Sepetteki Ürünlerin Mini Listesi */}
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <BookCover src={item.coverImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <span className="text-sm font-bold text-gray-800 line-clamp-1">{item.bookTitle}</span>
                                            <span className="text-xs text-gray-500">{item.quantity} Adet</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Ara Toplam</span>
                                    <span className="font-medium">{cartTotal.toFixed(2)} ₺</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Kargo Ücreti</span>
                                    <span className="font-medium text-green-600">Ücretsiz</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Ödenecek Tutar</span>
                                <span className="text-2xl font-extrabold text-primary">{cartTotal.toFixed(2)} ₺</span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={placingOrder || isStaffTestMode}
                                className="w-full bg-primary hover:bg-opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md disabled:bg-gray-400"
                            >
                                {isStaffTestMode ? '🔒 Test Modu: Personel Hesabıyla Sipariş Verilemez' : placingOrder ? 'Ödeme İşleniyor...' : 'Öde ve Siparişi Tamamla'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
