import React, { useState, useEffect, useRef } from 'react';

const BASELINE_WIDTH = 280;

const CalculatorWidget = ({ widget, updateData, extraProps }: { widget: any, updateData: any, extraProps?: any }) => {
    const theme = extraProps?.theme || { 500: '#6366f1', 600: '#4f46e5' };
    const [display, setDisplay] = useState(widget.data?.display || '0');
    const [prevValue, setPrevValue] = useState<number | null>(widget.data?.prevValue ?? null);
    const [operator, setOperator] = useState<string | null>(widget.data?.operator ?? null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [expression, setExpression] = useState(widget.data?.expression || '');

    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Responsive scaling
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                setScale(Math.max(0.5, Math.min(1.5, w / BASELINE_WIDTH)));
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const s = (base: number) => Math.round(base * scale);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setExpression('');
    };

    const toggleSign = () => {
        const val = parseFloat(display);
        if (val !== 0) setDisplay(String(-val));
    };

    const inputPercent = () => {
        const val = parseFloat(display);
        setDisplay(String(val / 100));
    };

    const backspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const performOperation = (nextOp: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
            setExpression(`${display} ${nextOp}`);
        } else if (operator) {
            const result = calculate(prevValue, inputValue, operator);
            const resultStr = formatResult(result);
            setPrevValue(result);
            setDisplay(resultStr);
            setExpression(`${resultStr} ${nextOp}`);
        }

        setOperator(nextOp);
        setWaitingForOperand(true);
    };

    const calculate = (a: number, b: number, op: string): number => {
        switch (op) {
            case '+': return a + b;
            case '−': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 0;
            default: return b;
        }
    };

    const formatResult = (val: number): string => {
        const str = String(val);
        if (str.length > 12) return parseFloat(val.toPrecision(10)).toString();
        return str;
    };

    const handleEquals = () => {
        const inputValue = parseFloat(display);
        if (operator && prevValue !== null) {
            const result = calculate(prevValue, inputValue, operator);
            const resultStr = formatResult(result);
            setExpression(`${expression} ${display} =`);
            setDisplay(resultStr);
            setPrevValue(null);
            setOperator(null);
            setWaitingForOperand(true);
        }
    };

    // Button definitions
    const buttons = [
        { label: 'C', type: 'func', action: clear },
        { label: '±', type: 'func', action: toggleSign },
        { label: '%', type: 'func', action: inputPercent },
        { label: '÷', type: 'op', action: () => performOperation('÷') },
        { label: '7', type: 'num', action: () => inputDigit('7') },
        { label: '8', type: 'num', action: () => inputDigit('8') },
        { label: '9', type: 'num', action: () => inputDigit('9') },
        { label: '×', type: 'op', action: () => performOperation('×') },
        { label: '4', type: 'num', action: () => inputDigit('4') },
        { label: '5', type: 'num', action: () => inputDigit('5') },
        { label: '6', type: 'num', action: () => inputDigit('6') },
        { label: '−', type: 'op', action: () => performOperation('−') },
        { label: '1', type: 'num', action: () => inputDigit('1') },
        { label: '2', type: 'num', action: () => inputDigit('2') },
        { label: '3', type: 'num', action: () => inputDigit('3') },
        { label: '+', type: 'op', action: () => performOperation('+') },
        { label: '⌫', type: 'func', action: backspace },
        { label: '0', type: 'num', action: () => inputDigit('0') },
        { label: '.', type: 'num', action: inputDecimal },
        { label: '=', type: 'eq', action: handleEquals },
    ];

    const getButtonStyle = (type: string) => {
        const base: React.CSSProperties = {
            borderRadius: s(10),
            fontSize: s(18),
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${s(8)}px ${s(4)}px`,
        };
        switch (type) {
            case 'num': return { ...base, background: '#f8fafc', color: '#1e293b' };
            case 'op': return { ...base, background: theme[500], color: 'white' };
            case 'eq': return { ...base, background: theme[600], color: 'white' };
            case 'func': return { ...base, background: '#e2e8f0', color: '#475569' };
            default: return base;
        }
    };

    // Auto-size display font
    const displayFontSize = display.length > 10 ? s(20) : display.length > 7 ? s(26) : s(34);

    return (
        <div ref={containerRef} className="flex flex-col h-full" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
            {/* Display */}
            <div style={{ padding: `${s(12)}px ${s(14)}px ${s(4)}px`, flexShrink: 0 }}>
                <div style={{ fontSize: s(11), color: '#94a3b8', fontWeight: 500, minHeight: s(16), textAlign: 'right', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {expression || '\u00A0'}
                </div>
                <div style={{
                    fontSize: displayFontSize,
                    fontWeight: 800,
                    color: '#1e293b',
                    textAlign: 'right',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                    minHeight: s(42),
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: '-0.02em',
                }}>
                    {display}
                </div>
            </div>

            {/* Button Grid */}
            <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: s(5),
                padding: `${s(6)}px ${s(10)}px ${s(10)}px`,
            }}>
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.action}
                        style={getButtonStyle(btn.type)}
                        className="hover:brightness-95 active:scale-95"
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CalculatorWidget;
