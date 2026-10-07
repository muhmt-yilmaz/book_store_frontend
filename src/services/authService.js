import api from './api';
import { getErrorMessage } from '../utils/errorHelper';


export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            
            localStorage.setItem('userName', response.data.name || "Kullanıcı"); 
        }
        return response.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(error, "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."), 
            { cause: error }
        );
    }
};


export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(error, "Kayıt işlemi başarısız oldu."), 
            { cause: error }
        );
    }
};


export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName'); 
    localStorage.removeItem('userRole'); 
};


export const verifyEmail = async (data) => {
    try {
        
        
        const payload = {
            email: data.email,
            code: data.verificationCode || data.code 
        };


        const response = await api.post('/auth/verify', payload);
        return response.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(error, "Doğrulama başarısız. Lütfen kodu kontrol edin."), 
            { cause: error }
        );
    }
};


export const resendVerificationEmail = async (email) => {
    try {
        
        const response = await api.post('/auth/resend-verification', null, {
            params: { email }
        });
        return response.data;
    } catch (error) {
        throw new Error(
            getErrorMessage(error, "Yeni doğrulama kodu gönderilemedi."), 
            { cause: error }
        );
    }
};