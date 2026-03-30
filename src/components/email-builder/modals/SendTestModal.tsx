'use client';

import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SendTestModalProps {
  open: boolean;
  onClose: () => void;
  html: string;
  subject: string;
}

export function SendTestModal({ open, onClose, html, subject: initialSubject }: SendTestModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!open) return null;

  function validateEmail(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('E-mail invalido');
    } else {
      setEmailError('');
    }
  }

  async function handleSend() {
    if (!validateEmail(email)) {
      setEmailError('E-mail invalido');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: email,
          subject: subject || 'Teste de Email',
          html,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar');
      }

      toast.success('E-mail de teste enviado com sucesso!');
      onClose();
    } catch {
      toast.error('Erro ao enviar e-mail de teste. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Enviar e-mail de teste</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            E-mail do destinatario
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="teste@exemplo.com"
              className={`w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B2A] ${
                emailError ? 'border-red-400' : 'border-gray-300'
              }`}
              disabled={sending}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Assunto
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do e-mail"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F26B2A]"
              disabled={sending}
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !email || !!emailError}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#F26B2A] rounded-lg hover:bg-[#d95d22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Enviar teste
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
