import React, { useState, useEffect } from 'react';
import { PlanType } from '../../domain/Subscription';
import { BACKEND_URL } from './LocalSecureApp';

interface CheckoutModalProps {
  planType: PlanType | 'single_story';
  billingCycle: 'mensal' | 'anual';
  price: number;
  userEmail: string;
  onClose: () => void;
  onSuccess: (paymentMethod: 'pix' | 'credit_card') => void;
  isAdultHomenagem?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  planType,
  billingCycle,
  price,
  userEmail,
  onClose,
  onSuccess,
  isAdultHomenagem = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [activePrice, setActivePrice] = useState(price);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes for PIX

  // Real Pix states
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [copyPasteCode, setCopyPasteCode] = useState<string | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Default to R$ 59,00 if adult homenaje is selected
  useEffect(() => {
    if (isAdultHomenagem) {
      setActivePrice(59.00);
    } else {
      setActivePrice(price);
    }
  }, [price, isAdultHomenagem]);

  const handlePriceChange = (newPrice: number) => {
    setActivePrice(newPrice);
    setPaymentId(null);
    setQrCodeImage(null);
    setCopyPasteCode(null);
  };

  // 1. Fetch Real Pix QR Code when choosing PIX method
  useEffect(() => {
    if (paymentMethod === 'pix' && !paymentId && !pixLoading && !isSuccess) {
      setPixLoading(true);
      setPixError(null);

      fetch(`${BACKEND_URL}/api/create-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: activePrice,
          planName: planType.toUpperCase() + (isAdultHomenagem ? '_HOMENAGEM' : ''),
          email: userEmail
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Erro na comunicação com o Asaas");
        return res.json();
      })
      .then(data => {
        setPaymentId(data.paymentId);
        setQrCodeImage(data.qrCodeImage);
        setCopyPasteCode(data.copyPasteCode);
        setPixLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPixError("Não foi possível gerar a cobrança real via Asaas. Verifique se o servidor proxy está rodando.");
        setPixLoading(false);
      });
    }
  }, [paymentMethod, paymentId, activePrice, planType, userEmail, isSuccess, isAdultHomenagem]);

  // 2. Poll Asaas payment status in real-time
  useEffect(() => {
    let interval: any;
    if (paymentId && !isSuccess) {
      interval = setInterval(() => {
        fetch(`${BACKEND_URL}/api/check-payment?paymentId=${paymentId}`)
          .then(res => res.json())
          .then(data => {
            if (data.isPaid) {
              setIsSuccess(true);
              clearInterval(interval);
              setTimeout(() => {
                onSuccess('pix');
              }, 2000);
            }
          })
          .catch(err => console.warn("Erro ao checar status de pagamento:", err));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [paymentId, isSuccess, onSuccess]);

  // Countdown timer for PIX
  useEffect(() => {
    if (paymentMethod === 'pix' && countdown > 0 && !isSuccess) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [paymentMethod, countdown, isSuccess]);

  const handleCopyPix = () => {
    if (copyPasteCode) {
      navigator.clipboard.writeText(copyPasteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate credit card processing
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(paymentMethod);
      }, 2000);
    }, 2500);
  };

  const getPlanName = () => {
    if (planType === 'hero') return 'Plano Inicial';
    if (planType === 'legendary') return 'Plano Criador / Estúdio';
    if (planType === 'single_story') return 'História / Homenagem Avulsa';
    return 'Plano Profissional';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-all z-20 cursor-pointer"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl animate-bounce">
              🎉
            </div>
            <h3 className="text-2xl font-black text-slate-800">Pagamento Aprovado!</h3>
            <p className="text-slate-500 text-sm font-semibold max-w-xs mx-auto">
              Seu crédito foi ativado com sucesso. Estamos liberando seu acesso ao Estúdio de Criação!
            </p>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {planType === 'single_story' ? 'Crédito de História' : 'Assinatura Estúdio'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  {getPlanName()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-800">R$ {activePrice.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-bold block -mt-1">
                  {planType === 'single_story' ? 'avulso' : `/${billingCycle === 'mensal' ? 'mês' : 'ano'}`}
                </span>
              </div>
            </div>

            {/* Commemorative Upsell Option Selector inside Checkout Modal */}
            {isAdultHomenagem && (
              <div className="px-8 pt-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Escolha seu Pacote de Homenagem</label>
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => handlePriceChange(59.00)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${activePrice === 59.00 ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 hover:border-slate-350'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={activePrice === 59.00} 
                        onChange={() => {}} 
                        className="accent-amber-500 cursor-pointer" 
                      />
                      <div>
                        <strong className="text-xs font-black text-slate-800 block">✨ Combo Super Homenagem (Recomendado)</strong>
                        <span className="text-[10px] text-slate-500 font-medium">Livro Completo (16 Cenas) + Vídeo Premium de 4 min + Áudio</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-600">R$ 59,00</span>
                  </div>

                  <div 
                    onClick={() => handlePriceChange(29.00)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${activePrice === 29.00 ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-350'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={activePrice === 29.00} 
                        onChange={() => {}} 
                        className="accent-slate-505 cursor-pointer" 
                      />
                      <div>
                        <strong className="text-xs font-black text-slate-700 block">📖 Homenagem Básica (Sem Vídeo)</strong>
                        <span className="text-[10px] text-slate-500 font-medium">Livro Digital Completo (16 Cenas) + PDF + Áudio</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-600">R$ 29,00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tabs */}
            <div className="p-8">
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-6">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'pix'
                      ? 'bg-white text-slate-850 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ⚡ Pix Oficial
                </button>
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'credit_card'
                      ? 'bg-white text-slate-850 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  💳 Cartão de Crédito
                </button>
              </div>

              {paymentMethod === 'pix' ? (
                /* PIX Checkout Area */
                <div className="flex flex-col items-center gap-4 text-center">
                  {pixLoading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-bold">Solicitando Pix real ao Asaas...</span>
                    </div>
                  ) : pixError ? (
                    <div className="p-5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold leading-relaxed">
                      ⚠️ {pixError}
                    </div>
                  ) : (
                    <>
                      {qrCodeImage && (
                        <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-inner">
                          <img 
                            src={`data:image/png;base64,${qrCodeImage}`} 
                            alt="Pix QR Code Asaas" 
                            className="w-48 h-48 block"
                          />
                        </div>
                      )}

                      {/* Timer & Info */}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Aguardando confirmação... expira em: <span className="text-amber-600 font-extrabold">{formatTime(countdown)}</span>
                      </div>

                      {/* Copy Pix Code button */}
                      {copyPasteCode && (
                        <button
                          onClick={handleCopyPix}
                          className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          {copied ? '✓ Código Copiado!' : '📋 Copiar Pix Copia e Cola'}
                        </button>
                      )}
                    </>
                  )}

                  <div className="text-[10px] text-slate-400 font-medium mt-2">
                    Transação real criptografada processada por **Asaas S.A.**
                  </div>
                </div>
              ) : (
                /* Credit Card Checkout Form */
                <form onSubmit={handlePayment} className="flex flex-col gap-4">
                  {/* Interactive Card Preview */}
                  <div className="bg-gradient-to-tr from-slate-800 to-slate-950 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 bg-amber-400/20 rounded-md border border-amber-400/30"></div>
                      <span className="text-xs font-bold text-slate-400 tracking-wider">ASAAS CARD</span>
                    </div>

                    <div className="my-4">
                      <div className="text-lg font-mono tracking-widest text-slate-200">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500">Titular</span>
                        <span className="text-xs font-bold tracking-wide uppercase truncate block max-w-[180px]">
                          {cardName || 'NOME DO TITULAR'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500">Expira em</span>
                        <span className="text-xs font-bold tracking-wide block">
                          {cardExpiry || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Número do Cartão</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        placeholder="4532 0000 0000 0000"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none text-slate-700 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">Nome no Cartão</label>
                      <input 
                        type="text" 
                        placeholder="MARCOS A SILVA"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none text-slate-700 text-sm font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">Vencimento</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          placeholder="MM/AA"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none text-slate-700 text-sm font-semibold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-455 uppercase tracking-widest mb-1.5">CVC / CVV</label>
                        <input 
                          type="password" 
                          maxLength={4}
                          placeholder="123"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none text-slate-700 text-sm font-semibold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 mt-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processando Pagamento...
                        </>
                      ) : (
                        `Pagar R$ ${activePrice.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
