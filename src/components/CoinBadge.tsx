export function CoinBadge({ amount }: { amount: number }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'linear-gradient(180deg,#ffe082,#f9a825)',
      border: '3px solid #ff8f00',
      borderRadius: 999,
      padding: '6px 14px 6px 8px',
      boxShadow: '0 4px 0 #e65100',
      fontWeight: 900,
      color: '#5d4037',
      fontSize: 18,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%,#fff59d,#ff8f00)',
        border: '2px solid #ef6c00',
        display: 'inline-block',
      }} />
      {amount}
    </div>
  )
}
