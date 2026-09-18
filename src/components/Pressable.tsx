import { useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onPress?: () => void
  children?: ReactNode
  style?: CSSProperties
  className?: string
}

/** Works with pointerup AND click — installed Android Chrome often eats one. */
export function Pressable({ onPress, children, style, className, disabled, ...rest }: Props) {
  const fired = useRef(false)

  const fire = () => {
    if (disabled || !onPress) return
    if (fired.current) return
    fired.current = true
    onPress()
    window.setTimeout(() => {
      fired.current = false
    }, 350)
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      disabled={disabled}
      onPointerUp={(e) => {
        if (e.button !== undefined && e.button !== 0) return
        e.preventDefault()
        fire()
      }}
      onClick={(e) => {
        e.preventDefault()
        fire()
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
