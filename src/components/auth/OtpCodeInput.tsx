import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

const LENGTH = 6;

interface OtpCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

// Ô nhập mã OTP 6 số: tự chuyển ô, dán cả mã, Backspace lùi ô
export default function OtpCodeInput({ value, onChange, disabled, invalid }: OtpCodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const update = (next: string) => onChange(next.replace(/\D/g, '').slice(0, LENGTH));

  const onInput = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (!d) return;
    update(value.slice(0, i) + d + value.slice(i + d.length));
    refs.current[Math.min(i + d.length, LENGTH - 1)]?.focus();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) update(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        update(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!d) return;
    e.preventDefault();
    update(d);
    refs.current[Math.min(d.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className={`otp-group ${invalid ? 'otp-group-invalid' : ''}`} role="group" aria-label="Mã OTP 6 số">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="otp-cell"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={LENGTH}
          aria-label={`Số thứ ${i + 1}`}
          value={d}
          disabled={disabled}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
